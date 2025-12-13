import { substTerm } from '../terms.js';

/**
 * Evaluate a term as a number
 * @param {Object} term - Term to evaluate
 * @param {Object} env - Variable environment
 * @returns {number}
 * @throws {Error} If term is not a number
 */
export function evalNumber(term, env) {
  const t = substTerm(term, env);
  if (t.type === 'num') return t.value;
  throw new Error('Expected number in builtin');
}

/**
 * Evaluate a term as a list
 * @param {Object} term - Term to evaluate
 * @param {Object} env - Variable environment
 * @returns {Array}
 * @throws {Error} If term is not a list
 */
export function evalList(term, env) {
  const t = substTerm(term, env);
  if (t.type === 'list') return t.items;
  throw new Error('Expected list in builtin');
}

/**
 * Evaluate a term (no type checking)
 * @param {Object} term - Term to evaluate
 * @param {Object} env - Variable environment
 * @returns {Object}
 */
export function evalTerm(term, env) {
  return substTerm(term, env);
}

/**
 * Deep equality check using JSON serialization
 * @param {*} a - First value
 * @param {*} b - Second value
 * @returns {boolean}
 */
export function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Calculate step index at a given time for euclidean rhythms
 * @param {number} T - Time in seconds
 * @param {number} N - Total steps per bar
 * @param {number} B - Beats per bar
 * @param {number} bpm - Beats per minute
 * @returns {number} Step index (0..N-1)
 */
export function stepIndexAtTime(T, N, B, bpm) {
  const beats = T * bpm / 60;
  const bars = beats / B;
  const sReal = Math.round(bars * N);
  return ((sReal % N) + N) % N;
}
