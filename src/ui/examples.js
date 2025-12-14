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
% Polyrhythms: Different beat divisions create interesting patterns
% beat(T, N) fires every N beats
kik(T) :- beat(T, 3).  % Every 3 beats
snr(T) :- beat(T, 2), prob(0.7).  % Every 2 beats, 70% chance
hat(T) :- beat(T, 5).  % Every 5 beats creates polyrhythm

% phase(T, N, K) fires on step K of every N steps
% Here: 15th step of 16 = fill at bar end, 50% probability
fill(T) :- phase(T, 16, 15), prob(0.5).

% Map predicates to sound events
event(kick, 36, 0.95, T) :- kik(T).
event(snare, 38, 0.85, T) :- snr(T).
event(hat, 42, 0.25, T) :- hat(T).
event(hat, 44, 0.40, T) :- fill(T).  % Higher pitched hat for fills
`
  },
  {
    id: 'scale-chords',
    label: 'Scales + chord arps',
    code: `
% scale(Root, Mode, Degree, Octave, Out) converts scale degree to MIDI
% Ionian mode (major scale) rooted at C4 (MIDI 60)
% Multiple clauses create non-determinism: all fire, creating chord/harmony
lead(T, N) :- every(T, 0.25), scale(60, ionian, 1, 0, N).  % Root (C)
lead(T, N) :- every(T, 0.25), scale(60, ionian, 3, 0, N).  % 3rd (E)
lead(T, N) :- every(T, 0.25), scale(60, ionian, 5, 0, N).  % 5th (G)
lead(T, N) :- every(T, 0.25), scale(60, ionian, 8, 0, N).  % Octave (C)

% chord(Root, Quality, Octave, Out) outputs all chord tones
% A minor7 chord (A-C-E-G) arpeggiated every half beat
arp(T, N) :- every(T, 0.5), chord(57, min7, 0, N).

% Euclidean rhythm grid for drums
kik(T) :- euc(T, 4, 16, 4, 0).   % Four-on-the-floor
hat(T) :- euc(T, 11, 16, 4, 0).  % Dense euclidean hat pattern

% Events with different velocities for dynamics
event(kick, 36, 0.95, T) :- kik(T).
event(hat, 42, 0.25, T) :- hat(T).
event(sine, N, 0.50, T) :- lead(T, N).  % Softer lead
event(sine, N, 0.60, T) :- arp(T, N).   % Louder arp
`
  },
  {
    id: 'randomizer',
    label: 'Random melody + swingy hats',
    code: `
% cycle([List], Out) outputs each list element on successive calls
% Combined with prob(): probabilistic pentatonic melody
% C pentatonic: C(60) D(62) F(65) G(67) A(69)
rnd(T, N) :- every(T, 0.25), cycle([60,62,65,67,69], N), prob(0.9).

% Swingy hat grid: rapid 1/8 notes with probability
% Vary swing slider in controls to change groove feel
hat(T) :- every(T, 0.125), prob(0.8).

% Backbeat rhythm section
kik(T) :- euc(T, 4, 16, 4, 0).  % Four-on-the-floor
snr(T) :- euc(T, 2, 16, 4, 4).  % Beats 2 & 4

% Events - note low velocity on hats for human feel
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
% Sparse, micro-timed house grid with varied probabilities
kik(T) :- euc(T, 4, 16, 4, 0).  % Steady kick
snr(T) :- phase(T, 8, 4).        % Clap on step 4 of every 8
hat(T) :- every(T, 0.125), prob(0.6).  % Sparse hi-hats
perc(T) :- beat(T, 7), prob(0.3).  % Occasional texture hit

% Dorian mode bass (minor with raised 6th)
% Root on 1/2 beats, 5th on whole beats creates movement
bass(T, N) :- every(T, 0.5), scale(48, dorian, 1, 0, N).  % Root
bass(T, N) :- every(T, 1.0), scale(48, dorian, 5, 0, N).  % 5th

% Map to events with dynamic control via velocity
event(kick, 36, 0.95, T) :- kik(T).
event(snare, 38, 0.75, T) :- snr(T).  % Softer clap
event(hat, 42, 0.18, T) :- hat(T).    % Very quiet hats
event(hat, 46, 0.22, T) :- perc(T).   % Open hat texture
event(sine, N, 0.45, T) :- bass(T, N).
`
  },
  {
    id: 'constraints',
    label: 'Constraints: cooldown & within',
    code: `
% Constraint built-ins control when events can fire

% cooldown(Now, LastTime, MinGap) prevents events firing too close together
% within(T, Start, End) limits events to time window
% All conditions must be true (logical AND)
event(kick, 36, 0.95, T) :- euc(T, 4, 16, 4, 0), within(T, 0, 2.0), cooldown(T, 0, 0.3).

% Chord hits on quarters (C major)
% beat(T, 1) fires every beat (quarter note)
event(sine, N, 0.70, T) :- beat(T, 1), chord(60, maj, 0, N).

% Cycling bass line every half beat
event(sine, N, 0.60, T) :- every(T, 0.5), cycle([40,43,47,48], N).

