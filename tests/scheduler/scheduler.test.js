import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Scheduler } from '../../src/scheduler/scheduler.js';
import { createBuiltins } from '../../src/prolog/builtins/index.js';
import { parseProgram } from '../../src/prolog/parser.js';
import { defaultProgram } from '../../src/ui/defaultProgram.js';

const builtins = createBuiltins();

const makeFakeAudio = () => {
  return {
    init: vi.fn(),
    time: () => 0,
    events: [],
    kick: vi.fn(function(t, vel){ this.events.push({ voice:'kick', t, vel }); }),
    snare: vi.fn(function(t, vel){ this.events.push({ voice:'snare', t, vel }); }),
    hat: vi.fn(function(t, vel){ this.events.push({ voice:'hat', t, vel }); }),
    sine: vi.fn(function(t, midi, vel){ this.events.push({ voice:'sine', t, midi, vel }); })
  };
};

let originalRandom;
beforeEach(() => { originalRandom = Math.random; Math.random = () => 1; }); // ensure prob/1 fails deterministically
afterEach(() => { Math.random = originalRandom; });

describe('Scheduler.queryAndSchedule', () => {
  it('triggers events derived from the program at a given time', () => {
    const audio = makeFakeAudio();
    const scheduler = new Scheduler({ audio, builtins });
    scheduler.setProgram(parseProgram(defaultProgram));
    const captured = [];
    scheduler.trigger = (voice, t, midi, vel) => captured.push({ voice, t, midi, vel });

    scheduler.queryAndSchedule(0);

    const voices = captured.map((e) => e.voice);
    expect(voices).toContain('kick');
    expect(voices).toContain('hat');
    expect(voices.filter((v) => v==='sine').length).toBeGreaterThanOrEqual(1);
    // No probabilistic extra hat due to Math.random stub (set to 1)
  });
});
