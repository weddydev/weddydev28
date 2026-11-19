/* Canvas FX — drifting gold leaf, gold-leaf confetti, cursor sparkles.
   DPR capped, loops pause off-screen and when the tab is hidden. */
import { env } from './utils.js';

function loop(canvas, { setup, frame, observe = true }) {
  const ctx = canvas.getContext('2d');
  const st = { ctx, w: 0, h: 0, t: 0, running: false, raf: 0 };
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, env.isMobile ? 1.5 : 1.75);
    st.w = canvas.clientWidth; st.h = canvas.clientHeight;
    canvas.width = Math.round(st.w * dpr); canvas.height = Math.round(st.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    setup && setup(st);
  };
  let last = 0;
  const tick = (now) => {
    if (!st.running) return;
    const dt = Math.min(50, now - (last || now)); last = now; st.t += dt;
    frame(st, dt / 16.67);
    st.raf = requestAnimationFrame(tick);
  };
  st.start = () => { if (st.running) return; st.running = true; last = 0; st.raf = requestAnimationFrame(tick); };
  st.stop = () => { st.running = false; cancelAnimationFrame(st.raf); };
  resize();
  let rT; const onResize = () => { clearTimeout(rT); rT = setTimeout(resize, 200); };
  window.addEventListener('resize', onResize);
  let io; const onVis = () => document.hidden && st.stop();
  if (observe && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(([en]) => (en.isIntersecting && !document.hidden ? st.start() : st.stop()));
    io.observe(canvas); document.addEventListener('visibilitychange', onVis);
  }
  st.destroy = () => { st.stop(); window.removeEventListener('resize', onResize); io && io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  return st;
}

/* irregular gold-leaf flake sprites */
function flake(size, tones) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, size, size);
  tones.forEach((t, i) => g.addColorStop(i / (tones.length - 1), t));
  x.fillStyle = g; x.beginPath();
  const n = 7 + ((Math.random() * 4) | 0);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, r = size * (0.28 + Math.random() * 0.22);
    const px = size / 2 + Math.cos(a) * r, py = size / 2 + Math.sin(a) * r * (0.6 + Math.random() * 0.4);
    i ? x.lineTo(px, py) : x.moveTo(px, py);
  }
  x.closePath(); x.fill();
  x.globalAlpha = 0.5; x.strokeStyle = 'rgba(255,250,230,.9)'; x.lineWidth = 0.6; x.stroke();
  return c;
}
const TONES = [['#8c6a2a', '#e9cf8a', '#fff3d0', '#c9a24f'], ['#a67c2e', '#f6e3a8', '#b8893a'], ['#7a5a1f', '#d4ad5c', '#fff1c9', '#9c712a'], ['#c9a24f', '#fff8e1', '#d9b56a']];

/* slow-falling gold leaf (hero ambience + finale shower) */
export function goldLeaf(canvas, { count = 40, density = 1 } = {}) {
  if (!canvas || env.reduced) return null;
  const N = Math.round((env.isMobile ? count * 0.6 : count) * density);
  const sprites = Array.from({ length: 12 }, (_, i) => flake(48, TONES[i % TONES.length]));
  let P = [];
  const make = (s, init) => ({ x: Math.random() * s.w, y: init ? Math.random() * s.h : -30, s: 6 + Math.random() * 16, vy: 0.25 + Math.random() * 0.55, vx: (Math.random() - 0.5) * 0.25, r: Math.random() * 6.3, vr: (Math.random() - 0.5) * 0.02, f: Math.random() * 6.3, vf: 0.01 + Math.random() * 0.035, sp: sprites[(Math.random() * sprites.length) | 0], a: 0.55 + Math.random() * 0.45, ph: Math.random() * 6 });
  return loop(canvas, {
    setup(s) { P = Array.from({ length: N }, () => make(s, true)); },
    frame(s, k) {
      const { ctx, w, h, t } = s;
      ctx.clearRect(0, 0, w, h);
      for (const p of P) {
        p.y += p.vy * k; p.x += (Math.sin(t * 0.0008 + p.ph) * 0.5 + p.vx) * k; p.r += p.vr * k; p.f += p.vf * k;
        if (p.y > h + 30) Object.assign(p, make(s));
        const flip = Math.cos(p.f);
        ctx.save(); ctx.globalAlpha = p.a * (0.55 + 0.45 * Math.abs(flip)); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(flip, 1);
        ctx.drawImage(p.sp, -p.s / 2, -p.s / 2, p.s, p.s); ctx.restore();
      }
    }
  });
}

