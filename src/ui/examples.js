import { defaultProgram } from './defaultProgram.js';

export const examples = [
  {
    id: 'euclid-basics',
    label: 'Euclidean basics (drums + bass)',
    code: defaultProgram.trim()
  },
  {
    id: 'poly-prob',
    label: 'Polyrhythm + probability',
    code: `
% Polyrhythms and probabilistic fills
kik(T) :- beat(T, 3).
snr(T) :- beat(T, 2), prob(0.7).
hat(T) :- beat(T, 5).
fill(T) :- phase(T, 16, 15), prob(0.5).

% Map to events
event(kick, 36, 0.95, T) :- kik(T).
event(snare, 38, 0.85, T) :- snr(T).
event(hat, 42, 0.25, T) :- hat(T).
event(hat, 44, 0.40, T) :- fill(T).
`
  },
  {
    id: 'scale-chords',
    label: 'Scales + chord arps',
    code: `
% Major scale lead with octave wrapping
lead(T, N) :- every(T, 0.25), scale(60, ionian, 1, 0, N).
lead(T, N) :- every(T, 0.25), scale(60, ionian, 3, 0, N).
lead(T, N) :- every(T, 0.25), scale(60, ionian, 5, 0, N).
lead(T, N) :- every(T, 0.25), scale(60, ionian, 8, 0, N).

% Arp a minor7 chord
arp(T, N) :- every(T, 0.5), chord(57, min7, 0, N).

% Rhythm skeleton
kik(T) :- euc(T, 4, 16, 4, 0).
hat(T) :- euc(T, 11, 16, 4, 0).

% Events
event(kick, 36, 0.95, T) :- kik(T).
event(hat, 42, 0.25, T) :- hat(T).
event(sine, N, 0.50, T) :- lead(T, N).
event(sine, N, 0.60, T) :- arp(T, N).
`
  },
  {
    id: 'randomizer',
    label: 'Random melody + swingy hats',
    code: `
% Random note chooser in pentatonic
rnd(T, N) :- every(T, 0.25), cycle([60,62,65,67,69], N), prob(0.9).

% Swingy hat grid
hat(T) :- every(T, 0.125), prob(0.8).

% Backbeat and kick grid
kik(T) :- euc(T, 4, 16, 4, 0).
snr(T) :- euc(T, 2, 16, 4, 4).

% Events
event(kick, 36, 0.9, T) :- kik(T).
event(snare, 38, 0.8, T) :- snr(T).
event(hat, 42, 0.2, T) :- hat(T).
event(sine, N, 0.55, T) :- rnd(T, N).
`
  },
  {
    id: 'microhouse',
    label: 'Minimal microhouse',
    code: `
% Sparse, micro-timed house grid
kik(T) :- euc(T, 4, 16, 4, 0).
snr(T) :- phase(T, 8, 4).
hat(T) :- every(T, 0.125), prob(0.6).
perc(T) :- beat(T, 7), prob(0.3).

bass(T, N) :- every(T, 0.5), scale(48, dorian, 1, 0, N).
bass(T, N) :- every(T, 1.0), scale(48, dorian, 5, 0, N).

% Map to events
event(kick, 36, 0.95, T) :- kik(T).
event(snare, 38, 0.75, T) :- snr(T).
event(hat, 42, 0.18, T) :- hat(T).
event(hat, 46, 0.22, T) :- perc(T).
event(sine, N, 0.45, T) :- bass(T, N).
`
  },
  {
    id: 'constraints',
    label: 'Constraints: cooldown & distinct',
    code: `
% Kick only if cooldown passed and within first bar
event(kick, 36, 0.95, T) :- euc(T, 4, 16, 4, 0), within(T, 0, 2.0), cooldown(T, 0, 0.3).

% Chord hits on quarters (Cmaj), bass on halves
event(sine, N, 0.70, T) :- beat(T, 1), chord(60, maj, 0, N).
event(sine, N, 0.60, T) :- every(T, 0.5), cycle([40,43,47,48], N).

% Hats with a small chance of accents if within the first bar
event(hat, 42, 0.22, T) :- every(T, 0.125).
event(hat, 46, 0.30, T) :- every(T, 0.25), prob(0.3), within(T, 0, 2.0).
`
  },
  {
    id: 'recursion',
    label: 'Recursive loops',
    code: `
% Recursive sequence walker (loops over list)
seq([H|_], H).
seq([_|T], X) :- seq(T, X).

mel_note(N) :- seq([72,74,76,79,81], N).
event(sine, N, 0.65, T) :- every(T, 0.25), mel_note(N).

% Recursive descending bass (one note per step)
bass_note(N) :- seq([48,47,45,43,41,40,38], N).
event(sine, N, 0.50, T) :- every(T, 0.5), bass_note(N).

% Drums
event(kick, 36, 0.95, T) :- euc(T, 4, 16, 4, 0).
event(snare, 38, 0.85, T) :- euc(T, 2, 16, 4, 4).
event(hat, 42, 0.20, T) :- every(T, 0.125), prob(0.6).
`
  }
];
