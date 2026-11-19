/* RSVP — a single, beautiful reply card. Guests choose, add details, then SIGN
   in gold ink with a finger. Sealing it brings down an embossed gold stamp,
   then a burst of gold leaf. Delivery: WhatsApp / Formspree / Google / demo. */
import { useEffect, useRef, useState } from 'react';
import C from '../config.js';
import { gsap, SplitText, useGSAP } from '../lib/gsap.js';
import { EASE, guest, plain, buzz, clamp, wait, fmt } from '../lib/utils.js';
import { leafBurst } from '../lib/fx.js';
import { audio } from '../lib/audio.js';
import { scroll } from '../lib/scroll.js';
import Button from '../components/Button.jsx';
import { Label, Monogram, Rich } from '../components/Ui.jsx';
import { Lines, Reveal } from '../components/Reveal.jsx';

const R = C.rsvp;

/* gold-ink signature pad with pressure-like stroke width from speed */
function SignaturePad({ onChange }) {
  const cv = useRef(null), st = useRef({ down: false, pts: [], drawn: false, w: 2 });
  useEffect(() => {
    const c = cv.current, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fit = () => { const r = c.getBoundingClientRect(); c.width = r.width * dpr; c.height = r.height * dpr; const x = c.getContext('2d'); x.scale(dpr, dpr); x.lineCap = 'round'; x.lineJoin = 'round'; st.current.drawn = false; onChange(false); };
    fit();
  }, []); // eslint-disable-line
  const ctx = () => cv.current.getContext('2d');
  const pos = (e) => { const r = cv.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }; };
  const down = (e) => { e.preventDefault(); cv.current.setPointerCapture(e.pointerId); st.current.down = true; st.current.pts = [pos(e)]; };
  const move = (e) => {
    const s = st.current; if (!s.down) return;
    const p = pos(e), prev = s.pts[s.pts.length - 1];
    const v = Math.hypot(p.x - prev.x, p.y - prev.y) / Math.max(1, p.t - prev.t);
    s.w = s.w * 0.7 + clamp(3.4 - v * 1.6, 0.9, 3.4) * 0.3;
    const x = ctx();
    const g = x.createLinearGradient(0, 0, cv.current.width, 0);
    g.addColorStop(0, '#8c6a2a'); g.addColorStop(0.5, '#c9a24f'); g.addColorStop(1, '#a67c2e');
    x.strokeStyle = g; x.lineWidth = s.w;
    x.beginPath(); const mid = { x: (prev.x + p.x) / 2, y: (prev.y + p.y) / 2 };
    x.moveTo(s.lastMid ? s.lastMid.x : prev.x, s.lastMid ? s.lastMid.y : prev.y); x.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y); x.stroke();
    s.lastMid = mid; s.pts.push(p);
    if (!s.drawn) { s.drawn = true; onChange(true); }
  };
  const up = () => { st.current.down = false; st.current.lastMid = null; };
  const clear = () => { const c = cv.current; ctx().clearRect(0, 0, c.width, c.height); st.current.drawn = false; onChange(false); };
  SignaturePad.toDataURL = () => cv.current?.toDataURL('image/png');
  return (
    <div>
      <div className="relative rounded-[16px] border border-dashed border-gold/50 bg-white/70">
        <canvas ref={cv} className="block h-[150px] w-full touch-none" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="Signature area: sign with your finger or mouse" />
        <span className="pointer-events-none absolute bottom-4 left-5 right-5 border-b border-gold/40" />
        <span className="caps pointer-events-none absolute bottom-6 left-5 text-[8px] text-ink/35">✕</span>
      </div>
      <button type="button" onClick={clear} className="caps mt-2 text-[9px] text-ink/50 underline-offset-4 hover:underline">Clear signature</button>
    </div>
  );
}

