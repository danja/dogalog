import { describe, it, expect } from 'vitest';
import { createAppTemplate } from '../../src/ui/template.js';

describe('App Template', () => {
  const mockConfig = {
    examples: [
      { id: 'ex1', label: 'Example 1', code: 'test1.' },
      { id: 'ex2', label: 'Example 2', code: 'test2.' }
    ]
  };

  it('creates a document fragment', () => {
    const template = createAppTemplate(mockConfig);
    expect(template).toBeInstanceOf(DocumentFragment);
  });

  it('includes header with title', () => {
    const template = createAppTemplate(mockConfig);
    const container = document.createElement('div');
    container.appendChild(template);

    const header = container.querySelector('header');
    expect(header).toBeTruthy();

    const h1 = header.querySelector('h1');
    expect(h1).toBeTruthy();
    expect(h1.textContent).toBe('Dogalog');
  });

  it('includes validation container', () => {
    const template = createAppTemplate(mockConfig);
    const container = document.createElement('div');
    container.appendChild(template);

    const validationContainer = container.querySelector('#validation-container');
    expect(validationContainer).toBeTruthy();
  });

  it('includes controls container', () => {
    const template = createAppTemplate(mockConfig);
    const container = document.createElement('div');
    container.appendChild(template);

    const controlsContainer = container.querySelector('#controls-container');
    expect(controlsContainer).toBeTruthy();
  });

  it('includes main element with panels', () => {
    const template = createAppTemplate(mockConfig);
    const container = document.createElement('div');
    container.appendChild(template);

    const main = container.querySelector('main');
    expect(main).toBeTruthy();

    const panels = main.querySelectorAll('.panel');
    expect(panels.length).toBe(2);
  });

  it('includes code editor container', () => {
    const template = createAppTemplate(mockConfig);
    const container = document.createElement('div');
    container.appendChild(template);

    const editorContainer = container.querySelector('#code-editor');
    expect(editorContainer).toBeTruthy();
    expect(editorContainer.className).toBe('editor-container');
  });

  it('includes example selector with all examples', () => {
    const template = createAppTemplate(mockConfig);
    const container = document.createElement('div');
    container.appendChild(template);

    const select = container.querySelector('#example-select');
    expect(select).toBeTruthy();

    const options = select.querySelectorAll('option');
    expect(options.length).toBe(2);
    expect(options[0].value).toBe('ex1');
    expect(options[0].textContent).toBe('Example 1');
    expect(options[1].value).toBe('ex2');
    expect(options[1].textContent).toBe('Example 2');
  });

  // Manual/tutorial/reference links now live in the controls component.

  it('includes log element', () => {
    const template = createAppTemplate(mockConfig);
    const container = document.createElement('div');
    container.appendChild(template);

    const log = container.querySelector('#log');
    expect(log).toBeTruthy();
    expect(log.tagName).toBe('PRE');
    expect(log.className).toBe('log');
  });

  it('displays top goal information', () => {
    const template = createAppTemplate(mockConfig);
    const container = document.createElement('div');
    container.appendChild(template);

    const content = container.textContent;
    expect(content).toContain('Top goal:');
    expect(content).toContain('event(Voice, Pitch, Vel, T).');
  });

  it('displays builtin functions', () => {
    const template = createAppTemplate(mockConfig);
    const container = document.createElement('div');
    container.appendChild(template);

    const content = container.textContent;
    expect(content).toContain('Built-ins:');
    expect(content).toContain('beat(T, N)');
    expect(content).toContain('scale(Root, Mode, Degree, Oct, Midi)');
    expect(content).toContain('prob(P)');
  });

  it('displays instrument information', () => {
    const template = createAppTemplate(mockConfig);
    const container = document.createElement('div');
    container.appendChild(template);

    const content = container.textContent;
    expect(content).toContain('Instruments');
    expect(content).toContain('kick');
    expect(content).toContain('snare');
    expect(content).toContain('hat');
    expect(content).toContain('sine');
  });

  it('includes footer with instructions', () => {
    const template = createAppTemplate(mockConfig);
    const container = document.createElement('div');
    container.appendChild(template);

    const footer = container.querySelector('footer');
    expect(footer).toBeTruthy();
    expect(footer.innerHTML).toContain('Source');
    expect(footer.innerHTML).toContain('MIT License');
  });
});
