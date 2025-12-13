import { unify } from '../unify.js';
import { evalNumber, evalList } from './utils.js';

/**
 * Arithmetic and list manipulation builtin predicates
 */

/**
 * add(A, B, C) - C = A + B
 */
export function add(args, env) {
  const A = evalNumber(args[0], env);
  const B = evalNumber(args[1], env);
  const C = args[2];

  if (C.type !== 'var') return [];

  const out = { ...env };
  out[C.name] = { type: 'num', value: A + B };
  return [out];
}

/**
 * range(Start, End, Step, X) - Generate range of numbers
 */
export function range(args, env) {
  const start = evalNumber(args[0], env);
  const end = evalNumber(args[1], env);
  const step = Math.abs(evalNumber(args[2], env)) || 1;
  const target = args[3];

  if (target.type !== 'var') return [];

  const outs = [];
  const dir = end >= start ? 1 : -1;

  for (let v = start; dir > 0 ? v <= end : v >= end; v += dir * step) {
    const e = { ...env };
    e[target.name] = { type: 'num', value: v };
    outs.push(e);
  }

  return outs;
}

/**
 * rotate(List, Shift, OutList) - Rotate list by shift amount
 */
export function rotate(args, env) {
  const list = evalList(args[0], env);
  const shift = evalNumber(args[1], env);
  const target = args[2];

  if (target.type !== 'var') return [];

  const n = list.length;
  if (n === 0) return [];

  const s = ((Math.trunc(shift) % n) + n) % n;
  const rotated = [...list.slice(s), ...list.slice(0, s)];
  const e = unify(target, { type: 'list', items: rotated }, env);
  return e ? [e] : [];
}
