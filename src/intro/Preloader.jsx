/* PRELOADER — a single gold ring fills with real loading progress around a
   counter; then the ring expands into a circular portal onto the foil. */
import { useEffect, useRef } from 'react';
import C from '../config.js';
import { gsap, useGSAP } from '../lib/gsap.js';
import { EASE, wait } from '../lib/utils.js';
import { Monogram, drawMonogram } from '../components/Ui.jsx';

export default function Preloader({ progress, loaded, quick, onOpen, onGone }) {
  const root = useRef(null), count = useRef(null), ring = useRef(null);
  const minDone = useRef(false), opened = useRef(false), isLoaded = useRef(loaded);
  isLoaded.current = loaded;
  const num = useRef({ v: 0 });

  useGSAP(() => {
    drawMonogram(gsap, root.current.querySelector('.pre-mono'), quick ? 0.5 : 0.9);
    gsap.from('.pre-in', { opacity: 0, y: 16, duration: 1.6, stagger: 0.15, ease: EASE, delay: 0.3 });
  }, { scope: root });

  useEffect(() => {
    gsap.to(num.current, { v: Math.round(progress * 92), duration: 1.4, ease: 'power2.out', onUpdate: () => { if (count.current) count.current.textContent = String(Math.round(num.current.v)).padStart(3, '0'); } });
    gsap.to(ring.current, { strokeDashoffset: 1 - progress * 0.92, duration: 1.4, ease: 'power2.out' });
  }, [progress]);

  useEffect(() => { wait((quick ? 1.4 : 3.2) * 1000).then(() => { minDone.current = true; tryOpen(); }); }, []); // eslint-disable-line
  useEffect(() => { tryOpen(); }, [loaded]); // eslint-disable-line

  function tryOpen() {
    if (!isLoaded.current || !minDone.current || opened.current) return;
    opened.current = true;
    const portal = { s: 1 };
    const R = 74; // ring radius in px
    const setHole = () => {
      const r = R * portal.s;
      root.current.style.webkitMaskImage = root.current.style.maskImage = `radial-gradient(circle at 50% 50%, transparent ${r}px, #000 ${r + 1}px)`;
    };
    gsap.timeline({ onComplete: onGone })
      .to(num.current, { v: 100, duration: 0.7, ease: 'power2.out', onUpdate: () => { count.current.textContent = String(Math.round(num.current.v)).padStart(3, '0'); } })
      .to(ring.current, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out' }, '<')
      .to('.pre-in, .pre-mono, .pre-count', { opacity: 0, y: -10, duration: 0.6, ease: 'power2.in' }, '+=.2')
      .add(onOpen)
      .to(portal, { s: Math.hypot(window.innerWidth, window.innerHeight) / R * 0.62, duration: 1.8, ease: 'power3.in', onUpdate: () => { setHole(); gsap.set('.pre-ring', { scale: portal.s }); } })
      .to('.pre-ring', { opacity: 0, duration: 0.4 }, '-=.35');
  }

  return (
    <div ref={root} className="fixed inset-0 z-[1000] grid place-items-center bg-porcelain" aria-live="polite">
      <div className="marble absolute! z-0" />
      <div className="relative z-[1] flex flex-col items-center text-center">
        <p className="pre-in caps mb-10 text-gold-deep">{C.house} · {C.couple.partner1} &amp; {C.couple.partner2}</p>
        <div className="relative grid size-[160px] place-items-center">
          <svg className="pre-ring absolute inset-0 size-full overflow-visible" viewBox="0 0 160 160" aria-hidden="true">
            <circle cx="80" cy="80" r="74" fill="none" stroke="rgba(184,137,58,.18)" strokeWidth="1" />
            <circle ref={ring} cx="80" cy="80" r="74" fill="none" stroke="url(#mg-gold)" strokeWidth="1.6" pathLength="1" strokeDasharray="1" strokeDashoffset="1" transform="rotate(-90 80 80)" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="pre-mono w-[58px]"><Monogram variant="draw" /></div>
        </div>
        <p ref={count} className="pre-count font-display mt-8 text-[44px] leading-none tracking-[.12em] text-ink">000</p>
        <p className="pre-in caps mt-4 text-[9px] text-ink/50">An auspicious wedding invitation</p>
      </div>
    </div>
  );
}
