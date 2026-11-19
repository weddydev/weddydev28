/* ==========================================================================
   MAISON ATELIER — personalised guest links (index.html?guest=Name) and
   one-tap WhatsApp messages. Optional phone per line: Name | 919812345678
   ========================================================================== */
import { StrictMode, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import C from '../config.js';
import { gsap, useGSAP } from '../lib/gsap.js';
import { applyTheme, makeMarble, fmt, EASE } from '../lib/utils.js';
import { SvgDefs, Monogram, Ornament } from '../components/Ui.jsx';

const LS = 'maison-generator-v1';
const load = () => { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; } };
const save = (v) => { try { localStorage.setItem(LS, JSON.stringify(v)); } catch { /* private */ } };
const defaultBase = () => {
  if (C.siteUrl) return C.siteUrl.replace(/\/?$/, '/');
  const u = new URL(window.location.href); u.search = ''; u.hash = '';
  return u.href.replace(/generator\.html$/, '');
};
const defaultMsg = `Priya {guest},\n\nWith the blessings of our elders and Lord Ganesha, ${C.couple.partner1} & ${C.couple.partner2} warmly invite you to celebrate their Shubh Vivah in ${C.city}, ${fmt.short(C.date)}.\n\nYour sacred invitation is waiting under gold foil:\n{link}`;
const linkFor = (base, name) => {
  const b = base.trim() || defaultBase();
  const page = /\.html$/.test(b) ? b : b.replace(/\/?$/, '/') + 'index.html';
  return `${page}?guest=${encodeURIComponent(name)}`;
};
function copy(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  const t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
  document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); return Promise.resolve();
}
const chip = 'caps inline-flex min-h-10 items-center rounded-full border border-gold/45 bg-white/60 px-4 text-[9px] text-gold-deep transition duration-700 ease-silk hover:bg-gold hover:text-white';

function Atelier() {
  const saved = load();
  const [base, setBase] = useState(saved.base || defaultBase());
  const [msg, setMsg] = useState(saved.msg || defaultMsg);
  const [list, setList] = useState(saved.list || 'Mr. and Mrs. Khanna\nThe Oberoi Family | 919800000000\nAnanya & Rohan');
  const [toast, setToast] = useState('');
  const root = useRef(null);
  useEffect(() => { applyTheme(); makeMarble(); }, []);
  useEffect(() => save({ base, msg, list }), [base, msg, list]);
  const guests = useMemo(() => list.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const [name, phone = ''] = l.split('|').map((x) => x.trim());
    const link = linkFor(base, name);
    return { name, phone: phone.replace(/\D/g, ''), link, text: msg.replace(/\{guest\}/g, name).replace(/\{link\}/g, link) };
  }), [list, base, msg]);
  const flash = (t) => { setToast(t); gsap.fromTo('.toast', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: EASE }); gsap.to('.toast', { opacity: 0, duration: 0.6, delay: 1.8 }); };
  const csv = () => {
    const rows = [['Guest', 'Phone', 'Link', 'Message'], ...guests.map((g) => [g.name, g.phone, g.link, g.text])];
    const body = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/csv' })); a.download = 'maison-guest-links.csv'; a.click();
  };
  useGSAP(() => { gsap.from('.at-in', { opacity: 0, y: 30, duration: 1.6, stagger: 0.08, ease: EASE }); }, { scope: root });

  return (
    <div ref={root} className="relative mx-auto max-w-[980px] px-gutter pt-[clamp(48px,10vw,96px)] pb-32">
      <SvgDefs /><div className="marble" aria-hidden="true" />
      <header className="at-in mb-12 text-center">
        <div className="mx-auto w-16"><Monogram /></div>
        <p className="caps mt-6 text-gold-deep">{C.house} atelier · private</p>
        <h1 className="font-display mt-3 text-[clamp(3rem,12vw,6rem)] leading-[.95] font-normal">Personal <em className="gold-text italic">invitations</em></h1>
        <Ornament className="mt-8" />
      </header>
      <section className="at-in gild-frame grid gap-10 rounded-[28px] bg-white/70 p-[clamp(22px,5vw,44px)] backdrop-blur-sm desk:grid-cols-2">
        <label className="block"><span className="caps text-gold-deep">Live site address</span>
          <input className="field mt-2 font-serif !text-[16px]" value={base} onChange={(e) => setBase(e.target.value)} placeholder="https://maison-aarav-meher.netlify.app/" />
          <span className="mt-2 block text-[.9em] text-ink/50 italic">Set it once you have deployed. Links work locally too.</span>
        </label>
        <label className="block"><span className="caps text-gold-deep">Message · {'{guest}'} and {'{link}'}</span>
          <textarea className="field mt-2 min-h-[150px] resize-y font-serif !text-[1.05rem] leading-[1.45]" value={msg} onChange={(e) => setMsg(e.target.value)} />
        </label>
        <label className="block desk:col-span-2"><span className="caps text-gold-deep">Guests · one per line · optional “| phone”</span>
          <textarea className="field mt-2 min-h-[170px] resize-y !text-[1.5rem] leading-[1.5]" value={list} onChange={(e) => setList(e.target.value)} />
        </label>
        <div className="flex flex-wrap gap-3 desk:col-span-2">
          <button className="btn btn-gold" onClick={() => copy(guests.map((g) => `${g.name}\t${g.link}`).join('\n')).then(() => flash('All links copied'))}><span>Copy all links</span></button>
          <button className="btn btn-line" onClick={csv}><span>Export CSV</span></button>
        </div>
      </section>
      <ol className="at-in mt-14 border-t border-gold/30">
        {guests.map((g, i) => (
          <li key={i} className="grid gap-4 border-b border-gold/30 py-7 desk:grid-cols-[1fr_auto] desk:items-center">
            <div className="min-w-0">
              <p className="font-display text-[1.9rem] leading-tight">{g.name}</p>
              <p className="mt-1 truncate text-[13px] text-ink/50">{g.link}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a className={chip} href={g.link} target="_blank" rel="noopener">Preview</a>
              <button className={chip} onClick={() => copy(g.link).then(() => flash('Link copied'))}>Copy link</button>
              <button className={chip} onClick={() => copy(g.text).then(() => flash('Message copied'))}>Copy message</button>
              <a className="btn btn-gold btn-sm" target="_blank" rel="noopener" href={`https://wa.me/${g.phone}?text=${encodeURIComponent(g.text)}`}><span>WhatsApp</span></a>
            </div>
          </li>
        ))}
        {!guests.length && <li className="py-10 text-ink/50 italic">Add a guest above to begin.</li>}
      </ol>
      <div className="toast caps pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-gold/40 bg-white/90 px-6 py-3 text-gold-deep opacity-0 shadow-lg backdrop-blur" role="status">{toast}</div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<StrictMode><Atelier /></StrictMode>);
