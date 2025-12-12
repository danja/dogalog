import { substTerm } from './terms.js';
import { unify } from './unify.js';

const scales = {
  ionian:      [0,2,4,5,7,9,11], // major
  dorian:      [0,2,3,5,7,9,10],
  phrygian:    [0,1,3,5,7,8,10],
  lydian:      [0,2,4,6,7,9,11],
  mixolydian:  [0,2,4,5,7,9,10],
  aeolian:     [0,2,3,5,7,8,10], // natural minor
  locrian:     [0,1,3,5,6,8,10],
  major_pent:  [0,2,4,7,9],
  minor_pent:  [0,3,5,7,10],
  blues:       [0,3,5,6,7,10]
};

const chords = {
  maj:   [0,4,7],
  min:   [0,3,7],
  sus2:  [0,2,7],
  sus4:  [0,5,7],
  dim:   [0,3,6],
  aug:   [0,4,8],
  maj7:  [0,4,7,11],
  dom7:  [0,4,7,10],
  min7:  [0,3,7,10]
};

function evalNumber(term, env) {
  const t = substTerm(term, env);
  if (t.type === 'num') return t.value;
  throw new Error('Expected number in builtin');
}

function evalList(term, env) {
  const t = substTerm(term, env);
  if (t.type === 'list') return t.items;
  throw new Error('Expected list in builtin');
}

function evalTerm(term, env) { return substTerm(term, env); }
function deepEqual(a,b){ return JSON.stringify(a)===JSON.stringify(b); }

function stepIndexAtTime(T, N, B, bpm) {
  // T seconds -> beats -> bars -> step index 0..N-1
  const beats = T * bpm / 60;
  const bars  = beats / B;
  const sReal = Math.round(bars * N);  // quantized to nearest step
  return ((sReal % N) + N) % N;
}

