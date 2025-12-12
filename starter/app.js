// -----------------------------
// 1) Tiny Prolog-ish engine
// -----------------------------
function tokenize(src) {
  const tokens = [];
  const re = /\s+|([A-Za-z_][A-Za-z0-9_]*)|(\d+\.?\d*)|(:-|[()\[\],.|])|(\%.*$)/gy;
  let m;
  while ((m = re.exec(src)) !== null) {
    if (m[0].trim() === '') continue;
    if (m[4]) continue; // comment
    if (m[1]) tokens.push({ type: 'atom_or_var', value: m[1] });
    else if (m[2]) tokens.push({ type: 'number', value: parseFloat(m[2]) });
    else if (m[3]) tokens.push({ type: 'sym', value: m[3] });
  }
  return tokens;
}

function parse(src) {
  const t = tokenize(src);
  let i = 0;
  function peek() { return t[i]; }
  function eat(type, value) {
    const tok = t[i];
    if (!tok || tok.type !== type || (value && tok.value !== value)) throw new Error(`Parse error near token ${JSON.stringify(tok)}; expected ${type} ${value??''}`);
    i++; return tok;
  }
  function parseTerm() {
    const tok = peek();
    if (!tok) throw new Error('Unexpected end while parsing term');
    if (tok.type === 'number') { i++; return { type:'num', value: tok.value }; }
    if (tok.type === 'atom_or_var') {
      i++;
      const name = tok.value;
      if (peek() && peek().type === 'sym' && peek().value === '(') {
        eat('sym','(');
        const args = [];
        if (!(peek() && peek().type === 'sym' && peek().value === ')')) {
          while (true) {
            args.push(parseTerm());
            if (peek() && peek().type === 'sym' && peek().value === ',') { eat('sym',','); continue; }
            break;
          }
        }
        eat('sym',')');
        return { type:'compound', f:name, args };
      }
      if (name[0] === name[0].toUpperCase() || name[0] === '_') return { type:'var', name };
      return { type:'atom', name };
    }
    if (tok.type === 'sym' && tok.value === '[') {
      eat('sym','[');
      const items = [];
      if (peek() && !(peek().type==='sym' && peek().value===']')) {
        while (true) {
          items.push(parseTerm());
          if (peek() && peek().type==='sym' && peek().value===',') { eat('sym',','); continue; }
          break;
        }
      }
      eat('sym',']');
      return { type:'list', items };
    }
    throw new Error('Bad term');
  }
  function parseClause() {
    const head = parseTerm();
    let body = [];
    if (peek() && peek().type==='sym' && peek().value===':-') {
      eat('sym',':-');
      while (true) {
        body.push(parseTerm());
        if (peek() && peek().type==='sym' && peek().value===',') { eat('sym',','); continue; }
        break;
      }
    }
    eat('sym','.');
    return { head, body };
  }
  const clauses = [];
  while (i < t.length) clauses.push(parseClause());
  return clauses;
}

function cloneTerm(t) { return JSON.parse(JSON.stringify(t)); }

function substTerm(term, env) {
  if (term.type === 'var') {
    const v = env[term.name];
    return v ? substTerm(v, env) : term;
  }
  if (term.type === 'compound') return { type:'compound', f:term.f, args: term.args.map(a=>substTerm(a,env)) };
  if (term.type === 'list') return { type:'list', items: term.items.map(a=>substTerm(a,env)) };
  return term;
}

function unify(a, b, env) {
  a = substTerm(a, env); b = substTerm(b, env);
  if (a.type === 'var') { const out = {...env}; out[a.name] = b; return out; }
  if (b.type === 'var') { const out = {...env}; out[b.name] = a; return out; }
  if (a.type === 'num' && b.type === 'num') return (a.value===b.value)? {...env} : null;
  if (a.type === 'atom' && b.type === 'atom') return (a.name===b.name)? {...env} : null;
  if (a.type === 'list' && b.type === 'list') {
    if (a.items.length !== b.items.length) return null;
    let e = {...env};
    for (let k=0;k<a.items.length;k++) { e = unify(a.items[k], b.items[k], e); if (!e) return null; }
    return e;
  }
  if (a.type === 'compound' && b.type === 'compound' && a.f===b.f && a.args.length===b.args.length) {
    let e = {...env};
    for (let k=0;k<a.args.length;k++) { e = unify(a.args[k], b.args[k], e); if (!e) return null; }
    return e;
  }
  return null;
}

