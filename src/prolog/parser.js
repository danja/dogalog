import { tokenize } from './tokenizer.js';

export function parseProgram(src) {
  const tokens = tokenize(src);
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

  function parseTerm() {
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
            args.push(parseTerm());
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
      if (peek() && !(peek().type==='sym' && peek().value===']')) {
        while (true) {
          items.push(parseTerm());
          if (peek() && peek().type==='sym' && peek().value===',') { eat('sym',','); continue; }
          break;
        }
      }
      eat('sym',']');
      return { type:'list', items };
    }
    throw new Error('Bad term');
  }

  function parseClause() {
    const head = parseTerm();
    const body = [];
    if (peek() && peek().type==='sym' && peek().value===':-') {
      eat('sym',':-');
      while (true) {
        body.push(parseTerm());
        if (peek() && peek().type==='sym' && peek().value===',') { eat('sym',','); continue; }
        break;
      }
    }
    eat('sym','.');
    return { head, body };
  }

  const clauses = [];
  while (index < tokens.length) clauses.push(parseClause());
  return clauses;
}