/* gold-leaf burst (RSVP success) */
export function leafBurst(canvas) {
  if (!canvas || env.reduced) return;
  canvas.style.display = 'block';
  const sprites = Array.from({ length: 10 }, (_, i) => flake(48, TONES[i % TONES.length]));
  const N = env.isMobile ? 120 : 200;
  let P = [];
  const st = loop(canvas, {
    observe: false,
    setup(s) {
      if (P.length) return;
      P = Array.from({ length: N }, () => {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6, sp = 8 + Math.random() * 13;
        return { x: s.w / 2 + (Math.random() - 0.5) * 80, y: s.h * 0.62, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.25, f: Math.random() * 6, vf: 0.06 + Math.random() * 0.12, s: 8 + Math.random() * 16, sp: sprites[(Math.random() * sprites.length) | 0], a: 1 };
      });
    },
    frame(s, k) {
      const { ctx, w, h } = s;
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of P) {
        p.vx *= Math.pow(0.972, k); p.vy = Math.min(1.8, p.vy * Math.pow(0.972, k) + 0.14 * k);
        p.x += (p.vx + Math.sin(p.f) * 0.7) * k; p.y += p.vy * k; p.r += p.vr * k; p.f += p.vf * k;
        if (s.t > 4500) p.a -= 0.01 * k;
        if (p.a <= 0 || p.y > h + 40) continue;
        alive++;
        ctx.save(); ctx.globalAlpha = Math.max(0, p.a); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(Math.cos(p.f), 1);
        ctx.drawImage(p.sp, -p.s / 2, -p.s / 2, p.s, p.s); ctx.restore();
      }
      if (!alive || s.t > 10000) { st.destroy(); ctx.clearRect(0, 0, w, h); canvas.style.display = 'none'; }
    }
  });
  st.start();
}

/* sparkle trail behind the cursor (desktop) */
export function sparkleTrail(canvas) {
  if (!canvas || env.reduced || !env.finePointer) return null;
  const P = [];
  let mx = -99, my = -99, lx = -99, ly = -99;
  const onMove = (e) => { mx = e.clientX; my = e.clientY; };
  window.addEventListener('mousemove', onMove, { passive: true });
  const st = loop(canvas, {
    observe: false,
    frame(s, k) {
      const { ctx, w, h } = s;
      const d = Math.hypot(mx - lx, my - ly);
      if (d > 4 && lx > -90) for (let i = 0; i < Math.min(3, d / 8); i++) P.push({ x: mx + (Math.random() - 0.5) * 8, y: my + (Math.random() - 0.5) * 8, vx: (Math.random() - 0.5) * 0.6, vy: 0.2 + Math.random() * 0.6, life: 1, s: 1 + Math.random() * 2.4 });
      lx = mx; ly = my;
      ctx.clearRect(0, 0, w, h);
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i];
        p.x += p.vx * k; p.y += p.vy * k; p.life -= 0.025 * k;
        if (p.life <= 0) { P.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = i % 3 ? '#c9a24f' : '#fff3d0';
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.PI / 4);
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s); ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
  });
  st.start();
  const destroy = st.destroy;
  st.destroy = () => { destroy(); window.removeEventListener('mousemove', onMove); };
  return st;
}