function termToString(t) {
  if (!t) return '∅';
  if (t.type==='num') return String(t.value);
  if (t.type==='atom') return t.name;
  if (t.type==='var') return t.name;
  if (t.type==='list') return '['+t.items.map(termToString).join(', ')+']';
  if (t.type==='compound') return `${t.f}(${t.args.map(termToString).join(', ')})`;
}

// Built-in predicates may yield multiple envs (for nondeterminism)
const builtins = {
  // every(T, StepBeats): true when T (seconds) aligns to a grid of 'StepBeats'
  every: (args, env, ctx) => {
    const T = evalNumber(args[0], env);
    const step = evalNumber(args[1], env);
    const beat = T * ctx.bpm / 60;
    const eps = 1e-4;
    return (Math.abs((beat/step) - Math.round(beat/step)) < eps) ? [env] : [];
  },
  // beat(T, N): true when N divides beat count (integer grid of N per beat)
  beat: (args, env, ctx) => {
    const T = evalNumber(args[0], env);
    const N = evalNumber(args[1], env);
    const beat = T * ctx.bpm / 60; // beats elapsed
    const value = beat * N;
    const eps = 1e-4;
    return (Math.abs(value - Math.round(value)) < eps) ? [env] : [];
  },
  // phase(T, N, K): bar subdivision phase (e.g., N=4 quarters, K in 0..N-1)
  phase: (args, env, ctx) => {
    const T = evalNumber(args[0], env);
    const N = evalNumber(args[1], env);
    const K = evalNumber(args[2], env);
    const beat = T * ctx.bpm / 60; // beats
    const pos = Math.round(beat * N);
    return (pos % N) === (K % N) ? [env] : [];
  },
  prob: (args, env) => {
    const p = evalNumber(args[0], env);
    return (Math.random() < p) ? [env] : [];
  },
  eq: (args, env) => {
    const A = evalTerm(args[0], env);
    const B = evalTerm(args[1], env);
    return deepEqual(A,B)? [env] : [];
  },
  add: (args, env) => {
    const A = evalNumber(args[0], env);
    const B = evalNumber(args[1], env);
    const C = args[2];
    if (C.type!== 'var') return [];
    const out = {...env};
    out[C.name] = { type:'num', value: A+B };
    return [out];
  },
  choose: (args, env) => {
    const list = evalList(args[0], env);
    const v = args[1];
    const outs = [];
    for (const item of list) {
      const e = unify(v, item, env);
      if (e) outs.push(e);
    }
    return outs;
  }
};

function evalNumber(term, env) {
  const t = substTerm(term, env);
  if (t.type === 'num') return t.value;
  throw new Error('Expected number in builtin');
}
function evalList(term, env) {
  const t = substTerm(term, env);
  if (t.type === 'list') return t.items;
  throw new Error('Expected list in builtin');
}
function evalTerm(term, env) { return substTerm(term, env); }
function deepEqual(a,b){ return JSON.stringify(a)===JSON.stringify(b); }

// ---- Euclidean rhythm helpers ----
function stepIndexAtTime(T, N, B, bpm) {
  // T seconds -> beats -> bars -> step index 0..N-1
  const beats = T * bpm / 60;
  const bars  = beats / B;
  const sReal = Math.round(bars * N);  // quantized to nearest step
  return ((sReal % N) + N) % N;
}
// euc(T, K, N, B, R): K hits, N steps per bar, B beats per bar, rotation R
builtins.euc = (args, env, ctx) => {
  const T = evalNumber(args[0], env);
  const K = evalNumber(args[1], env);
  const N = evalNumber(args[2], env);
  const B = evalNumber(args[3], env);
  const R = evalNumber(args[4], env);
  if (!(Number.isFinite(K) && Number.isFinite(N) && N>0 && K>=0 && K<=N)) return [];
  const s  = stepIndexAtTime(T, N, B, ctx.bpm);
  const sR = (s + (R % N) + N) % N;
  const hit = ((sR * K) % N) < K;
  return hit ? [env] : [];
};

