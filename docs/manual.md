# Dogalog Manual

## What is this?
A tiny, Prolog-ish livecoding playground in the browser. You write facts and rules; the engine queries `event(Voice, Pitch, Vel, T)` every step and plays matching sounds.

## Getting started
1. Open the app (GitHub Pages link in the README).
2. Click once on the page, then press **Start** to unlock audio.
3. Edit rules in the editor, then press **Evaluate Rules** to load them.
4. Use **BPM**, **Swing**, and **Lookahead** sliders to tweak feel and timing.

## Core syntax
- Facts end with `.`: `kick(t0).`
- Rules: `head :- goal1, goal2.`
- Variables start uppercase or `_`; atoms start lowercase.
- Lists: `[a, b, c]`.
- Comments: `% comment text`.

## Built-ins (music)
- Rhythm grids: `beat(T, N)`, `phase(T, N, K)`, `every(T, Step)`
- Probability: `prob(P)`
- Lists/choices: `choose(List, X)`, `pick(List, X)`, `cycle(List, X)`, `range(Start, End, Step, X)`
- Random: `rand(Min, Max, X)`, `randint(Min, Max, X)`
- Math: `eq(A,B)`, `add(A,B,C)`
- Euclidean: `euc(T, K, N, B, R)`
- Pitch helpers: `scale(Root, Mode, Degree, Oct, Midi)`, `chord(Root, Quality, Oct, Midi)`, `transpose(Note, Offset, Out)`, `rotate(List, Shift, OutList)`

## Instruments (voices)
- `kick`, `snare`, `hat`, `sine` (Pitch is MIDI for `sine`).

## Examples
```prolog
% Drums
kik(T) :- euc(T, 4, 16, 4, 0).
snr(T) :- euc(T, 2, 16, 4, 4).
hat(T) :- euc(T,11, 16, 4, 0).

event(kick, 36, 0.95, T) :- kik(T).
event(snare, 38, 0.85, T) :- snr(T).
event(hat, 42, 0.25, T) :- hat(T).

% Bass: choose notes every half beat
bass(T, N) :- every(T,0.5), pick([40,43,47,48], N).
event(sine, N, 0.55, T) :- bass(T, N).

% Lead using scale degrees
lead(T, N) :- every(T,0.25), scale(60, ionian, 1, 0, N).
lead(T, N) :- every(T,0.25), scale(60, ionian, 3, 0, N).
lead(T, N) :- every(T,0.25), scale(60, ionian, 5, 0, N).
event(sine, N, 0.4, T) :- lead(T, N).
```

## Tips
- Every rule ends with `.`
- Combine deterministic grids (`beat/phase/every`) with `prob` for variation.
- `cycle` for motifs, `pick/rand` for surprise, `euc` for quick grooves.
- If timing is off, reduce Lookahead; add Swing for feel.

## Troubleshooting
- No sound: click the page, press **Start**, ensure device volume, disable mute/silent.
- Parse errors: check missing periods or mismatched parens/brackets.
- Network/Pages: hard refresh or disable old service workers if a stale cached build interferes.
