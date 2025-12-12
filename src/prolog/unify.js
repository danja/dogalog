import { substTerm } from './terms.js';

export function unify(a, b, env) {
  let left = substTerm(a, env);
  let right = substTerm(b, env);
  if (left.type === 'var') { const out = {...env}; out[left.name] = right; return out; }
  if (right.type === 'var') { const out = {...env}; out[right.name] = left; return out; }
  if (left.type === 'num' && right.type === 'num') return (left.value===right.value)? {...env} : null;
  if (left.type === 'atom' && right.type === 'atom') return (left.name===right.name)? {...env} : null;
  if (left.type === 'list' && right.type === 'list') {
    if (left.items.length !== right.items.length) return null;
    let e = {...env};
    for (let k=0;k<left.items.length;k++) { e = unify(left.items[k], right.items[k], e); if (!e) return null; }
    return e;
  }
  if (left.type === 'compound' && right.type === 'compound' && left.f===right.f && left.args.length===right.args.length) {
    let e = {...env};
    for (let k=0;k<left.args.length;k++) { e = unify(left.args[k], right.args[k], e); if (!e) return null; }
    return e;
  }
  return null;
}
