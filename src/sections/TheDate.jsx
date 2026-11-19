/* THE DATE — a December calendar with the day circled in hand-drawn gold, and
   a haute-horlogerie dial whose hands sweep COUNTER-clockwise, counting down. */
import { useEffect, useRef, useState } from 'react';
import C from '../config.js';
import { gsap, useGSAP } from '../lib/gsap.js';
import { parts, roman, env } from '../lib/utils.js';
import { Label, Rich } from '../components/Ui.jsx';
import { Lines, Reveal } from '../components/Reveal.jsx';

const target = new Date(C.date).getTime();
const P = parts(C.date);
const eventDays = new Set(C.events.map((e) => parts(e.start)).filter((p) => p && p.mo === P.mo).map((p) => p.d));

function Calendar() {
  const first = new Date(Date.UTC(P.y, P.mo - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(P.y, P.mo, 0)).getUTCDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="mb-5 flex items-baseline justify-between">
        <p className="font-display m-0 text-[2.4rem] leading-none">{P.month}</p>
        <p className="caps m-0 text-gold-deep">{P.y}</p>
      </div>
      <div className="gild-rule mb-4 h-px" />
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="caps pb-2 text-[9px] text-ink/45">{d}</span>)}
        {cells.map((d, i) => (
          <span key={i} className={`font-display relative grid aspect-square place-items-center text-[1.35rem] ${d === P.d ? 'text-gold-deep' : 'text-ink/80'}`}>
            {d}
            {d && eventDays.has(d) && d !== P.d && <i className="absolute bottom-[14%] size-1 rotate-45 bg-gold" />}
            {d === P.d && (
              <svg className="cal-circle pointer-events-none absolute -inset-[30%] size-[160%] overflow-visible" viewBox="0 0 100 100" aria-hidden="true">
                <path pathLength="1" d="M52 8 C 20 6, 6 30, 9 55 C 12 82, 40 95, 64 90 C 88 84, 96 58, 90 36 C 84 16, 60 6, 38 12" fill="none" stroke="url(#mg-gold)" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="1" strokeDashoffset="1" />
              </svg>
            )}
          </span>
        ))}
      </div>
      <p className="caps mt-5 flex items-center gap-2 text-[9px] text-ink/55"><i className="size-1 rotate-45 bg-gold" /> celebrations</p>
    </div>
  );
}

function Dial({ remain }) {
  const hand = useRef({ h: null, m: null, s: null });
  /* smooth sweep each frame while visible */
  useEffect(() => {
    let raf = 0, vis = true;
    const svg = hand.current.s?.ownerSVGElement;
    const tick = () => {
      if (!vis) { raf = 0; return; }
      raf = requestAnimationFrame(tick);
      const ms = Math.max(0, target - Date.now());
      const s = (ms / 1000) % 60, m = (ms / 60000) % 60, h = (ms / 3600000) % 12;
      // remaining time → angle; as it shrinks the hands travel counter-clockwise
      if (hand.current.s) hand.current.s.setAttribute('transform', `rotate(${(s / 60) * 360} 150 150)`);
      if (hand.current.m) hand.current.m.setAttribute('transform', `rotate(${(m / 60) * 360} 150 150)`);
      if (hand.current.h) hand.current.h.setAttribute('transform', `rotate(${(h / 12) * 360} 150 150)`);
    };
    const io = new IntersectionObserver(([e]) => {
      vis = e.isIntersecting;
      if (vis && !raf) tick();
    });
    svg && io.observe(svg);
    tick();
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  return (
    <svg className="dial w-full max-w-[460px] drop-shadow-[0_30px_40px_rgba(120,90,30,.25)]" viewBox="0 0 300 300" role="img" aria-label={`${remain.d} days, ${remain.h} hours and ${remain.m} minutes until the ceremony`}>
      <defs>
        <radialGradient id="dial-face" cx=".5" cy=".4" r=".7"><stop offset="0" stopColor="#fffdf8" /><stop offset=".7" stopColor="#f6efe0" /><stop offset="1" stopColor="#eadcc0" /></radialGradient>
        <pattern id="guilloche" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 3h6" stroke="rgba(184,137,58,.12)" strokeWidth=".6" /></pattern>
      </defs>
      <circle cx="150" cy="150" r="146" fill="url(#mg-gold)" />
      <circle cx="150" cy="150" r="138" fill="#fbf6ea" />
      <circle cx="150" cy="150" r="134" fill="url(#dial-face)" />
      <circle cx="150" cy="150" r="96" fill="url(#guilloche)" />
      <circle cx="150" cy="150" r="96" fill="none" stroke="rgba(184,137,58,.35)" strokeWidth=".6" />
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2, big = i % 5 === 0;
        const r1 = 128, r2 = big ? 118 : 123;
        return <line key={i} x1={150 + Math.sin(a) * r1} y1={150 - Math.cos(a) * r1} x2={150 + Math.sin(a) * r2} y2={150 - Math.cos(a) * r2} stroke={big ? '#8c6a2a' : 'rgba(140,106,42,.55)'} strokeWidth={big ? 1.6 : 0.7} />;
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i === 0 ? 12 : i, a = (i / 12) * Math.PI * 2;
        return <text key={i} x={150 + Math.sin(a) * 104} y={150 - Math.cos(a) * 104 + 5} textAnchor="middle" fontFamily="Cinzel" fontWeight="600" fontSize="13" fill="#2a2118">{roman(n)}</text>;
      })}
      <text x="150" y="88" textAnchor="middle" fontFamily="Cinzel" fontWeight="600" fontSize="8" letterSpacing="3" fill="#8c6a2a">MAISON</text>
      <text x="150" y="99" textAnchor="middle" fontFamily="Pinyon Script" fontSize="12" fill="#8c6a2a">{C.couple.initials.join(' & ')}</text>
      {/* days sub-dial */}
      <circle cx="150" cy="200" r="27" fill="#fffdf8" stroke="url(#mg-gold)" strokeWidth="1.2" />
      <text x="150" y="207" textAnchor="middle" fontFamily="Italiana" fontSize="22" fill="#2a2118">{remain.d}</text>
      <text x="150" y="218" textAnchor="middle" fontFamily="Cinzel" fontSize="5" letterSpacing="2" fill="#8c6a2a">DAYS</text>
      {/* hands */}
      <g ref={(el) => (hand.current.h = el)}><path d="M150 150 L146.5 140 L150 92 L153.5 140Z" fill="url(#mg-gold)" stroke="#7a5a1f" strokeWidth=".4" /></g>
      <g ref={(el) => (hand.current.m = el)}><path d="M150 150 L147.5 138 L150 52 L152.5 138Z" fill="url(#mg-gold)" stroke="#7a5a1f" strokeWidth=".4" /></g>
      <g ref={(el) => (hand.current.s = el)}><path d="M150 168 L150 40" stroke="#8c3a2a" strokeWidth=".9" /><circle cx="150" cy="40" r="2.2" fill="#8c3a2a" /></g>
      <circle cx="150" cy="150" r="4.5" fill="url(#mg-gold)" stroke="#7a5a1f" strokeWidth=".5" /><circle cx="150" cy="150" r="1.4" fill="#fbf6ea" />
      {/* crystal reflection */}
      <path d="M40 120 A112 112 0 0 1 200 44 L190 60 A96 96 0 0 0 58 126Z" fill="#fff" opacity=".35" />
    </svg>
  );
}

