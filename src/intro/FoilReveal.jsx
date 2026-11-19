/* ==========================================================================
   THE UNVEILING — a sheet of real-looking gold foil, embossed with the
   guest's name. Swipe to scratch it away (sparkles, haptics, crinkle);
   past ~40% it lifts off and drifts away as gold leaf.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import C from '../config.js';
import { gsap } from '../lib/gsap.js';
import { env, guest, buzz, fmt, EASE } from '../lib/utils.js';
import { audio } from '../lib/audio.js';
import { enableGyro } from '../lib/rings.js';

function paintFoil(ctx, w, h) {
  // base metallic ramp
  const g = ctx.createLinearGradient(0, 0, w, h);
  [['#a77b2c', 0], ['#e2c27a', 0.16], ['#fff1c9', 0.3], ['#c99a45', 0.44], ['#f3dc9c', 0.58], ['#b08132', 0.74], ['#edd08f', 0.88], ['#9c712a', 1]].forEach(([c, o]) => g.addColorStop(o, c));
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // crinkled facets
  for (let i = 0; i < (env.isMobile ? 90 : 160); i++) {
    const x = Math.random() * w, y = Math.random() * h, s = 30 + Math.random() * 140;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * s, y + (Math.random() - 0.5) * s);
    ctx.lineTo(x + (Math.random() - 0.5) * s, y + (Math.random() - 0.5) * s);
    ctx.closePath();
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,248,225,${0.05 + Math.random() * 0.12})` : `rgba(90,60,15,${0.04 + Math.random() * 0.1})`;
    ctx.fill();
  }
  // fine specks
  for (let i = 0; i < (env.isMobile ? 1800 : 3500); i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,240,.35)' : 'rgba(100,70,20,.25)';
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
  }
  // diagonal light streaks
  [0.22, 0.55, 0.8].forEach((p, i) => {
    const sx = w * p, l = ctx.createLinearGradient(sx - 120, 0, sx + 120, h * 0.3);
    l.addColorStop(0, 'rgba(255,255,255,0)'); l.addColorStop(0.5, `rgba(255,252,235,${0.28 - i * 0.07})`); l.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = l; ctx.fillRect(0, 0, w, h);
  });
}

function emboss(ctx, text, x, y, font, depth = 1) {
  ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(80,52,8,.75)'; ctx.fillText(text, x + depth, y + depth);
  ctx.fillStyle = 'rgba(255,252,236,.95)'; ctx.fillText(text, x - depth * 0.9, y - depth * 0.9);
  const g = ctx.createLinearGradient(x - 200, y - 40, x + 200, y + 40);
  g.addColorStop(0, '#7a5a1f'); g.addColorStop(0.5, '#a67c2e'); g.addColorStop(1, '#6f5320');
  ctx.fillStyle = g; ctx.fillText(text, x, y);
}

function fitFont(ctx, text, family, max, width) {
  let size = max;
  ctx.font = `${size}px ${family}`;
  while (ctx.measureText(text).width > width && size > 18) { size -= 2; ctx.font = `${size}px ${family}`; }
  return size;
}

export default function FoilReveal({ active, onReveal, onGone }) {
  const wrap = useRef(null), cv = useRef(null), fx = useRef(null);
  const [hint, setHint] = useState(true);
  const state = useRef({ done: false, grid: null, cols: 0, rows: 0, cleared: 0, total: 1, last: null, lastBuzz: 0, lastSfx: 0, sparks: [] });

  useEffect(() => {
    const c = cv.current, f = fx.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    [c, f].forEach((el) => { el.width = w * dpr; el.height = h * dpr; el.style.width = `${w}px`; el.style.height = `${h}px`; });
    const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
    paintFoil(ctx, w, h);

    // letterpressed content
    const cx = w / 2, cy = h / 2;
    const name = guest || C.greeting.genericName;
    emboss(ctx, `${C.house.toUpperCase()}  ${C.couple.partner1.toUpperCase()}  &  ${C.couple.partner2.toUpperCase()}`, cx, cy - h * 0.2, `600 ${Math.max(10, Math.min(13, w * 0.03))}px Cinzel`, 0.8);
    // lozenge
    ctx.save(); ctx.translate(cx, cy - h * 0.1); ctx.rotate(Math.PI / 4);
    ctx.strokeStyle = 'rgba(255,250,228,.8)'; ctx.lineWidth = 1; ctx.strokeRect(-21, -21, 42, 42);
    ctx.strokeStyle = 'rgba(95,62,12,.5)'; ctx.strokeRect(-20, -20, 42, 42);
    ctx.restore();
    emboss(ctx, C.greeting.foilLabel.toUpperCase(), cx, cy - h * 0.02, `500 ${Math.max(11, Math.min(14, w * 0.032))}px Cinzel`, 0.6);
    const size = fitFont(ctx, name, 'Italiana', Math.min(92, w * 0.15), w * 0.84);
    emboss(ctx, name, cx, cy + h * 0.06, `${size}px Italiana`, 1.8);
    emboss(ctx, fmt.dots(C.date), cx, cy + h * 0.15, `500 ${Math.max(11, Math.min(14, w * 0.032))}px Cinzel`, 0.6);

    const s = state.current;
    const cell = 22;
    s.cols = Math.ceil(w / cell); s.rows = Math.ceil(h / cell);
    s.grid = new Uint8Array(s.cols * s.rows); s.total = s.cols * s.rows; s.cell = cell;
    s.brush = Math.max(34, Math.min(w, h) * 0.11);
    s.ctx = ctx; s.w = w; s.h = h;

    // sparkle loop
    const fctx = f.getContext('2d'); fctx.scale(dpr, dpr);
    let raf;
    const tick = () => {
      fctx.clearRect(0, 0, w, h);
      for (let i = s.sparks.length - 1; i >= 0; i--) {
        const p = s.sparks[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.022; p.r += p.vr;
        if (p.life <= 0) { s.sparks.splice(i, 1); continue; }
        fctx.save(); fctx.globalAlpha = p.life; fctx.translate(p.x, p.y); fctx.rotate(p.r); fctx.scale(Math.cos(p.r * 3), 1);
        fctx.fillStyle = p.c; fctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.7); fctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  /* fade in when the portal opens */
  useEffect(() => { if (active) gsap.fromTo('.foil-ui', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.4, stagger: 0.12, ease: EASE, delay: 0.8 }); }, [active]);

  const scratchAt = (x, y) => {
    const s = state.current;
    if (s.done) return;
    const ctx = s.ctx;
    ctx.save(); ctx.globalCompositeOperation = 'destination-out';
    const from = s.last || { x, y };
    const dist = Math.hypot(x - from.x, y - from.y), steps = Math.max(1, Math.ceil(dist / (s.brush * 0.3)));
    for (let i = 1; i <= steps; i++) {
      const px = from.x + ((x - from.x) * i) / steps, py = from.y + ((y - from.y) * i) / steps;
      const g = ctx.createRadialGradient(px, py, 0, px, py, s.brush);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.65, 'rgba(0,0,0,.9)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, s.brush, 0, Math.PI * 2); ctx.fill();
      // coverage grid
      const r = Math.ceil((s.brush * 0.75) / s.cell), gx = Math.floor(px / s.cell), gy = Math.floor(py / s.cell);
      for (let yy = gy - r; yy <= gy + r; yy++) for (let xx = gx - r; xx <= gx + r; xx++) {
        if (xx < 0 || yy < 0 || xx >= s.cols || yy >= s.rows || (xx - gx) ** 2 + (yy - gy) ** 2 > r * r) continue;
        const k = yy * s.cols + xx; if (!s.grid[k]) { s.grid[k] = 1; s.cleared++; }
      }
    }
    ctx.restore();
    s.last = { x, y };
    // sparkles fly off the finger
    for (let i = 0; i < 3; i++) s.sparks.push({ x, y, vx: (Math.random() - 0.5) * 5, vy: -1 - Math.random() * 3, s: 2 + Math.random() * 5, life: 1, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: ['#fff3d0', '#e6c77a', '#b8893a', '#ffffff'][(Math.random() * 4) | 0] });
    const now = performance.now();
    if (now - s.lastBuzz > 70) { buzz(4); s.lastBuzz = now; }
    if (now - s.lastSfx > 60) { audio.sfx('foil'); s.lastSfx = now; }
    if (s.cleared / s.total > 0.4) finish();
  };

  const finish = () => {
    const s = state.current;
    if (s.done) return;
    s.done = true;
    buzz([12, 40, 20]);
    audio.sfx('chime');
    onReveal();
    // the rest of the foil lifts away, turning into falling leaf
    for (let i = 0; i < (env.isMobile ? 60 : 110); i++) {
      s.sparks.push({ x: Math.random() * s.w, y: Math.random() * s.h, vx: (Math.random() - 0.5) * 2, vy: -2 - Math.random() * 3, s: 6 + Math.random() * 14, life: 1.4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.15, c: ['#e2c27a', '#fff1c9', '#c99a45', '#b08132'][(Math.random() * 4) | 0] });
    }
    gsap.timeline({ onComplete: onGone })
      .to('.foil-ui', { opacity: 0, duration: 0.5 }, 0)
      .to(cv.current, { opacity: 0, scale: 1.08, filter: 'blur(6px)', duration: 1.6, ease: 'power2.inOut' }, 0)
      .to(wrap.current, { opacity: 0, duration: 0.8 }, 1.9);
  };

  /* pointer handling */
  const down = useRef(false);
  const onDown = (e) => { if (!active) return; down.current = true; state.current.last = null; setHint(false); enableGyro(); scratchAt(e.clientX, e.clientY); };
  const onMove = (e) => { if (down.current) scratchAt(e.clientX, e.clientY); };
  const onUp = () => { down.current = false; state.current.last = null; };

  /* a graceful automatic unveil for those who prefer to tap */
  const auto = () => {
    if (state.current.done) return;
    setHint(false); enableGyro();
    const s = state.current, path = { t: 0 };
    s.last = null;
    gsap.to(path, {
      t: 1, duration: 1.6, ease: 'power1.inOut',
      onUpdate: () => {
        const rows = 5, t = path.t * rows, row = Math.floor(t), f = t - row;
        const x = (row % 2 ? 1 - f : f) * s.w * 1.1 - s.w * 0.05, y = ((row + 0.5) / rows) * s.h;
        scratchAt(x, y);
      },
      onComplete: finish
    });
  };

  return (
    <div ref={wrap} className="fixed inset-0 z-[990] touch-none select-none" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp} role="dialog" aria-label="Your invitation, under gold foil">
      <canvas ref={cv} className="absolute inset-0" aria-hidden="true" />
      <canvas ref={fx} className="pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className={`foil-ui pointer-events-none absolute inset-x-0 bottom-[calc(18vh+env(safe-area-inset-bottom))] flex flex-col items-center opacity-0 transition-opacity duration-700 ${hint ? '' : '!opacity-0'}`}>
        <div className="relative h-10 w-40" aria-hidden="true">
          <span className="absolute top-1 left-1/2 -ml-4 size-8 rounded-full border border-white/80 bg-white/40 shadow-[0_0_24px_rgba(255,255,255,.9)]" style={{ animation: 'swipe-hint 2.6s ease-in-out infinite' }} />
        </div>
        <p className="caps mt-3 text-[10px] text-[#5c4314]">Swipe to unveil</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); auto(); }} onPointerDown={(e) => e.stopPropagation()}
        className="foil-ui caps absolute bottom-[calc(28px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 rounded-full border border-[#5c4314]/40 bg-white/30 px-6 py-3 text-[9px] text-[#5c4314] opacity-0 backdrop-blur-sm">
        Or tap to unveil
      </button>
    </div>
  );
}
