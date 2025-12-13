/**
 * Builtins index - aggregates all builtin predicates
 */
import { every, beat, phase, euc } from './timing.js';
import { scale, chord, transpose } from './musical.js';
import { prob, choose, pick, cycle, rand, randint } from './random.js';
import { eq, eqNumeric, neqNumeric, unifyGoal, lt, gt, lte, gte, within, distinct, cooldown } from './logic.js';
import { add, range, rotate } from './arithmetic.js';

/**
 * Create and return all builtin predicates
 * @returns {Object} Builtin predicates object
 */
export function createBuiltins() {
  return {
    // Timing
    every,
    beat,
    phase,
    euc,

    // Musical
    scale,
    chord,
    transpose,

    // Random
    prob,
    choose,
    pick,
    cycle,
    rand,
    randint,

    // Logic
    eq,
    '=': unifyGoal,
    '=:=': eqNumeric,
    '=\\=': neqNumeric,
    '<': lt,
    '>': gt,
    '=<': lte,
    '>=': gte,
    lt,
    gt,
    eqNumeric,
    neqNumeric,
    lte,
    gte,
    within,
    distinct,
    cooldown,

    // Arithmetic
    add,
    range,
    rotate
  };
}
