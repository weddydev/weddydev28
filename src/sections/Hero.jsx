/* HERO — the 3D rings float at the centre (fixed WebGL layer behind the type);
   giant names frame them; gold leaf drifts down. */
import { useEffect, useRef } from 'react';
import C from '../config.js';
import { gsap, SplitText, useGSAP } from '../lib/gsap.js';
import { EASE, fmt, guest, fill } from '../lib/utils.js';
import { goldLeaf } from '../lib/fx.js';
import { ringState } from '../lib/rings.js';

export default function Hero({ entered, animateIn, webgl }) {
  const root = useRef(null), leaf = useRef(null);
  const chars = useRef([]);

  useGSAP(() => {
    const a = SplitText.create('.hn-1', { type: 'chars', mask: 'chars' });
    const b = SplitText.create('.hn-2', { type: 'chars', mask: 'chars', charsClass: 'gold-text' });
    const s = { chars: [...a.chars, ...b.chars] };
    chars.current = s.chars;
    if (animateIn) {
      gsap.set(s.chars, { yPercent: 120 });
      gsap.set('.h-fade', { opacity: 0, y: 18 });
      gsap.set('.h-amp', { opacity: 0, scale: 0.6, rotate: -12 });
    }
    // drift apart as you scroll away
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hn-1', { xPercent: -18, ease: 'none' }, 0)
      .to('.hn-2', { xPercent: 18, ease: 'none' }, 0)
      .to('.h-meta', { opacity: 0, y: -40, ease: 'none' }, 0);
  }, { scope: root });

  useGSAP(() => {
    if (!entered) return;
    if (animateIn) {
      gsap.timeline({ defaults: { ease: EASE } })
        .to(chars.current, { yPercent: 0, duration: 2, stagger: 0.06 }, 0.2)
        .to('.h-amp', { opacity: 1, scale: 1, rotate: 0, duration: 2.2 }, 0.8)
        .to('.h-fade', { opacity: 1, y: 0, duration: 1.6, stagger: 0.12 }, 1);
    }
    // the rings take a bow
    gsap.fromTo(ringState, { spin: 9, glow: 1.2 }, { spin: 1, glow: 0, duration: 3.2, ease: 'power3.out' });
  }, { scope: root, dependencies: [entered] });

  useEffect(() => { const s = goldLeaf(leaf.current, { count: 22 }); return () => s && s.destroy(); }, []);

  return (
    <section id="hero" ref={root} className="relative h-screen-s min-h-[600px] overflow-hidden">
      <canvas ref={leaf} className="pointer-events-none absolute inset-0 z-[3] size-full" aria-hidden="true" />
      {/* soft halo behind the rings */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[110vmin] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(232,205,140,.45),rgba(232,205,140,.12)_45%,transparent_70%)]" aria-hidden="true" />

      {/* the names sit BEHIND the WebGL rings (z-0 vs canvas z-1) */}
      <h1 className="font-display pointer-events-none absolute inset-0 z-0 m-0 font-normal" aria-label={`${C.couple.partner1} and ${C.couple.partner2}`}>
        <span className="hn hn-1 absolute top-[15%] left-gutter block text-[clamp(5.5rem,30vw,19rem)] leading-[.8] tracking-[-.02em] text-ink desk:top-[22%] desk:left-[6vw] desk:text-[15vw] [&>*]:pb-[.08em]" aria-hidden="true">{C.couple.partner1}</span>
        <span className="hn hn-2 absolute right-gutter bottom-[22%] block text-[clamp(5.5rem,30vw,19rem)] leading-[.8] tracking-[-.02em] desk:right-[6vw] desk:bottom-[20%] desk:text-[15vw] [&>*]:pb-[.08em]" aria-hidden="true">{C.couple.partner2}</span>
      </h1>
      <span className="h-amp font-script gold-text pointer-events-none absolute bottom-[35%] left-[5%] z-[3] text-[clamp(4.5rem,22vw,11rem)] leading-none desk:bottom-auto desk:top-[38%] desk:left-[46%]" aria-hidden="true">&amp;</span>

      {!webgl && (
        <svg className="pointer-events-none absolute top-1/2 left-1/2 z-[1] w-[62vmin] -translate-1/2" viewBox="0 0 200 120" aria-hidden="true">
          <ellipse cx="78" cy="60" rx="46" ry="46" fill="none" stroke="url(#mg-gold)" strokeWidth="7" />
          <ellipse cx="122" cy="60" rx="46" ry="16" fill="none" stroke="url(#mg-gold)" strokeWidth="7" />
        </svg>
      )}

      <div className="h-meta relative z-[3] flex h-full flex-col justify-between px-gutter pt-[max(28px,env(safe-area-inset-top))] pb-[calc(96px+env(safe-area-inset-bottom))]">
        <div className="h-fade flex items-center justify-between">
          <p className="caps text-gold-deep">{C.hero.kicker}</p>
          <p className="caps hidden text-ink/60 desk:block">{C.hero.subtitle}</p>
        </div>
        <div className="h-fade flex flex-col items-center gap-3 text-center desk:flex-row desk:items-end desk:justify-between desk:text-left">
          <div>
            <p className="caps text-ink">{fmt.dots(C.date)} <span className="mx-2 text-gold">◆</span> {C.city}</p>
            {guest && <p className="mt-2 text-[1.05em] text-ink/65 italic">{fill(C.greeting.heroFor, guest)}</p>}
          </div>
          <p className="caps flex items-center gap-3 text-[9px] text-ink/50"><span className="block h-px w-10 bg-gold/60" />Scroll to begin</p>
        </div>
      </div>
    </section>
  );
}