export default function Rsvp() {
  const root = useRef(null), card = useRef(null);
  const [s, setS] = useState({ name: guest, attend: '', events: C.events.map(() => true), guests: 1, diet: [], note: '' });
  const [signed, setSigned] = useState(false);
  const [err, setErr] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);
  const set = (p) => setS((o) => ({ ...o, ...p }));
  const yes = s.attend === 'yes';

  const summary = () => {
    const evs = C.events.filter((_, i) => yes && s.events[i]).map((e) => plain(e.title));
    return { name: s.name.trim(), attending: yes ? 'Joyfully accepts' : 'Regretfully declines', events: evs.join(', ') || '—', guests: yes ? s.guests : 0, dietary: s.diet.join(', ') || '—', note: s.note.trim() || '—', signed: signed ? 'yes' : 'no', link: guest, sent: new Date().toISOString() };
  };
  const message = (d) => [
    `◆ ${C.house} ${C.couple.partner1} & ${C.couple.partner2} · RSVP ◆`, '',
    `${d.name} — ${d.attending}`,
    ...(yes ? ['', ...C.events.map((e, i) => `${s.events[i] ? '✓' : '✗'} ${plain(e.title)}`), '', `Party of ${d.guests}`, `Dietary: ${d.dietary}`] : []),
    '', `Note: ${d.note}`, d.signed === 'yes' ? '✍ Signed in gold' : ''
  ].join('\n').trim();

  async function submit() {
    if (s.name.trim().length < 2) return shake('Please tell us your name.');
    if (!s.attend) return shake('Will you be joining us?');
    if (yes && !s.events.some(Boolean)) return shake('Choose at least one celebration.');
    setErr(''); setSending(true);
    const d = summary();
    try {
      if (R.method === 'whatsapp') window.open(`https://wa.me/${R.whatsapp}?text=${encodeURIComponent(message(d))}`, '_blank', 'noopener');
      else if (R.method === 'formspree' && R.endpoint) {
        const res = await fetch(R.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...d, signature: signed ? SignaturePad.toDataURL() : '' }) });
        if (!res.ok) throw new Error('failed');
      } else if (R.method === 'google' && R.googleForm?.action) {
        const f = R.googleForm.fields || {}, body = new URLSearchParams();
        Object.entries({ name: d.name, attendance: d.attending, events: d.events, guests: String(d.guests), dietary: d.dietary, note: d.note }).forEach(([k, v]) => f[k] && body.append(f[k], v));
        await fetch(R.googleForm.action, { method: 'POST', mode: 'no-cors', body });
      } else await wait(800);
      stamp();
    } catch {
      setSending(false);
      setErr('We couldn’t send your reply just now. Please try again, or message your concierge.');
    }
  }
  const shake = (m) => { setErr(m); buzz(30); gsap.fromTo(card.current, { x: -8 }, { x: 0, duration: 0.7, ease: 'elastic.out(1,.35)' }); };

  /* the embossed stamp comes down */
  const stamp = () => {
    const el = root.current.querySelector('.rs-stamp');
    gsap.timeline({ onComplete: () => setDone(yes ? 'yes' : 'no') })
      .set(el, { display: 'grid' })
      .fromTo(el, { scale: 2.6, opacity: 0, rotate: -28 }, { scale: 1, opacity: 1, rotate: -12, duration: 0.42, ease: 'power4.in' })
      .add(() => { audio.sfx('stamp'); buzz([30, 30, 60]); gsap.fromTo(card.current, { y: 0 }, { keyframes: [{ y: 6 }, { y: -2 }, { y: 0 }], duration: 0.35 }); })
      .to({}, { duration: 1.3 });
  };

  useGSAP(() => {
    if (!done) return;
    const t = root.current.querySelector('.rs-title');
    const split = SplitText.create(t, { type: 'lines', mask: 'lines' });
    gsap.to('.rs-stamp', { top: '9%', left: '84%', scale: 0.46, rotate: 14, duration: 1.4, ease: 'power3.inOut' });
    gsap.timeline({ defaults: { ease: EASE } })
      .from('.rs-mono', { scale: 0.6, opacity: 0, rotate: -45, duration: 1.6 })
      .from(split.lines, { yPercent: 115, duration: 1.8, stagger: 0.12 }, 0.3)
      .from('.rs-sub', { opacity: 0, y: 16, duration: 1.4 }, 1);
    if (done === 'yes') { leafBurst(document.getElementById('burst')); audio.sfx('chime'); }
    scroll.lenis && scroll.lenis.scrollTo('#rsvp', { offset: 20, duration: 1.4 });
  }, { scope: root, dependencies: [done] });

  return (
    <section id="rsvp" ref={root} className="relative px-gutter py-[clamp(110px,24vw,220px)]">
      <div className="relative z-[2] mx-auto max-w-[760px]">
        <div className="mb-[clamp(48px,10vw,80px)] text-center">
          <Reveal><Label>Kripya uttar dijiye</Label></Reveal>
          <Lines className="font-display mt-5 text-[clamp(3rem,14vw,8rem)] leading-[.95] font-normal">Kindly <em className="gold-text italic">reply</em></Lines>
          <Reveal as="p" className="mt-4 text-ink/60 italic">by {C.rsvpDeadline}</Reveal>
        </div>

        <Reveal>
          <div ref={card} className="card-paper gild-frame relative rounded-[30px] px-[clamp(22px,6vw,56px)] py-[clamp(30px,7vw,56px)]">
            <div className="pointer-events-none absolute inset-[12px] rounded-[22px] border border-gold/20" />
            {!done ? (
              <form noValidate onSubmit={(e) => { e.preventDefault(); submit(); }} className="relative">
                <label className="block"><span className="caps text-gold-deep">Your name</span>
                  <input className="field mt-2" value={s.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" maxLength={90} placeholder="As on your place card" />
                </label>

                <fieldset className="mt-10">
                  <legend className="caps mb-4 text-gold-deep">Will you join us?</legend>
                  <div className="grid grid-cols-2 gap-3">
                    {[['yes', 'Harshoullās se', 'accepts'], ['no', 'Khed ke saath', 'declines']].map(([v, a, b]) => (
                      <label key={v} className="relative cursor-pointer">
                        <input type="radio" name="attend" value={v} checked={s.attend === v} onChange={() => { set({ attend: v }); buzz(8); }} className="peer absolute opacity-0" />
                        <span className="block rounded-[18px] border border-gold/35 bg-white/60 px-2 py-5 text-center transition-all duration-700 ease-silk peer-checked:border-transparent peer-checked:shadow-[0_16px_34px_-16px_rgba(140,106,42,.8)] peer-checked:[background:var(--gold-grad)] peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-gold">
                          <span className="font-script block text-[clamp(1.5rem,7vw,2.1rem)] leading-none whitespace-nowrap">{a}</span><span className="caps mt-1 block text-[9px]">{b}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className={`grid transition-all duration-1000 ease-silk ${yes ? 'mt-10 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="caps mb-4 text-gold-deep">Celebrations</p>
                    <div className="flex flex-wrap gap-2">
                      {C.events.map((e, i) => (
                        <label key={i} className="pill relative">
                          <input type="checkbox" checked={s.events[i]} onChange={() => { const ev = [...s.events]; ev[i] = !ev[i]; set({ events: ev }); buzz(5); }} tabIndex={yes ? 0 : -1} />
                          <span>{plain(e.title)}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-9 flex items-center justify-between gap-4">
                      <p className="caps m-0 text-gold-deep">Guests, including you</p>
                      <div className="flex items-center gap-4">
                        {[-1, 1].map((d) => (
                          <button key={d} type="button" onClick={() => { set({ guests: clamp(s.guests + d, 1, R.maxGuests) }); buzz(5); }} aria-label={d < 0 ? 'Fewer guests' : 'More guests'} tabIndex={yes ? 0 : -1}
                            className={`grid size-10 place-items-center rounded-full border border-gold/45 text-gold-deep transition hover:bg-gold/10 ${d > 0 ? 'order-3' : ''}`}>{d < 0 ? '−' : '+'}</button>
                        ))}
                        <span className="font-display order-2 w-8 text-center text-[2.4rem] leading-none" aria-live="polite">{s.guests}</span>
                      </div>
                    </div>
                    <p className="caps mt-9 mb-4 text-gold-deep">Dietary wishes</p>
                    <div className="flex flex-wrap gap-2">
                      {R.dietary.map((d) => (
                        <label key={d} className="pill relative">
                          <input type="checkbox" checked={s.diet.includes(d)} onChange={() => { set({ diet: s.diet.includes(d) ? s.diet.filter((x) => x !== d) : [...s.diet, d] }); buzz(5); }} tabIndex={yes ? 0 : -1} />
                          <span>{d}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <label className="mt-10 block"><span className="caps text-gold-deep">A note for {C.couple.partner1} &amp; {C.couple.partner2}</span>
                  <textarea data-lenis-prevent className="field mt-2 min-h-[110px] resize-y font-serif text-[1.15rem] leading-[1.5]" rows={3} maxLength={800} value={s.note} onChange={(e) => set({ note: e.target.value })} placeholder="A wish, a memory, a song request…" />
                </label>

                <div className="mt-10">
                  <p className="caps mb-3 text-gold-deep">Sign in gold <span className="text-ink/40 normal-case tracking-normal italic">— optional, but lovely</span></p>
                  <SignaturePad onChange={setSigned} />
                </div>

                <p className="mt-6 min-h-[1.4em] text-[#9b3b2a] italic" role="alert">{err}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                  <p className="caps m-0 text-[9px] text-ink/45">{fmt.dots(new Date().toISOString().slice(0, 16))}</p>
                  <Button onClick={submit}>{sending ? 'Sealing…' : 'Seal my reply'}</Button>
                </div>
              </form>
            ) : (
              <div className="relative py-8 text-center">
                <div className="rs-mono mx-auto w-24"><Monogram /></div>
                <h3 className="rs-title font-display mt-8 text-[clamp(2.4rem,10vw,4.4rem)] leading-[1] font-normal">
                  {done === 'yes' ? <Rich text="We can’t wait to *celebrate* with you." /> : <Rich text="You will be *missed.*" />}
                </h3>
                <p className="rs-sub mx-auto mt-6 max-w-[34ch] text-ink/65 italic">
                  {done === 'yes' ? 'Your reply is sealed and on its way. Your concierge will be in touch with the finer details.' : 'Thank you for letting us know. You will be in our thoughts on the day.'}
                </p>
              </div>
            )}

            {/* embossed gold stamp */}
            <div className="rs-stamp pointer-events-none absolute top-[38%] left-1/2 z-[5] hidden size-[170px] -translate-1/2 place-items-center rounded-full [background:var(--gold-grad)] text-white shadow-[0_18px_40px_-12px_rgba(120,90,30,.7),inset_0_2px_0_rgba(255,255,255,.6),inset_0_-3px_6px_rgba(90,60,10,.35)]" aria-hidden="true">
              <div className="grid size-[146px] place-items-center rounded-full border border-dashed border-white/70 text-center">
                <div>
                  <p className="caps text-[9px] tracking-[.4em] text-white">Received</p>
                  <p className="font-display my-1 text-[2.4rem] leading-none [text-shadow:0_1px_1px_rgba(90,60,10,.5)]">{C.couple.initials.join('·')}</p>
                  <p className="caps text-[8px] text-white/90">{C.house} · MMXXVI</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
