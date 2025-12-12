import { describe, expect, it } from 'vitest';
import { parseProgram } from '../../src/prolog/parser.js';
import { createBuiltins } from '../../src/prolog/builtins.js';
import { resolveGoals } from '../../src/prolog/resolution.js';
import { substTerm } from '../../src/prolog/terms.js';

const builtins = createBuiltins();

describe('parser', () => {
  it('parses a simple clause', () => {
    const clauses = parseProgram('event(kick, 36, 1.0, T) :- every(T, 1).');
    expect(clauses).toHaveLength(1);
    expect(clauses[0].head.f).toBe('event');
  });

  it('ignores percent comments and keeps clauses', () => {
    const program = `% comment
foo(a).`;
    const clauses = parseProgram(program);
    expect(clauses).toHaveLength(1);
    expect(clauses[0].head.f).toBe('foo');
  });
});

describe('resolution', () => {
  it('resolves built-in choose', () => {
    const clauses = parseProgram('event(sine, N, 0.8, T) :- every(T, 1), choose([40,43], N).');
    const goal = { type:'compound', f:'event', args:[{type:'var',name:'Voice'}, {type:'var',name:'Pitch'}, {type:'var',name:'Vel'}, {type:'num', value: 0 }] };
    const envs = Array.from(resolveGoals([goal], {}, clauses, { bpm: 120 }, builtins));
    const pitches = envs.map((env) => substTerm({ type:'var', name:'Pitch' }, env).value);
    expect(pitches).toEqual([40,43]);
  });

  it('supports euclidean rhythm gating', () => {
    const clauses = parseProgram('event(kick, 36, 1.0, T) :- euc(T, 4, 16, 4, 0).');
    const goal = { type:'compound', f:'event', args:[{type:'var',name:'Voice'}, {type:'var',name:'Pitch'}, {type:'var',name:'Vel'}, {type:'num', value: 0 }] };
    const envs = Array.from(resolveGoals([goal], {}, clauses, { bpm: 120 }, builtins));
    expect(envs.length).toBe(1);
  });
});
