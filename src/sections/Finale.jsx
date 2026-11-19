/* FINALE — the rings return and interlock at centre in a golden bloom; the
   signature writes itself; gold leaf showers down over white marble. */
import { useEffect, useRef } from 'react';
import C from '../config.js';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { EASE, store } from '../lib/utils.js';
import { goldLeaf } from '../lib/fx.js';
import { navigate } from '../lib/scroll.js';
import { Label, Rich, Ornament } from '../components/Ui.jsx';

export default function Finale() {
  const root = useRef(null), leaf = useRef(null);
  useGSAP(() => {
    gsap.set('.fn-sig', { '--m': '-30%' });
    gsap.set('.fn-in', { opacity: 0, y: 30 });
    ScrollTrigger.create({
      trigger: root.current, start: 'top 45%', once: true,
      onEnter: () => gsap.timeline({ defaults: { ease: EASE } })
        .to('.fn-sig', { '--m': '130%', duration: 3.6, ease: 'power1.inOut' }, 0.6)
        .to('.fn-in', { opacity: 1, y: 0, duration: 2, stagger: 0.25 }, 2.4)
    });
    gsap.to('.fn-bloom', { scale: 1.15, opacity: 0.9, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }, { scope: root });
  useEffect(() => { const s = goldLeaf(leaf.current, { count: 70, density: 1 }); return () => s && s.destroy(); }, []);

  return (
    <section id="finale" ref={root} className="relative flex min-h-screen-s flex-col items-center justify-end overflow-hidden px-gutter pt-[55vh] pb-[calc(104px+env(safe-area-inset-bottom))] text-center">
      <div className="fn-bloom pointer-events-none absolute top-[32%] left-1/2 size-[130vmin] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(246,227,168,.75),rgba(232,205,140,.25)_45%,transparent_72%)] opacity-70" aria-hidden="true" />
      <canvas ref={leaf} className="pointer-events-none absolute inset-0 z-[3] size-full" aria-hidden="true" />
      <div className="relative z-[4]">
        <p className="fn-sig font-script gold-text m-0 text-[clamp(3rem,13vw,8rem)] leading-[1.15]"
          style={{ WebkitMaskImage: 'linear-gradient(90deg,#000 var(--m),transparent calc(var(--m) + 18%))', maskImage: 'linear-gradient(90deg,#000 var(--m),transparent calc(var(--m) + 18%))' }}>
          {C.couple.signature}
        </p>
        <p className="fn-in font-display mt-2 text-[clamp(2.6rem,11vw,6.5rem)] leading-[1] text-balance"><Rich text={C.finale.line} /></p>
        <Ornament className="fn-in my-5" />
        <p className="fn-in font-display gold-text m-0 text-[clamp(1.4rem,5.6vw,2.2rem)]">{C.hashtag}</p>
        <Label className="fn-in mt-4 !text-ink/55">{C.finale.footnote}</Label>
        <div className="fn-in mt-7 flex flex-wrap justify-center gap-2">
          <button className="btn btn-line btn-sm" onClick={() => navigate('#hero')}><span>Return to the top</span></button>
          <button className="btn btn-line btn-sm" onClick={() => { store.del('maison-unveiled'); window.scrollTo(0, 0); window.location.reload(); }}><span>Replay the unveiling</span></button>
        </div>
      </div>
    </section>
  );
}
