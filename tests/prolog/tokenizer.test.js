import { describe, expect, it } from 'vitest';
import { tokenize } from '../../src/prolog/tokenizer.js';

describe('tokenizer', () => {
  it('emits atoms, variables, numbers, and punctuation', () => {
    const tokens = tokenize('foo(Bar, 12.5).');
    expect(tokens.map((t) => t.value)).toEqual(['foo', '(', 'Bar', ',', 12.5, ')', '.']);
  });

  it('skips percent comments and whitespace', () => {
    const tokens = tokenize('foo. % this is ignored\nbar.');
    expect(tokens.map((t) => t.value)).toEqual(['foo', '.', 'bar', '.']);
  });
});
