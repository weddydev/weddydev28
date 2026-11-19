/* The Dock (bottom pill: progress ring · chapter · sound · menu), the menu sheet
   that morphs out of it, the gold-leaf page wipe, and the gem cursor. */
import { useEffect, useRef, useState } from 'react';
import C from '../config.js';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { EASE, buzz, env, fmt } from '../lib/utils.js';
import { navigate, lockScroll, unlockScroll } from '../lib/scroll.js';
import { audio } from '../lib/audio.js';
import { sparkleTrail } from '../lib/fx.js';
import { Monogram } from './Ui.jsx';

export const CHAPTERS = [
  ['#hero', 'Shubh Vivah'], ['#manifesto', 'The Promise'], ['#story', 'Our Story'], ['#date', 'Save the Date'],
  ['#programme', 'Celebrations'], ['#venue', 'The Palace'], ['#lookbook', 'Lookbook'], ['#concierge', 'Concierge'],
  ['#rsvp', 'RSVP'], ['#finale', 'Saat Janam']
];

export function Wipe() {
  return (
    <div id="wipe" className="fixed inset-0 z-[880] hidden" style={{ background: 'var(--foil-grad)' }} aria-hidden="true">
      <div className="absolute top-1/2 left-1/2 w-24 -translate-1/2 opacity-90 mix-blend-multiply"><Monogram /></div>
    </div>
  );
}

export function Cursor() {
  const gem = useRef(null), trail = useRef(null);
  const [hover, setHover] = useState(false);
  useEffect(() => {
    if (!env.finePointer || env.reduced) return;
    document.documentElement.classList.add('has-cursor');
    let x = -50, y = -50, cx = -50, cy = -50, raf;
    const move = (e) => { x = e.clientX; y = e.clientY; };
    const over = (e) => setHover(!!(e.target.closest && e.target.closest('a,button,label,[role=button],input,textarea,.card-hit')));
    const loop = () => { cx += (x - cx) * 0.22; cy += (y - cy) * 0.22; gem.current.style.transform = `translate3d(${cx}px,${cy}px,0)`; raf = requestAnimationFrame(loop); };
    loop();
    window.addEventListener('mousemove', move, { passive: true }); document.addEventListener('mouseover', over);
    const s = sparkleTrail(trail.current);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', move); document.removeEventListener('mouseover', over); s && s.destroy(); };
  }, []);
  return (
    <>
      <canvas ref={trail} className="pointer-events-none fixed inset-0 z-[9590] size-full" aria-hidden="true" />
      <div ref={gem} className={`cursor ${hover ? 'is-hover' : ''}`} aria-hidden="true"><div className="cursor-gem" /></div>
    </>
  );
}

