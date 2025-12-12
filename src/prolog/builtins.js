import { substTerm } from './terms.js';
import { unify } from './unify.js';

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
