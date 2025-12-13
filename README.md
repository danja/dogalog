# Dogalog

Dogalog is a musical livecoding toy based on the Prolog language.

## What are “rules”?
Rules are little statements like this:
```
kick(T)  :- euc(T, 4, 16, 4, 0).
```
Read it as: “At time `T`, the *kick* should play if an **Euclidean rhythm** with 4 hits over 16 steps (in 4/4 time) says so.”

The system repeatedly asks:
```
event(Voice, Pitch, Velocity, Time).
```
Every matching result becomes a sound.

## Euclidean rhythms (the fun part)
This project includes a builtin:
```
euc(T, K, N, B, R)
```
- **K** = number of hits
- **N** = total steps per bar
- **B** = beats per bar (use 4 for 4/4, 3 for 3/4, etc.)
- **R** = rotation (shift the pattern right by R steps)

### Examples
Four‑on‑the‑floor kick (4 hits over 16 steps):
```
kik(T) :- euc(T, 4, 16, 4, 0).
event(kick, 36, 0.95, T) :- kik(T).
```
Backbeat snare on 2 and 4 (rotate by 4 steps):
```
snr(T) :- euc(T, 2, 16, 4, 4).
event(snare, 38, 0.90, T) :- snr(T).
```
Busy hi‑hat (11 hits over 16 steps):
```
hat1(T) :- euc(T, 11, 16, 4, 0).
event(hat, 42, 0.30, T) :- hat1(T).
```

## Choosing notes for melodies/bass
Pick from a list at certain times:
```
bass(T, N) :- every(T, 0.5), choose([40,43,47,48], N).
event(sine, N, 0.55, T) :- bass(T, N).
```
Here `N` is a MIDI note number (40 = E2, 48 = C3).

## Dev Notes

Dogalog is written in vanilla JS and bundled into an app with Vite. The code is split into small modules for the Prolog engine, audio layer, scheduler, and UI.

### Build
1. Install deps: `npm install`
2. Run dev server: `npm run dev` (Vite dev launcher)
3. Build for prod: `npm run build`
4. Preview build: `npm run preview`
5. Run tests: `npm test`

Open the dev server URL, edit rules, click **Evaluate Rules**, then **Start**. Audio may require a user gesture before playback.

Live demo (GitHub Pages) and docs:
- Manual (HTML): `docs/manual.html` (source `docs/manual.md`; built during deploy)
- Cheatsheet (HTML): `docs/cheatsheet.html` (source `cheatsheet.md`; built during deploy)
- Pages link: will be published via GitHub Actions on `main` (see `.github/workflows/deploy.yml`).

### Project layout
- `src/prolog` – tokenizer, parser, unifier, resolver, built-ins
- `src/audio` – WebAudio instruments
- `src/scheduler` – time grid + engine integration
- `src/ui` – default program seed
- `src/main.js` – UI wiring

## Notes
- The scheduler queries `event(Voice, Pitch, Vel, T)` on a 16th-note grid and triggers matching instruments.
- Built-ins include `every/2`, `beat/2`, `phase/3`, `prob/1`, `eq/2`, `add/3`, `choose/2`, `pick/2`, `cycle/2`, `rotate/3`, `range/4`, `transpose/3`, `lt/2`, `gt/2`, `within/3`, `distinct/1`, `cooldown/3`, `euc/5`, `rand/3`, `randint/3`, `scale/5`, `chord/4`.
- Swing and lookahead are adjustable from the controls bar.
