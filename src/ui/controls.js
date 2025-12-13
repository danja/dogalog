/**
 * Controls panel component
 */
import { createButton } from './components/button.js';
import { createSlider } from './components/slider.js';

/**
 * Create and populate the controls panel
 * @param {Object} handlers - Event handlers
 * @param {Function} handlers.onStart - Start button handler
 * @param {Function} handlers.onStop - Stop button handler
 * @param {Function} handlers.onBpmChange - BPM change handler
 * @param {Function} handlers.onSwingChange - Swing change handler
 * @param {Function} handlers.onLookaheadChange - Lookahead change handler
 * @param {Object} scheduler - Scheduler instance (for updating properties)
 * @returns {void} - Modifies the controls container in place
 */
export function createControls({
  onStart,
  onStop,
  onBpmChange,
  onSwingChange,
  onLookaheadChange,
  scheduler
}) {
  const container = document.getElementById('controls-container');
  if (!container) return;

  // BPM slider
  const bpmSlider = createSlider({
    label: 'BPM',
    inputId: 'bpm',
    valueId: 'bpmv',
    min: 40,
    max: 220,
    value: 120,
    onChange: (event) => {
      scheduler.bpm = parseFloat(event.target.value);
      if (onBpmChange) onBpmChange(event);
    }
  });
  container.appendChild(bpmSlider);

  // Swing slider
  const swingSlider = createSlider({
    label: 'Swing',
    inputId: 'swing',
    valueId: 'swingv',
    min: 0,
    max: 0.25,
    step: 0.005,
    value: 0,
    formatValue: (val) => Number(val).toFixed(3),
    onChange: (event) => {
      scheduler.swing = parseFloat(event.target.value);
      if (onSwingChange) onSwingChange(event);
    }
  });
  container.appendChild(swingSlider);

  // Lookahead slider
  const lookaheadSlider = createSlider({
    label: 'Lookahead',
    inputId: 'look',
    valueId: 'lookv',
    min: 20,
    max: 150,
    step: 5,
    value: 80,
    formatValue: (val) => `${val}ms`,
    onChange: (event) => {
      scheduler.lookaheadMs = parseFloat(event.target.value);
      if (scheduler.interval) {
        scheduler.start();
      }
      if (onLookaheadChange) onLookaheadChange(event);
    }
  });
  container.appendChild(lookaheadSlider);

  // Start button
  const startBtn = createButton({
    label: 'Start',
    id: 'start',
    variant: 'primary',
    onClick: onStart
  });
  container.appendChild(startBtn);

  // Stop button
  const stopBtn = createButton({
    label: 'Stop',
    id: 'stop',
    variant: 'danger',
    onClick: onStop
  });
  container.appendChild(stopBtn);
}
