/**
 * Application template builder
 * Creates the main HTML structure using DOM methods
 */

/**
 * Create the main application template
 * @param {Object} config - Configuration object
 * @param {Array} config.examples - Array of example programs
 * @returns {DocumentFragment}
 */
export function createAppTemplate({ examples }) {
  const fragment = document.createDocumentFragment();

  // Header
  const header = document.createElement('header');

  const title = document.createElement('h1');
  title.textContent = 'Dogalog';
  header.appendChild(title);

  // Controls container
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'controls';
  controlsDiv.id = 'controls-container';
  header.appendChild(controlsDiv);

  fragment.appendChild(header);

  // Instruction note above main columns
  const layoutNote = document.createElement('div');
  layoutNote.className = 'layout-note';
  layoutNote.innerHTML = 'Edit rules and they reload automatically. The engine asks <code>event/4</code> every step and plays any matching results.';
  fragment.appendChild(layoutNote);

  // Main content
  const main = document.createElement('main');

  // Left panel - Rules editor
  const leftPanel = document.createElement('section');
  leftPanel.className = 'panel';

  // Validation indicator container
  const validationContainer = document.createElement('div');
  validationContainer.id = 'validation-container';
  leftPanel.appendChild(validationContainer);

  // Code editor container
  const editorContainer = document.createElement('div');
  editorContainer.id = 'code-editor';
  editorContainer.className = 'editor-container';
  leftPanel.appendChild(editorContainer);

  // Example bar
  const exampleBar = document.createElement('div');
  exampleBar.className = 'example-bar';

  const exampleLabel = document.createElement('label');
  exampleLabel.textContent = 'Examples';
  exampleLabel.style.display = 'flex';
  exampleLabel.style.alignItems = 'center';
  exampleLabel.style.gap = '6px';

  const exampleSelect = document.createElement('select');
  exampleSelect.id = 'example-select';
  examples.forEach(ex => {
    const option = document.createElement('option');
    option.value = ex.id;
    option.textContent = ex.label;
    exampleSelect.appendChild(option);
  });
  exampleLabel.appendChild(exampleSelect);
  exampleBar.appendChild(exampleLabel);

  leftPanel.appendChild(exampleBar);

  // Mapping section (goal + builtins + instruments)
  const mappingDiv = createMappingSection();
  leftPanel.appendChild(mappingDiv);

  main.appendChild(leftPanel);

  // Right panel - REPL, AI helper, Log
  const rightPanel = document.createElement('section');
  rightPanel.className = 'panel';

  // REPL container
  const replContainer = document.createElement('div');
  replContainer.id = 'repl-container';
  rightPanel.appendChild(replContainer);

  // AI Chat container (optional helper)
  const aiChatContainer = document.createElement('div');
  aiChatContainer.id = 'ai-chat-container';
  rightPanel.appendChild(aiChatContainer);

  const logHeader = document.createElement('h2');
  logHeader.textContent = 'Log';
  rightPanel.appendChild(logHeader);

  const logPre = document.createElement('pre');
  logPre.id = 'log';
  logPre.className = 'log';
  rightPanel.appendChild(logPre);

  main.appendChild(rightPanel);

  fragment.appendChild(main);

  // Footer
  const footer = document.createElement('footer');
  const footerMeta = document.createElement('div');
  footerMeta.className = 'footer-meta';

  const srcLink = document.createElement('a');
  srcLink.href = 'https://github.com/danja/dogalog';
  srcLink.target = '_blank';
  srcLink.rel = 'noreferrer';
  srcLink.textContent = 'Source';
  footerMeta.appendChild(srcLink);

  const license = document.createElement('span');
  license.textContent = ' · MIT License · ';
  footerMeta.appendChild(license);

  const author = document.createElement('a');
  author.href = 'https://danny.ayers.name';
  author.target = '_blank';
  author.rel = 'noreferrer';
  author.textContent = '(c) Danny Ayers 2025';
  footerMeta.appendChild(author);

  footer.appendChild(footerMeta);
  fragment.appendChild(footer);

  return fragment;
}

/**
 * Create the mapping section (top goal + builtins list)
 * @returns {HTMLElement}
 */
function createMappingSection() {
  const mapping = document.createElement('div');
  mapping.className = 'mapping';

  const goalRow = document.createElement('div');
  goalRow.className = 'row';
  const strong = document.createElement('strong');
  strong.textContent = 'Top goal:';
  goalRow.appendChild(strong);
  goalRow.appendChild(document.createTextNode(' '));
  const code = document.createElement('code');
  code.textContent = 'event(Voice, Pitch, Vel, T).';
  goalRow.appendChild(code);
  mapping.appendChild(goalRow);

  const builtinsDiv = document.createElement('div');
  builtinsDiv.className = 'builtins';

  const builtinsTitle = document.createElement('div');
  builtinsTitle.className = 'builtins-title';
  builtinsTitle.textContent = 'Built-ins:';
  builtinsDiv.appendChild(builtinsTitle);

  const builtinsGrid = document.createElement('div');
  builtinsGrid.className = 'builtins-grid';

  const builtinsList = [
    'beat(T, N)', 'phase(T, N, K)', 'every(T, Step)', 'prob(P)',
    'choose(List, X)', 'pick(List, X)', 'cycle(List, X)', 'range(Start, End, Step, X)',
    'rand(Min, Max, X)', 'randint(Min, Max, X)', 'eq(A,B)', 'add(A,B,C)',
    'euc(T, K, N, B, R)', 'scale(Root, Mode, Degree, Oct, Midi)', 'chord(Root, Quality, Oct, Midi)',
    'transpose(Note, Offset, Out)', 'rotate(List, Shift, OutList)', 'lt(A,B)', 'gt(A,B)',
    'within(T, Start, End)', 'distinct(List)', 'cooldown(Now, Last, Gap)'
  ];

  builtinsList.forEach(builtin => {
    const code = document.createElement('code');
    code.textContent = builtin;
    builtinsGrid.appendChild(code);
  });

  builtinsDiv.appendChild(builtinsGrid);
  mapping.appendChild(builtinsDiv);

  // Instruments list (moved under built-ins)
  const instrumentsHeader = document.createElement('div');
  instrumentsHeader.className = 'builtins-title';
  instrumentsHeader.textContent = 'Instruments:';
  mapping.appendChild(instrumentsHeader);

  const instrumentsMapping = createInstrumentsSection();
  mapping.appendChild(instrumentsMapping);

  return mapping;
}

/**
 * Create the instruments section
 * @returns {HTMLElement}
 */
function createInstrumentsSection() {
  const mapping = document.createElement('div');
  mapping.className = 'mapping';

  const instruments = [
    { name: 'kick', desc: 'synthesized kick' },
    { name: 'snare', desc: 'noise snare' },
    { name: 'hat', desc: 'noise hat' },
    { name: 'clap', desc: 'layered noise clap' },
    { name: 'sine', desc: 'sine monosynth (use Pitch as MIDI)' },
    { name: 'square', desc: 'square monosynth (use Pitch as MIDI)' },
    { name: 'triangle', desc: 'triangle monosynth (use Pitch as MIDI)' },
    { name: 'noise', desc: 'broadband noise burst (ignore Pitch)' }
  ];

  instruments.forEach(inst => {
    const row = document.createElement('div');
    row.className = 'row';
    const code = document.createElement('code');
    code.textContent = inst.name;
    row.appendChild(code);
    row.appendChild(document.createTextNode(' – ' + inst.desc));
    mapping.appendChild(row);
  });

  return mapping;
}
