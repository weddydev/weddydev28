/* CONCIERGE — arrangements as gilded tiles, a personal concierge card with a
   gold bell, and an accordion of gentle answers. */
import { useRef, useState } from 'react';
import C from '../config.js';
import { gsap, useGSAP } from '../lib/gsap.js';
import { roman, fill, guest, EASE } from '../lib/utils.js';
import Button from '../components/Button.jsx';
import { Label, Monogram } from '../components/Ui.jsx';
import { Lines, Reveal } from '../components/Reveal.jsx';

function Faq({ q, a, i }) {
  const [open, setOpen] = useState(false);
  const body = useRef(null);
  const { contextSafe } = useGSAP(() => { gsap.set(body.current, { height: 0, opacity: 0 }); }, { scope: body });
  const toggle = contextSafe(() => {
    const next = !open; setOpen(next);
    gsap.to(body.current, { height: next ? 'auto' : 0, opacity: next ? 1 : 0, duration: 0.9, ease: EASE });
  });
  return (
    <div className="border-b border-gold/25">
      <button onClick={toggle} aria-expanded={open} aria-controls={`faq${i}`} className="flex w-full items-center justify-between gap-6 py-6 text-left">
        <span className="font-display text-[clamp(1.35rem,5.4vw,1.9rem)] leading-[1.15]">{q}</span>
        <span className={`relative size-8 flex-none rounded-full border border-gold/45 transition-transform duration-700 ease-silk ${open ? 'rotate-45 gold-fill border-transparent' : ''}`} aria-hidden="true">
          <i className={`absolute top-1/2 left-1/2 h-px w-3 -translate-1/2 ${open ? 'bg-white' : 'bg-gold-deep'}`} /><i className={`absolute top-1/2 left-1/2 h-3 w-px -translate-1/2 ${open ? 'bg-white' : 'bg-gold-deep'}`} />
        </span>
      </button>
      <div ref={body} id={`faq${i}`} className="overflow-hidden"><p className="m-0 max-w-[60ch] pb-6 text-ink/70">{a}</p></div>
    </div>
  );
}

export default function Concierge() {
  const cc = C.concierge;
  return (
    <section id="concierge" className="relative px-gutter py-[clamp(110px,24vw,220px)]">
      <div className="relative z-[2] mx-auto max-w-[1180px]">
        <div className="mb-[clamp(56px,12vw,100px)] text-center">
          <Reveal><Label>Yatra &amp; Seva</Label></Reveal>
          <Lines className="font-display mt-5 text-[clamp(3rem,13vw,8rem)] leading-[.95] font-normal">Every detail, <em className="gold-text italic">attended to</em></Lines>
        </div>

        <div className="grid gap-4 desk:grid-cols-4">
          {C.arrangements.map((t, i) => (
            <Reveal key={i} delay={i * 0.08} className="gild-frame rounded-[22px] bg-white/60 p-7 backdrop-blur-sm">
              <p className="font-display gold-text m-0 text-[2.2rem] leading-none">{roman(i + 1)}</p>
              <h3 className="font-display mt-5 mb-3 text-[1.9rem] leading-none font-normal">{t.title}</h3>
              <p className="m-0 text-[.98em] leading-[1.55] text-ink/70">{t.text}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="gild-frame relative mx-auto mt-[clamp(60px,12vw,100px)] max-w-[620px] overflow-hidden rounded-[30px] bg-[radial-gradient(120%_90%_at_50%_0%,#fffdf8,#f4ecdc)] px-7 py-10 text-center shadow-[0_40px_70px_-40px_rgba(80,55,15,.5)]">
          <svg viewBox="0 0 64 64" className="mx-auto w-14" fill="none" stroke="url(#mg-gold)" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M10 46h44M14 46c0-12 8-20 18-20s18 8 18 20M32 26v-4M28 22h8M6 52h52" /><path d="M22 36c2-4 5-6 9-7" />
          </svg>
          <p className="caps mt-5 text-gold-deep">{cc.role}</p>
          <p className="font-display mt-3 text-[clamp(2.4rem,10vw,3.6rem)] leading-none">{cc.name}</p>
          <p className="mt-3 text-ink/60 italic">{cc.hours}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button as="a" target="_blank" rel="noopener" href={`https://wa.me/${cc.whatsapp}?text=${encodeURIComponent(fill(cc.message, guest || 'a guest'))}`}>Message on WhatsApp</Button>
            <Button as="a" variant="line" href={`tel:+${cc.whatsapp}`}>Call</Button>
          </div>
          <div className="pointer-events-none absolute -right-10 -bottom-10 w-40 opacity-[.07]"><Monogram /></div>
        </Reveal>

        <div className="mx-auto mt-[clamp(70px,14vw,120px)] max-w-[860px]">
          <Reveal><Label className="mb-4">Prashna-Uttar</Label></Reveal>
          <div className="border-t border-gold/25">{C.faq.map((f, i) => <Faq key={i} i={i} {...f} />)}</div>
        </div>
      </div>
    </section>
  );
}