const calc = () => {
  let ms = target - Date.now();
  if (ms <= 0) return null;
  const d = Math.floor(ms / 864e5); ms -= d * 864e5;
  const h = Math.floor(ms / 36e5); ms -= h * 36e5;
  const m = Math.floor(ms / 6e4); ms -= m * 6e4;
  return { d, h, m, s: Math.floor(ms / 1000) };
};

export default function TheDate() {
  const root = useRef(null);
  const [remain, setRemain] = useState(calc);
  useEffect(() => { const id = setInterval(() => setRemain(calc()), 1000); return () => clearInterval(id); }, []);
  useGSAP(() => {
    gsap.to('.cal-circle path', { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', scrollTrigger: { trigger: '.cal-circle', start: 'top 75%', once: true } });
    if (!env.reduced) gsap.from('.dial', { rotate: -25, scale: 0.85, opacity: 0, duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: '.dial', start: 'top 85%', once: true } });
  }, { scope: root });

  const pad = (n) => String(n).padStart(2, '0');
  return (
    <section id="date" ref={root} className="relative px-gutter py-[clamp(110px,24vw,220px)]">
      <div className="relative z-[2] mx-auto max-w-[1180px]">
        <div className="mb-[clamp(56px,12vw,100px)] text-center">
          <Reveal><Label>Save the date</Label></Reveal>
          <Lines className="font-display mt-5 text-[clamp(3rem,13vw,8rem)] leading-[.95] font-normal"><Rich text={`${P.weekday}, the *${P.d}${ord(P.d)}*`} /></Lines>
        </div>
        <div className="grid items-center gap-[clamp(60px,12vw,120px)] desk:grid-cols-2">
          <Reveal className="order-2 desk:order-1"><Calendar /></Reveal>
          <div className="order-1 flex flex-col items-center desk:order-2">
            {remain ? <Dial remain={remain} /> : <p className="font-display text-[3rem]">Today, <em className="gold-text italic">forever begins.</em></p>}
            {remain && (
              <p className="caps mt-8 flex flex-wrap justify-center gap-x-4 gap-y-1 text-center text-ink/70" role="timer" aria-live="off">
                {[[remain.d, 'days'], [pad(remain.h), 'hrs'], [pad(remain.m), 'min'], [pad(remain.s), 'sec']].map(([v, l]) => (
                  <span key={l}><span className="font-display mr-1 align-middle text-[1.9rem] tracking-normal text-ink normal-case">{v}</span>{l}</span>
                ))}
              </p>
            )}
            <p className="mt-3 text-center text-ink/55 italic">{time(C.date)} {C.timezoneLabel} · {C.city}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ord(n) { const s = ["th", "st", "nd", "rd"], v = n % 100; return s[(v - 20) % 10] || s[v] || s[0]; }
function time(iso) { const p = parts(iso); return `${p.h % 12 || 12}:${String(p.mi).padStart(2, '0')} ${p.h < 12 ? 'AM' : 'PM'}`; }
