/**
 * Manages persistent state across program updates
 * Centralizes cycle counters, cooldown timers, and other stateful builtins
 */
export class StateManager {
  constructor() {
    this.cycleState = new Map();
    this.lastTriggers = new Map();
  }

  /**
   * Get current cycle index for a given key
   * @param {string} key - Cycle identifier (serialized list)
   * @returns {number} Current index (0 if not found)
   */
  getCycleIndex(key) {
    return this.cycleState.get(key) ?? 0;
  }

  /**
   * Increment cycle counter and return current value
   * @param {string} key - Cycle identifier
   * @param {number} listLength - Length of the cycling list
   * @returns {number} Current index before increment
   */
  incrementCycle(key, listLength) {
    const idx = this.getCycleIndex(key);
    const nextIdx = (idx + 1) % listLength;
    this.cycleState.set(key, nextIdx);
    return idx;
  }

  /**
   * Get last trigger time for cooldown tracking
   * @param {string} key - Cooldown identifier
   * @returns {number} Last trigger time (0 if not found)
   */
  getLastTrigger(key) {
    return this.lastTriggers.get(key) ?? 0;
  }

  /**
   * Set last trigger time for cooldown tracking
   * @param {string} key - Cooldown identifier
   * @param {number} time - Current time in seconds
   */
  setLastTrigger(key, time) {
    this.lastTriggers.set(key, time);
  }

  /**
   * Reset all state (for explicit user action only)
   */
  reset() {
    this.cycleState.clear();
    this.lastTriggers.clear();
  }
}
