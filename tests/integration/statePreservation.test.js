/**
 * Integration tests for state preservation across code updates
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Scheduler } from '../../src/scheduler/scheduler.js';
import { StateManager } from '../../src/scheduler/stateManager.js';
import { createBuiltins } from '../../src/prolog/builtins/index.js';
import { parseProgram } from '../../src/prolog/parser.js';

describe('State Preservation Integration', () => {
  let scheduler;
  let stateManager;
  let mockAudio;

  beforeEach(() => {
    mockAudio = {
      context: { currentTime: 0 },
      playSynth: vi.fn()
    };

    const builtins = createBuiltins();
    stateManager = new StateManager();
    scheduler = new Scheduler({ audio: mockAudio, builtins, stateManager });
  });

  it('preserves cycle state when updating program', () => {
    // Load initial program with cycle
    const program1 = parseProgram('test(X) :- cycle([a,b,c], X).');
    scheduler.setProgram(program1);

    // Increment cycle counter
    const key = 'my-key';
    expect(stateManager.incrementCycle(key, 3)).toBe(0); // Returns 0, sets to 1
    expect(stateManager.getCycleIndex(key)).toBe(1);

    expect(stateManager.incrementCycle(key, 3)).toBe(1); // Returns 1, sets to 2
    expect(stateManager.getCycleIndex(key)).toBe(2);

    // Update program (different code, same cycle usage)
    const program2 = parseProgram('test(X) :- cycle([1,2,3], X).');
    scheduler.setProgram(program2);

    // Cycle state should be preserved
    expect(stateManager.getCycleIndex(key)).toBe(2);

    // Next increment continues from preserved state
    expect(stateManager.incrementCycle(key, 3)).toBe(2); // Returns 2, sets to 0 (wraps)
    expect(stateManager.getCycleIndex(key)).toBe(0);
  });

  it('preserves cooldown state across program updates', () => {
    const program1 = parseProgram('test :- cooldown(10, last, 5).');
    scheduler.setProgram(program1);

    // Record trigger
    stateManager.recordTrigger('test-trigger', 100);
    expect(stateManager.getLastTrigger('test-trigger')).toBe(100);

    // Update program
    const program2 = parseProgram('test :- cooldown(20, last, 5).');
    scheduler.setProgram(program2);

    // Cooldown state should be preserved
    expect(stateManager.getLastTrigger('test-trigger')).toBe(100);
  });

  it('resets state when explicitly requested', () => {
    const program = parseProgram('test(X) :- cycle([a,b,c], X).');
    scheduler.setProgram(program);

    // Build up state
    stateManager.incrementCycle('key1', 3); // Sets to 1
    stateManager.incrementCycle('key2', 5); // Sets to 1
    stateManager.recordTrigger('trigger1', 100);

    expect(stateManager.getCycleIndex('key1')).toBe(1);
    expect(stateManager.getCycleIndex('key2')).toBe(1);
    expect(stateManager.getLastTrigger('trigger1')).toBe(100);

    // Explicit reset
    scheduler.resetState();

    // All state should be cleared
    expect(stateManager.getCycleIndex('key1')).toBe(0);
    expect(stateManager.getCycleIndex('key2')).toBe(0);
    expect(stateManager.getLastTrigger('trigger1')).toBeUndefined();
  });

  it('maintains independent cycle counters', () => {
    const program = parseProgram('test.');
    scheduler.setProgram(program);

    // Create multiple independent counters
    stateManager.incrementCycle('counter-a', 3); // Sets to 1
    stateManager.incrementCycle('counter-a', 3); // Sets to 2

    stateManager.incrementCycle('counter-b', 5); // Sets to 1

    expect(stateManager.getCycleIndex('counter-a')).toBe(2);
    expect(stateManager.getCycleIndex('counter-b')).toBe(1);

    // Update program - both should persist
    const program2 = parseProgram('test2.');
    scheduler.setProgram(program2);

    expect(stateManager.getCycleIndex('counter-a')).toBe(2);
    expect(stateManager.getCycleIndex('counter-b')).toBe(1);
  });

  it('wraps cycle counter at list length', () => {
    const program = parseProgram('test.');
    scheduler.setProgram(program);

    const listLength = 4;

    // Increment through wrap-around
    expect(stateManager.incrementCycle('wrap-test', listLength)).toBe(0); // Returns 0, sets to 1
    expect(stateManager.incrementCycle('wrap-test', listLength)).toBe(1); // Returns 1, sets to 2
    expect(stateManager.incrementCycle('wrap-test', listLength)).toBe(2); // Returns 2, sets to 3
    expect(stateManager.incrementCycle('wrap-test', listLength)).toBe(3); // Returns 3, sets to 0 (wraps)

    expect(stateManager.getCycleIndex('wrap-test')).toBe(0);

    // Update program - wrapped state persists
    const program2 = parseProgram('test2.');
    scheduler.setProgram(program2);

    expect(stateManager.getCycleIndex('wrap-test')).toBe(0);
  });

  it('cooldown prevents rapid triggers', () => {
    stateManager.recordTrigger('test', 100);

    // Too soon (within gap)
    expect(stateManager.canTrigger('test', 103, 5)).toBe(false);

    // Enough time passed
    expect(stateManager.canTrigger('test', 106, 5)).toBe(true);
  });

  it('allows first trigger when no previous record', () => {
    expect(stateManager.canTrigger('new-trigger', 100, 5)).toBe(true);
  });

  it('integrates cycle state with scheduler evaluation', () => {
    const program = parseProgram(`
      pattern(X) :- cycle([kick, snare, hat], X).
      event(X, 60, 80, T) :- beat(T, 1), pattern(X).
    `);
    scheduler.setProgram(program);

    // Note: This test verifies the integration works without errors
    // Actual evaluation would require mocking more of the scheduler internals
    expect(scheduler.program.length).toBe(2);
    expect(scheduler.stateManager).toBe(stateManager);
  });
});
