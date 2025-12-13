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
 * @returns {HTMLLabelElement}
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
  const labelElement = document.createElement('label');

  // Label text
  labelElement.appendChild(document.createTextNode(label + ' '));

  // Range input
  const input = document.createElement('input');
  input.type = 'range';
  input.id = inputId;
  input.min = min;
  input.max = max;
  input.value = value;
  if (step !== undefined) {
    input.step = step;
  }

  // Value display
  const valueSpan = document.createElement('span');
  valueSpan.id = valueId;
  valueSpan.textContent = formatValue ? formatValue(value) : value;

  // Wire up change handler
  if (onChange) {
    input.addEventListener('input', (event) => {
      const val = event.target.value;
      valueSpan.textContent = formatValue ? formatValue(val) : val;
      onChange(event);
    });
  }

  labelElement.appendChild(input);
  labelElement.appendChild(document.createTextNode(' '));
  labelElement.appendChild(valueSpan);

  return labelElement;
}