export function Dock({ visible }) {
  const dock = useRef(null), sheet = useRef(null), ring = useRef(null);
  const [open, setOpen] = useState(false);
  const [chapter, setChapter] = useState(CHAPTERS[0][1]);
  const [on, setOn] = useState(audio.on);
  useEffect(() => audio.subscribe(setOn), []);

  /* progress ring + current chapter */
  useEffect(() => {
    if (!visible) return;
    const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => { if (ring.current) ring.current.style.strokeDashoffset = String(1 - s.progress); } });
    const io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { const c = CHAPTERS.find(([h]) => h === `#${e.target.id}`); if (c) setChapter(c[1]); } }), { rootMargin: '-45% 0px -45% 0px' });
    CHAPTERS.forEach(([h]) => { const el = document.querySelector(h); el && io.observe(el); });
    return () => { st.kill(); io.disconnect(); };
  }, [visible]);

  /* the menu sheet grows out of the dock */
  const { contextSafe } = useGSAP(() => {}, { scope: sheet });
  const toggle = contextSafe((state) => {
    const next = state ?? !open;
    setOpen(next);
    buzz(6);
    const r = dock.current.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
    const from = `inset(${r.top}px ${vw - r.right}px ${vh - r.bottom}px ${r.left}px round 999px)`;
    if (next) {
      lockScroll();
      gsap.timeline()
        .set(sheet.current, { visibility: 'visible' })
        .fromTo(sheet.current, { clipPath: from }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 1.1, ease: 'power3.inOut' })
        .fromTo('.m-item', { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.04, ease: EASE }, '-=.5')
        .fromTo('.m-foot', { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=.8');
    } else {
      unlockScroll();
      gsap.timeline()
        .to('.m-item', { yPercent: -60, opacity: 0, duration: 0.45, stagger: 0.02, ease: 'power2.in' })
        .to(sheet.current, { clipPath: from, duration: 0.9, ease: 'power3.inOut' }, '-=.15')
        .set(sheet.current, { visibility: 'hidden' });
    }
  });
  useEffect(() => { const k = (e) => e.key === 'Escape' && open && toggle(false); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [open, toggle]);
  const go = (e, h) => { e.preventDefault(); if (open) { toggle(false); setTimeout(() => navigate(h), 500); } else navigate(h); };

  return (
    <>
      <nav ref={sheet} id="menu" aria-hidden={!open} className="invisible fixed inset-0 z-[940] overflow-y-auto bg-porcelain">
        <div className="marble !absolute" />
        <div className="relative mx-auto flex min-h-full max-w-[900px] flex-col justify-center px-gutter pt-16 pb-36">
          <p className="m-item caps mb-8 text-gold-deep">The Collection</p>
          <ol>
            {CHAPTERS.slice(1).map(([h, label], i) => (
              <li key={h} className="overflow-hidden border-b border-gold/20">
                <a href={h} onClick={(e) => go(e, h)} tabIndex={open ? 0 : -1} className="m-item group flex items-baseline gap-5 py-2.5">
                  <span className="caps w-8 flex-none text-[9px] text-gold">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-display text-[clamp(2rem,9vw,4.4rem)] leading-[1.05] transition-all duration-700 ease-silk group-hover:translate-x-3 group-hover:text-gold-deep">{label}</span>
                </a>
              </li>
            ))}
          </ol>
          <div className="m-foot caps mt-10 flex flex-wrap justify-between gap-3 text-[9px] text-ink/60"><span>{fmt.dots(C.date)} · {C.city}</span><span>{C.hashtag}</span></div>
        </div>
      </nav>

      <div ref={dock} className={`fixed bottom-[calc(14px+env(safe-area-inset-bottom))] left-1/2 z-[950] -translate-x-1/2 transition-all duration-[1200ms] ease-silk ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-24 opacity-0'}`}>
        <div className="gild-frame flex items-center gap-1 rounded-full bg-white/75 p-1.5 shadow-[0_18px_40px_-18px_rgba(120,90,30,.55)] backdrop-blur-xl">
          <a href="#hero" onClick={(e) => go(e, '#hero')} className="relative grid size-11 place-items-center" aria-label="Back to the top">
            <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
              <circle cx="22" cy="22" r="20.5" fill="none" stroke="rgba(184,137,58,.18)" strokeWidth="1" />
              <circle ref={ring} cx="22" cy="22" r="20.5" fill="none" stroke="url(#mg-gold)" strokeWidth="1.4" pathLength="1" strokeDasharray="1" strokeDashoffset="1" strokeLinecap="round" />
            </svg>
            <span className="w-6"><Monogram /></span>
          </a>
          <span className="caps min-w-[124px] px-2 text-center text-[9px] whitespace-nowrap text-ink/80" aria-live="polite">{chapter}</span>
          <button onClick={() => { audio.toggle(); buzz(6); }} aria-pressed={on} aria-label={on ? 'Mute music' : 'Play music'} className="grid size-11 place-items-center rounded-full transition-colors duration-500 hover:bg-gold/10">
            <span className="flex h-4 items-end gap-[3px]">
              {[0, 1, 2, 3].map((i) => <i key={i} className="w-[2px] rounded-full gold-fill transition-all duration-500" style={{ height: on ? undefined : 3, animation: on ? `eq 1.2s ${-i * 0.3}s ease-in-out infinite alternate` : 'none' }} />)}
            </span>
          </button>
          <button onClick={() => toggle()} aria-expanded={open} aria-controls="menu" aria-label={open ? 'Close menu' : 'Open menu'} className="grid size-11 place-items-center rounded-full gold-fill text-white shadow-[inset_0_1px_0_rgba(255,255,255,.6)]">
            <span className="relative block h-2.5 w-4">
              <i className={`absolute inset-x-0 top-0 h-px bg-white transition duration-700 ease-silk ${open ? 'translate-y-[5px] rotate-45' : ''}`} />
              <i className={`absolute inset-x-0 bottom-0 h-px bg-white transition duration-700 ease-silk ${open ? '-translate-y-[4px] -rotate-45' : ''}`} />
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
