import { evalNumber, evalTerm, evalList, deepEqual, evalExpression } from './utils.js';
import { unify } from '../unify.js';

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
 * =:= / numeric equality
 */
export function eqNumeric(args, env) {
  const a = evalNumber(args[0], env);
  const b = evalNumber(args[1], env);
  return a === b ? [env] : [];
}

/**
 * =\= / numeric inequality
 */
export function neqNumeric(args, env) {
  const a = evalNumber(args[0], env);
  const b = evalNumber(args[1], env);
  return a !== b ? [env] : [];
}

/**
 * Unification goal (=)
 */
export function unifyGoal(args, env) {
  const left = normalizeTerm(args[0], env);
  const right = normalizeTerm(args[1], env);
  const out = unify(left, right, { ...env });
  return out ? [out] : [];
}

function normalizeTerm(term, env) {
  // If it's an arithmetic expression we can reduce it before unifying
  try {
    const value = evalExpression(term, env);
    return { type: 'num', value };
  } catch {
    return evalTerm(term, env);
  }
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
 * <= / >=
 */
export function lte(args, env) {
  const a = evalNumber(args[0], env);
  const b = evalNumber(args[1], env);
  return a <= b ? [env] : [];
}

export function gte(args, env) {
  const a = evalNumber(args[0], env);
  const b = evalNumber(args[1], env);
  return a >= b ? [env] : [];
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
