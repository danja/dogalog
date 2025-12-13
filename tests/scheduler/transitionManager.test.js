import { describe, expect, it, beforeEach, vi } from 'vitest';
import { TransitionManager } from '../../src/scheduler/transitionManager.js';

describe('Transition Manager', () => {
  let transitionManager;
  let mockScheduler;
  let mockAudioEngine;

  beforeEach(() => {
    vi.useFakeTimers();

    mockScheduler = {
      setProgram: vi.fn(),
      bpm: 120
    };

    mockAudioEngine = {
      time: vi.fn(() => 0)
    };

    transitionManager = new TransitionManager({
      scheduler: mockScheduler,
      audioEngine: mockAudioEngine,
      quantization: 4
    });
  });

  it('schedules transition at next bar boundary', () => {
    const newProgram = [{ head: {}, body: [] }];
    mockAudioEngine.time.mockReturnValue(0);

    transitionManager.scheduleTransition(newProgram);

    // Should not call immediately
    expect(mockScheduler.setProgram).not.toHaveBeenCalled();

    // Advance to next bar (2 seconds at 120 BPM, 4 beats)
    vi.advanceTimersByTime(2000);

    expect(mockScheduler.setProgram).toHaveBeenCalledWith(newProgram);
  });

  it('schedules transition mid-bar', () => {
    const newProgram = [{ head: {}, body: [] }];

    // At 120 BPM, 4 beats = 2 seconds
    // Start at 0.5 seconds (1 beat in)
    mockAudioEngine.time.mockReturnValue(0.5);

    transitionManager.scheduleTransition(newProgram);

    // Should wait 1.5 seconds until next bar
    expect(mockScheduler.setProgram).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1500);
    expect(mockScheduler.setProgram).toHaveBeenCalledWith(newProgram);
  });

  it('cancels pending transition', () => {
    const newProgram = [{ head: {}, body: [] }];

    transitionManager.scheduleTransition(newProgram);
    expect(transitionManager.hasPending()).toBe(true);

    transitionManager.cancelPending();
    expect(transitionManager.hasPending()).toBe(false);

    vi.advanceTimersByTime(5000);
    expect(mockScheduler.setProgram).not.toHaveBeenCalled();
  });

  it('replaces pending transition with new one', () => {
    const program1 = [{ head: { f: 'rule1' }, body: [] }];
    const program2 = [{ head: { f: 'rule2' }, body: [] }];

    transitionManager.scheduleTransition(program1);
    transitionManager.scheduleTransition(program2);

    vi.advanceTimersByTime(5000);

    // Should only call with the second program
    expect(mockScheduler.setProgram).toHaveBeenCalledTimes(1);
    expect(mockScheduler.setProgram).toHaveBeenCalledWith(program2);
  });

  it('handles immediate transition at boundary', () => {
    const newProgram = [{ head: {}, body: [] }];
    mockAudioEngine.time.mockReturnValue(0); // Exactly at boundary

    transitionManager.scheduleTransition(newProgram);

    // Should transition immediately (or very soon)
    vi.advanceTimersByTime(10);
    expect(mockScheduler.setProgram).toHaveBeenCalledWith(newProgram);
  });

  it('clears pending state after transition', () => {
    const newProgram = [{ head: {}, body: [] }];

    transitionManager.scheduleTransition(newProgram);
    expect(transitionManager.hasPending()).toBe(true);

    vi.advanceTimersByTime(5000);

    expect(transitionManager.hasPending()).toBe(false);
  });

  it('respects custom quantization', () => {
    const customManager = new TransitionManager({
      scheduler: mockScheduler,
      audioEngine: mockAudioEngine,
      quantization: 8 // 8 beats instead of 4
    });

    const newProgram = [{ head: {}, body: [] }];
    mockAudioEngine.time.mockReturnValue(0);

    customManager.scheduleTransition(newProgram);

    // At 120 BPM, 8 beats = 4 seconds
    vi.advanceTimersByTime(4000);
    expect(mockScheduler.setProgram).toHaveBeenCalledWith(newProgram);
  });

  it('cleans up on destroy', () => {
    const newProgram = [{ head: {}, body: [] }];

    transitionManager.scheduleTransition(newProgram);
    transitionManager.destroy();

    expect(transitionManager.hasPending()).toBe(false);

    vi.advanceTimersByTime(5000);
    expect(mockScheduler.setProgram).not.toHaveBeenCalled();
  });
});
