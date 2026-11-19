/* ==========================================================================
   Audio — muted until the guest taps. Plays config.music.src if set; otherwise
   a generative music-box waltz (3/4, D major) with a soft hall reverb.
   SFX: foil crinkle, chime, card flip, stamp, swish.
   ========================================================================== */
import C from '../config.js';

let ctx = null, master = null, dry = null, wetIn = null, on = false, el = null, timer = 0, nextBar = 0, bar = 0, prevNote = 74;
const VOL = (C.music && C.music.volume) || 0.5;
const listeners = new Set();
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const BPM = 84, BEAT = 60 / BPM;
// D  Bm  G  A  D  F#m  G  A(sus→A)
const PROG = [[50, [62, 66, 69]], [47, [62, 66, 71]], [43, [62, 67, 71]], [45, [61, 64, 69]], [50, [62, 66, 69]], [42, [61, 66, 69]], [43, [62, 67, 71]], [45, [61, 64, 67]]];
const SCALE = [62, 64, 66, 67, 69, 71, 73, 74, 76, 78, 79, 81, 83, 85, 86];
const RHYTHMS = [[0, 1, 2], [0, 2], [0, 1, 1.5, 2], [0], [0, 1.5, 2], [0, 0.5, 1, 2]];

function ensure() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.connect(master);
  dry = ctx.createGain(); dry.gain.value = 0.8; dry.connect(comp);
  const conv = ctx.createConvolver();
  const len = ctx.sampleRate * 3.2, buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  conv.buffer = buf;
  const wet = ctx.createGain(); wet.gain.value = 0.55; conv.connect(wet); wet.connect(comp);
  wetIn = conv;
  return true;
}

/* a single music-box tine: bright partials, fast attack, long ring */
function tine(midi, t, vel = 0.05, decay = 1.8) {
  const f = mtof(midi);
  [[1, 1], [2.01, 0.32], [3.98, 0.12], [5.9, 0.05]].forEach(([r, a], i) => {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * r; o.detune.value = (Math.random() - 0.5) * 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel * a, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay / (1 + i * 0.8));
    o.connect(g); g.connect(dry); g.connect(wetIn);
    o.start(t); o.stop(t + decay + 0.1);
  });
}

function scheduleBar(t) {
  const [bass, chord] = PROG[bar % PROG.length];
  tine(bass, t, 0.045, 2.6);                                  // beat 1: bass
  chord.forEach((n, i) => { tine(n, t + BEAT * (1 + (i % 2) * 0.0), 0.016, 1.2); tine(n, t + BEAT * 2, 0.014, 1.2); });
  const rhythm = RHYTHMS[(Math.random() * RHYTHMS.length) | 0];
  rhythm.forEach((beat, i) => {
    let target;
    if (i === 0) { target = chord[(Math.random() * chord.length) | 0] + 12; }
    else {
      const idx = SCALE.indexOf(SCALE.reduce((a, b) => (Math.abs(b - prevNote) < Math.abs(a - prevNote) ? b : a)));
      target = SCALE[Math.max(0, Math.min(SCALE.length - 1, idx + [-2, -1, 1, 2][(Math.random() * 4) | 0]))];
    }
    prevNote = target;
    tine(target, t + beat * BEAT, 0.05, 2.2);
  });
  if (bar % 8 === 7) tine(chord[2] + 24, t + BEAT * 2.5, 0.02, 3);   // a sparkle at phrase end
  bar++;
}
function schedule() { while (nextBar < ctx.currentTime + 1.2) { scheduleBar(nextBar); nextBar += BEAT * 3; } }

function fadeEl(to) {
  if (!el) return;
  const from = el.volume, t0 = performance.now();
  const step = (now) => { const k = Math.min(1, (now - t0) / 1600); el.volume = from + (to - from) * k; if (k < 1) requestAnimationFrame(step); else if (!to) el.pause(); };
  requestAnimationFrame(step);
}
function set(state) {
  on = state;
  if (on) {
    if (!ensure()) return;
    ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(C.music?.src ? 1 : VOL, ctx.currentTime, 0.6);
    if (C.music?.src) { if (!el) { el = new Audio(C.music.src); el.loop = true; el.volume = 0; } el.play().catch(() => {}); fadeEl(VOL); }
    else if (!timer) { nextBar = ctx.currentTime + 0.15; schedule(); timer = setInterval(schedule, 300); }
  } else if (ctx) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    fadeEl(0);
  }
  listeners.forEach((fn) => fn(on));
}

function noise(dur) {
  const b = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource(); s.buffer = b; return s;
}
const SFX = {
  foil() {
    const t = ctx.currentTime, n = noise(0.09), hp = ctx.createBiquadFilter(), g = ctx.createGain();
    hp.type = 'highpass'; hp.frequency.value = 3200 + Math.random() * 2500;
    g.gain.setValueAtTime(0.05 + Math.random() * 0.04, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    n.connect(hp); hp.connect(g); g.connect(dry); n.start(t);
  },
  chime() { const t = ctx.currentTime; [74, 78, 81, 86, 90].forEach((m, i) => tine(m, t + i * 0.11, 0.05, 2.6)); },
  flip() {
    const t = ctx.currentTime, n = noise(0.25), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    bp.type = 'bandpass'; bp.frequency.setValueAtTime(900, t); bp.frequency.linearRampToValueAtTime(2600, t + 0.2); bp.Q.value = 0.7;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.09, t + 0.06); g.gain.linearRampToValueAtTime(0, t + 0.24);
    n.connect(bp); bp.connect(g); g.connect(dry); n.start(t);
  },
  stamp() {
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
    g.gain.setValueAtTime(0.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g); g.connect(dry); o.start(t); o.stop(t + 0.32);
    const n = noise(0.05), hp = ctx.createBiquadFilter(), g2 = ctx.createGain();
    hp.type = 'highpass'; hp.frequency.value = 2000; g2.gain.setValueAtTime(0.2, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    n.connect(hp); hp.connect(g2); g2.connect(dry); n.start(t);
  },
  swish() {
    const t = ctx.currentTime, n = noise(1.2), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    lp.type = 'bandpass'; lp.Q.value = 0.8; lp.frequency.setValueAtTime(400, t); lp.frequency.exponentialRampToValueAtTime(4000, t + 0.6); lp.frequency.exponentialRampToValueAtTime(600, t + 1.1);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.5); g.gain.linearRampToValueAtTime(0, t + 1.15);
    n.connect(lp); lp.connect(g); g.connect(dry); g.connect(wetIn); n.start(t);
  }
};

export const audio = {
  get on() { return on; },
  toggle() { set(!on); },
  sfx(name) { if (on && ctx && SFX[name]) { try { SFX[name](); } catch { /* ignore */ } } },
  subscribe(fn) { listeners.add(fn); return () => { listeners.delete(fn); }; }
};
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!ctx || !on) return;
    if (document.hidden) { ctx.suspend(); el && el.pause(); } else { ctx.resume(); el && el.play().catch(() => {}); }
  });
}
