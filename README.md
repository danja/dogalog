# Dogalog

Dogalog is a realtime Prolog-based livecoding music environment where you write logic rules to create algorithmic rhythmic patterns and melodies.

## Features

- **Livecoding**: Auto-evaluation with visual feedback - code changes apply automatically
- **State Preservation**: Cycle counters and cooldowns persist across updates
- **Interactive Tutorial**: Built-in 13-step guided tutorial for learning
- **PWA Support**: Install as an app, works offline
- **Mobile-First**: Touch-friendly UI optimized for all devices
- **Modular Architecture**: Clean separation of concerns, all files <100 lines
- **Comprehensive Testing**: 123 tests with 88%+ coverage

## Quick Start

```bash
npm install
npm run dev
```

Open the dev server URL, click **Tutorial** to learn, or click **Start** and begin livecoding!

## What are "rules"?

Rules are Prolog-like statements that define when sounds should play:

```prolog
% Kick drum on every beat
event(kick, 60, 80, T) :- beat(T, 1).

% Snare on beats 2 and 4
event(snare, 60, 90, T) :- beat(T, 2).

% Hi-hats every 8th note
event(hat, 60, 70, T) :- every(T, 0.5).
```

The system asks `event(Voice, Pitch, Velocity, Time)` on every step and plays all matching results.

## Builtin Predicates

### Timing
- `beat(T, N)` - Trigger on beat N (1 = downbeat, 2 = halfway, 4 = quarter notes)
- `every(T, Step)` - Trigger at regular intervals (0.5 = twice per beat)
- `phase(T, N, K)` - Trigger on phase K of N divisions
- `euc(T, K, N, B, R)` - Euclidean rhythm (K hits over N steps)

### Random & Variation
- `prob(P)` - Succeed with probability P (0.0-1.0)
- `choose(List, X)` - Pick random element
- `cycle(List, X)` - Cycle through elements sequentially (stateful!)
- `pick(List, X)` - Backtrack through all elements
- `rand(Min, Max, X)` - Random float
- `randint(Min, Max, X)` - Random integer

### Musical
- `scale(Root, Mode, Degree, Oct, Midi)` - Convert scale degree to MIDI note
- `chord(Root, Quality, Oct, Midi)` - Generate chord tones
- `transpose(Note, Offset, Out)` - Transpose by semitones

### Logic & Control
- `within(T, Start, End)` - Time range check (for song structure)
- `cooldown(Now, Last, Gap)` - Prevent rapid retriggering
- `eq(A, B)`, `lt(A, B)`, `gt(A, B)` - Comparisons
- `distinct(List)` - Check all elements are unique
- `add(A, B, C)` - Arithmetic
- `range(Start, End, Step, X)` - Generate number sequences
- `rotate(List, Shift, OutList)` - Rotate lists

### Instruments
- `kick` - Synthesized kick drum
- `snare` - Noise-based snare
- `hat` - Noise-based hi-hat
- `sine` - Sine wave monosynth (use MIDI pitch)

## Examples

### Euclidean Rhythms

Four-on-the-floor with backbeat:
```prolog
event(kick, 60, 100, T) :- euc(T, 4, 16, 4, 0).
event(snare, 60, 90, T) :- euc(T, 2, 16, 4, 4).
```

Complex polyrhythm:
```prolog
event(kick, 60, 100, T) :- euc(T, 3, 8, 0.5, 0).
event(snare, 60, 80, T) :- euc(T, 5, 8, 0.5, 2).
```

### Melodies with Scales

Pentatonic melody:
```prolog
note(N) :- cycle([1, 3, 4, 5, 8], D), scale(60, minor_pent, D, 0, N).
event(sine, N, 70, T) :- every(T, 0.5), note(N).
```

Available modes: `major`, `minor`, `dorian`, `phrygian`, `lydian`, `mixolydian`, `locrian`, `minor_pent`, `major_pent`, `blues`, `whole_tone`, `chromatic`

### Arpeggiated Chords

```prolog
arp(N) :- chord(60, minor, 0, Notes), choose(Notes, N).
event(sine, N, 70, T) :- every(T, 0.25), arp(N).
```

Chord qualities: `maj`, `min`, `dim`, `aug`, `sus2`, `sus4`, `maj7`, `min7`, `dom7`, `dim7`

### Probability & Variation

Random velocities:
```prolog
vel(V) :- choose([60, 80, 100], V).
event(hat, 60, V, T) :- every(T, 0.25), vel(V).
```

Sparse pattern:
```prolog
event(snare, 60, 80, T) :- beat(T, 2), prob(0.3).
```

