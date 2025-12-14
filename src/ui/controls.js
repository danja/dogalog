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
 * @param {Object} links - Documentation links
 * @param {string} links.manualLink - Manual URL
 * @param {string} links.tutorialLink - Tutorial URL
 * @param {string} links.referencesLink - References URL
 * @param {Object} scheduler - Scheduler instance (for updating properties)
 * @returns {{ beatCounter: HTMLElement | null }} - References to created controls
 */
export function createControls({
  onStart,
  onStop,
  onBpmChange,
  onSwingChange,
  onLookaheadChange,
  links = {},
  scheduler
}) {
  const container = document.getElementById('controls-container');
  if (!container) return { beatCounter: null };

  const grid = document.createElement('div');
  grid.className = 'controls-grid';

  const placeSliderRow = (components, row) => {
    components.labelEl.style.gridColumn = '2';
    components.sliderEl.style.gridColumn = '3';
    components.valueEl.style.gridColumn = '4';
    components.labelEl.style.gridRow = String(row);
    components.sliderEl.style.gridRow = String(row);
    components.valueEl.style.gridRow = String(row);
  };

  const linkGroup = document.createElement('div');
  linkGroup.className = 'control-links';
  linkGroup.style.gridRow = '1 / span 4';
  linkGroup.style.gridColumn = '5';

  if (links.tutorialLink) {
    const tutorialBtn = document.createElement('a');
    tutorialBtn.id = 'tutorial-btn';
    tutorialBtn.className = 'btn tutorial-btn';
    tutorialBtn.href = links.tutorialLink;
    tutorialBtn.target = '_blank';
    tutorialBtn.rel = 'noreferrer';
    tutorialBtn.textContent = 'Tutorial';
    linkGroup.appendChild(tutorialBtn);
  }

  if (links.manualLink) {
    const manualBtn = document.createElement('a');
    manualBtn.className = 'btn';
    manualBtn.href = links.manualLink;
    manualBtn.target = '_blank';
    manualBtn.rel = 'noreferrer';
    manualBtn.textContent = 'Manual';
    linkGroup.appendChild(manualBtn);
  }

  if (links.referencesLink) {
    const referencesBtn = document.createElement('a');
    referencesBtn.className = 'btn';
    referencesBtn.href = links.referencesLink;
    referencesBtn.target = '_blank';
    referencesBtn.rel = 'noreferrer';
    referencesBtn.textContent = 'References';
    linkGroup.appendChild(referencesBtn);
  }

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
  placeSliderRow(bpmSlider, 2);
  grid.appendChild(bpmSlider.labelEl);
  grid.appendChild(bpmSlider.sliderEl);
  grid.appendChild(bpmSlider.valueEl);

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
  placeSliderRow(swingSlider, 3);
  grid.appendChild(swingSlider.labelEl);
  grid.appendChild(swingSlider.sliderEl);
  grid.appendChild(swingSlider.valueEl);

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
  placeSliderRow(lookaheadSlider, 4);
  grid.appendChild(lookaheadSlider.labelEl);
  grid.appendChild(lookaheadSlider.sliderEl);
  grid.appendChild(lookaheadSlider.valueEl);

  const actions = document.createElement('div');
  actions.className = 'control-actions';
  actions.style.gridRow = '1 / span 4';
  actions.style.gridColumn = '1';

  // Start button
  const startBtn = createButton({
    label: 'Start',
    id: 'start',
    variant: 'primary',
    onClick: onStart
  });
  actions.appendChild(startBtn);

  // Stop button
  const stopBtn = createButton({
    label: 'Stop',
    id: 'stop',
    variant: 'danger',
    onClick: onStop
  });
  actions.appendChild(stopBtn);

  // Beat counter
  const beatCounter = document.createElement('div');
  beatCounter.id = 'beat-counter';
  beatCounter.className = 'beat-counter';
  beatCounter.textContent = 'Beat: 0';
  actions.appendChild(beatCounter);

  grid.appendChild(linkGroup);
  grid.appendChild(actions);
  container.appendChild(grid);

  return { beatCounter };
}
