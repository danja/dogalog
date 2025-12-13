/**
 * Event handler setup
 */
import { parseProgram } from '../prolog/parser.js';

/**
 * Create and wire up all event handlers
 * @param {Object} dependencies
 * @param {AudioEngine} dependencies.audio
 * @param {Scheduler} dependencies.scheduler
 * @param {LiveEvaluator} dependencies.liveEvaluator
 * @param {ValidationIndicator} dependencies.validationIndicator
 * @param {EditorView} dependencies.editorView
 * @param {HTMLSelectElement} dependencies.exampleSelect
 * @param {Array} dependencies.examples
 * @param {Function} dependencies.log
 * @param {Function} dependencies.getCode
 * @param {Function} dependencies.setCode
 */
export function setupEventHandlers({
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
}) {
  // Live evaluator validation feedback
  liveEvaluator.on('validated', (result) => {
    if (result.success) {
      validationIndicator.setState('valid');
      log(`[live] Loaded ${result.clauses.length} clauses.`);
    } else {
      validationIndicator.setState('invalid', result.error.message);
    }
  });

  // Example selector handler
  exampleSelect.addEventListener('change', () => {
    const id = exampleSelect.value;
    const ex = examples.find((item) => item.id === id);
    if (ex) {
      const wasRunning = Boolean(scheduler.interval);
      scheduler.stop();
      scheduler.resetState();
      setCode(ex.code.trim());
      evaluateProgram(scheduler, validationIndicator, getCode, log);
      if (wasRunning) scheduler.start();
    }
  });

  // Return handler functions for control panel
  return {
    onStart: async () => {
      await audio.ensureRunning();
      scheduler.start();
      log('[audio] started');
    },
    onStop: () => {
      scheduler.stop();
      log('[audio] stopped');
    },
    onEval: () => evaluateProgram(scheduler, validationIndicator, getCode, log)
  };
}

/**
 * Evaluate the current program
 * @param {Scheduler} scheduler
 * @param {ValidationIndicator} validationIndicator
 * @param {Function} getCode
 * @param {Function} log
 */
function evaluateProgram(scheduler, validationIndicator, getCode, log) {
  try {
    const text = getCode().trim();
    const normalized = text.endsWith('.') ? text : `${text}.`;
    const clauses = parseProgram(normalized);
    scheduler.setProgram(clauses);
    validationIndicator.setState('valid');
    log(`[manual] Loaded ${clauses.length} clauses.`);
  } catch (error) {
    console.error(error);
    validationIndicator.setState('invalid', error.message);
    log(`[parse error] ${error.message}`);
  }
}