export function createBuiltins() {
  const cycleState = new Map();

  const builtins = {
    every: (args, env, ctx) => {
      const T = evalNumber(args[0], env);
      const step = evalNumber(args[1], env);
      const beat = T * ctx.bpm / 60;
      const eps = 1e-4;
      return (Math.abs((beat/step) - Math.round(beat/step)) < eps) ? [env] : [];
    },
    beat: (args, env, ctx) => {
      const T = evalNumber(args[0], env);
      const N = evalNumber(args[1], env);
      const beat = T * ctx.bpm / 60; // beats elapsed
      const value = beat * N;
      const eps = 1e-4;
      return (Math.abs(value - Math.round(value)) < eps) ? [env] : [];
    },
    phase: (args, env, ctx) => {
      const T = evalNumber(args[0], env);
      const N = evalNumber(args[1], env);
      const K = evalNumber(args[2], env);
      const beat = T * ctx.bpm / 60; // beats
      const pos = Math.round(beat * N);
      return (pos % N) === (K % N) ? [env] : [];
    },
    prob: (args, env) => {
      const p = evalNumber(args[0], env);
      return (Math.random() < p) ? [env] : [];
    },
    eq: (args, env) => {
      const A = evalTerm(args[0], env);
      const B = evalTerm(args[1], env);
      return deepEqual(A,B)? [env] : [];
    },
    add: (args, env) => {
      const A = evalNumber(args[0], env);
      const B = evalNumber(args[1], env);
      const C = args[2];
      if (C.type!== 'var') return [];
      const out = {...env};
      out[C.name] = { type:'num', value: A+B };
      return [out];
    },
    choose: (args, env) => {
      const list = evalList(args[0], env);
      const v = args[1];
      const outs = [];
      for (const item of list) {
        const e = unify(v, item, env);
        if (e) outs.push(e);
      }
      return outs;
    },
    rand: (args, env) => {
      const min = evalNumber(args[0], env);
      const max = evalNumber(args[1], env);
      const target = args[2];
      if (target.type !== 'var') return [];
      const out = { ...env };
      const value = min + Math.random() * (max - min);
      out[target.name] = { type: 'num', value };
      return [out];
    },
    randint: (args, env) => {
      const min = Math.floor(evalNumber(args[0], env));
      const max = Math.floor(evalNumber(args[1], env));
      const target = args[2];
      if (target.type !== 'var') return [];
      const out = { ...env };
      const value = Math.floor(min + Math.random() * (max - min));
      out[target.name] = { type: 'num', value };
      return [out];
    },
    scale: (args, env) => {
      const root = evalNumber(args[0], env);
      const modeTerm = substTerm(args[1], env);
      const degree = evalNumber(args[2], env);
      const octave = evalNumber(args[3], env);
      const target = args[4];
      if (target.type !== 'var') return [];
      const steps = scales[modeTerm.name];
      if (!steps) return [];
      const zeroIdx = degree - 1;
      const step = steps[((zeroIdx % steps.length) + steps.length) % steps.length];
      const octShift = Math.floor(zeroIdx / steps.length);
      const midi = root + step + 12 * (octave + octShift);
      const out = { ...env };
      out[target.name] = { type: 'num', value: midi };
      return [out];
    },
    chord: (args, env) => {
      const root = evalNumber(args[0], env);
      const chordTerm = substTerm(args[1], env);
      const octave = evalNumber(args[2], env);
      const target = args[3];
      if (target.type !== 'var') return [];
      const intervals = chords[chordTerm.name];
      if (!intervals) return [];
      const outs = [];
      for (const step of intervals) {
        const e = { ...env };
        e[target.name] = { type: 'num', value: root + step + 12 * octave };
        outs.push(e);
      }
      return outs;
    },
    pick: (args, env) => {
      const list = evalList(args[0], env);
      const target = args[1];
      if (target.type !== 'var' || list.length === 0) return [];
      const choice = list[Math.floor(Math.random() * list.length)];
      const e = unify(target, choice, env);
      return e ? [e] : [];
    },
    transpose: (args, env) => {
      const note = evalNumber(args[0], env);
      const offset = evalNumber(args[1], env);
      const target = args[2];
      if (target.type !== 'var') return [];
      const e = { ...env };
      e[target.name] = { type:'num', value: note + offset };
      return [e];
    },
    rotate: (args, env) => {
      const list = evalList(args[0], env);
      const shift = evalNumber(args[1], env);
      const target = args[2];
      if (target.type !== 'var') return [];
      const n = list.length;
      if (n === 0) return [];
      const s = ((Math.trunc(shift) % n) + n) % n;
      const rotated = [...list.slice(s), ...list.slice(0, s)];
      const e = unify(target, { type:'list', items: rotated }, env);
      return e ? [e] : [];
    },
    lt: (args, env) => {
      const a = evalNumber(args[0], env);
      const b = evalNumber(args[1], env);
      return a < b ? [env] : [];
    },
    gt: (args, env) => {
      const a = evalNumber(args[0], env);
      const b = evalNumber(args[1], env);
      return a > b ? [env] : [];
    },
    within: (args, env) => {
      const t = evalNumber(args[0], env);
      const start = evalNumber(args[1], env);
      const end = evalNumber(args[2], env);
      return (t >= start && t <= end) ? [env] : [];
    },
    distinct: (args, env) => {
      const list = evalList(args[0], env);
      const seen = new Set();
      for (const item of list) {
        const key = JSON.stringify(item);
        if (seen.has(key)) return [];
        seen.add(key);
      }
      return [env];
    },
    cooldown: (args, env) => {
      const now = evalNumber(args[0], env);
      const last = evalNumber(args[1], env);
      const gap = evalNumber(args[2], env);
      return now - last >= gap ? [env] : [];
    },
    range: (args, env) => {
      const start = evalNumber(args[0], env);
      const end = evalNumber(args[1], env);
      const step = Math.abs(evalNumber(args[2], env)) || 1;
      const target = args[3];
      if (target.type !== 'var') return [];
      const outs = [];
      const dir = end >= start ? 1 : -1;
      for (let v = start; dir > 0 ? v <= end : v >= end; v += dir * step) {
        const e = { ...env };
        e[target.name] = { type:'num', value: v };
        outs.push(e);
      }
      return outs;
    },
    cycle: (args, env) => {
      const list = evalList(args[0], env);
      const target = args[1];
      if (target.type !== 'var' || list.length === 0) return [];
      const key = JSON.stringify(list);
      const idx = cycleState.get(key) ?? 0;
      const nextIdx = (idx + 1) % list.length;
      cycleState.set(key, nextIdx);
      const e = unify(target, list[idx], env);
      return e ? [e] : [];
    }
  };

  builtins.euc = (args, env, ctx) => {
    const T = evalNumber(args[0], env);
    const K = evalNumber(args[1], env);
    const N = evalNumber(args[2], env);
    const B = evalNumber(args[3], env);
    const R = evalNumber(args[4], env);
    if (!(Number.isFinite(K) && Number.isFinite(N) && N>0 && K>=0 && K<=N)) return [];
    const s  = stepIndexAtTime(T, N, B, ctx.bpm);
    const sR = (s + (R % N) + N) % N;
    const hit = ((sR * K) % N) < K;
    return hit ? [env] : [];
  };

  return builtins;
}
