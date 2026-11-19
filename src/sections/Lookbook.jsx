/* LOOKBOOK — photographs mounted on a slowly turning 3D cylinder that orbits
   the gold rings. Scroll turns it; drag spins it; tap opens the photograph. */
import { useEffect, useRef, useState } from 'react';
import C from '../config.js';
import { gsap, useGSAP } from '../lib/gsap.js';
import { env, img, buzz, EASE } from '../lib/utils.js';
import { scroll } from '../lib/scroll.js';
import { Label } from '../components/Ui.jsx';
import { Lines, Reveal } from '../components/Reveal.jsx';

const G = C.lookbook;
const N = G.length;
const STEP = 360 / N;

function Lightbox({ index, onClose, onNav }) {
  const root = useRef(null);
  useGSAP(() => {
    scroll.lenis && scroll.lenis.stop();
    gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.6 });
    gsap.fromTo('.lb-photo', { scale: 0.86, rotateY: -25, opacity: 0 }, { scale: 1, rotateY: 0, opacity: 1, duration: 1.2, ease: EASE });
    return () => scroll.lenis && scroll.lenis.start();
  }, { scope: root, dependencies: [index] });
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') onNav(1); if (e.key === 'ArrowLeft') onNav(-1); };
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k);
  }, [onClose, onNav]);
  const sx = useRef(0);
  return (
    <div ref={root} className="fixed inset-0 z-[960] flex flex-col items-center justify-center bg-porcelain/96 px-gutter backdrop-blur-md [perspective:1200px]" role="dialog" aria-modal="true" aria-label="Photograph"
      onClick={onClose} onTouchStart={(e) => { sx.current = e.touches[0].clientX; }} onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - sx.current; if (Math.abs(dx) > 50) onNav(dx < 0 ? 1 : -1); }}>
      <div className="gild-frame lb-photo rounded-[18px] bg-white p-2 shadow-[0_40px_80px_-30px_rgba(80,55,15,.5)]" onClick={(e) => e.stopPropagation()}>
        <img src={img(G[index].src, 1600)} alt={G[index].caption} className="grade-light block max-h-[68vh] max-w-[86vw] rounded-[12px] object-contain" />
      </div>
      <p className="font-display mt-6 text-[2rem] leading-none">{G[index].caption}</p>
      <p className="caps mt-2 text-gold-deep">Nº {String(index + 1).padStart(2, '0')} · {G[index].place}</p>
      <div className="mt-6 flex gap-3" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => onNav(-1)} aria-label="Previous" className="grid size-11 place-items-center rounded-full border border-gold/40 text-gold-deep">←</button>
        <button onClick={onClose} className="btn btn-line btn-sm"><span>Close</span></button>
        <button onClick={() => onNav(1)} aria-label="Next" className="grid size-11 place-items-center rounded-full border border-gold/40 text-gold-deep">→</button>
      </div>
    </div>
  );
}

