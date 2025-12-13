export function cloneTerm(term) {
  return JSON.parse(JSON.stringify(term));
}

export function substTerm(term, env) {
  if (term.type === 'var') {
    const value = env[term.name];
    return value ? substTerm(value, env) : term;
  }
  if (term.type === 'compound') return { type:'compound', f:term.f, args: term.args.map(a=>substTerm(a,env)) };
  if (term.type === 'list') return { type:'list', items: term.items.map(a=>substTerm(a,env)), tail: term.tail ? substTerm(term.tail, env) : null };
  if (term.type === 'expr') return { type:'expr', op: term.op, left: substTerm(term.left, env), right: substTerm(term.right, env) };
  return term;
}

export function termToString(term) {
  if (!term) return '∅';
  if (term.type==='num') return String(term.value);
  if (term.type==='atom') return term.name;
  if (term.type==='var') return term.name;
  if (term.type==='list') {
    const base = term.items.map(termToString).join(', ');
    const tail = term.tail ? ` | ${termToString(term.tail)}` : '';
    return `[${base}${tail}]`;
  }
  if (term.type==='expr') return `(${termToString(term.left)} ${term.op} ${termToString(term.right)})`;
  if (term.type==='compound') return `${term.f}(${term.args.map(termToString).join(', ')})`;
  return '';
}

export function renameVars(clause, counter = { current: 0 }) {
  const map = {};
  const renamedHead = renameTerm(clause.head);
  const renamedBody = clause.body.map((b) => renameTerm(b));
  return { head: renamedHead, body: renamedBody };

  function renameTerm(term) {
    if (term.type==='var') {
      if (!map[term.name]) map[term.name] = { type:'var', name: `${term.name}$${counter.current++}` };
      return map[term.name];
    }
    if (term.type === 'not') {
      return {
        type: 'not',
        branches: term.branches.map((branch) => branch.map(renameTerm))
      };
    }
    if (term.type==='compound') return { type:'compound', f:term.f, args: term.args.map(renameTerm) };
    if (term.type==='list') return { type:'list', items: term.items.map(renameTerm), tail: term.tail ? renameTerm(term.tail) : null };
    if (term.type==='expr') return { type:'expr', op: term.op, left: renameTerm(term.left), right: renameTerm(term.right) };
    return term;
  }
}
