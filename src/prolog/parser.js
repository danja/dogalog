import { tokenize } from './tokenizer.js';

function stripComments(src) {
  // Remove percent comments that run until end-of-line.
  return src.replace(/%[^\n\r]*/g, '');
}

export function parseProgram(src) {
  const tokens = tokenize(stripComments(src));
  let index = 0;

  function peek() { return tokens[index]; }
  function eat(type, value) {
    const tok = tokens[index];
    if (!tok || tok.type !== type || (value && tok.value !== value)) {
      throw new Error(`Parse error near token ${JSON.stringify(tok)}; expected ${type} ${value ?? ''}`);
    }
    index++;
    return tok;
  }

  function parseClause() {
    const head = parseExpression();
    let bodyAst = null;

    if (peek() && peek().type === 'sym' && peek().value === ':-') {
      eat('sym', ':-');
      bodyAst = parseGoalOr();
    }

    eat('sym', '.');
    const bodies = bodyAst ? expandGoals(bodyAst) : [[]];
    return bodies.map((body) => ({ head, body }));
  }

  function parseGoalOr() {
    let left = parseGoalAnd();
    while (peek() && peek().type === 'sym' && peek().value === ';') {
      eat('sym', ';');
      const right = parseGoalAnd();
      left = { type: 'or', left, right };
    }
    return left;
  }

  function parseGoalAnd() {
    let left = parseGoalUnary();
    while (peek() && peek().type === 'sym' && peek().value === ',') {
      eat('sym', ',');
      const right = parseGoalUnary();
      left = { type: 'and', left, right };
    }
    return left;
  }

  function parseGoalUnary() {
    const tok = peek();
    if (tok && tok.type === 'sym' && tok.value === '\\+') {
      eat('sym', '\\+');
      const goal = parseGoalUnary();
      return { type: 'not', goal };
    }
    if (tok && tok.type === 'sym' && tok.value === '(') {
      eat('sym', '(');
      const inner = parseGoalOr();
      eat('sym', ')');
      return inner;
    }
    return { type: 'goal', goal: parseGoalTerm() };
  }

  function parseGoalTerm() {
    const left = parseExpression();
    const comp = peek();
    if (comp && comp.type === 'sym' && comparisonOps.has(comp.value)) {
      const op = comp.value;
      eat('sym', op);
      const right = parseExpression();
      return { type: 'comparison', op, left, right };
    }
    return left;
  }

  // Expression parsing with precedence (*/ then +-)
  function parseExpression() {
    return parseAdditive();
  }

  function parseAdditive() {
    let node = parseMultiplicative();
    while (peek() && peek().type === 'sym' && (peek().value === '+' || peek().value === '-')) {
      const op = peek().value;
      eat('sym', op);
      const right = parseMultiplicative();
      node = { type: 'expr', op, left: node, right };
    }
    return node;
  }

  function parseMultiplicative() {
    let node = parsePrimary();
    while (peek() && peek().type === 'sym' && (peek().value === '*' || peek().value === '/')) {
      const op = peek().value;
      eat('sym', op);
      const right = parsePrimary();
      node = { type: 'expr', op, left: node, right };
    }
    return node;
  }

  function parsePrimary() {
    const tok = peek();
    if (!tok) throw new Error('Unexpected end while parsing term');
    if (tok.type === 'number') { index++; return { type:'num', value: tok.value }; }
    if (tok.type === 'atom_or_var') {
      index++;
      const name = tok.value;
      if (peek() && peek().type === 'sym' && peek().value === '(') {
        eat('sym','(');
        const args = [];
        if (!(peek() && peek().type === 'sym' && peek().value === ')')) {
          while (true) {
            args.push(parseExpression());
            if (peek() && peek().type === 'sym' && peek().value === ',') { eat('sym',','); continue; }
            break;
          }
        }
        eat('sym',')');
        return { type:'compound', f:name, args };
      }
      if (name[0] === name[0].toUpperCase() || name[0] === '_') return { type:'var', name };
      return { type:'atom', name };
    }
    if (tok.type === 'sym' && tok.value === '[') {
      eat('sym','[');
      const items = [];
      let tail = null;
      if (peek() && !(peek().type==='sym' && peek().value===']')) {
        while (true) {
          items.push(parseExpression());
          if (peek() && peek().type==='sym' && peek().value===',') { eat('sym',','); continue; }
          if (peek() && peek().type==='sym' && peek().value==='|') {
            eat('sym','|');
            tail = parseExpression();
            break;
          }
          break;
        }
      }
      eat('sym',']');
      return { type:'list', items, tail };
    }
    if (tok.type === 'sym' && tok.value === '(') {
      eat('sym','(');
      const inner = parseExpression();
      eat('sym',')');
      return inner;
    }
    throw new Error('Bad term');
  }

  function expandGoals(ast) {
    if (!ast) return [[]];
    if (ast.type === 'goal') return [[convertComparison(ast.goal)]];
    if (ast.type === 'comparison') return [[convertComparison(ast)]];
    if (ast.type === 'not') {
      const branches = expandGoals(ast.goal);
      return [[{ type: 'not', branches }]];
    }
    if (ast.type === 'and') {
      const left = expandGoals(ast.left);
      const right = expandGoals(ast.right);
      const combos = [];
      for (const l of left) {
        for (const r of right) {
          combos.push([...l, ...r]);
        }
      }
      return combos;
    }
    if (ast.type === 'or') {
      return [...expandGoals(ast.left), ...expandGoals(ast.right)];
    }
    // Already an expression/term, treat as single goal
    return [[convertComparison(ast)]];
  }

  function convertComparison(node) {
    if (node?.type === 'comparison') {
      const left = nodeToTerm(node.left);
      const right = nodeToTerm(node.right);
      const mapping = {
        '=': '=',
        '=:=': '=:=', // numeric equality
        '=\\=': '=\\=',
        '<': '<',
        '>': '>',
        '=<': '=<',
        '>=': '>='
      };
      const f = mapping[node.op];
      if (!f) throw new Error(`Unsupported operator ${node.op}`);
      return { type: 'compound', f, args: [left, right] };
    }
    return nodeToTerm(node);
  }

  function nodeToTerm(node) {
    if (!node) throw new Error('Expected term');
    if (node.type === 'expr') {
      return { type: 'expr', op: node.op, left: nodeToTerm(node.left), right: nodeToTerm(node.right) };
    }
    if (node.type === 'comparison') return convertComparison(node);
    if (node.type === 'goal') return nodeToTerm(node.goal);
    return node;
  }

  const clauses = [];
  while (index < tokens.length) {
    const results = parseClause();
    clauses.push(...results);
  }
  return clauses;
}

const comparisonOps = new Set(['=', '=:=', '=\\=', '<', '>', '=<', '>=']);
