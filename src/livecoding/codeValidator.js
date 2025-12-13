import { parseProgram } from '../prolog/parser.js';

/**
 * Validates Prolog code without throwing exceptions
 * @param {string} text - Prolog source code
 * @returns {{ valid: boolean, clauses?: Array, error?: Error }}
 */
export function validatePrologCode(text) {
  try {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return { valid: true, clauses: [] };
    }
    const normalized = trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
    const clauses = parseProgram(normalized);
    return { valid: true, clauses };
  } catch (error) {
    return { valid: false, error };
  }
}
