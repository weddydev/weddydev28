/* MANIFESTO — giant outlined lines that fill with liquid gold as you scroll,
   then a hand-written letter from the families. */
import { Fragment, useRef } from 'react';
import C from '../config.js';
import { gsap, useGSAP } from '../lib/gsap.js';
import { guest } from '../lib/utils.js';
import { Label, Ornament } from '../components/Ui.jsx';
import { Reveal, Lines } from '../components/Reveal.jsx';

const parts = (s) => String(s).split(/(\*[^*]+\*)/).map((p, i) => (/^\*.*\*$/.test(p) ? <em key={i} className="italic">{p.slice(1, -1)}</em> : <Fragment key={i}>{p}</Fragment>));

export default function Manifesto() {
  const root = useRef(null);
  useGSAP(() => {
    gsap.utils.toArray('.mf-line', root.current).forEach((line) => {
      gsap.fromTo(line.querySelector('.mf-fill'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: line, start: 'top 82%', end: 'top 38%', scrub: 0.6 } });
      gsap.fromTo(line, { xPercent: line.dataset.i % 2 ? 6 : -6 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: line, start: 'top bottom', end: 'top 40%', scrub: true } });
    });
  }, { scope: root });

  const greet = guest ? C.greeting.letterWithGuest.replace('{guest}', guest) : C.greeting.letterGeneric;
  return (
    <section id="manifesto" ref={root} className="relative overflow-hidden px-gutter py-[clamp(120px,28vw,240px)]">
      <div className="relative z-[2] mx-auto max-w-[1180px]">
        <Reveal><Label className="mb-10">Shubh Sandesh</Label></Reveal>
        {C.manifesto.lines.map((l, i) => (
          <div key={i} data-i={i} className={`mf-line relative w-fit ${i % 2 ? 'ml-auto text-right' : ''}`}>
            <p className="font-display m-0 text-[clamp(3rem,14.5vw,10.5rem)] leading-[1.02] tracking-[-.01em] text-outline-gold">{parts(l)}</p>
            <p className="mf-fill font-display gold-text absolute inset-0 m-0 text-[clamp(3rem,14.5vw,10.5rem)] leading-[1.02] tracking-[-.01em]" aria-hidden="true">{parts(l)}</p>
          </div>
        ))}

        <Ornament className="my-[clamp(80px,16vw,140px)]" />

        <div className="grid gap-8 desk:grid-cols-[.9fr_1.1fr] desk:gap-20">
          <Reveal as="p" className="font-script gold-text m-0 text-[clamp(2.6rem,11vw,4.6rem)] leading-[1.1]">{greet}</Reveal>
          <div>
            <Lines as="p" className="m-0 text-[clamp(1.25rem,5vw,1.6rem)] leading-[1.55] text-ink/85 first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[4.2em] first-letter:leading-[.8] first-letter:text-gold-deep">{C.manifesto.letter}</Lines>
            <Reveal as="p" className="caps mt-10 flex items-center gap-4 text-gold-deep"><span className="gild-rule block h-px w-10" />{C.manifesto.signoff}</Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
