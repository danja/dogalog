import { describe, expect, it } from 'vitest';
import { validatePrologCode } from '../../src/livecoding/codeValidator.js';

describe('Code Validator', () => {
  it('validates correct Prolog syntax', () => {
    const code = 'event(kick, 36, 0.9, T) :- beat(T, 1).';
    const result = validatePrologCode(code);
    expect(result.valid).toBe(true);
    expect(result.clauses).toHaveLength(1);
    expect(result.error).toBeUndefined();
  });

  it('validates code without trailing period', () => {
    const code = 'event(kick, 36, 0.9, T) :- beat(T, 1)';
    const result = validatePrologCode(code);
    expect(result.valid).toBe(true);
    expect(result.clauses).toHaveLength(1);
  });

  it('returns error for invalid syntax without throwing', () => {
    const code = 'event(kick, 36, 0.9, T) :- beat(T, 1';
    const result = validatePrologCode(code);
    expect(result.valid).toBe(false);
    expect(result.clauses).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(result.error.message).toBeTruthy();
  });

  it('handles empty code as valid', () => {
    const result = validatePrologCode('');
    expect(result.valid).toBe(true);
    expect(result.clauses).toEqual([]);
  });

  it('handles whitespace-only code as valid', () => {
    const result = validatePrologCode('   \n  \t  ');
    expect(result.valid).toBe(true);
    expect(result.clauses).toEqual([]);
  });

  it('validates multiple clauses', () => {
    const code = `
      event(kick, 36, 0.9, T) :- beat(T, 1).
      event(snare, 38, 0.8, T) :- beat(T, 2).
    `;
    const result = validatePrologCode(code);
    expect(result.valid).toBe(true);
    expect(result.clauses).toHaveLength(2);
  });

  it('handles partial edits during typing', () => {
    const code = 'event(kick';
    const result = validatePrologCode(code);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
