/**
 * Validation indicator component
 * Shows visual feedback for code validation state
 */
export class ValidationIndicator {
  constructor() {
    this.element = this.createElement();
    this.setState('valid');
  }

  /**
   * Create the indicator DOM element
   * @returns {HTMLElement}
   */
  createElement() {
    const container = document.createElement('div');
    container.className = 'validation-indicator';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');

    const dot = document.createElement('span');
    dot.className = 'validation-dot';
    dot.setAttribute('aria-hidden', 'true');

    const message = document.createElement('span');
    message.className = 'validation-message';

    container.appendChild(dot);
    container.appendChild(message);

    return container;
  }

  /**
   * Update the validation state
   * @param {string} state - State: 'valid', 'invalid', or 'evaluating'
   * @param {string} errorMessage - Optional error message for invalid state
   */
  setState(state, errorMessage = '') {
    this.element.setAttribute('data-state', state);

    const message = this.element.querySelector('.validation-message');

    switch (state) {
      case 'valid':
        message.textContent = 'Code valid';
        this.element.setAttribute('aria-label', 'Code is valid');
        break;
      case 'invalid':
        message.textContent = errorMessage || 'Syntax error';
        this.element.setAttribute('aria-label', `Code has error: ${errorMessage || 'Syntax error'}`);
        break;
      case 'evaluating':
        message.textContent = 'Evaluating...';
        this.element.setAttribute('aria-label', 'Evaluating code');
        break;
      default:
        message.textContent = '';
    }
  }

  /**
   * Get the DOM element
   * @returns {HTMLElement}
   */
  getElement() {
    return this.element;
  }
}
