/**
 * REPL (Read-Eval-Print Loop) component
 * Interactive Prolog query interface
 */
import { parseProgram } from '../prolog/parser.js';
import { resolveGoals, substTerm, termToString } from '../prolog/index.js';

export class REPL {
  constructor({ getProgram, builtins, stateManager }) {
    this.getProgram = getProgram;
    this.builtins = builtins;
    this.stateManager = stateManager;
    this.history = [];
    this.element = null;

    this.createREPL();
  }

  createREPL() {
    const container = document.createElement('div');
    container.className = 'repl-container';

    // Header
    const header = document.createElement('div');
    header.className = 'repl-header';
    header.innerHTML = '<h2>Interactive Query</h2>';
    container.appendChild(header);

    // Output area
    this.output = document.createElement('div');
    this.output.className = 'repl-output';
    this.output.innerHTML = '<div class="repl-welcome">Enter queries to interact with the rules. Examples: <code>kik(0.5)</code> <code>bass(1.0, N)</code> <code>event(V, P, _, 0)</code> <code>mortal(X)</code></div>';
    container.appendChild(this.output);

    // Input area
    const inputContainer = document.createElement('div');
    inputContainer.className = 'repl-input-container';

    const prompt = document.createElement('span');
    prompt.className = 'repl-prompt';
    prompt.textContent = '?- ';
    inputContainer.appendChild(prompt);

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'repl-input';
    this.input.placeholder = 'Enter query (e.g., kik(0.5) or event(Voice, Pitch, Vel, 0))';
    this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
    inputContainer.appendChild(this.input);

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn repl-submit';
    submitBtn.textContent = 'Query';
    submitBtn.addEventListener('click', () => this.executeQuery());
    inputContainer.appendChild(submitBtn);

    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn repl-clear';
    clearBtn.textContent = 'Clear';
    clearBtn.addEventListener('click', () => this.clear());
    inputContainer.appendChild(clearBtn);

    container.appendChild(inputContainer);

    this.element = container;
  }

  handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.executeQuery();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.navigateHistory(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.navigateHistory(1);
    }
  }

  navigateHistory(direction) {
    if (this.history.length === 0) return;

    if (this.historyIndex === undefined) {
      this.historyIndex = this.history.length;
    }

    this.historyIndex += direction;
    this.historyIndex = Math.max(0, Math.min(this.history.length, this.historyIndex));

    if (this.historyIndex < this.history.length) {
      this.input.value = this.history[this.historyIndex];
    } else {
      this.input.value = '';
    }
  }

  executeQuery() {
    let queryText = this.input.value.trim();
    if (!queryText) return;

    // Add to history
    this.history.push(queryText);
    this.historyIndex = undefined;

    // Display query
    const queryDiv = document.createElement('div');
    queryDiv.className = 'repl-query';
    queryDiv.innerHTML = `<span class="repl-prompt">?-</span> ${this.escapeHtml(queryText)}`;
    this.output.appendChild(queryDiv);

    // Clear input
    this.input.value = '';

    try {
      // Normalize query: strip ?- prefix and ensure trailing period
      queryText = queryText.replace(/^\?-\s*/, '').trim();
      if (!queryText.endsWith('.')) {
        queryText += '.';
      }

      // Parse query as a program (treating it as a fact/clause)
      // parseProgram returns an array of clauses directly
      let clauses;
      try {
        clauses = parseProgram(queryText);
      } catch (parseError) {
        this.showError(`Parse error: ${parseError.message}`);
        return;
      }

      if (!clauses || clauses.length === 0) {
        this.showError('Syntax error: Could not parse query (no clauses generated)');
        return;
      }

      // Get goals from query (body of first clause, or head if it's a fact)
      const clause = clauses[0];
      const goals = clause.body && clause.body.length > 0 ? clause.body : [clause.head];

      // Execute query
      const program = this.getProgram();
      const ctx = {
        bpm: 120, // default BPM for built-ins that need it
        stateManager: this.stateManager
      };

      const solutions = [];
      const maxSolutions = 100; // Limit solutions to prevent infinite loops

      for (const env of resolveGoals(goals, {}, program, ctx, this.builtins)) {
        solutions.push(env);
        if (solutions.length >= maxSolutions) {
          this.showWarning(`Showing first ${maxSolutions} solutions (limit reached)`);
          break;
        }
      }

      // Display results
      if (solutions.length === 0) {
        this.showResult('false.');
      } else {
        // Extract variables from query
        const vars = this.extractVariables(goals);

        if (vars.length === 0) {
          // No variables - just show true
          this.showResult('true.');
        } else {
          // Show bindings for each solution
          solutions.forEach((env, idx) => {
            const bindings = vars
              .map(v => {
                const value = substTerm({ type: 'var', name: v }, env);
                return `${v} = ${termToString(value)}`;
              })
              .join(', ');

            const more = idx < solutions.length - 1 ? ' ;' : '.';
            this.showResult(bindings + more);
          });

          if (solutions.length === 1) {
            this.showInfo('(1 solution)');
          } else {
            this.showInfo(`(${solutions.length} solutions)`);
          }
        }
      }
    } catch (error) {
      this.showError(`Error: ${error.message}`);
    }

    // Scroll to bottom
    this.output.scrollTop = this.output.scrollHeight;
  }

  extractVariables(goals) {
    const vars = new Set();

    const extractFromTerm = (term) => {
      if (!term) return;

      if (term.type === 'var' && term.name !== '_') {
        vars.add(term.name);
      } else if (term.type === 'compound' && term.args) {
        term.args.forEach(extractFromTerm);
      } else if (term.type === 'list' && term.elements) {
        term.elements.forEach(extractFromTerm);
        if (term.tail) extractFromTerm(term.tail);
      }
    };

    goals.forEach(extractFromTerm);
    return Array.from(vars).sort();
  }

  showResult(text) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'repl-result';
    resultDiv.textContent = text;
    this.output.appendChild(resultDiv);
  }

  showError(text) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'repl-error';
    errorDiv.textContent = text;
    this.output.appendChild(errorDiv);
  }

  showWarning(text) {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'repl-warning';
    warningDiv.textContent = text;
    this.output.appendChild(warningDiv);
  }

  showInfo(text) {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'repl-info';
    infoDiv.textContent = text;
    this.output.appendChild(infoDiv);
  }

  clear() {
    this.output.innerHTML = '<div class="repl-welcome">REPL cleared. Enter a query to begin.</div>';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getElement() {
    return this.element;
  }
}
