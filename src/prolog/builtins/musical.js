import { evalNumber, evalTerm } from './utils.js';
import { scales } from './data/scales.js';
import { chords } from './data/chords.js';

/**
 * Musical builtin predicates
 */

/**
 * scale(Root, Mode, Degree, Octave, Midi) - Map scale degree to MIDI note
 */
export function scale(args, env) {
  const root = evalNumber(args[0], env);
  const modeTerm = evalTerm(args[1], env);
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
}

/**
 * chord(Root, Quality, Octave, Midi) - Generate chord tones
 */
export function chord(args, env) {
  const root = evalNumber(args[0], env);
  const chordTerm = evalTerm(args[1], env);
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
}

/**
 * transpose(Note, Offset, Out) - Transpose a note by semitones
 */
export function transpose(args, env) {
  const note = evalNumber(args[0], env);
  const offset = evalNumber(args[1], env);
  const target = args[2];

  if (target.type !== 'var') return [];

  const e = { ...env };
  e[target.name] = { type: 'num', value: note + offset };
  return [e];
}
