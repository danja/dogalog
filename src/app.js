/**
 * Application orchestrator
 * Handles component initialization, composition, and lifecycle management
 */
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, dropCursor, highlightSpecialChars } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { StreamLanguage } from '@codemirror/language';
import { indentOnInput, syntaxHighlighting, defaultHighlightStyle, foldGutter, foldKeymap, bracketMatching } from '@codemirror/language';
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
  const appTemplate = createAppTemplate({ manualLink, examples });
  app.appendChild(appTemplate);

  // Get DOM elements
  const logEl = document.getElementById('log');
  const exampleSelect = document.getElementById('example-select');
  const editorHost = document.getElementById('code-editor');
  const validationContainer = document.getElementById('validation-container');

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

  // Create editor
  function createEditor(doc) {
    const extensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
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
        ...foldKeymap,
        ...completionKeymap,
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
  createControls({
    scheduler,
    onStart: handlers.onStart,
    onStop: handlers.onStop,
    onEval: handlers.onEval
  });

  // Initialize editor and load default program
  createEditor(defaultProgram.trim());
  exampleSelect.value = examples[0]?.id ?? '';
  handlers.onEval();
}
