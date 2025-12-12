export function cloneTerm(term) {
  return JSON.parse(JSON.stringify(term));
}

export function substTerm(term, env) {
  if (term.type === 'var') {
    const value = env[term.name];
    return value ? substTerm(value, env) : term;
  }
  if (term.type === 'compound') return { type:'compound', f:term.f, args: term.args.map(a=>substTerm(a,env)) };
  if (term.type === 'list') return { type:'list', items: term.items.map(a=>substTerm(a,env)) };
  return term;
}

export function termToString(term) {
  if (!term) return '∅';
  if (term.type==='num') return String(term.value);
  if (term.type==='atom') return term.name;
  if (term.type==='var') return term.name;
  if (term.type==='list') return '['+term.items.map(termToString).join(', ')+']';
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
    if (term.type==='compound') return { type:'compound', f:term.f, args: term.args.map(renameTerm) };
    if (term.type==='list') return { type:'list', items: term.items.map(renameTerm) };
    return term;
  }
}
