/**
 * Integration tests for example loading workflow
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Scheduler } from '../../src/scheduler/scheduler.js';
import { StateManager } from '../../src/scheduler/stateManager.js';
import { createBuiltins } from '../../src/prolog/builtins/index.js';
import { parseProgram } from '../../src/prolog/parser.js';

describe('Example Loading Integration', () => {
  let scheduler;
  let stateManager;
  let mockAudio;

  beforeEach(() => {
    mockAudio = {
      context: { currentTime: 0 },
      playSynth: vi.fn(),
      init: vi.fn().mockResolvedValue(undefined),
      time: vi.fn(() => 0)
    };

    const builtins = createBuiltins();
    stateManager = new StateManager();
    scheduler = new Scheduler({ audio: mockAudio, builtins, stateManager });
  });

  it('loads example and resets state', () => {
    // Set up initial program with state
    const initialProgram = parseProgram('initial(X) :- cycle([a,b], X).');
    scheduler.setProgram(initialProgram);

    stateManager.incrementCycle('test-key', 2);
    stateManager.recordTrigger('test-trigger', 100);

    expect(stateManager.getCycleIndex('test-key')).toBe(1);
    expect(stateManager.getLastTrigger('test-trigger')).toBe(100);

    // Load example (simulates user selecting new example)
    scheduler.stop();
    scheduler.resetState();

    const exampleProgram = parseProgram('example(X) :- cycle([1,2,3], X).');
    scheduler.setProgram(exampleProgram);

    // State should be cleared
    expect(stateManager.getCycleIndex('test-key')).toBe(0);
    expect(stateManager.getLastTrigger('test-trigger')).toBeUndefined();

    // Program should be updated
    expect(scheduler.program.length).toBeGreaterThan(0);
  });

  it('preserves running state when loading example while playing', () => {
    // Start scheduler
    scheduler.start();
    const wasRunning = Boolean(scheduler.interval);

    expect(wasRunning).toBe(true);

    // Stop, load example
    scheduler.stop();
    expect(scheduler.interval).toBeNull();

    const exampleProgram = parseProgram('new_example.');
    scheduler.setProgram(exampleProgram);

    // Restart if it was running
    if (wasRunning) {
      scheduler.start();
    }

    expect(scheduler.interval).toBeTruthy();
  });

  it('does not auto-start when loading example while stopped', () => {
    // Ensure stopped
    scheduler.stop();
    expect(scheduler.interval).toBeNull();

    const wasRunning = Boolean(scheduler.interval);

    // Load example
    const exampleProgram = parseProgram('example.');
    scheduler.setProgram(exampleProgram);

    // Should remain stopped
    if (!wasRunning) {
      expect(scheduler.interval).toBeNull();
    }
  });

  it('handles loading multiple examples in sequence', () => {
    const examples = [
      { code: 'ex1(X) :- cycle([a], X).', name: 'ex1' },
      { code: 'ex2(X) :- cycle([b,c], X).', name: 'ex2' },
      { code: 'ex3(X) :- cycle([d,e,f], X).', name: 'ex3' }
    ];

    examples.forEach((example) => {
      scheduler.stop();
      scheduler.resetState();

      const program = parseProgram(example.code);
      scheduler.setProgram(program);

      expect(scheduler.program.length).toBeGreaterThan(0);

      // State should be clean for each example
      expect(stateManager.getCycleIndex('any-key')).toBe(0);
    });
  });

  it('clears all state types when resetting', () => {
    const program = parseProgram('test.');
    scheduler.setProgram(program);

    // Build complex state
    stateManager.incrementCycle('cycle-1', 5);
    stateManager.incrementCycle('cycle-1', 5);
    stateManager.incrementCycle('cycle-2', 3);
    stateManager.recordTrigger('trig-1', 100);
    stateManager.recordTrigger('trig-2', 200);

    // Reset
    scheduler.resetState();

    // All should be cleared
    expect(stateManager.getCycleIndex('cycle-1')).toBe(0);
    expect(stateManager.getCycleIndex('cycle-2')).toBe(0);
    expect(stateManager.getLastTrigger('trig-1')).toBeUndefined();
    expect(stateManager.getLastTrigger('trig-2')).toBeUndefined();
  });

  it('loads example with complex prolog code', () => {
    const complexExample = `
      pattern(kick, T) :- beat(T, 1).
      pattern(snare, T) :- beat(T, 2).
      pattern(hat, T) :- every(T, 0.5).
      velocity(V) :- choose([80, 90, 100], V).
      event(Voice, 60, Vel, T) :- pattern(Voice, T), velocity(Vel).
    `;

    scheduler.resetState();
    const program = parseProgram(complexExample);
    scheduler.setProgram(program);

    // Verify program was loaded
    expect(scheduler.program).toBeDefined();
    expect(Array.isArray(scheduler.program)).toBe(true);
    expect(scheduler.program.length).toBeGreaterThan(0);
  });
});
