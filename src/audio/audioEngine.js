export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
    }
  }

  async ensureRunning() {
    this.init();
    if (this.ctx.state === 'suspended') await this.ctx.resume();
  }

  time() { return this.ctx ? this.ctx.currentTime : 0; }

  noteToFreq(midi) { return 440 * Math.pow(2, (midi-69)/12); }

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
  }

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
  }

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
  }

  sine(t, midi=48, vel=0.6) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type='sine'; o.frequency.value = this.noteToFreq(midi);
    const g = ctx.createGain(); g.gain.value = vel;
    const f = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=3000; f.Q.value=0.2;
    o.connect(f).connect(g).connect(this.master);
    o.start(t); o.stop(t+0.25);
  }
}
