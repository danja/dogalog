# Dogalog Requirements Compliance Implementation Plan

## Overview

This plan addresses three major compliance gaps between the current Dogalog implementation and the requirements in `docs/requirements.md`:

1. **Livecoding**: No auto-evaluation, state reset on updates, no smooth transitions
2. **Modularity**: HTML in JS, monolithic files (main.js 214 lines, builtins.js 267 lines)
3. **PWA/Mobile**: No PWA infrastructure, desktop-first CSS, missing mobile optimization

## Priority 1: Livecoding Core (Foundational)

### 1.1 Code Validation System
**Create**: `src/livecoding/codeValidator.js`
- Wrap `parseProgram()` to return `{ valid, clauses?, error? }` instead of throwing
- Enable safe auto-evaluation without crashes

**Create**: `tests/livecoding/codeValidator.test.js`
- Test valid/invalid syntax handling
- Test partial edits during typing

### 1.2 Live Evaluation Engine
**Create**: `src/livecoding/liveEvaluator.js`
- Monitor editor changes with 300ms debounce
- Validate code continuously
- Swap program only when valid
- Preserve state across updates

**Modify**: `src/main.js` (lines 113-145)
- Add EditorView.updateListener extension
- Wire to LiveEvaluator instance
- Keep manual "Evaluate" button for explicit control

**Create**: `src/ui/validationIndicator.js`
- Visual feedback (green/red indicator) for code validation state

**Create**: `tests/livecoding/liveEvaluator.test.js`

### 1.3 State Preservation
**Create**: `src/scheduler/stateManager.js`
- Centralize cycle counters and cooldown timers
- Persist state across program updates
- Provide explicit reset() method (not auto-reset)

**Modify**: `src/prolog/builtins.js` (line 165)
- Remove `if (builtins.reset) builtins.reset();` from evaluation
- Inject stateManager into builtins context

**Modify**: `src/scheduler/scheduler.js` (line 22)
- Remove state reset from `setProgram()`
- Add explicit `resetState()` method

**Create**: `tests/scheduler/stateManager.test.js`
- Test state persistence across code updates
- Test explicit reset behavior

### 1.4 Smooth Transitions
**Create**: `src/scheduler/transitionManager.js`
- Quantize code swaps to bar boundaries
- Prevent mid-phrase disruptions
- Optional: Add volume crossfade

**Modify**: `src/livecoding/liveEvaluator.js`
- Use TransitionManager for program swaps instead of direct `setProgram()`

**Create**: `tests/scheduler/transitionManager.test.js`

## Priority 2: Modularity Refactor

### 2.1 Extract HTML from main.js
**Create**: `src/ui/template.js`
- Extract lines 22-95 from `src/main.js`
- Return DOM elements using `document.createElement()` (not HTML strings)
- Reason: Type safety, no XSS risk, easier testing

**Create**: `src/ui/controls.js`
- Extract control panel creation
- Encapsulate BPM/swing/lookahead sliders

**Create**: `src/ui/editorPanel.js`
- Extract editor section
- Encapsulate CodeMirror setup

**Create**: `src/ui/logPanel.js`
- Extract log section

**Create**: `src/ui/components/` (button.js, slider.js, select.js)
- Reusable UI components
- Touch-friendly sizing (44px minimum)

### 2.2 Split builtins.js (267 lines → 8 modules)
**Delete**: `src/prolog/builtins.js`

**Create**: `src/prolog/builtins/`
- `index.js` - Aggregator exports `createBuiltins()`
- `timing.js` - beat, phase, every, euc
- `musical.js` - scale, chord, transpose
- `random.js` - choose, pick, cycle, rand, randint, prob
- `logic.js` - eq, lt, gt, within, distinct, cooldown
- `arithmetic.js` - add, range, rotate
- `utils.js` - evalNumber, evalList, evalTerm, stepIndexAtTime
- `data/scales.js` - Scale definitions
- `data/chords.js` - Chord definitions

**Migration Strategy**:
1. Create new structure alongside old file
2. Export both old and new `createBuiltins()` temporarily
3. Update imports to use new structure
4. Run all tests
5. Delete old file

### 2.3 Simplify main.js
**Modify**: `src/main.js` (reduce from 214 to ~50 lines)
- Keep only: imports, app initialization, entry point
- Move orchestration to new `src/app.js`

**Create**: `src/app.js`
- Application orchestrator
- Dependency injection (audio, scheduler, builtins)
- Component composition
- Lifecycle management

**Create**: `src/ui/eventHandlers.js`
- Extract event handler setup from main.js