### Song Structure with `within`

```prolog
% Intro: just kick (beats 0-8)
event(kick, 60, 100, T) :- beat(T, 1).

% Verse: add snare (beats 8-16)
event(snare, 60, 80, T) :- beat(T, 2), within(T, 8, 16).

% Chorus: add melody (beats 16-24)
melody(N) :- scale(60, major, D, 0, N), cycle([1,3,5,8], D).
event(sine, N, 70, T) :- every(T, 0.5), melody(N), within(T, 16, 24).
```

### Fills with `cooldown`

```prolog
% Regular pattern
event(kick, 60, 100, T) :- beat(T, 1).

% Fill every 4+ bars
fill(T) :- beat(T, 1), cooldown(T, last_fill, 4).
event(snare, 60, V, T) :- fill(T), every(T, 0.25), choose([80,90,100], V).
```

## Development

### Build Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate coverage report
npm run docs:html    # Build manual and cheatsheet
```

### Project Structure

```
src/
├── prolog/          # Prolog engine
│   ├── builtins/    # Builtin predicates (modular)
│   ├── parser.js    # Parser
│   ├── resolution.js # SLD resolution with generators
│   ├── tokenizer.js # Tokenizer
│   ├── unify.js     # Unification
│   └── terms.js     # Term constructors
├── audio/           # WebAudio synthesis
│   └── audioEngine.js
├── scheduler/       # Timing and execution
│   ├── scheduler.js
│   ├── stateManager.js
│   └── transitionManager.js
├── livecoding/      # Auto-evaluation
│   ├── codeValidator.js
│   └── liveEvaluator.js
├── tutorial/        # Tutorial system
│   ├── tutorialManager.js
│   ├── tutorialOverlay.js
│   └── steps.js
├── ui/              # User interface
│   ├── components/  # Reusable components
│   ├── template.js
│   ├── controls.js
│   └── validationIndicator.js
├── help/            # Documentation
│   └── builtinDocs.js
├── config/          # Configuration
│   └── defaults.js
├── app.js           # Application orchestrator
└── main.js          # Entry point
```

### Architecture

- **Prolog Engine**: Custom implementation with SLD resolution using ES6 generators for backtracking
- **Livecoding**: Debounced auto-evaluation (300ms) with syntax validation
- **State Management**: Centralized state for cycle counters and cooldowns (persists across code updates)
- **Scheduler**: Time-grid based (16th notes) with swing and lookahead support
- **Audio**: WebAudio synthesis without samples - all sounds generated in real-time
- **UI**: Mobile-first, progressive enhancement, DOM-based components

### Testing

- 123 tests across 16 test files
- Coverage: 88.52% statements, 90.42% functions
- Integration tests for livecoding, state preservation, example loading
- UI component tests with vitest + jsdom

### PWA Features

- Installable on mobile and desktop
- Offline support with service worker
- Caches all assets and documentation
- Manifest with icons and theme colors

## Documentation

- **Interactive Tutorial**: Click "Tutorial" button in the app
- **Manual**: `docs/manual.html` (comprehensive reference)
- **Cheatsheet**: `docs/cheatsheet.html` (quick reference)
- **Live Demo**: [GitHub Pages](https://yourusername.github.io/dogalog/)

## Technical Details

### Livecoding Flow

1. User edits code in editor
2. After 300ms debounce, code is validated
3. If valid: parse → compile → swap program (with smooth transition)
4. State (cycles, cooldowns) persists across updates
5. Visual indicator shows validation state (green/red/yellow)

### State Preservation

```prolog
% This pattern's state persists when you edit other code:
drums(D) :- cycle([kick, snare, hat], D).
event(D, 60, 80, T) :- beat(T, 1), drums(D).

% Editing this won't reset the cycle counter!
```

### Euclidean Rhythms

Euclidean rhythms distribute K hits as evenly as possible over N steps using the Euclidean algorithm. The result is musically interesting patterns used in music worldwide:

- `euc(T, 3, 8, 0.5, 0)` - Tresillo pattern (Cuban music)
- `euc(T, 5, 8, 0.5, 0)` - Cinquillo pattern
- `euc(T, 5, 12, 0.5, 0)` - Common rock beat

## Browser Support

- Modern browsers with WebAudio API
- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- Mobile browsers (iOS Safari, Chrome Android)

## License

MIT

## Credits

Built with vanilla JavaScript, CodeMirror 6, and WebAudio API. Inspired by TidalCycles, Sonic Pi, and Datalog.
