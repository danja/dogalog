import './style.css';
import { parseProgram } from './prolog/parser.js';
import { createBuiltins } from './prolog/builtins.js';
import { AudioEngine } from './audio/audioEngine.js';
import { Scheduler } from './scheduler/scheduler.js';
import { defaultProgram } from './ui/defaultProgram.js';

const app = document.getElementById('app');
app.innerHTML = `
  <header>
    <h1>Prolog-like Livecoding Music (Vanilla JS + WebAudio)</h1>
    <div class="controls">
      <label>BPM <input id="bpm" type="range" min="40" max="220" value="120"> <span id="bpmv">120</span></label>
      <label>Swing <input id="swing" type="range" min="0" max="0.25" step="0.005" value="0"> <span id="swingv">0.00</span></label>
      <label>Lookahead <input id="look" type="range" min="20" max="150" step="5" value="80"> <span id="lookv">80ms</span></label>
      <button id="start" class="btn primary">Start</button>
      <button id="stop"  class="btn danger">Stop</button>
      <button id="eval"  class="btn">Evaluate Rules</button>
    </div>
  </header>

  <main>
    <section class="panel">
      <h2>Rules (Prolog-ish)</h2>
      <textarea id="code" spellcheck="false" class="editor"></textarea>
      <div class="mapping">
        <div class="row"><strong>Top goal:</strong> <code>event(Voice, Pitch, Vel, T).</code></div>
        <div class="row"><span>Built-ins:</span>
          <code>beat(T, N)</code>
          <code>phase(T, N, K)</code>
          <code>every(T, Step)</code>
          <code>prob(P)</code>
          <code>choose(List, X)</code>
          <code>eq(A,B)</code>
          <code>add(A,B,C)</code>
          <code>euc(T, K, N, B, R)</code>
        </div>
      </div>
    </section>

    <section class="panel">
      <h2>Log</h2>
      <pre id="log" class="log"></pre>
      <h2>Instruments</h2>
      <div class="mapping">
        <div class="row"><code>kick</code> – synthesized kick</div>
        <div class="row"><code>snare</code> – noise snare</div>
        <div class="row"><code>hat</code> – noise hat</div>
        <div class="row"><code>sine</code> – sine monosynth (use Pitch as MIDI)</div>
      </div>
    </section>
  </main>

  <footer>
    Edit rules then press <em>Evaluate Rules</em>. The engine asks <code>event/4</code> every step and plays any matching results.
  </footer>
`;

const logEl = document.getElementById('log');
const codeEl = document.getElementById('code');
const bpmInput = document.getElementById('bpm');
const bpmValue = document.getElementById('bpmv');
const swingInput = document.getElementById('swing');
const swingValue = document.getElementById('swingv');
const lookaheadInput = document.getElementById('look');
const lookaheadValue = document.getElementById('lookv');

const builtins = createBuiltins();
const audio = new AudioEngine();
const scheduler = new Scheduler({ audio, builtins });

codeEl.value = defaultProgram.trim();

function log(msg) {
  logEl.textContent = (msg + "\n" + logEl.textContent).slice(0, 8000);
}

function evaluateProgram() {
  try {
    const text = codeEl.value.trim();
    const normalized = text.endsWith('.') ? text : `${text}.`;
    const clauses = parseProgram(normalized);
    scheduler.setProgram(clauses);
    log(`[ok] Loaded ${clauses.length} clauses.`);
  } catch (error) {
    console.error(error);
    log(`[parse error] ${error.message}`);
  }
}

document.getElementById('eval').onclick = evaluateProgram;
document.getElementById('start').onclick = async () => {
  await audio.ensureRunning();
  scheduler.start();
  log('[audio] started');
};
document.getElementById('stop').onclick = () => { scheduler.stop(); log('[audio] stopped'); };

bpmInput.addEventListener('input', (event) => {
  bpmValue.textContent = event.target.value;
  scheduler.bpm = parseFloat(event.target.value);
});

swingInput.addEventListener('input', (event) => {
  swingValue.textContent = Number(event.target.value).toFixed(3);
  scheduler.swing = parseFloat(event.target.value);
});

lookaheadInput.addEventListener('input', (event) => {
  lookaheadValue.textContent = `${event.target.value}ms`;
  scheduler.lookaheadMs = parseFloat(event.target.value);
  if (scheduler.interval) {
    scheduler.start();
  }
});

evaluateProgram();
