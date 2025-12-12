# dogalog

Vite-based vanilla JS playground for a Prolog-like livecoding music toy. The code is split into small modules for the Prolog engine, audio layer, scheduler, and UI.

## Getting started
1. Install deps: `npm install`
2. Run dev server: `npm run dev` (Vite dev launcher)
3. Build for prod: `npm run build`
4. Preview build: `npm run preview`
5. Run tests: `npm test`

Open the dev server URL, edit rules, click **Evaluate Rules**, then **Start**. Audio may require a user gesture before playback.

## Project layout
- `src/prolog` – tokenizer, parser, unifier, resolver, built-ins
- `src/audio` – WebAudio instruments
- `src/scheduler` – time grid + engine integration
- `src/ui` – default program seed
- `src/main.js` – UI wiring

## Notes
- The scheduler queries `event(Voice, Pitch, Vel, T)` on a 16th-note grid and triggers matching instruments.
- Built-ins include `every/2`, `beat/2`, `phase/3`, `prob/1`, `eq/2`, `add/3`, `choose/2`, `euc/5`.
- Swing and lookahead are adjustable from the controls bar.
