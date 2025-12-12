import { renameVars } from './terms.js';
import { unify } from './unify.js';

export function* resolveGoals(goals, env, program, ctx, builtins) {
  if (goals.length === 0) { yield env; return; }
  const [goal, ...rest] = goals;
  if (goal.type==='compound' && builtins[goal.f]) {
    const outs = builtins[goal.f](goal.args, env, ctx);
    for (const e of outs) yield* resolveGoals(rest, e, program, ctx, builtins);
    return;
  }

  const counter = { current: 0 };
  for (const clause of program) {
    const renamed = renameVars(clause, counter);
    const e2 = unify(goal, renamed.head, {...env});
    if (!e2) continue;
    yield* resolveGoals([...renamed.body, ...rest], e2, program, ctx, builtins);
  }
}
