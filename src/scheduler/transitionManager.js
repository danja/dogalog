/**
 * Manages smooth transitions between program updates
 * Quantizes code swaps to musical boundaries (bar boundaries)
 */
export class TransitionManager {
  /**
   * @param {Object} options - Configuration options
   * @param {Object} options.scheduler - Scheduler instance
   * @param {Object} options.audioEngine - Audio engine for timing
   * @param {number} options.quantization - Quantization in beats (default: 4 for bar boundaries)
   */
  constructor({ scheduler, audioEngine, quantization = 4 }) {
    this.scheduler = scheduler;
    this.audioEngine = audioEngine;
    this.quantization = quantization;
    this.pendingProgram = null;
    this.transitionTimeout = null;
  }

  /**
   * Schedule a program transition at the next quantized boundary
   * @param {Array} newProgram - New program clauses
   */
  scheduleTransition(newProgram) {
    // Clear any pending transition
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }

    const now = this.audioEngine.time();
    const bpm = this.scheduler.bpm;
    const beatDuration = 60 / bpm;
    const quantizationDuration = beatDuration * this.quantization;

    // Calculate next quantized boundary
    const currentPhase = now % quantizationDuration;
    const timeToNext = currentPhase === 0 ? 0 : quantizationDuration - currentPhase;
    const nextBoundary = now + timeToNext;

    // Store pending program
    this.pendingProgram = newProgram;

    // Schedule the swap
    const delayMs = Math.max(0, (nextBoundary - now) * 1000);

    this.transitionTimeout = setTimeout(() => {
      this.scheduler.setProgram(this.pendingProgram);
      this.pendingProgram = null;
      this.transitionTimeout = null;
    }, delayMs);
  }

  /**
   * Cancel any pending transition
   */
  cancelPending() {
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = null;
      this.pendingProgram = null;
    }
  }

  /**
   * Check if a transition is pending
   * @returns {boolean}
   */
  hasPending() {
    return this.pendingProgram !== null;
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.cancelPending();
  }
}