**Create**: `src/config/defaults.js`
- Default values (BPM, swing, lookahead, etc.)

## Priority 3: PWA & Mobile-First

### 3.1 PWA Infrastructure
**Install**: `npm install -D vite-plugin-pwa`

**Create**: `public/manifest.json`
```json
{
  "name": "Dogalog - Prolog Livecoding",
  "short_name": "Dogalog",
  "description": "Realtime Prolog-based livecoding music environment",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#0b0c10",
  "theme_color": "#7ee787",
  "orientation": "any",
  "icons": [...]
}
```

**Create**: PWA icons
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/icon-maskable-512.png`

**Modify**: `index.html`
- Add `<link rel="manifest" href="/manifest.json">`
- Add `<meta name="theme-color" content="#7ee787">`
- Add `<meta name="description" content="...">`
- Add `<link rel="apple-touch-icon">`

**Modify**: `vite.config.mjs`
- Import and configure `vite-plugin-pwa`
- Set up Workbox caching strategy (cache-first for assets)

### 3.2 Mobile-First CSS Refactor
**Modify**: `src/style.css` (complete rewrite)

**Current Problem**: Desktop-first with single 980px breakpoint

**New Approach**: Mobile-first with progressive enhancement
```css
/* Base: 320px+ mobile */
.btn { min-height: 44px; min-width: 44px; } /* Touch-friendly */
main { display: flex; flex-direction: column; } /* Single column */