function* resolve(goals, env, program, ctx) {
  if (goals.length === 0) { yield env; return; }
  const [g, ...rest] = goals;
  // Built-in?
  if (g.type==='compound' && builtins[g.f]) {
    const outs = builtins[g.f](g.args, env, ctx);
    for (const e of outs) yield* resolve(rest, e, program, ctx);
    return;
  }
  // User-defined clauses
  for (const clause of program) {
    const renamed = renameVars(clause); // avoid variable capture
    const e2 = unify(g, renamed.head, {...env});
    if (!e2) continue;
    yield* resolve([...renamed.body, ...rest], e2, program, ctx);
  }
}

let varCounter = 0;
function renameVars(clause) {
  const map = {};
  function rename(term) {
    if (term.type==='var') {
      if (!map[term.name]) map[term.name] = { type:'var', name: term.name+"$"+(varCounter++) };
      return map[term.name];
    }
    if (term.type==='compound') return { type:'compound', f:term.f, args: term.args.map(rename) };
    if (term.type==='list') return { type:'list', items: term.items.map(rename) };
    return term;
  }
  return { head: rename(cloneTerm(clause.head)), body: clause.body.map(b=>rename(cloneTerm(b))) };
}

// -----------------------------
// 2) WebAudio engine + scheduler
// -----------------------------
const Audio = {
  ctx: null,
  master: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
    }
  },
  time() { return this.ctx ? this.ctx.currentTime : 0; },
  noteToFreq(midi) { return 440 * Math.pow(2, (midi-69)/12); },
  kick(t, vel=0.9) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t+0.12);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t+0.001);
    g.gain.exponentialRampToValueAtTime(0.0008, t+0.25);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t+0.3);
  },
  snare(t, vel=0.8) {
    const ctx = this.ctx;
    const n = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate*0.2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i=0;i<data.length;i++) data[i] = (Math.random()*2-1) * Math.pow(1-i/data.length, 2);
    n.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=2000; bp.Q.value=0.5;
    const g = ctx.createGain(); g.gain.value = vel;
    n.connect(bp).connect(g).connect(this.master);
    n.start(t); n.stop(t+0.2);
  },
  hat(t, vel=0.4) {
    const ctx = this.ctx;
    const n = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate*0.08, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i=0;i<data.length;i++) data[i] = (Math.random()*2-1) * Math.pow(1-i/data.length, 8);
    n.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=6000; hp.Q.value=0.7;
    const g = ctx.createGain(); g.gain.value = vel;
    n.connect(hp).connect(g).connect(this.master);
    n.start(t); n.stop(t+0.1);
  },
  sine(t, midi=48, vel=0.6) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type='sine'; o.frequency.value = this.noteToFreq(midi);
    const g = ctx.createGain(); g.gain.value = vel;
    const f = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=3000; f.Q.value=0.2;
    o.connect(f).connect(g).connect(this.master);
    o.start(t); o.stop(t+0.25);
  }
};

function swingAdjust(t, bpm, swingAmt) {
  // Delay every 2nd 1/8th by swingAmt proportion of the 1/8 duration
  const eighth = (60/bpm)/2; // seconds per 1/8
  const pos = t / eighth;
  const isOdd = Math.floor(pos) % 2 === 1;
  return isOdd ? t + swingAmt * eighth : t;
}

