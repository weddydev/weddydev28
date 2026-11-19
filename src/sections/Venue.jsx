/* VENUE — the city's name is cut from the photograph itself; scroll and the
   camera dives through the letters until the palace fills the screen. */
import { useRef, useState } from 'react';
import C from '../config.js';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { img } from '../lib/utils.js';
import Button from '../components/Button.jsx';
import { Label, Rich } from '../components/Ui.jsx';
import { Lines, Reveal } from '../components/Reveal.jsx';

export default function Venue() {
  const root = useRef(null);
  const [map, setMap] = useState(false);
  const photo = img(C.venue.image, 2000);

  useGSAP(() => {
    gsap.timeline({ scrollTrigger: { trigger: '.vz-pin', start: 'top top', end: '+=160%', pin: true, scrub: 1, anticipatePin: 1 } })
      .to('.vz-word', { scale: 22, ease: 'power2.in', duration: 0.85 }, 0)
      .to('.vz-cap', { opacity: 0, y: -30, duration: 0.25 }, 0)
      .fromTo('.vz-full', { opacity: 0, scale: 1.2 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power1.out' }, 0.48)
      .to('.vz-word', { opacity: 0, duration: 0.18 }, 0.54)
      .fromTo('.vz-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.32 }, 0.82);
    ScrollTrigger.create({ trigger: '.vz-body', start: 'top bottom+=600', once: true, onEnter: () => setMap(true) });
  }, { scope: root });

  return (
    <section id="venue" ref={root} className="relative">
      <div className="vz-pin relative z-[2] grid h-screen-s place-items-center overflow-hidden">
        <div className="vz-full absolute inset-0 opacity-0">
          <img src={photo} alt="" loading="lazy" className="size-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(42,33,24,.1),rgba(42,33,24,.45))]" />
        </div>
        <div className="vz-cap absolute top-[16%] inset-x-0 text-center"><Label>The venue</Label></div>
        <h2 className="vz-word relative m-0 origin-[50%_52%] text-center font-caps text-[clamp(3.6rem,16vw,15rem)] leading-[.9] font-black tracking-[-.01em] text-transparent will-change-transform [-webkit-text-stroke:1px_rgba(140,106,42,.55)]"
          style={{ backgroundImage: `url("${photo}")`, backgroundSize: 'cover', backgroundPosition: '50% 55%', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
          {C.venue.word}
        </h2>
        <p className="vz-cap caps absolute bottom-[18%] inset-x-0 text-center text-ink/60">{C.region}</p>
        <div className="vz-title absolute inset-x-gutter bottom-[16%] text-center text-white opacity-0">
          <p className="caps text-white/85">Where our sacred journey begins</p>
          <p className="font-display mt-3 text-[clamp(2.8rem,12vw,7rem)] leading-[.95] [text-shadow:0_6px_40px_rgba(0,0,0,.35)]"><Rich text={C.venue.name} em="italic text-gold-light" /></p>
        </div>
      </div>

      <div className="vz-body relative z-[2] mx-auto max-w-[860px] px-gutter py-[clamp(90px,18vw,160px)] text-center">
        <Lines as="p" className="font-display text-[clamp(1.7rem,7vw,3rem)] leading-[1.2]">{C.venue.description}</Lines>
        <Reveal as="p" className="caps mt-7 leading-[2] text-ink/60">{C.venue.address}</Reveal>
        <Reveal className="gild-frame relative mt-12 mb-10 overflow-hidden rounded-[28px] bg-pearl p-2">
          {map
            ? <iframe title="Map to the venue" src={`https://maps.google.com/maps?q=${encodeURIComponent(C.venue.mapQuery)}&z=15&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="map-champagne block h-[clamp(300px,80vw,440px)] w-full rounded-[22px] border-0" />
            : <div className="h-[clamp(300px,80vw,440px)] w-full rounded-[22px] bg-champagne" />}
        </Reveal>
        <Button as="a" href={C.venue.directionsUrl} target="_blank" rel="noopener">Get directions</Button>
      </div>
    </section>
  );
}
