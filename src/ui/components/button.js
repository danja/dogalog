/**
 * Reusable button component
 */

/**
 * Create a button element
 * @param {Object} options - Button configuration
 * @param {string} options.label - Button text
 * @param {string} options.id - Button ID
 * @param {string} options.variant - Button variant ('primary', 'danger', or default)
 * @param {Function} options.onClick - Click handler
 * @returns {HTMLButtonElement}
 */
export function createButton({ label, id, variant, onClick }) {
  const button = document.createElement('button');
  button.textContent = label;
  button.className = 'btn';

  if (id) {
    button.id = id;
  }

  if (variant) {
    button.classList.add(variant);
  }

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}
