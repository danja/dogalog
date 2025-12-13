import { describe, expect, it, beforeEach } from 'vitest';
import { StateManager } from '../../src/scheduler/stateManager.js';

describe('State Manager', () => {
  let stateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  describe('Cycle State', () => {
    it('returns 0 for new cycle key', () => {
      expect(stateManager.getCycleIndex('new-key')).toBe(0);
    });

    it('increments cycle and returns current value', () => {
      const key = 'test-cycle';
      const current = stateManager.incrementCycle(key, 3);
      expect(current).toBe(0);
      expect(stateManager.getCycleIndex(key)).toBe(1);
    });

    it('wraps cycle around at list length', () => {
      const key = 'test-cycle';
      stateManager.incrementCycle(key, 3); // 0 -> 1
      stateManager.incrementCycle(key, 3); // 1 -> 2
      const current = stateManager.incrementCycle(key, 3); // 2 -> 0
      expect(current).toBe(2);
      expect(stateManager.getCycleIndex(key)).toBe(0);
    });

    it('maintains independent state for different keys', () => {
      stateManager.incrementCycle('key1', 3); // key1: 0 -> 1
      stateManager.incrementCycle('key2', 3); // key2: 0 -> 1
      stateManager.incrementCycle('key1', 3); // key1: 1 -> 2

      expect(stateManager.getCycleIndex('key1')).toBe(2);
      expect(stateManager.getCycleIndex('key2')).toBe(1);
    });

    it('persists state across multiple queries', () => {
      const key = 'persistent';
      stateManager.incrementCycle(key, 5);
      stateManager.incrementCycle(key, 5);

      expect(stateManager.getCycleIndex(key)).toBe(2);

      stateManager.incrementCycle(key, 5);
      expect(stateManager.getCycleIndex(key)).toBe(3);
    });
  });

  describe('Cooldown State', () => {
    it('returns undefined for new cooldown key', () => {
      expect(stateManager.getLastTrigger('new-key')).toBeUndefined();
    });

    it('stores and retrieves last trigger time', () => {
      stateManager.setLastTrigger('test', 1.5);
      expect(stateManager.getLastTrigger('test')).toBe(1.5);
    });

    it('updates existing trigger time', () => {
      stateManager.setLastTrigger('test', 1.0);
      stateManager.setLastTrigger('test', 2.5);
      expect(stateManager.getLastTrigger('test')).toBe(2.5);
    });

    it('maintains independent state for different keys', () => {
      stateManager.setLastTrigger('key1', 1.0);
      stateManager.setLastTrigger('key2', 2.0);

      expect(stateManager.getLastTrigger('key1')).toBe(1.0);
      expect(stateManager.getLastTrigger('key2')).toBe(2.0);
    });
  });

  describe('Reset', () => {
    it('clears all cycle state', () => {
      stateManager.incrementCycle('key1', 3);
      stateManager.incrementCycle('key2', 5);

      stateManager.reset();

      expect(stateManager.getCycleIndex('key1')).toBe(0);
      expect(stateManager.getCycleIndex('key2')).toBe(0);
    });

    it('clears all cooldown state', () => {
      stateManager.setLastTrigger('key1', 1.5);
      stateManager.setLastTrigger('key2', 2.5);

      stateManager.reset();

      expect(stateManager.getLastTrigger('key1')).toBeUndefined();
      expect(stateManager.getLastTrigger('key2')).toBeUndefined();
    });

    it('allows state to be rebuilt after reset', () => {
      stateManager.incrementCycle('test', 3);
      stateManager.reset();

      stateManager.incrementCycle('test', 3);
      expect(stateManager.getCycleIndex('test')).toBe(1);
    });
  });
});
