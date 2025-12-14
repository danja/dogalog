/**
 * Parser tests - especially for REPL query parsing
 */
import { describe, it, expect } from 'vitest';
import { parseProgram } from '../../src/prolog/parser.js';

describe('Parser - Basic Facts', () => {
  it('should parse simple atom fact', () => {
    const clauses = parseProgram('kik(0.5).');
    expect(clauses).toBeDefined();
    expect(clauses).toHaveLength(1);
    expect(clauses[0].head.type).toBe('compound');
    expect(clauses[0].head.f).toBe('kik');
    expect(clauses[0].head.args).toHaveLength(1);
    expect(clauses[0].head.args[0].type).toBe('num');
    expect(clauses[0].head.args[0].value).toBe(0.5);
  });

  it('should parse fact with multiple arguments', () => {
    const clauses = parseProgram('event(kick, 36, 0.95, 0).');
    expect(clauses).toHaveLength(1);
    expect(clauses[0].head.f).toBe('event');
    expect(clauses[0].head.args).toHaveLength(4);
    expect(clauses[0].head.args[0].type).toBe('atom');
    expect(clauses[0].head.args[0].name).toBe('kick');
  });

  it('should parse fact with variables', () => {
    const clauses = parseProgram('bass(T, N).');
    expect(clauses).toHaveLength(1);
    expect(clauses[0].head.args).toHaveLength(2);
    expect(clauses[0].head.args[0].type).toBe('var');
    expect(clauses[0].head.args[0].name).toBe('T');
    expect(clauses[0].head.args[1].type).toBe('var');
    expect(clauses[0].head.args[1].name).toBe('N');
  });
});

describe('Parser - REPL Query Patterns', () => {
  it('should parse query with numbers', () => {
    const clauses = parseProgram('euc(0.5, 4, 16, 4, 0).');
    expect(clauses).toHaveLength(1);
    expect(clauses[0].head.f).toBe('euc');
    expect(clauses[0].head.args).toHaveLength(5);
  });

  it('should parse query with mixed variables and atoms', () => {
    const clauses = parseProgram('scale(60, ionian, 5, 0, N).');
    expect(clauses).toHaveLength(1);
    const args = clauses[0].head.args;
    expect(args[0].type).toBe('num');
    expect(args[1].type).toBe('atom');
    expect(args[1].name).toBe('ionian');
    expect(args[4].type).toBe('var');
    expect(args[4].name).toBe('N');
  });

  it('should parse query with underscore variable', () => {
    const clauses = parseProgram('event(Voice, _, _, 0).');
    expect(clauses).toHaveLength(1);
    const args = clauses[0].head.args;
    expect(args[0].type).toBe('var');
    expect(args[1].type).toBe('var');
    expect(args[1].name).toBe('_');
  });

  it('should parse query with list', () => {
    const clauses = parseProgram('choose([60, 64, 67], N).');
    expect(clauses).toHaveLength(1);
    const args = clauses[0].head.args;
    expect(args[0].type).toBe('list');
    expect(args[0].items).toHaveLength(3);
  });
});

describe('Parser - Clauses with Bodies', () => {
  it('should parse simple rule', () => {
    const clauses = parseProgram('kik(T) :- euc(T, 4, 16, 4, 0).');
    expect(clauses).toHaveLength(1);
    expect(clauses[0].head.f).toBe('kik');
    expect(clauses[0].body).toHaveLength(1);
    expect(clauses[0].body[0].f).toBe('euc');
  });

  it('should parse rule with multiple body goals', () => {
    const clauses = parseProgram('test(X) :- foo(X), bar(X).');
    expect(clauses).toHaveLength(1);
    expect(clauses[0].body).toHaveLength(2);
    expect(clauses[0].body[0].f).toBe('foo');
    expect(clauses[0].body[1].f).toBe('bar');
  });
});

describe('Parser - Edge Cases', () => {
  it('should parse multiple clauses', () => {
    const clauses = parseProgram('foo(1). bar(2).');
    expect(clauses).toHaveLength(2);
    expect(clauses[0].head.f).toBe('foo');
    expect(clauses[1].head.f).toBe('bar');
  });

  it('should handle comments', () => {
    const clauses = parseProgram('% This is a comment\nkik(0.5).');
    expect(clauses).toHaveLength(1);
    expect(clauses[0].head.f).toBe('kik');
  });

  it('should parse empty list', () => {
    const clauses = parseProgram('test([]).');
    expect(clauses).toHaveLength(1);
    const arg = clauses[0].head.args[0];
    expect(arg.type).toBe('list');
    expect(arg.items).toHaveLength(0);
  });

  it('should parse nested compounds', () => {
    const clauses = parseProgram('test(foo(bar(1))).');
    expect(clauses).toHaveLength(1);
    const arg = clauses[0].head.args[0];
    expect(arg.type).toBe('compound');
    expect(arg.f).toBe('foo');
    expect(arg.args[0].type).toBe('compound');
    expect(arg.args[0].f).toBe('bar');
  });
});

describe('Parser - Error Cases', () => {
  it('should throw on missing period', () => {
    expect(() => parseProgram('kik(0.5)')).toThrow();
  });

  it('should throw on unbalanced parentheses', () => {
    expect(() => parseProgram('kik(0.5.')).toThrow();
  });

  it('should throw on invalid syntax', () => {
    expect(() => parseProgram('(0.5)kik.')).toThrow();
  });
});
