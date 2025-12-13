import { evalNumber, stepIndexAtTime } from './utils.js';

/**
 * Timing-related builtin predicates
 */

/**
 * every(T, Step) - Succeeds when T aligns with a step division
 */
export function every(args, env, ctx) {
  const T = evalNumber(args[0], env);
  const step = evalNumber(args[1], env);
  const beat = T * ctx.bpm / 60;
  const eps = 1e-4;
  return (Math.abs((beat / step) - Math.round(beat / step)) < eps) ? [env] : [];
}

/**
 * beat(T, N) - Succeeds when T aligns with a 1/N beat division
 */
export function beat(args, env, ctx) {
  const T = evalNumber(args[0], env);
  const N = evalNumber(args[1], env);
  const beat = T * ctx.bpm / 60;
  const value = beat * N;
  const eps = 1e-4;
  return (Math.abs(value - Math.round(value)) < eps) ? [env] : [];
}

/**
 * phase(T, N, K) - Succeeds when time phase matches K out of N divisions
 */
export function phase(args, env, ctx) {
  const T = evalNumber(args[0], env);
  const N = evalNumber(args[1], env);
  const K = evalNumber(args[2], env);
  const beat = T * ctx.bpm / 60;
  const pos = Math.round(beat * N);
  return (pos % N) === (K % N) ? [env] : [];
}

/**
 * euc(T, K, N, B, R) - Euclidean rhythm generator
 * @param T - Time in seconds
 * @param K - Number of hits
 * @param N - Total steps per bar
 * @param B - Beats per bar
 * @param R - Rotation offset
 */
export function euc(args, env, ctx) {
  const T = evalNumber(args[0], env);
  const K = evalNumber(args[1], env);
  const N = evalNumber(args[2], env);
  const B = evalNumber(args[3], env);
  const R = evalNumber(args[4], env);

  if (!(Number.isFinite(K) && Number.isFinite(N) && N > 0 && K >= 0 && K <= N)) {
    return [];
  }

  const s = stepIndexAtTime(T, N, B, ctx.bpm);
  const sR = (s + (R % N) + N) % N;
  const hit = ((sR * K) % N) < K;
  return hit ? [env] : [];
}
