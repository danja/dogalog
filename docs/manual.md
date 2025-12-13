# Dogalog Manual

## What is this?
A tiny, Prolog-ish livecoding playground in the browser. You write facts and rules; the engine queries `event(Voice, Pitch, Vel, T)` every step and plays matching sounds.

## Getting started
1. Open the app (GitHub Pages link in the README).
2. Click once on the page, then press **Start** to unlock audio.
3. Edit rules in the editor — changes load automatically as you type.
4. Use **BPM**, **Swing**, and **Lookahead** sliders to tweak feel and timing.

## Core syntax
- Facts end with `.`: `kick(t0).`
- Rules: `head :- goal1, goal2.`
- Variables start uppercase or `_`; atoms start lowercase.
- Lists: `[a, b, c]`.
- Comments: `% comment text`.

## Built-ins (music + constraints)
- Rhythm grids: `beat(T, N)`, `phase(T, N, K)`, `every(T, Step)`
- Probability: `prob(P)`
- Lists/choices: `choose(List, X)`, `pick(List, X)`, `cycle(List, X)`, `range(Start, End, Step, X)`
- Random: `rand(Min, Max, X)`, `randint(Min, Max, X)`
- Math/relations: `eq(A,B)`, `add(A,B,C)`, `lt(A,B)`, `gt(A,B)`
- Constraints: `within(T, Start, End)`, `distinct(List)`, `cooldown(Now, Last, Gap)`
- Euclidean: `euc(T, K, N, B, R)`
- Pitch helpers: `scale(Root, Mode, Degree, Oct, Midi)`, `chord(Root, Quality, Oct, Midi)`, `transpose(Note, Offset, Out)`, `rotate(List, Shift, OutList)`

## Instruments (voices)
- `kick`, `snare`, `hat`, `clap`, `noise` (drums/noise; ignore Pitch)
- `sine`, `square`, `triangle` (monosynths; Pitch is MIDI)

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

% Recursive loop over time (bounded)
loop_hats(T, End) :-
  T =< End,
  event(hat, 42, 0.25, T),
  add(T, 0.125, T1),
  loop_hats(T1, End).

start_loop(T0) :-
  event(kick, 36, 0.95, T0),
  add(T0, 0.125, Tstart),
  add(T0, 2.0, Tend),
  loop_hats(Tstart, Tend).

% Recursive walk through a list (motif)
play_seq(T, Step, [N|Ns]) :-
  event(sine, N, 0.5, T),
  add(T, Step, T1),
  play_seq(T1, Step, Ns).
play_seq(_, _, []).
motif(T) :- play_seq(T, 0.25, [60,62,65,67]).
```

## Tips
- Every rule ends with `.`
- Combine deterministic grids (`beat/phase/every`) with `prob` for variation.
- `cycle` for motifs, `pick/rand` for surprise, `euc` for quick grooves.
- If timing is off, reduce Lookahead; add Swing for feel.

## Dogalog Language Reference
- **Programs**: A program is a list of clauses ending with `.`. Clauses are either facts (`drum(kick).`) or rules (`head :- goal1, goal2.`).
- **Terms**: atoms (`kick`), numbers (`42`, `3.14`), variables (`X`, `_Foo`), lists (`[a, b, c]`), compounds (`event(kick, 36, 0.8, T)`), and arithmetic expressions (`(A + 3) * 0.5`).
- **Variables**: Uppercase or `_` start a variable; `_` is anonymous and fresh each time. Variables are renamed per rule application.
- **Top goal**: The engine repeatedly queries `event(Voice, Pitch, Vel, T)`. Your rules should ultimately derive that predicate to make sound.
- **Conjunction**: `,` means logical AND and is evaluated left-to-right with backtracking.
- **Disjunction**: `;` means logical OR. `(a, b ; c)` tries `a, b` first, then `c`.
- **Negation as failure**: `\+ Goal` succeeds when `Goal` has no solutions. Works with grouped goals: `\+ (beat(T, 1) ; beat(T, 3))`.
- **Grouping**: Parentheses change precedence for disjunction/negation and arithmetic.
- **Infix comparisons**: Use `<`, `>`, `=<`, `>=`, `=:=` (numeric equality), `=\=` (numeric inequality), and `=` (unification). Examples: `T >= 4`, `Vel =:= 0.8`, `Note1 = Note2`.
- **Arithmetic expressions**: `+`, `-`, `*`, `/` can appear inside arguments and in infix comparisons: `Vel = (A + B) / 2`, `T < 8 - 0.5`.
- **Unification**: `=` unifies terms (after evaluating arithmetic expressions). It can bind variables or check equality of structures.
- **Built-ins vs infix**: Comparisons via infix operators replace `lt/gt/eq` in most cases. List/logic helpers (`within/3`, `distinct/1`, `cooldown/3`, etc.) remain as predicates.
- **Randomness/state**: `prob/1`, `choose/2`, `pick/2`, `rand/3`, `randint/3` add variation. `cycle/2` and `cooldown/3` keep state across calls (reset by example change or reload).
- **Time**: `T` is in beats. Use `beat/2`, `phase/3`, `every/2`, `euc/5`, `within/3` for rhythm. Scheduler swing/lookahead are handled automatically.
- **Comments**: `%` starts a line comment (runs to newline).

## Troubleshooting
- No sound: click the page, press **Start**, ensure device volume, disable mute/silent.
- Parse errors: check missing periods or mismatched parens/brackets.
- Network/Pages: hard refresh or disable old service workers if a stale cached build interferes.
