import { evalNumber, evalTerm, evalList, deepEqual } from './utils.js';

/**
 * Logic and constraint builtin predicates
 */

/**
 * eq(A, B) - Deep equality check
 */
export function eq(args, env) {
  const A = evalTerm(args[0], env);
  const B = evalTerm(args[1], env);
  return deepEqual(A, B) ? [env] : [];
}

/**
 * lt(A, B) - Less than
 */
export function lt(args, env) {
  const a = evalNumber(args[0], env);
  const b = evalNumber(args[1], env);
  return a < b ? [env] : [];
}

/**
 * gt(A, B) - Greater than
 */
export function gt(args, env) {
  const a = evalNumber(args[0], env);
  const b = evalNumber(args[1], env);
  return a > b ? [env] : [];
}

/**
 * within(T, Start, End) - Check if time is within bounds
 */
export function within(args, env) {
  const t = evalNumber(args[0], env);
  const start = evalNumber(args[1], env);
  const end = evalNumber(args[2], env);
  return (t >= start && t <= end) ? [env] : [];
}

/**
 * distinct(List) - Check that list has no duplicates
 */
export function distinct(args, env) {
  const list = evalList(args[0], env);
  const seen = new Set();

  for (const item of list) {
    const key = JSON.stringify(item);
    if (seen.has(key)) return [];
    seen.add(key);
  }

  return [env];
}

/**
 * cooldown(Now, Last, Gap) - Check if enough time has passed
 */
export function cooldown(args, env) {
  const now = evalNumber(args[0], env);
  const last = evalNumber(args[1], env);
  const gap = evalNumber(args[2], env);
  return now - last >= gap ? [env] : [];
}
