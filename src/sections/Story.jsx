/* STORY — a pinned horizontal gallery. Chapters glide sideways; photographs
   parallax inside gilded arches; giant outlined years drift behind. */
import { useRef } from 'react';
import C from '../config.js';
import { gsap, useGSAP } from '../lib/gsap.js';
import { env, img, roman } from '../lib/utils.js';
import { Label, Rich } from '../components/Ui.jsx';

export default function Story() {
  const root = useRef(null), track = useRef(null);

  useGSAP(() => {
    const distance = () => track.current.scrollWidth - window.innerWidth;
    const tween = gsap.to(track.current, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (s) => gsap.set('.st-bar', { scaleX: s.progress }) }
    });
    gsap.utils.toArray('.st-panel', root.current).forEach((p) => {
      const im = p.querySelector('.st-img'), yr = p.querySelector('.st-year'), tx = p.querySelectorAll('.st-tx');
      if (im && !env.reduced) gsap.fromTo(im, { xPercent: -14, scale: 1.18 }, { xPercent: 14, scale: 1.06, ease: 'none', scrollTrigger: { containerAnimation: tween, trigger: p, start: 'left right', end: 'right left', scrub: true } });
      if (yr) gsap.fromTo(yr, { xPercent: 30 }, { xPercent: -30, ease: 'none', scrollTrigger: { containerAnimation: tween, trigger: p, start: 'left right', end: 'right left', scrub: true } });
      if (tx.length) gsap.from(tx, { opacity: 0, y: 30, duration: 1.4, stagger: 0.1, ease: 'power3.out', scrollTrigger: { containerAnimation: tween, trigger: p, start: 'left 70%', toggleActions: 'play none none reverse' } });
    });
  }, { scope: root });

  return (
    <section id="story" ref={root} className="relative h-screen-s overflow-hidden bg-pearl/70">
      <div ref={track} className="relative z-[2] flex h-full w-max items-center gap-[8vw] pr-[12vw] pl-gutter desk:gap-[6vw]">
        {/* opening panel */}
        <div className="st-panel flex w-[78vw] flex-none flex-col justify-center desk:w-[38vw]">
          <Label className="st-tx mb-6">Hamari Kahani</Label>
          <h2 className="st-tx font-display m-0 text-[clamp(3.4rem,17vw,9rem)] leading-[.9] font-normal">Four <em className="gold-text italic">chapters</em> of a love story</h2>
          <p className="st-tx caps mt-8 flex items-center gap-3 text-ink/50">Keep scrolling <span className="inline-block h-px w-12 bg-gold" />→</p>
        </div>

        {C.story.map((s, i) => (
          <article key={i} className="st-panel relative flex h-[78%] w-[84vw] flex-none flex-col justify-center desk:h-[80%] desk:w-[64vw] desk:flex-row desk:items-center desk:gap-[4vw]">
            <span className="st-year font-display text-outline-gold pointer-events-none absolute top-[-2%] right-0 z-0 text-[clamp(7rem,38vw,26rem)] leading-none opacity-70 desk:top-auto desk:bottom-[-4%]" aria-hidden="true">{s.year}</span>
            <div className="gild-frame arch relative z-[1] h-[52%] w-[76%] flex-none overflow-hidden bg-champagne p-[6px] desk:h-full desk:w-[42%]">
              <div className="arch relative size-full overflow-hidden">
                <img src={img(s.image, env.isMobile ? 800 : 1200)} alt="" loading="lazy" className="st-img grade-light absolute inset-0 size-full object-cover" />
              </div>
            </div>
            <div className="relative z-[1] mt-7 max-w-[520px] desk:mt-0">
              <p className="st-tx caps text-gold-deep">Chapter {roman(i + 1)} · {s.place} · {s.year}</p>
              <h3 className="st-tx font-display mt-3 mb-4 text-[clamp(2.4rem,10vw,5rem)] leading-[.98] font-normal"><Rich text={s.title} /></h3>
              <p className="st-tx m-0 text-[1.02em] leading-[1.55] text-ink/75">{s.text}</p>
            </div>
          </article>
        ))}

        {/* closing panel */}
        <div className="st-panel flex w-[78vw] flex-none flex-col items-start justify-center desk:w-[34vw]">
          <p className="st-tx font-script gold-text text-[clamp(3rem,13vw,6rem)] leading-none">to be continued…</p>
          <p className="st-tx caps mt-6 text-ink/60">in {C.city}, with you</p>
        </div>
      </div>
      <div className="absolute inset-x-gutter bottom-[calc(96px+env(safe-area-inset-bottom))] z-[3] h-px bg-gold/20 desk:bottom-14">
        <i className="st-bar absolute inset-0 origin-left scale-x-0 gild-rule" />
      </div>
    </section>
  );
}
