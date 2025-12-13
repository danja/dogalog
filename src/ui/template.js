/**
 * Application template builder
 * Creates the main HTML structure using DOM methods
 */

/**
 * Create the main application template
 * @param {Object} config - Configuration object
 * @param {string} config.manualLink - Link to manual
 * @param {Array} config.examples - Array of example programs
 * @returns {DocumentFragment}
 */
export function createAppTemplate({ manualLink, examples }) {
  const fragment = document.createDocumentFragment();

  // Header
  const header = document.createElement('header');

  const title = document.createElement('h1');
  title.textContent = 'Dogalog';
  header.appendChild(title);

  // Validation indicator container
  const validationContainer = document.createElement('div');
  validationContainer.id = 'validation-container';
  header.appendChild(validationContainer);

  // Tutorial button
  const tutorialBtn = document.createElement('button');
  tutorialBtn.id = 'tutorial-btn';
  tutorialBtn.className = 'btn tutorial-btn';
  tutorialBtn.textContent = 'Tutorial';
  header.appendChild(tutorialBtn);

  // Controls container
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'controls';
  controlsDiv.id = 'controls-container';
  header.appendChild(controlsDiv);

  fragment.appendChild(header);

  // Main content
  const main = document.createElement('main');

  // Left panel - Rules editor
  const leftPanel = document.createElement('section');
  leftPanel.className = 'panel';

  const rulesHeader = document.createElement('h2');
  rulesHeader.textContent = 'Rules (Prolog-ish)';
  leftPanel.appendChild(rulesHeader);

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

  const manualBtn = document.createElement('a');
  manualBtn.className = 'btn';
  manualBtn.href = manualLink;
  manualBtn.target = '_blank';
  manualBtn.rel = 'noreferrer';
  manualBtn.textContent = 'Manual';
  exampleBar.appendChild(manualBtn);

  leftPanel.appendChild(exampleBar);

  // Code editor container
  const editorContainer = document.createElement('div');
  editorContainer.id = 'code-editor';
  editorContainer.className = 'editor-container';
  leftPanel.appendChild(editorContainer);

  // Mapping section (goal + builtins)
  const mappingDiv = createMappingSection();
  leftPanel.appendChild(mappingDiv);

  main.appendChild(leftPanel);

  // Right panel - Log and instruments
  const rightPanel = document.createElement('section');
  rightPanel.className = 'panel';

  const logHeader = document.createElement('h2');
  logHeader.textContent = 'Log';
  rightPanel.appendChild(logHeader);

  const logPre = document.createElement('pre');
  logPre.id = 'log';
  logPre.className = 'log';
  rightPanel.appendChild(logPre);

  const instrumentsHeader = document.createElement('h2');
  instrumentsHeader.textContent = 'Instruments';
  rightPanel.appendChild(instrumentsHeader);

  const instrumentsMapping = createInstrumentsSection();
  rightPanel.appendChild(instrumentsMapping);

  main.appendChild(rightPanel);

  fragment.appendChild(main);

  // Footer
  const footer = document.createElement('footer');
  footer.innerHTML = 'Edit rules then press <em>Evaluate Rules</em>. The engine asks <code>event/4</code> every step and plays any matching results.';
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
    { name: 'sine', desc: 'sine monosynth (use Pitch as MIDI)' }
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
