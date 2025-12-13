import { substTerm } from './terms.js';

export function unify(a, b, env) {
  let left = substTerm(a, env);
  let right = substTerm(b, env);
  if (left.type === 'var') { const out = {...env}; out[left.name] = right; return out; }
  if (right.type === 'var') { const out = {...env}; out[right.name] = left; return out; }
  if (left.type === 'num' && right.type === 'num') return (left.value===right.value)? {...env} : null;
  if (left.type === 'atom' && right.type === 'atom') return (left.name===right.name)? {...env} : null;
  if (left.type === 'list' && right.type === 'list') {
    return unifyLists(left, right, env);
  }
  if (left.type === 'expr' && right.type === 'expr' && left.op === right.op) {
    let e = { ...env };
    e = unify(left.left, right.left, e);
    if (!e) return null;
    e = unify(left.right, right.right, e);
    return e;
  }
  if (left.type === 'compound' && right.type === 'compound' && left.f===right.f && left.args.length===right.args.length) {
    let e = {...env};
    for (let k=0;k<left.args.length;k++) { e = unify(left.args[k], right.args[k], e); if (!e) return null; }
    return e;
  }
  return null;
}

function unifyLists(left, right, env) {
  let e = { ...env };
  const min = Math.min(left.items.length, right.items.length);
  for (let k = 0; k < min; k++) {
    e = unify(left.items[k], right.items[k], e);
    if (!e) return null;
  }

  if (left.items.length === right.items.length) {
    if (!left.tail && !right.tail) return e;
    if (left.tail && right.tail) return unify(left.tail, right.tail, e);
    if (left.tail) return unify(left.tail, { type: 'list', items: [], tail: right.tail ?? null }, e);
    if (right.tail) return unify({ type: 'list', items: [], tail: left.tail ?? null }, right.tail, e);
    return e;
  }

  if (left.items.length < right.items.length) {
    if (!left.tail) return null;
    const remaining = { type: 'list', items: right.items.slice(left.items.length), tail: right.tail ?? null };
    return unify(left.tail, remaining, e);
  }

  if (right.items.length < left.items.length) {
    if (!right.tail) return null;
    const remaining = { type: 'list', items: left.items.slice(right.items.length), tail: left.tail ?? null };
    return unify(remaining, right.tail, e);
  }

  return null;
}
