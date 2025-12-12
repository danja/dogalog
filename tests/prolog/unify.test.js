import { describe, expect, it } from 'vitest';
import { unify } from '../../src/prolog/unify.js';

describe('unify', () => {
  it('binds variables to atoms', () => {
    const env = unify({ type:'var', name:'X' }, { type:'atom', name:'kick' }, {});
    expect(env).toEqual({ X: { type:'atom', name:'kick' } });
  });

  it('fails on mismatched structures', () => {
    const env = unify({ type:'atom', name:'kick' }, { type:'atom', name:'snare' }, {});
    expect(env).toBeNull();
  });

  it('handles lists element-wise', () => {
    const env = unify(
      { type:'list', items:[{type:'num', value:1}, {type:'var', name:'X'}] },
      { type:'list', items:[{type:'num', value:1}, {type:'num', value:2}] },
      {}
    );
    expect(env).toEqual({ X: { type:'num', value: 2 } });
  });
});
