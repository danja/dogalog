import { describe, expect, it, beforeEach, vi } from 'vitest';
import { LiveEvaluator } from '../../src/livecoding/liveEvaluator.js';

describe('Live Evaluator', () => {
  let evaluator;
  let mockScheduler;

  beforeEach(() => {
    mockScheduler = {
      setProgram: vi.fn()
    };
    evaluator = new LiveEvaluator({
      scheduler: mockScheduler,
      debounceMs: 50
    });
  });

  it('evaluates valid code immediately', () => {
    const code = 'event(kick, 36, 0.9, T) :- beat(T, 1).';
    evaluator.evaluate(code);

    expect(mockScheduler.setProgram).toHaveBeenCalledTimes(1);
    expect(mockScheduler.setProgram).toHaveBeenCalledWith(
      expect.arrayContaining([expect.any(Object)])
    );
  });

  it('does not update scheduler for invalid code', () => {
    const code = 'event(kick, 36, 0.9';
    evaluator.evaluate(code);

    expect(mockScheduler.setProgram).not.toHaveBeenCalled();
  });

  it('emits validated event on successful evaluation', () => {
    const callback = vi.fn();
    evaluator.on('validated', callback);

    const code = 'event(kick, 36, 0.9, T) :- beat(T, 1).';
    evaluator.evaluate(code);

    expect(callback).toHaveBeenCalledWith({
      success: true,
      clauses: expect.any(Array),
      text: code
    });
  });

  it('emits validated event with error for invalid code', () => {
    const callback = vi.fn();
    evaluator.on('validated', callback);

    const code = 'event(kick';
    evaluator.evaluate(code);

    expect(callback).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      text: code
    });
  });

  it('debounces code changes', async () => {
    evaluator.onCodeChange('event(kick');
    evaluator.onCodeChange('event(kick,');
    evaluator.onCodeChange('event(kick, 36, 0.9, T) :- beat(T, 1).');

    // Should not call immediately
    expect(mockScheduler.setProgram).not.toHaveBeenCalled();

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should have called once with final code
    expect(mockScheduler.setProgram).toHaveBeenCalledTimes(1);
  });

  it('tracks last valid code', () => {
    const validCode = 'event(kick, 36, 0.9, T) :- beat(T, 1).';
    evaluator.evaluate(validCode);

    expect(evaluator.getLastValidCode()).toBe(validCode);

    // Invalid code should not update last valid
    evaluator.evaluate('invalid(');
    expect(evaluator.getLastValidCode()).toBe(validCode);
  });

  it('handles empty code as valid', () => {
    evaluator.evaluate('');

    expect(mockScheduler.setProgram).toHaveBeenCalledWith([]);
  });

  it('supports multiple event listeners', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    evaluator.on('validated', callback1);
    evaluator.on('validated', callback2);

    evaluator.evaluate('event(kick, 36, 0.9, T) :- beat(T, 1).');

    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  it('cleans up timeout on destroy', () => {
    evaluator.onCodeChange('test code');
    evaluator.destroy();

    // If timeout wasn't cleared, this would trigger evaluation after delay
    // This test verifies no errors occur
    expect(() => evaluator.destroy()).not.toThrow();
  });
});