/* Tablet: 768px+ */
@media (min-width: 768px) {
  main { display: grid; grid-template-columns: 1fr 1fr; }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  main { grid-template-columns: 1.2fr 0.8fr; }
  .btn { min-height: 36px; } /* Smaller on desktop */
}
```

**Key Changes**:
- Touch targets minimum 44x44px
- Fluid typography using clamp()
- Responsive padding/margins
- Editor height adjusts for virtual keyboard
- Remove fixed widths

### 3.3 Mobile UX Improvements
**Create**: `src/ui/mobile/keyboardManager.js`
- Detect virtual keyboard appearance
- Adjust layout using VisualViewport API
- Prevent content hidden behind keyboard

**Create**: `src/ui/mobile/gestureHandler.js`
- Prevent double-tap zoom on buttons
- Touch gesture support

## Priority 4: Testing & Quality

### 4.1 Component Tests
**Create**: `tests/ui/` (mirror structure)
- `template.test.js`
- `controls.test.js`
- `editorPanel.test.js`
- `components/button.test.js`
- `components/slider.test.js`

### 4.2 Integration Tests
**Create**: `tests/integration/`
- `livecoding.test.js` - Auto-evaluation flow
- `statePreservation.test.js` - Cycle state across updates
- `exampleLoading.test.js` - Example switching

### 4.3 Coverage Reporting
**Install**: `npm install -D @vitest/coverage-v8`

**Modify**: `package.json`
```json
{
  "scripts": {
    "test:coverage": "vitest --coverage"
  }
}
```

**Target Coverage**:
- Prolog engine: 90%+ (already well-tested)
- Scheduler: 85%+
- Builtins: 80%+ per module
- UI components: 75%+

## Priority 5: Didactic Features

### 5.1 In-App Tutorial System
**Create**: `src/tutorial/tutorialManager.js`
- State machine for tutorial progression
- LocalStorage for progress tracking

**Create**: `src/tutorial/steps.js`
- Tutorial content (15-20 steps)
- Interactive "try it" examples

**Create**: `src/ui/tutorialOverlay.js`
- Non-blocking overlay UI
- Progress indicator
- Keyboard navigation

**Create**: `tests/tutorial/tutorialManager.test.js`

### 5.2 Context-Sensitive Help
**Create**: `src/ui/contextHelp.js`
- Detect cursor position in editor
- Show relevant builtin documentation

**Create**: `src/help/builtinDocs.js`
- Documentation for all builtins
- Signature, description, examples

### 5.3 Tutorial Content
**Modify**: `docs/manual.md`
- Expand with structured tutorial sections:
  1. Prolog Basics (30 min)
  2. Music Fundamentals (20 min)
  3. Rhythm Patterns (30 min)
  4. Melody and Harmony (30 min)
  5. Advanced Techniques (30 min)

## Priority 6: Documentation & Polish

### 6.1 JSDoc Comments
- Add JSDoc to every exported function/class
- Brief descriptions, parameter types, return types
- Keep inline comments minimal (only for non-obvious logic)

### 6.2 GitHub Pages Organization
**Create**: `docs/index.html` - Documentation landing page

**Create**: `docs/architecture.md` - Architecture guide

**Create**: `docs/contributing.md` - Contribution guide

**Create**: `docs/api.md` - API reference (auto-generated from JSDoc)

### 6.3 README Enhancement
- Add interactive demo GIF
- Feature highlights
- Quick start (3 steps max)
- Architecture diagram
- Contribution guidelines link

## Critical Files Summary

### To Create (45 new files):
- Livecoding: `src/livecoding/` (2 files)
- State: `src/scheduler/stateManager.js`, `transitionManager.js`
- UI Components: `src/ui/` (13 files)
- Builtins Modules: `src/prolog/builtins/` (9 files)
- PWA: `public/manifest.json`, `public/icons/` (3 files)
- Tutorial: `src/tutorial/` (3 files), `src/help/` (1 file)
- Mobile: `src/ui/mobile/` (2 files)
- Docs: `docs/` (4 files)
- Tests: `tests/` (16 files)

### To Modify (6 files):
- `src/main.js` - Simplify to ~50 lines
- `src/style.css` - Mobile-first rewrite
- `src/scheduler/scheduler.js` - Remove auto-reset
- `index.html` - Add PWA meta tags
- `vite.config.mjs` - Add PWA plugin
- `package.json` - Add dependencies

### To Delete (1 file):
- `src/prolog/builtins.js` - Replaced by modular structure

## Implementation Sequence

### Week 1: Foundation
- Code validation system
- State manager
- Begin builtins modularization

### Week 2: Livecoding Core
- Live evaluator
- Smooth transitions
- Complete builtins refactor
- Integration tests

### Week 3: UI Refactor
- Extract HTML from main.js
- Create UI components
- Simplify main.js to app.js pattern

### Week 4: PWA & Mobile
- PWA infrastructure
- Mobile-first CSS rewrite
- Mobile UX improvements
- Real device testing

### Week 5: Testing & Quality
- Component tests
- Integration tests
- Coverage reporting
- Bug fixes

### Week 6-7: Didactic Features
- Tutorial system
- Context help
- Tutorial content
- In-app guidance

### Week 8: Documentation & Polish
- JSDoc comments
- GitHub Pages setup
- Architecture docs
- README enhancement

## Technical Decisions

### 1. DOM-based Components vs HTML Strings
**Choice**: `document.createElement()` over template literals
**Reason**: Type safety, no XSS, easier testing, better refactoring

### 2. Auto-Evaluation Timing
**Choice**: 300ms debounce with validation gate
**Reason**: Balance responsiveness with parsing overhead, industry standard

### 3. State Persistence Scope
**Choice**: Persist cycle counters, reset only on example load
**Reason**: "Edit" preserves state, "load new" resets - matches user mental model

### 4. Transition Timing
**Choice**: Bar-boundary quantization for program swaps
**Reason**: Musical alignment, predictable, glitch-free

### 5. Mobile-First Approach
**Choice**: Base styles 320px+, enhance with media queries
**Reason**: Requirement explicitly states mobile-first, forces constraint consideration

## Risk Mitigation

### Risk: State Management Complexity
- **Mitigation**: Comprehensive integration tests, clear reset rules, debug logging

### Risk: Mobile Keyboard Interaction
- **Mitigation**: VisualViewport API, real device testing, collapsible controls

### Risk: Audio Context Restrictions
- **Mitigation**: Explicit "Start" button, prominent CTA if suspended, documentation

### Risk: Breaking Changes During Refactor
- **Mitigation**: Incremental changes, maintain tests, feature flags, git branching

### Risk: PWA Installation Friction
- **Mitigation**: BeforeInstallPrompt API, graceful degradation, platform-specific docs

## Success Criteria

- ✅ Auto-evaluation with state preservation (no manual button clicks required)
- ✅ Smooth transitions without audio glitches
- ✅ All files < 100 lines (except data/tests)
- ✅ Strict HTML/CSS/JS separation
- ✅ PWA installable with offline support
- ✅ Mobile-first CSS with 3+ breakpoints
- ✅ Touch-friendly UI (44px minimum targets)
- ✅ 80%+ test coverage
- ✅ Interactive tutorial system
- ✅ Comprehensive documentation

## Dependencies

**NPM Packages to Add**:
```json
{
  "devDependencies": {
    "vite-plugin-pwa": "^0.20.0",
    "@vitest/coverage-v8": "^4.0.15",
    "@vitest/ui": "^4.0.15"
  }
}
```

## Next Steps

1. Review this plan with stakeholder
2. Clarify any ambiguities
3. Begin Week 1 foundation work
4. Iterate based on feedback
