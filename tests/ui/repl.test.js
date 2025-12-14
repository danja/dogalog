/**
 * REPL component tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { REPL } from '../../src/ui/repl.js';
import { createBuiltins } from '../../src/prolog/builtins/index.js';
import { StateManager } from '../../src/scheduler/stateManager.js';
import { parseProgram } from '../../src/prolog/parser.js';

describe('REPL', () => {
  let repl;
  let mockProgram;
  let builtins;
  let stateManager;

  beforeEach(() => {
    // Create a simple test program
    const programText = `
      kik(T) :- euc(T, 4, 16, 4, 0).
      bass(T, N) :- every(T, 0.5), choose([40, 43, 47, 48], N).
    `;
    mockProgram = parseProgram(programText);

    builtins = createBuiltins();
    stateManager = new StateManager();

    repl = new REPL({
      getProgram: () => mockProgram,
      builtins,
      stateManager
    });
  });

  describe('Component Creation', () => {
    it('should create REPL element', () => {
      const element = repl.getElement();
      expect(element).toBeDefined();
      expect(element.className).toBe('repl-container');
    });

    it('should have input field', () => {
      const element = repl.getElement();
      const input = element.querySelector('.repl-input');
      expect(input).toBeDefined();
      expect(input.tagName).toBe('INPUT');
    });

    it('should have output area', () => {
      const element = repl.getElement();
      const output = element.querySelector('.repl-output');
      expect(output).toBeDefined();
    });

    it('should have submit and clear buttons', () => {
      const element = repl.getElement();
      const submitBtn = element.querySelector('.repl-submit');
      const clearBtn = element.querySelector('.repl-clear');
      expect(submitBtn).toBeDefined();
      expect(clearBtn).toBeDefined();
    });
  });

  describe('Variable Extraction', () => {
    it('should extract single variable', () => {
      const clauses = parseProgram('test(N).');
      const clause = clauses[0];
      const goals = (clause.body && clause.body.length > 0) ? clause.body : [clause.head];
      const vars = repl.extractVariables(goals);
      expect(vars).toContain('N');
    });

    it('should extract multiple variables', () => {
      const clauses = parseProgram('test(X, Y, Z).');
      const clause = clauses[0];
      const goals = (clause.body && clause.body.length > 0) ? clause.body : [clause.head];
      const vars = repl.extractVariables(goals);
      expect(vars).toContain('X');
      expect(vars).toContain('Y');
      expect(vars).toContain('Z');
      expect(vars).toHaveLength(3);
    });

    it('should exclude underscore variable', () => {
      const clauses = parseProgram('test(X, _, Y).');
      const clause = clauses[0];
      const goals = (clause.body && clause.body.length > 0) ? clause.body : [clause.head];
      const vars = repl.extractVariables(goals);
      expect(vars).toContain('X');
      expect(vars).toContain('Y');
      expect(vars).not.toContain('_');
    });

    it('should extract variables from nested structures', () => {
      const clauses = parseProgram('test(foo(X), [Y, Z]).');
      const clause = clauses[0];
      const goals = (clause.body && clause.body.length > 0) ? clause.body : [clause.head];
      const vars = repl.extractVariables(goals);
      expect(vars).toContain('X');
      expect(vars).toContain('Y');
      expect(vars).toContain('Z');
    });

    it('should deduplicate variables', () => {
      const clauses = parseProgram('test(X, X, X).');
      const clause = clauses[0];
      const goals = (clause.body && clause.body.length > 0) ? clause.body : [clause.head];
      const vars = repl.extractVariables(goals);
      expect(vars).toHaveLength(1);
      expect(vars[0]).toBe('X');
    });
  });

  describe('UI Operations', () => {
    it('should clear output', () => {
      repl.output.innerHTML = '<div>Some content</div>';
      repl.clear();
      expect(repl.output.textContent).toContain('REPL cleared');
    });

    it('should show result', () => {
      repl.showResult('N = 42');
      const result = repl.output.querySelector('.repl-result');
      expect(result).toBeDefined();
      expect(result.textContent).toBe('N = 42');
    });

    it('should show error', () => {
      repl.showError('Something went wrong');
      const error = repl.output.querySelector('.repl-error');
      expect(error).toBeDefined();
      expect(error.textContent).toBe('Something went wrong');
    });

    it('should escape HTML in queries', () => {
      const escaped = repl.escapeHtml('<script>alert("xss")</script>');
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
    });
  });

  describe('History Navigation', () => {
    it('should store query in history', () => {
      repl.input.value = 'test(1).';
      repl.executeQuery();
      expect(repl.history).toContain('test(1).');
    });

    it('should navigate history with arrow up', () => {
      repl.history = ['query1.', 'query2.', 'query3.'];
      repl.historyIndex = undefined;

      repl.navigateHistory(-1); // Up
      expect(repl.input.value).toBe('query3.');

      repl.navigateHistory(-1); // Up again
      expect(repl.input.value).toBe('query2.');
    });

    it('should navigate history with arrow down', () => {
      repl.history = ['query1.', 'query2.', 'query3.'];
      repl.historyIndex = 1;

      repl.navigateHistory(1); // Down
      expect(repl.input.value).toBe('query3.');

      repl.navigateHistory(1); // Down again (clear)
      expect(repl.input.value).toBe('');
    });

    it('should not navigate beyond history bounds', () => {
      repl.history = ['query1.'];
      repl.historyIndex = 0;

      repl.navigateHistory(-1); // Try to go before first
      expect(repl.historyIndex).toBe(0);
    });

    it('should allow programmatic query execution via helper', () => {
      repl.executeQueryFromText('kik(0.5).');
      expect(repl.history).toContain('kik(0.5).');
      expect(repl.input.value).toBe(''); // cleared after execution
    });
  });
});
