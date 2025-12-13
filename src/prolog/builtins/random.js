import { unify } from '../unify.js';
import { evalNumber, evalList } from './utils.js';

/**
 * Random and non-deterministic builtin predicates
 */

/**
 * prob(P) - Succeeds with probability P
 */
export function prob(args, env) {
  const p = evalNumber(args[0], env);
  return (Math.random() < p) ? [env] : [];
}

/**
 * choose(List, X) - Non-deterministically chooses each element from list
 */
export function choose(args, env) {
  const list = evalList(args[0], env);
  const v = args[1];
  const outs = [];
  for (const item of list) {
    const e = unify(v, item, env);
    if (e) outs.push(e);
  }
  return outs;
}

/**
 * pick(List, X) - Randomly picks one element from list
 */
export function pick(args, env) {
  const list = evalList(args[0], env);
  const target = args[1];

  if (target.type !== 'var' || list.length === 0) return [];

  const choice = list[Math.floor(Math.random() * list.length)];
  const e = unify(target, choice, env);
  return e ? [e] : [];
}

/**
 * cycle(List, X) - Cycles through list elements using state manager
 */
export function cycle(args, env, ctx) {
  const list = evalList(args[0], env);
  const target = args[1];

  if (target.type !== 'var' || list.length === 0) return [];

  const key = JSON.stringify(list);

  if (ctx.stateManager) {
    const idx = ctx.stateManager.incrementCycle(key, list.length);
    const e = unify(target, list[idx], env);
    return e ? [e] : [];
  }

  // Fallback if no stateManager
  const e = unify(target, list[0], env);
  return e ? [e] : [];
}

/**
 * rand(Min, Max, X) - Generates random float in range
 */
export function rand(args, env) {
  const min = evalNumber(args[0], env);
  const max = evalNumber(args[1], env);
  const target = args[2];

  if (target.type !== 'var') return [];

  const out = { ...env };
  const value = min + Math.random() * (max - min);
  out[target.name] = { type: 'num', value };
  return [out];
}

/**
 * randint(Min, Max, X) - Generates random integer in range
 */
export function randint(args, env) {
  const min = Math.floor(evalNumber(args[0], env));
  const max = Math.floor(evalNumber(args[1], env));
  const target = args[2];

  if (target.type !== 'var') return [];

  const out = { ...env };
  const value = Math.floor(min + Math.random() * (max - min));
  out[target.name] = { type: 'num', value };
  return [out];
}
