import { describe, it, expect, vi } from 'vitest';
import { createButton } from '../../../src/ui/components/button.js';

describe('Button Component', () => {
  it('creates button with label', () => {
    const button = createButton({ label: 'Test Button' });
    expect(button.textContent).toBe('Test Button');
    expect(button.tagName).toBe('BUTTON');
  });

  it('adds btn class by default', () => {
    const button = createButton({ label: 'Test' });
    expect(button.className).toBe('btn');
  });

  it('sets id when provided', () => {
    const button = createButton({ label: 'Test', id: 'test-btn' });
    expect(button.id).toBe('test-btn');
  });

  it('adds variant class when provided', () => {
    const button = createButton({ label: 'Test', variant: 'primary' });
    expect(button.classList.contains('btn')).toBe(true);
    expect(button.classList.contains('primary')).toBe(true);
  });

  it('handles danger variant', () => {
    const button = createButton({ label: 'Test', variant: 'danger' });
    expect(button.classList.contains('danger')).toBe(true);
  });

  it('attaches click handler when provided', () => {
    const onClick = vi.fn();
    const button = createButton({ label: 'Test', onClick });

    button.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not error when no click handler provided', () => {
    const button = createButton({ label: 'Test' });
    expect(() => button.click()).not.toThrow();
  });

  it('creates multiple buttons independently', () => {
    const btn1 = createButton({ label: 'Button 1', id: 'btn1', variant: 'primary' });
    const btn2 = createButton({ label: 'Button 2', id: 'btn2', variant: 'danger' });

    expect(btn1.textContent).toBe('Button 1');
    expect(btn2.textContent).toBe('Button 2');
    expect(btn1.classList.contains('primary')).toBe(true);
    expect(btn2.classList.contains('danger')).toBe(true);
  });
});
