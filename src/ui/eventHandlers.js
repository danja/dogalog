/**
 * Event handler setup
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
      liveEvaluator.evaluate(getCode());
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
    }
  };
}
