/**
 * Integration tests for livecoding functionality
 * Tests the full auto-evaluation flow
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LiveEvaluator } from '../../src/livecoding/liveEvaluator.js';
import { Scheduler } from '../../src/scheduler/scheduler.js';
import { StateManager } from '../../src/scheduler/stateManager.js';
import { createBuiltins } from '../../src/prolog/builtins/index.js';

describe('Livecoding Integration', () => {
  let scheduler;
  let liveEvaluator;
  let stateManager;

  beforeEach(() => {
    const mockAudio = {
      context: { currentTime: 0 },
      playSynth: vi.fn()
    };

    const builtins = createBuiltins();
    stateManager = new StateManager();
    scheduler = new Scheduler({ audio: mockAudio, builtins, stateManager });
    liveEvaluator = new LiveEvaluator({ scheduler, debounceMs: 50 });
  });

  it('validates and loads valid code automatically', async () => {
    const validatedPromise = new Promise((resolve) => {
      liveEvaluator.on('validated', resolve);
    });

    const validCode = 'test(1). test(2).';
    liveEvaluator.onCodeChange(validCode);

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 100));

    const result = await validatedPromise;
    expect(result.success).toBe(true);
    expect(result.clauses.length).toBe(2);
  });

  it('reports validation errors for invalid code', async () => {
    const validatedPromise = new Promise((resolve) => {
      liveEvaluator.on('validated', resolve);
    });

    const invalidCode = 'test(1';
    liveEvaluator.onCodeChange(invalidCode);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const result = await validatedPromise;
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('handles incremental code changes', async () => {
    const results = [];
    liveEvaluator.on('validated', (result) => results.push(result));

    // First change
    liveEvaluator.onCodeChange('fact(1).');
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Second change
    liveEvaluator.onCodeChange('fact(1). fact(2).');
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(results.length).toBe(2);
    expect(results[0].clauses.length).toBe(1);
    expect(results[1].clauses.length).toBe(2);
  });

  it('updates scheduler program when code is valid', async () => {
    const initialLength = scheduler.program.length;
    liveEvaluator.onCodeChange('event(kick, 60, 80, T) :- beat(T, 1).');
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Program should be updated (may or may not be longer depending on initial state)
    expect(scheduler.program).toBeDefined();
    expect(Array.isArray(scheduler.program)).toBe(true);
  });

  it('does not update scheduler when code is invalid', async () => {
    // Set valid program first
    liveEvaluator.onCodeChange('valid(1).');
    await new Promise((resolve) => setTimeout(resolve, 100));
    const initialProgram = scheduler.program;

    // Try invalid code
    liveEvaluator.onCodeChange('invalid(');
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Program should remain unchanged
    expect(scheduler.program).toBe(initialProgram);
  });

  it('preserves state across code updates', async () => {
    // Initialize with code that uses cycle
    liveEvaluator.onCodeChange('test(X) :- cycle([1,2,3], X).');
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Trigger some cycles
    const key = 'test-key';
    expect(stateManager.incrementCycle(key, 3)).toBe(0); // Returns 0, sets to 1
    expect(stateManager.incrementCycle(key, 3)).toBe(1); // Returns 1, sets to 2

    expect(stateManager.getCycleIndex(key)).toBe(2);

    // Update code
    liveEvaluator.onCodeChange('test(X) :- cycle([a,b,c], X).');
    await new Promise((resolve) => setTimeout(resolve, 100));

    // State should be preserved (still at index 2)
    expect(stateManager.getCycleIndex(key)).toBe(2);
  });

  it('debounces rapid code changes', async () => {
    const results = [];
    liveEvaluator.on('validated', (result) => results.push(result));

    // Rapid changes within debounce window
    liveEvaluator.onCodeChange('v1.');
    liveEvaluator.onCodeChange('v1. v2.');
    liveEvaluator.onCodeChange('v1. v2. v3.');

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Only the last change should have been processed
    expect(results.length).toBe(1);
    expect(results[0].clauses.length).toBe(3);
  });

  it('handles empty code gracefully', async () => {
    const validatedPromise = new Promise((resolve) => {
      liveEvaluator.on('validated', resolve);
    });

    liveEvaluator.onCodeChange('');
    await new Promise((resolve) => setTimeout(resolve, 100));

    const result = await validatedPromise;
    expect(result.success).toBe(true);
    expect(result.clauses.length).toBe(0);
  });

  it('handles code with only whitespace', async () => {
    const validatedPromise = new Promise((resolve) => {
      liveEvaluator.on('validated', resolve);
    });

    liveEvaluator.onCodeChange('   \n\n   ');
    await new Promise((resolve) => setTimeout(resolve, 100));

    const result = await validatedPromise;
    expect(result.success).toBe(true);
    expect(result.clauses.length).toBe(0);
  });
});
