/* PROGRAMME — a deck of gilt-edged cards in a 3D coverflow. Swipe through;
   tap a card to turn it over for the details, dress-code swatches, calendar
   and directions. Drag + arrows on desktop. */
import { useEffect, useRef, useState } from 'react';
import C from '../config.js';
import { gsap, useGSAP } from '../lib/gsap.js';
import { fmt, time, guest, buzz, plain, env } from '../lib/utils.js';
import { addToCalendar, addAllToCalendar } from '../lib/calendar.js';
import { audio } from '../lib/audio.js';
import { EventIcon, Label, Rich } from '../components/Ui.jsx';
import { roman } from '../lib/utils.js';
import Button from '../components/Button.jsx';
import { Lines, Reveal } from '../components/Reveal.jsx';

function Card({ e, i, flipped, onFlip }) {
  return (
    <div className="deck-card relative flex-none snap-center [perspective:1400px]" style={{ width: 'min(76vw, 340px)', aspectRatio: '3 / 4.55' }}>
      <div className="cf relative size-full [transform-style:preserve-3d]">
      <div className={`card-3d card-hit relative size-full cursor-pointer ${flipped ? 'is-flipped' : ''}`} onClick={() => onFlip(i)} role="button" tabIndex={0} aria-pressed={flipped} aria-label={`${plain(e.title)}: ${flipped ? 'hide' : 'show'} details`}
        onKeyDown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && (ev.preventDefault(), onFlip(i))}>
        {/* front */}
        <div className="card-face card-paper gild-frame flex flex-col items-center px-6 pt-7 pb-6 text-center">
          <div className="pointer-events-none absolute inset-[10px] rounded-[14px] border border-gold/25" />
          <div className="flex w-full items-center justify-between"><span className="caps text-[9px] text-gold-deep">Nº {roman(i + 1)}</span><span className="caps text-[9px] text-ink/50">{e.kind}</span></div>
          <EventIcon name={e.icon} className="mt-[12%] w-[34%]" />
          <h3 className="font-display mt-[9%] text-[clamp(2rem,9.5vw,2.7rem)] leading-[1.02] font-normal"><Rich text={e.title} /></h3>
          <div className="gild-rule my-5 h-px w-16" />
          <p className="caps text-ink/80">{fmt.dayMonth(e.start)}</p>
          <p className="font-display mt-1 text-[1.3rem] text-gold-deep">{time(e.start)}</p>
          <p className="caps mt-auto flex items-center gap-2 text-[8.5px] text-ink/45">Tap to turn <span className="text-gold">↻</span></p>
          <div className="card-shine" />
        </div>
        {/* back */}
        <div className="card-face card-back card-paper gild-frame flex flex-col px-6 pt-7 pb-6 text-left">
          <div className="pointer-events-none absolute inset-[10px] rounded-[14px] border border-gold/25" />
          <p className="caps text-[9px] text-gold-deep">Admit · {guest || 'Our honoured guest'}</p>
          <h3 className="font-display mt-2 text-[1.9rem] leading-[1.05] font-normal"><Rich text={e.title} /></h3>
          <p className="mt-3 text-[.95em] leading-[1.45] text-ink/70 italic">{e.note}</p>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[.92em]">
            <div><dt className="caps text-[8px] text-ink/45">When</dt><dd className="m-0">{time(e.start)}</dd></div>
            <div><dt className="caps text-[8px] text-ink/45">Dress</dt><dd className="m-0">{e.dress}</dd></div>
            <div className="col-span-2"><dt className="caps text-[8px] text-ink/45">Where</dt><dd className="m-0">{e.venue}<span className="block text-ink/55">{e.address}</span></dd></div>
          </dl>
          <div className="mt-4 flex items-center gap-2" aria-label="Dress-code palette">
            {e.palette.map((c) => <span key={c} className="size-6 rounded-full border border-white shadow-[0_2px_6px_rgba(0,0,0,.18),0_0_0_1px_rgba(184,137,58,.35)]" style={{ background: c }} />)}
            <span className="caps ml-1 text-[8px] text-ink/45">palette</span>
          </div>
          <div className="relative z-[2] mt-auto flex flex-wrap gap-1.5 pt-4 [&_.btn]:px-3.5" onClick={(ev) => ev.stopPropagation()}>
            <button className="btn btn-gold btn-sm" onClick={() => addToCalendar(i, 'ics')}><span>Calendar</span></button>
            <button className="btn btn-line btn-sm" onClick={() => addToCalendar(i, 'google')}><span>Google</span></button>
            <a className="btn btn-line btn-sm" href={e.mapUrl} target="_blank" rel="noopener"><span>Map</span></a>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function Programme() {
  const root = useRef(null), rail = useRef(null);
  const [flipped, setFlipped] = useState(-1);
  const [active, setActive] = useState(0);

  /* coverflow: tilt/scale each card by its distance from centre */
  useEffect(() => {
    const el = rail.current;
    const cards = Array.from(el.querySelectorAll('.deck-card'));
    let raf = 0;
    const update = () => {
      raf = 0;
      const viewMid = el.scrollLeft + el.clientWidth / 2;
      let best = 0, bestD = 1e9;
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        const cardWidth = c.offsetWidth || 300;
        const cardMid = c.offsetLeft + cardWidth / 2;
        const off = (cardMid - viewMid) / cardWidth;
        const o = Math.max(-1.6, Math.min(1.6, off));
        const absO = Math.abs(o);
        if (env.reduced) {
          c.firstChild.style.transform = '';
        } else {
          c.firstChild.style.transform = `rotateY(${-o * 32}deg) scale(${1 - absO * 0.12}) translateZ(${-absO * 60}px)`;
        }
        c.style.zIndex = String(100 - Math.round(absO * 10));
        const shine = c.querySelector('.card-shine');
        if (shine) shine.style.setProperty('--sx', `${50 + o * 70}%`);
        if (absO < bestD) { bestD = absO; best = i; }
      }
      setActive(best);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    el.addEventListener('scroll', onScroll, { passive: true });
    let resizeTimer = 0;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(update, 100); };
    window.addEventListener('resize', onResize);
    update();
    // drag to scroll with a mouse
    let dragging = false, sx = 0, sl = 0, moved = 0;
    const down = (e) => { if (e.pointerType !== 'mouse') return; dragging = true; moved = 0; sx = e.clientX; sl = el.scrollLeft; el.style.scrollSnapType = 'none'; };
    const move = (e) => { if (!dragging) return; moved = Math.abs(e.clientX - sx); el.scrollLeft = sl - (e.clientX - sx); };
    const up = () => { if (!dragging) return; dragging = false; el.style.scrollSnapType = ''; };
    const clickCapture = (e) => { if (moved > 6) { e.stopPropagation(); e.preventDefault(); moved = 0; } };
    el.addEventListener('pointerdown', down); window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); el.addEventListener('click', clickCapture, true);
    return () => { el.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); el.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); el.removeEventListener('click', clickCapture, true); };
  }, []);

  useGSAP(() => {
    gsap.from('.deck-card', { opacity: 0, x: 120, rotateY: -40, duration: 1.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: rail.current, start: 'top 80%', once: true } });
  }, { scope: root });

  const flip = (i) => { setFlipped((f) => (f === i ? -1 : i)); buzz(8); audio.sfx('flip'); };
  const go = (d) => {
    const el = rail.current, card = el.querySelector('.deck-card');
    el.scrollBy({ left: d * (card.offsetWidth + 24), behavior: 'smooth' });
  };

  return (
    <section id="programme" ref={root} className="relative py-[clamp(110px,24vw,220px)]">
      <div className="relative z-[2] mx-auto mb-[clamp(40px,8vw,70px)] max-w-[1180px] px-gutter text-center">
        <Reveal><Label>The celebrations</Label></Reveal>
        <Lines className="font-display mt-5 text-[clamp(3rem,13vw,8rem)] leading-[.95] font-normal">Five rituals, <em className="gold-text italic">one destiny</em></Lines>
        <Reveal as="p" className="mx-auto mt-6 max-w-[32ch] text-ink/65 italic">Swipe through the deck. Turn a card over for its secrets.</Reveal>
      </div>

      <div ref={rail} data-lenis-prevent className="relative z-[2] flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain px-[calc(50vw-min(38vw,170px))] py-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ perspective: '1600px' }}>
        {C.events.map((e, i) => <Card key={i} e={e} i={i} flipped={flipped === i} onFlip={flip} />)}
      </div>

      <div className="relative z-[2] mt-4 flex items-center justify-center gap-5">
        <button onClick={() => go(-1)} aria-label="Previous card" className="grid size-11 place-items-center rounded-full border border-gold/40 text-gold-deep transition hover:bg-gold/10">←</button>
        <div className="flex gap-2">{C.events.map((_, i) => <span key={i} className={`h-[3px] rounded-full transition-all duration-700 ease-silk ${i === active ? 'w-8 gold-fill' : 'w-3 bg-gold/25'}`} />)}</div>
        <button onClick={() => go(1)} aria-label="Next card" className="grid size-11 place-items-center rounded-full border border-gold/40 text-gold-deep transition hover:bg-gold/10">→</button>
      </div>
      <Reveal className="relative z-[2] mt-10 text-center"><Button variant="line" onClick={addAllToCalendar}>Add the whole programme</Button></Reveal>
    </section>
  );
}
