/**
 * Application orchestrator
 * Handles component initialization, composition, and lifecycle management
 */
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, highlightActiveLine, drawSelection, dropCursor, highlightSpecialChars } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { StreamLanguage } from '@codemirror/language';
import { indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { oneDark } from '@codemirror/theme-one-dark';
import { prologLanguage } from './ui/prologLanguage.js';

import { createBuiltins } from './prolog/builtins/index.js';
import { AudioEngine } from './audio/audioEngine.js';
import { Scheduler } from './scheduler/scheduler.js';
import { StateManager } from './scheduler/stateManager.js';
import { LiveEvaluator } from './livecoding/liveEvaluator.js';
import { ValidationIndicator } from './ui/validationIndicator.js';
import { createAppTemplate } from './ui/template.js';
import { createControls } from './ui/controls.js';
import { setupEventHandlers } from './ui/eventHandlers.js';
import { defaults } from './config/defaults.js';
import { TutorialManager } from './tutorial/tutorialManager.js';
import { TutorialOverlay } from './tutorial/tutorialOverlay.js';
import { REPL } from './ui/repl.js';
import { registerAIBridge } from './ui/aiBridge.js';

/**
 * Initialize and start the Dogalog application
 * @param {Object} config
 * @param {string} config.manualLink - Link to manual
 * @param {Array} config.examples - Array of example programs
 * @param {string} config.defaultProgram - Initial program to load
 */
export function initializeApp({ manualLink, examples, defaultProgram }) {
  // Create and insert app template
  const app = document.getElementById('app');
  const appTemplate = createAppTemplate({ examples });
  app.appendChild(appTemplate);

  // Get DOM elements
  const logEl = document.getElementById('log');
  const exampleSelect = document.getElementById('example-select');
  const editorHost = document.getElementById('code-editor');
  const validationContainer = document.getElementById('validation-container');
  const replContainer = document.getElementById('repl-container');

  // Initialize core components
  const builtins = createBuiltins();
  const audio = new AudioEngine();
  const stateManager = new StateManager();
  const scheduler = new Scheduler({ audio, builtins, stateManager });

  // Create validation indicator
  const validationIndicator = new ValidationIndicator();
  validationContainer.appendChild(validationIndicator.getElement());

  // Create live evaluator
  const liveEvaluator = new LiveEvaluator({ scheduler, debounceMs: defaults.debounceMs });

  // Create REPL
  const repl = new REPL({
    getProgram: () => liveEvaluator.currentProgram || [],
    builtins,
    stateManager
  });
  replContainer.appendChild(repl.getElement());

  // Logging utility
  function log(msg) {
    logEl.textContent = (msg + "\n" + logEl.textContent).slice(0, defaults.logMaxChars);
  }

  // Editor management
  let editorView;

  function getCode() {
    return editorView ? editorView.state.doc.toString() : '';
  }

  function setCode(text) {
    if (!editorView) return;
    editorView.dispatch({ changes: { from: 0, to: editorView.state.doc.length, insert: text } });
  }

  // Allow optional external drivers (e.g., AI bridge) to read/write code or run queries.
  const runQuery = (queryText) => {
    if (repl && typeof repl.executeQueryFromText === 'function') {
      repl.executeQueryFromText(queryText);
    }
  };

  if (typeof window !== 'undefined') {
    window.dogalog = {
      setCode,
      getCode,
      runQuery
    };
  }

  // Create editor
  function createEditor(doc) {
    const extensions = [
      highlightSpecialChars(),
      history(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        indentWithTab
      ]),
      StreamLanguage.define(prologLanguage),
      EditorView.lineWrapping,
      oneDark,
      // Live evaluation: trigger on document changes
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const code = update.state.doc.toString();
          liveEvaluator.onCodeChange(code);
        }
      })
    ];
    const state = EditorState.create({ doc, extensions });
    editorView = new EditorView({ state, parent: editorHost });
  }

  // Setup event handlers
  const handlers = setupEventHandlers({
    audio,
    scheduler,
    liveEvaluator,
    validationIndicator,
    editorView,
    exampleSelect,
    examples,
    log,
    getCode,
    setCode
  });

  // Create controls with event handlers
  const { beatCounter } = createControls({
    scheduler,
    onStart: handlers.onStart,
    onStop: handlers.onStop,
    links: {
      manualLink,
      tutorialLink: `${import.meta.env.BASE_URL}docs/tutorial.html`,
      referencesLink: `${import.meta.env.BASE_URL}docs/references.html`
    }
  });

  // Setup beat counter
  scheduler.onBeatChange((beat) => {
    if (beatCounter) beatCounter.textContent = `Beat: ${beat}`;
  });

  // Initialize tutorial system
  const tutorialManager = new TutorialManager();
  const applyCode = (text) => {
    const trimmed = text.trim();
    setCode(trimmed);
    liveEvaluator.evaluate(trimmed);
  };

  const tutorialOverlay = new TutorialOverlay(tutorialManager, applyCode);
  app.appendChild(tutorialOverlay.getElement());

  // Tutorial button handler
  const tutorialBtn = document.getElementById('tutorial-btn');
  if (tutorialBtn) {
    tutorialBtn.addEventListener('click', (event) => {
      event.preventDefault();
      if (!tutorialManager.hasStarted()) {
        tutorialManager.start();
      } else {
        tutorialOverlay.toggle();
      }
    });
  }

  // Initialize editor and load default program
  createEditor(defaultProgram.trim());
  exampleSelect.value = examples[0]?.id ?? '';
  liveEvaluator.evaluate(getCode());

  // Optional external hooks for AI/automation: react to custom events if dispatched.
  if (typeof window !== 'undefined') {
    const applyCode = (text) => {
      const codeText = typeof text === 'string' ? text : '';
      setCode(codeText);
      liveEvaluator.evaluate(codeText);
    };

    const queryRunner = (text) => {
      const queryText = typeof text === 'string' ? text : '';
      runQuery(queryText);
    };

    const handleSetCode = (event) => applyCode(event.detail);
    const handleRunQuery = (event) => queryRunner(event.detail);

    window.addEventListener('dogalog:setCode', handleSetCode);
    window.addEventListener('dogalog:query', handleRunQuery);

    // Optional bridge for postMessage-based AI clients; inert unless messages are sent.
    registerAIBridge({ setCode: applyCode, getCode, runQuery: queryRunner });
  }
}
