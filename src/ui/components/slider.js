/**
 * Reusable slider (range input) component
 */

/**
 * Create a labeled slider element
 * @param {Object} options - Slider configuration
 * @param {string} options.label - Slider label text
 * @param {string} options.inputId - Input element ID
 * @param {string} options.valueId - Value display element ID
 * @param {number} options.min - Minimum value
 * @param {number} options.max - Maximum value
 * @param {number} options.value - Initial value
 * @param {number} options.step - Step increment
 * @param {Function} options.onChange - Change handler (receives event)
 * @param {Function} options.formatValue - Optional value formatter
 * @returns {{ labelEl: HTMLDivElement, sliderEl: HTMLInputElement, valueEl: HTMLDivElement }}
 */
export function createSlider({
  label,
  inputId,
  valueId,
  min,
  max,
  value,
  step,
  onChange,
  formatValue
}) {
  const labelEl = document.createElement('div');
  labelEl.className = 'control-label';
  labelEl.textContent = label;

  // Range input
  const input = document.createElement('input');
  input.type = 'range';
  input.id = inputId;
  input.className = 'control-slider';
  input.min = min;
  input.max = max;
  input.value = value;
  if (step !== undefined) {
    input.step = step;
  }

  // Value display
  const valueEl = document.createElement('div');
  valueEl.id = valueId;
  valueEl.className = 'control-value';
  valueEl.textContent = formatValue ? formatValue(value) : value;

  // Wire up change handler
  if (onChange) {
    input.addEventListener('input', (event) => {
      const val = event.target.value;
      valueEl.textContent = formatValue ? formatValue(val) : val;
      onChange(event);
    });
  }

  return { labelEl, sliderEl: input, valueEl };
}
