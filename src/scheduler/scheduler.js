import { resolveGoals, substTerm, termToString } from '../prolog/index.js';

function swingAdjust(t, bpm, swingAmt) {
  const eighth = (60/bpm)/2; // seconds per 1/8
  const pos = t / eighth;
  const isOdd = Math.floor(pos) % 2 === 1;
  return isOdd ? t + swingAmt * eighth : t;
}

export class Scheduler {
  constructor({ audio, builtins, stateManager, bpm = 120, swing = 0, lookaheadMs = 80, gridBeats = 0.25 }) {
    this.audio = audio;
    this.builtins = builtins;
    this.stateManager = stateManager;
    this.bpm = bpm;
    this.swing = swing;
    this.lookaheadMs = lookaheadMs;
    this.gridBeats = gridBeats;
    this.program = [];
    this.interval = null;
  }

  setProgram(clauses) { this.program = clauses; }

  resetState() {
    if (this.stateManager) {
      this.stateManager.reset();
    }
  }

  start() {
    this.audio.init();
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.tick(), this.lookaheadMs/2);
  }

  stop() { if (this.interval) clearInterval(this.interval); this.interval=null; }

  tick() {
    const now = this.audio.time();
    const ahead = this.lookaheadMs/1000;
    const step = (60/this.bpm) * this.gridBeats;
    const startQ = Math.floor(now/step)*step;
    for (let t = startQ; t < now+ahead; t += step) {
      this.queryAndSchedule(t + step); // schedule strictly in the future
    }
  }

  queryAndSchedule(t) {
    const ctx = {
      bpm: this.bpm,
      stateManager: this.stateManager
    };
    const goal = { type:'compound', f:'event', args:[ {type:'var',name:'Voice'}, {type:'var',name:'Pitch'}, {type:'var',name:'Vel'}, {type:'num', value: t } ] };
    for (const env of resolveGoals([goal], {}, this.program, ctx, this.builtins)) {
      const voice = termToString(substTerm({type:'var',name:'Voice'}, env));
      const pitchTerm = substTerm({type:'var',name:'Pitch'}, env);
      const velTerm = substTerm({type:'var',name:'Vel'}, env);
      const midi = (pitchTerm.type==='num') ? pitchTerm.value : 48;
      const vel = (velTerm.type==='num') ? Math.min(Math.max(velTerm.value,0),1) : 0.7;
      const tt = swingAdjust(t, this.bpm, this.swing);
      this.trigger(voice, tt, midi, vel);
    }
  }

  trigger(voice, t, midi, vel) {
    const v = String(voice);
    if (v==='kick') return this.audio.kick(t, vel);
    if (v==='snare') return this.audio.snare(t, vel);
    if (v==='hat') return this.audio.hat(t, vel);
    if (v==='sine') return this.audio.sine(t, midi, vel);
  }
}
