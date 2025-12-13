import { validatePrologCode } from './codeValidator.js';

/**
 * Live code evaluation engine
 * Monitors editor changes and automatically evaluates valid Prolog code
 */
export class LiveEvaluator {
  /**
   * @param {Object} options - Configuration options
   * @param {Object} options.scheduler - Scheduler instance
   * @param {number} options.debounceMs - Debounce delay in milliseconds
   */
  constructor({ scheduler, debounceMs = 300 }) {
    this.scheduler = scheduler;
    this.debounceMs = debounceMs;
    this.timeoutId = null;
    this.listeners = {
      validated: [],
      error: []
    };
    this.lastValidCode = '';
  }

  /**
   * Handle code change from editor
   * @param {string} text - Current editor text
   */
  onCodeChange(text) {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.evaluate(text);
    }, this.debounceMs);
  }

  /**
   * Evaluate code immediately
   * @param {string} text - Code to evaluate
   */
  evaluate(text) {
    const result = validatePrologCode(text);

    if (result.valid) {
      this.lastValidCode = text;
      this.scheduler.setProgram(result.clauses);
      this.emit('validated', {
        success: true,
        clauses: result.clauses,
        text
      });
    } else {
      this.emit('validated', {
        success: false,
        error: result.error,
        text
      });
    }
  }

  /**
   * Register event listener
   * @param {string} event - Event name ('validated' or 'error')
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Emit event to all registered listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Get the last successfully validated code
   * @returns {string}
   */
  getLastValidCode() {
    return this.lastValidCode;
  }

  /**
   * Clean up timeouts
   */
  destroy() {
    clearTimeout(this.timeoutId);
  }
}
