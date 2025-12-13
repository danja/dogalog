/**
 * Tutorial Manager
 * Manages tutorial state, progression, and persistence
 */

const STORAGE_KEY = 'dogalog_tutorial_progress';

export class TutorialManager {
  constructor() {
    this.currentStep = 0;
    this.completed = false;
    this.listeners = new Map();
    this.loadProgress();
  }

  /**
   * Load progress from localStorage
   */
  loadProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.currentStep = data.currentStep || 0;
        this.completed = data.completed || false;
      }
    } catch (e) {
      console.warn('Failed to load tutorial progress:', e);
    }
  }

  /**
   * Save progress to localStorage
   */
  saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentStep: this.currentStep,
        completed: this.completed
      }));
    } catch (e) {
      console.warn('Failed to save tutorial progress:', e);
    }
  }

  /**
   * Start or restart the tutorial
   */
  start() {
    this.currentStep = 0;
    this.completed = false;
    this.saveProgress();
    this.emit('start');
    this.emit('step', this.currentStep);
  }

  /**
   * Go to next step
   */
  next() {
    this.currentStep++;
    this.saveProgress();
    this.emit('step', this.currentStep);
  }

  /**
   * Go to previous step
   */
  previous() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.saveProgress();
      this.emit('step', this.currentStep);
    }
  }

  /**
   * Skip to a specific step
   * @param {number} stepIndex
   */
  goToStep(stepIndex) {
    if (stepIndex >= 0) {
      this.currentStep = stepIndex;
      this.saveProgress();
      this.emit('step', this.currentStep);
    }
  }

  /**
   * Complete the tutorial
   */
  complete() {
    this.completed = true;
    this.saveProgress();
    this.emit('complete');
  }

  /**
   * Reset tutorial progress
   */
  reset() {
    this.currentStep = 0;
    this.completed = false;
    this.saveProgress();
    this.emit('reset');
  }

  /**
   * Get current step index
   * @returns {number}
   */
  getCurrentStep() {
    return this.currentStep;
  }

  /**
   * Check if tutorial is completed
   * @returns {boolean}
   */
  isCompleted() {
    return this.completed;
  }

  /**
   * Check if tutorial has been started
   * @returns {boolean}
   */
  hasStarted() {
    return this.currentStep > 0 || this.completed;
  }

  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Unregister event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
}