export default function Lookbook() {
  const root = useRef(null), drum = useRef(null);
  const captionRef = useRef(null);
  const metaRef = useRef(null);
  const [open, setOpen] = useState(null);
  const spin = useRef({ scroll: 0, drag: 0 });
  const lastIdx = useRef(0);

  const apply = () => {
    const a = spin.current.scroll + spin.current.drag;
    gsap.set(drum.current, { rotateY: a });
    const idx = ((Math.round(-a / STEP) % N) + N) % N;
    if (idx !== lastIdx.current) {
      lastIdx.current = idx;
      if (captionRef.current) captionRef.current.textContent = G[idx].caption;
      if (metaRef.current) metaRef.current.textContent = `Nº ${String(idx + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')} · ${G[idx].place}`;
    }
  };

  useGSAP(() => {
    gsap.to(spin.current, { scroll: -360 + STEP, ease: 'none', onUpdate: apply,
      scrollTrigger: { trigger: '.lb-pin', start: 'top top', end: '+=260%', pin: true, scrub: 1.2, anticipatePin: 1 } });
    gsap.from('.lb-item', { opacity: 0, duration: 1.6, stagger: 0.08, ease: 'power2.out', scrollTrigger: { trigger: '.lb-pin', start: 'top 70%', once: true } });
    gsap.from(drum.current.parentElement, { y: 90, scale: 0.82, duration: 2.2, ease: EASE, scrollTrigger: { trigger: '.lb-pin', start: 'top 70%', once: true } });
  }, { scope: root });

  /* drag to spin */
  useEffect(() => {
    const el = drum.current.parentElement;
    let down = false, sx = 0, start = 0, moved = 0;
    const d = (e) => { down = true; moved = 0; sx = e.clientX; start = spin.current.drag; };
    const m = (e) => { if (!down) return; moved = Math.abs(e.clientX - sx); spin.current.drag = start + (e.clientX - sx) * 0.25; apply(); };
    const u = () => {
      if (!down) return; down = false;
      const total = spin.current.scroll + spin.current.drag, snapped = Math.round(total / STEP) * STEP;
      gsap.to(spin.current, { drag: spin.current.drag + (snapped - total), duration: 1, ease: EASE, onUpdate: apply });
    };
    const cap = (e) => { if (moved > 6) { e.stopPropagation(); e.preventDefault(); } };
    el.addEventListener('pointerdown', d); window.addEventListener('pointermove', m); window.addEventListener('pointerup', u); el.addEventListener('click', cap, true);
    return () => { el.removeEventListener('pointerdown', d); window.removeEventListener('pointermove', m); window.removeEventListener('pointerup', u); el.removeEventListener('click', cap, true); };
  }, []); // eslint-disable-line

  const radius = `calc(var(--w) / 2 / ${Math.tan(Math.PI / N).toFixed(4)} * 1.08)`;
  return (
    <section id="lookbook" ref={root} className="relative">
      <div className="lb-pin relative z-[2] flex h-screen-s flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-x-0 top-[9%] px-gutter text-center desk:top-[8%]">
          <Reveal><Label>Jhanki</Label></Reveal>
          <Lines className="font-display mt-3 text-[clamp(2.8rem,12vw,6.5rem)] leading-[.95] font-normal">Moments, <em className="gold-text italic">set in gold</em></Lines>
        </div>

        <div className="relative mt-[14vh] h-[46vh] w-full touch-pan-y [perspective:var(--p)] [--p:900px] [--w:min(46vw,270px)] desk:mt-[10vh] desk:h-[52vh] desk:[--p:1500px] desk:[--w:min(20vw,300px)]">
          <div ref={drum} className="absolute top-1/2 left-1/2 [transform-style:preserve-3d]" style={{ transform: 'rotateX(-6deg)' }}>
            {G.map((g, i) => (
              <button key={i} type="button" onClick={() => { setOpen(i); buzz(6); }} aria-label={`Open photograph: ${g.caption}`}
                className="lb-item gild-frame absolute top-0 left-0 block overflow-hidden rounded-[14px] bg-white p-[5px] [backface-visibility:hidden] shadow-[0_30px_50px_-30px_rgba(80,55,15,.55)]"
                style={{ width: 'var(--w)', aspectRatio: '3 / 4', marginLeft: 'calc(var(--w) / -2)', marginTop: 'calc(var(--w) * -0.667)', transform: `rotateY(${i * STEP}deg) translateZ(${radius})` }}>
                <img src={img(g.src, env.isMobile ? 600 : 800)} alt="" loading="lazy" draggable="false" className="grade-light size-full rounded-[10px] object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-[calc(108px+env(safe-area-inset-bottom))] text-center desk:bottom-[12%]" aria-live="polite">
          <p ref={captionRef} className="font-display m-0 text-[1.9rem] leading-none">{G[0].caption}</p>
          <p ref={metaRef} className="caps mt-2 text-gold-deep">Nº 01 / {String(N).padStart(2, '0')} · {G[0].place}</p>
        </div>
      </div>
      {open !== null && <Lightbox index={open} onClose={() => setOpen(null)} onNav={(d) => setOpen((o) => (o + d + N) % N)} />}
    </section>
  );
}
