import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { createBuiltins } from '../../src/prolog/builtins.js';
import { StateManager } from '../../src/scheduler/stateManager.js';

const builtins = createBuiltins();
const stateManager = new StateManager();

let originalRandom;
beforeEach(() => {
  originalRandom = Math.random;
  stateManager.reset();
});
afterEach(() => { Math.random = originalRandom; });

describe('builtins.rand', () => {
  it('binds a random number within range', () => {
    Math.random = vi.fn(() => 0.5);
    const env = {};
    const outs = builtins.rand([
      { type:'num', value:0 },
      { type:'num', value:10 },
      { type:'var', name:'X' }
    ], env);
    expect(outs[0].X.value).toBeCloseTo(5, 5);
  });
});

describe('builtins.scale', () => {
  it('maps degree to midi using ionian scale', () => {
    const outs = builtins.scale([
      { type:'num', value:60 }, // C4
      { type:'atom', name:'ionian' },
      { type:'num', value:3 },
      { type:'num', value:0 },
      { type:'var', name:'N' }
    ], {});
    expect(outs[0].N.value).toBe(64); // E4
  });

  it('wraps degrees into later octaves', () => {
    const outs = builtins.scale([
      { type:'num', value:60 },
      { type:'atom', name:'ionian' },
      { type:'num', value:8 },
      { type:'num', value:0 },
      { type:'var', name:'N' }
    ], {});
    expect(outs[0].N.value).toBe(72); // C5 (degree 8 wraps to next octave)
  });
});

describe('builtins.chord', () => {
  it('emits each chord tone as separate envs', () => {
    const outs = builtins.chord([
      { type:'num', value:60 },
      { type:'atom', name:'maj' },
      { type:'num', value:0 },
      { type:'var', name:'N' }
    ], {});
    const values = outs.map((o) => o.N.value).sort((a,b)=>a-b);
    expect(values).toEqual([60,64,67]);
  });
});

describe('builtins.pick', () => {
  it('returns a single random element from a list', () => {
    Math.random = vi.fn(() => 0.75); // pick last element
    const outs = builtins.pick([
      { type:'list', items:[{type:'num', value:1}, {type:'num', value:2}] },
      { type:'var', name:'X' }
    ], {});
    expect(outs).toHaveLength(1);
    expect(outs[0].X.value).toBe(2);
  });
});

describe('builtins.cycle', () => {
  it('steps through a list deterministically across calls', () => {
    const list = { type:'list', items:[{type:'num', value:1}, {type:'num', value:2}] };
    const target = { type:'var', name:'X' };
    const ctx = { stateManager };
    const first = builtins.cycle([list, target], {}, ctx);
    const second = builtins.cycle([list, target], {}, ctx);
    expect(first[0].X.value).toBe(1);
    expect(second[0].X.value).toBe(2);
  });
});

describe('builtins.transpose', () => {
  it('offsets a pitch by semitones', () => {
    const outs = builtins.transpose([
      { type:'num', value:60 },
      { type:'num', value:7 },
      { type:'var', name:'X' }
    ], {});
    expect(outs[0].X.value).toBe(67);
  });
});

describe('builtins.rotate', () => {
  it('rotates a list by a shift', () => {
    const list = { type:'list', items:[{type:'num', value:1}, {type:'num', value:2}, {type:'num', value:3}] };
    const outs = builtins.rotate([
      list,
      { type:'num', value:1 },
      { type:'var', name:'X' }
    ], {});
    expect(outs[0].X.items.map((n)=>n.value)).toEqual([2,3,1]);
  });
});

describe('builtins.range', () => {
  it('yields numbers over a range with step', () => {
    const outs = builtins.range([
      { type:'num', value:0 },
      { type:'num', value:2 },
      { type:'num', value:1 },
      { type:'var', name:'X' }
    ], {});
    const vals = outs.map((o)=>o.X.value);
    expect(vals).toEqual([0,1,2]);
  });
});

describe('builtins.randint', () => {
  it('yields an integer within bounds', () => {
    Math.random = vi.fn(() => 0.4);
    const outs = builtins.randint([
      { type:'num', value:0 },
      { type:'num', value:10 },
      { type:'var', name:'X' }
    ], {});
    expect(Number.isInteger(outs[0].X.value)).toBe(true);
    expect(outs[0].X.value).toBeGreaterThanOrEqual(0);
    expect(outs[0].X.value).toBeLessThan(10);
  });
});

describe('builtins.lt/gt', () => {
  it('tests numeric ordering', () => {
    expect(builtins.lt([{type:'num',value:1},{type:'num',value:2}], {})).toHaveLength(1);
    expect(builtins.lt([{type:'num',value:2},{type:'num',value:1}], {})).toHaveLength(0);
    expect(builtins.gt([{type:'num',value:2},{type:'num',value:1}], {})).toHaveLength(1);
  });
});

describe('builtins.within', () => {
  it('accepts times inside bounds', () => {
    expect(builtins.within([{type:'num',value:1},{type:'num',value:0},{type:'num',value:2}], {})).toHaveLength(1);
    expect(builtins.within([{type:'num',value:3},{type:'num',value:0},{type:'num',value:2}], {})).toHaveLength(0);
  });
});

describe('builtins.distinct', () => {
  it('fails when list has duplicates', () => {
    expect(builtins.distinct([{type:'list', items:[{type:'num',value:1},{type:'num',value:1}]}], {})).toHaveLength(0);
    expect(builtins.distinct([{type:'list', items:[{type:'num',value:1},{type:'num',value:2}]}], {})).toHaveLength(1);
  });
});

describe('builtins.cooldown', () => {
  it('passes when gap is satisfied', () => {
    expect(builtins.cooldown([{type:'num',value:2},{type:'num',value:0},{type:'num',value:1}], {})).toHaveLength(1);
    expect(builtins.cooldown([{type:'num',value:0.5},{type:'num',value:0},{type:'num',value:1}], {})).toHaveLength(0);
  });
});
