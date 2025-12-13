# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dogalog is a musical livecoding toy that uses Prolog-like logic programming to generate music patterns via WebAudio. Users write declarative rules describing when sounds should play, and the engine queries these rules on a rhythmic grid to trigger synthesized instruments.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (Vite)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests (Vitest)
npm test

# Generate HTML documentation
npm run docs:html
```

## Architecture

### Core Components

**Prolog Engine** (`src/prolog/`)
- **tokenizer.js** / **parser.js**: Convert Prolog-like text into clause structures
- **terms.js**: Term representation and substitution (variables, atoms, compounds, lists, numbers)
- **unify.js**: Unification algorithm for pattern matching
- **resolution.js**: SLD resolution engine that yields environments through backtracking
- **builtins.js**: Built-in predicates (euclidean rhythms, scales, chords, timing, randomness)
- **index.js**: Public API exports

The Prolog engine uses ES6 generators for backtracking. `resolveGoals()` yields all possible environments that satisfy a goal.

**Scheduler** (`src/scheduler/scheduler.js`)
- Queries `event(Voice, Pitch, Vel, T)` on a 16th-note grid (configurable via `gridBeats`)
- Lookahead scheduling: queries future time steps and schedules audio events
- Swing support: delays odd eighth notes by a configurable amount
- Passes BPM context to built-ins so timing predicates work correctly

**Audio Engine** (`src/audio/audioEngine.js`)
- WebAudio-based synthesis for four instruments: kick, snare, hat, sine
- Each instrument method takes `(time, midi, velocity)` or similar parameters
- Uses scheduled audio nodes (no sample playback, all synthesis)
- Master gain bus connects to destination

**UI** (`src/main.js`, `src/ui/`)
- CodeMirror 6 editor with custom Prolog syntax highlighting (`prologLanguage.js`)
- Control panel for BPM, swing, lookahead
- Example programs selector
- Manual and cheatsheet links (generated from markdown)

### Data Flow

1. User writes Prolog-like rules in the editor
2. Editor changes auto-parse into clauses (debounced live evaluation)
3. "Start" button begins scheduler interval
4. Scheduler queries `event/4` for each time step in lookahead window
5. `resolveGoals()` backtracks through clauses and built-ins, yielding all matching events
6. Audio engine schedules WebAudio nodes at computed times

### Prolog Clause Structure

Each clause has:
- **head**: a compound term (e.g., `event(kick, 36, 1.0, T)`)
- **body**: array of goal terms (empty for facts)

Example clause representation:
```javascript
{
  head: { type: 'compound', f: 'event', args: [...] },
  body: [{ type: 'compound', f: 'euc', args: [...] }]
}
```

### Built-in Context

Built-ins receive `(args, env, ctx)`:
- **args**: array of goal arguments (terms)
- **env**: variable bindings object
- **ctx**: execution context (currently just `{ bpm }`)

Built-ins return an array of environments (possibly empty for failure, multiple for non-determinism).

## Testing

Tests use Vitest with jsdom environment (configured in `vite.config.mjs`). Tests are in `tests/` mirroring `src/` structure.

**Running specific tests:**
```bash
npm test -- tests/prolog/unify.test.js
```

**Watch mode:**
```bash
npm test -- --watch
```

## Important Constraints

- **No sample loading**: All audio is synthesized in real-time
- **16th-note grid**: Scheduler queries are quantized (adjustable via `gridBeats`)
- **Generator-based backtracking**: Resolution uses `yield*` for proper Prolog semantics
- **Stateless built-ins**: Except for `cycle/2`, built-ins should be pure (reset via `builtins.reset()`)

## Common Patterns

**Adding a new built-in:**
1. Add function to `builtins` object in `src/prolog/builtins.js`
2. Use `evalNumber()`, `evalList()`, `evalTerm()` to extract typed values
3. Return array of environments (empty array = failure, multiple envs = multiple solutions)
4. Add to UI built-ins list in `src/main.js` (lines 51-73)

**Adding a new instrument:**
1. Add method to `AudioEngine` class in `src/audio/audioEngine.js`
2. Add trigger case in `Scheduler.trigger()` in `src/scheduler/scheduler.js`
3. Document in UI instruments section (lines 84-88 of `src/main.js`)

**Modifying the query goal:**
The system always queries `event(Voice, Pitch, Vel, T)`. Changing this requires coordinating:
- Goal construction in `scheduler.js:44`
- Variable extraction in `scheduler.js:46-50`