% Hats: constant rhythm + probabilistic accents in first bar
event(hat, 42, 0.22, T) :- every(T, 0.125).
event(hat, 46, 0.30, T) :- every(T, 0.25), prob(0.3), within(T, 0, 2.0).
`
  },
  {
    id: 'recursion',
    label: 'Recursive loops',
    code: `
% User-defined predicates: Prolog-style list recursion
% seq/2 walks a list: [Head|Tail] pattern matching
% First clause: head of list matches
% Second clause: recurse on tail
seq([H|_], H).
seq([_|T], X) :- seq(T, X).

% Melody: each call to mel_note/1 backtracks through all list items
% Combined with every/2: all 5 notes fire on each quarter beat
mel_note(N) :- seq([72,74,76,79,81], N).
event(sine, N, 0.65, T) :- every(T, 0.25), mel_note(N).

% Descending bass line using same recursive pattern
bass_note(N) :- seq([48,47,45,43,41,40,38], N).
event(sine, N, 0.50, T) :- every(T, 0.5), bass_note(N).

% Drum foundation
event(kick, 36, 0.95, T) :- euc(T, 4, 16, 4, 0).
event(snare, 38, 0.85, T) :- euc(T, 2, 16, 4, 4).
event(hat, 42, 0.20, T) :- every(T, 0.125), prob(0.6).
`
  },
  {
    id: 'melodic-transforms',
    label: 'Melodic transforms (rotate & transpose)',
    code: `
% rotate(List, Shift, OutList) rotates a list by Shift positions
% transpose(Note, Offset, Out) shifts MIDI note by semitones
% These let you manipulate melodic patterns programmatically

% Original melody pattern
melody([60,64,67,69]).

% Play original pattern
mel1(T, N) :- every(T, 0.25), melody(M), rotate(M, 0, R), choose(R, N).

% Rotate pattern by 1 step (starts on 2nd note)
mel2(T, N) :- every(T, 0.25), melody(M), rotate(M, 1, R), choose(R, N), transpose(N, 7, N).

% Rotate by 2 and transpose up an octave (+12 semitones)
mel3(T, N) :- every(T, 0.5), melody(M), rotate(M, 2, R), choose(R, X), transpose(X, 12, N).

% Minimal drums to keep time
event(kick, 36, 0.85, T) :- beat(T, 2).
event(hat, 42, 0.20, T) :- every(T, 0.125).

% Three melody voices with different timbres
event(sine, N, 0.50, T) :- mel1(T, N).
event(square, N, 0.35, T) :- mel2(T, N).
event(triangle, N, 0.30, T) :- mel3(T, N).
`
  },
  {
    id: 'synth-showcase',
    label: 'Synth showcase (all instruments)',
    code: `
% Showcase all 8 synthesizer types available
% Each has unique timbre: sine, square, triangle = pitched synths
% kick, snare, hat, clap, noise = percussion

% Melodic instruments playing a simple chord progression
% sine = smooth pure tone
event(sine, N, 0.45, T) :- every(T, 1.0), chord(48, maj, 0, N).

% square = bright, hollow tone (video game style)
event(square, N, 0.30, T) :- every(T, 0.5), scale(72, dorian, 1, 0, N).

% triangle = soft, warm tone
event(triangle, N, 0.35, T) :- every(T, 0.25), choose([60,64,67], N).

% Drum/percussion instruments (Pitch/MIDI ignored for these)
event(kick, 36, 0.90, T) :- euc(T, 5, 16, 4, 0).
event(snare, 38, 0.75, T) :- phase(T, 8, 4).
event(hat, 42, 0.22, T) :- every(T, 0.125), prob(0.7).
event(clap, 39, 0.80, T) :- phase(T, 16, 7).
event(noise, 0, 0.15, T) :- every(T, 0.25), prob(0.2).  % Texture burst
`
  },
  {
    id: 'generative-chaos',
    label: 'Generative chaos (rand & randint)',
    code: `
% rand(Min, Max, Out) generates random float in range
% randint(Min, Max, Out) generates random integer in range
% Each call produces NEW random value - true randomness!

% Random MIDI notes between 60-84 (2 octave range)
% Creates unpredictable melodies
chaos(T, N) :- every(T, 0.125), randint(60, 84, N), prob(0.5).

% Random velocity for dynamics (0.3 to 0.9)
event(sine, N, V, T) :- chaos(T, N), rand(0.3, 0.9, V).

% Kick with random timing offsets using phase
event(kick, 36, 0.95, T) :- every(T, 0.5), randint(0, 3, R), eq(R, 0).

% Random drum fills: randint picks which sound
drum_chaos(T) :- every(T, 0.25), prob(0.3), randint(1, 4, R).
event(snare, 38, 0.70, T) :- drum_chaos(T), randint(1, 4, R), eq(R, 1).
event(hat, 42, 0.25, T) :- drum_chaos(T), randint(1, 4, R), eq(R, 2).
event(clap, 39, 0.65, T) :- drum_chaos(T), randint(1, 4, R), eq(R, 3).
event(noise, 0, 0.30, T) :- drum_chaos(T), randint(1, 4, R), eq(R, 4).
`
  }
];
