# Prolog-ish Livecoding Cheatsheet

## Core shape
- Facts: `kick(t0).` — things that are simply true.
- Rules: `head :- goal1, goal2.` — head is true if all goals are true.
- Queries: ask for solutions to a goal; here the engine repeatedly asks `event(Voice, Pitch, Vel, T).`
- Variables: Uppercase or `_` start, unify with anything. Atoms: lowercase. Numbers: decimals.
- Lists: `[a, b, c]`.

## Built-ins (music-focused)
- `beat(T, N)` – true on N subdivisions per beat.
- `phase(T, N, K)` – true on step K within N steps per bar.
- `every(T, Step)` – true on a regular grid of beats (Step in beats).
- `prob(P)` – passes with probability P (0..1).
- `choose(List, X)` – nondeterministically unify X with each item.
- `pick(List, X)` – pick one random element.
- `cycle(List, X)` – step through list items across calls.
- `range(Start, End, Step, X)` – count from Start to End by Step.
- `rand(Min, Max, X)` / `randint(Min, Max, X)` – random float/int in range.
- `eq(A,B)` – succeeds if A deep-equals B.
- `add(A,B,C)` – C = A+B.
- `euc(T, K, N, B, R)` – Euclidean rhythm, K hits over N steps per bar, B beats/bar, rotation R.
- `scale(Root, Mode, Degree, Oct, Midi)` – map a scale degree to MIDI.
- `chord(Root, Quality, Oct, Midi)` – emit chord tones as MIDI numbers.
- `transpose(Note, Offset, Out)` – add semitones.
- `rotate(List, Shift, OutList)` – rotate a list.

## Event mapping (default)
- The scheduler asks `event(Voice, Pitch, Vel, T)` every grid tick.
- Voices: `kick`, `snare`, `hat`, `sine` (Pitch is MIDI for `sine`).

## Mini patterns
```prolog
% Four-on-the-floor kick
event(kick, 36, 0.95, T) :- euc(T, 4, 16, 4, 0).

% Backbeat snare and busy hats
event(snare, 38, 0.85, T) :- euc(T, 2, 16, 4, 4).
event(hat,   42, 0.25, T) :- euc(T,11, 16, 4, 0).

% Probabilistic ghost hats
event(hat, 46, 0.18, T) :- every(T, 0.125), prob(0.3).

% Bass: pick from a list every half beat
bass(T, N) :- every(T,0.5), pick([40,43,47,48], N).
event(sine, N, 0.55, T) :- bass(T, N).

% Scale lead (major)
lead(T, N) :- every(T,0.25), scale(60, ionian, 1, 0, N).
lead(T, N) :- every(T,0.25), scale(60, ionian, 3, 0, N).
lead(T, N) :- every(T,0.25), scale(60, ionian, 5, 0, N).
event(sine, N, 0.4, T) :- lead(T, N).

% Chord arp (minor triad)
arp(T, N) :- every(T,0.5), chord(57, min, 0, N).
event(sine, N, 0.5, T) :- arp(T, N).
```

## Tips
- Every rule ends with a period `.`
- Mix deterministic grids (`beat/phase/every`) with `prob` for variation.
- Use `cycle` for predictable motifs, `pick/rand` for surprise, and `euc` for quick grooves.
- Adjust Swing/Lookahead in the UI to change feel and scheduling tightness.