const Scheduler = {
  bpm: 120,
  swing: 0,
  lookaheadMs: 80,
  interval: null,
  gridBeats: 0.25, // 16th notes
  program: [],
  start() {
    Audio.init();
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(()=>this.tick(), this.lookaheadMs/2);
  },
  stop() { if (this.interval) clearInterval(this.interval); this.interval=null; },
  tick() {
    const now = Audio.time();
    const ahead = this.lookaheadMs/1000;
    const step = (60/this.bpm) * this.gridBeats;
    const startQ = Math.floor(now/step)*step;
    for (let t = startQ; t < now+ahead; t += step) {
      this.queryAndSchedule(t + step); // schedule the next grid point (strictly future)
    }
  },
  queryAndSchedule(t) {
    const ctx = { bpm: this.bpm };
    // Solve event(Voice, Pitch, Vel, T)
    const goal = { type:'compound', f:'event', args:[ {type:'var',name:'Voice'}, {type:'var',name:'Pitch'}, {type:'var',name:'Vel'}, {type:'num', value: t } ] };
    let count = 0;
    for (const env of resolve([goal], {}, this.program, ctx)) {
      const voice = termToString(substTerm({type:'var',name:'Voice'}, env));
      const pitchTerm = substTerm({type:'var',name:'Pitch'}, env);
      const velTerm = substTerm({type:'var',name:'Vel'}, env);
      const midi = (pitchTerm.type==='num') ? pitchTerm.value : 48;
      const vel = (velTerm.type==='num') ? Math.min(Math.max(velTerm.value,0),1) : 0.7;
      const tt = swingAdjust(t, this.bpm, this.swing);
      this.trigger(voice, tt, midi, vel);
      count++;
    }
    if (count>0) log(`[sched] t=${t.toFixed(3)} → ${count} events`);
  },
  trigger(voice, t, midi, vel) {
    const v = String(voice);
    if (v==='kick') return Audio.kick(t, vel);
    if (v==='snare') return Audio.snare(t, vel);
    if (v==='hat') return Audio.hat(t, vel);
    if (v==='sine') return Audio.sine(t, midi, vel);
  }
};

// -----------------------------
// 3) UI glue
// -----------------------------
const logEl = document.getElementById('log');
function log(msg){ logEl.textContent = (msg + "\n" + logEl.textContent).slice(0, 8000); }

const codeEl = document.getElementById('code');
const defaultProgram = `
% --- Example rules: Euclidean + basics ---
% K hits over N steps per bar, in B=4 beats per bar, rotated by R steps

% Four-on-the-floor kick: E(4,16) in 4/4
kik(T)   :- euc(T, 4, 16, 4, 0).
% Backbeat snare: E(2,16) rotated 4 -> steps 4 & 12
snr(T)   :- euc(T, 2, 16, 4, 4).
% Hats: Euclidean 11 over 16 for a busy texture
hat1(T)  :- euc(T,11, 16, 4, 0).

% Simple bass that chooses notes every 1/2 beat
bass(T,N) :- every(T,0.5), choose([40,43,47,48], N).

% Map to playable events
event(kick,  36, 0.95, T) :- kik(T).
event(snare, 38, 0.90, T) :- snr(T).
event(hat,   42, 0.30, T) :- hat1(T).
event(sine,   N, 0.55, T) :- bass(T, N).

% Sprinkle extra ghost hats with probability on 1/8s
hat1(T) :- every(T,0.125), prob(0.2).
`;
if (codeEl) codeEl.value = defaultProgram.trim();

function evaluateProgram() {
  try {
    const text = codeEl.value + (codeEl.value.trim().endsWith('.')? '' : '\n');
    const clauses = parse(text);
    Scheduler.program = clauses;
    log(`[ok] Loaded ${clauses.length} clauses.`);
  } catch (e) {
    console.error(e);
    log(`[parse error] ${e.message}`);
  }
}

document.getElementById('eval').onclick = evaluateProgram;
document.getElementById('start').onclick = async () => {
  Audio.init();
  await Audio.ctx.resume();
  Scheduler.start();
  log('[audio] started');
};
document.getElementById('stop').onclick = () => { Scheduler.stop(); log('[audio] stopped'); };

const bpmInput = document.getElementById('bpm'); const bpmv = document.getElementById('bpmv');
bpmInput.addEventListener('input', e=>{ bpmv.textContent = e.target.value; Scheduler.bpm = parseFloat(e.target.value); });
const swingInput = document.getElementById('swing'); const swingv = document.getElementById('swingv');
swingInput.addEventListener('input', e=>{ swingv.textContent = Number(e.target.value).toFixed(3); Scheduler.swing = parseFloat(e.target.value); });
const lookInput = document.getElementById('look'); const lookv = document.getElementById('lookv');
lookInput.addEventListener('input', e=>{ lookv.textContent = `${e.target.value}ms`; Scheduler.lookaheadMs = parseFloat(e.target.value); if (Scheduler.interval) { Scheduler.start(); } });

// Boot
evaluateProgram();
