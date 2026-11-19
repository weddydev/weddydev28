/* Utilities — environment, formatting, personalisation, theme, textures */
import C from '../config.js';

const mm = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches;
export const env = {
  reduced: mm('(prefers-reduced-motion: reduce)'),
  finePointer: mm('(hover: hover) and (pointer: fine)'),
  isMobile: mm('(max-width: 899px)')
};
export const EASE = 'power4.out';
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const plain = (s) => String(s || '').replace(/[*~]/g, '');
export const buzz = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch { /* unsupported */ } };
export const store = {
  get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* private */ } },
  del: (k) => { try { sessionStorage.removeItem(k); } catch { /* noop */ } }
};

/* ?guest=Name (or ?g=) — React escapes it when rendering */
export const guest = (() => {
  try {
    const p = new URLSearchParams(window.location.search);
    return (p.get('guest') || p.get('g') || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 90);
  } catch { return ''; }
})();
export const fill = (tpl, name) => String(tpl || '').replace(/\{guest\}/g, name || guest || 'a guest');

export const img = (url, w = 1400, q = 74) =>
  url && /images\.unsplash\.com/.test(url) && !url.includes('?') ? `${url}?auto=format&fit=crop&w=${w}&q=${q}` : url;

/* ---------- dates (venue-local) ---------- */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const roman = (n) => {
  const map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = ''; n = +n;
  map.forEach(([v, s]) => { while (n >= v) { out += s; n -= v; } });
  return out;
};
export const parts = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso || '');
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  return { y, mo, d, h, mi, weekday: DAYS[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()], month: MONTHS[mo - 1] };
};
export const time = (iso) => { const p = parts(iso); return p ? `${p.h % 12 || 12}:${String(p.mi).padStart(2, '0')} ${p.h < 12 ? 'AM' : 'PM'}` : ''; };
export const fmt = {
  dots: (iso) => { const p = parts(iso); return p ? `${String(p.d).padStart(2, '0')} · ${String(p.mo).padStart(2, '0')} · ${p.y}` : ''; },
  short: (iso) => { const p = parts(iso); return p ? `${p.weekday}, ${p.d} ${p.month} ${p.y}` : ''; },
  dayMonth: (iso) => { const p = parts(iso); return p ? `${p.weekday}, ${p.d} ${p.month}` : ''; }
};

/* ---------- theme → Tailwind variables ---------- */
export const applyTheme = () => {
  const t = C.theme || {}, r = document.documentElement.style;
  if (t.white) r.setProperty('--color-porcelain', t.white);
  if (t.pearl) r.setProperty('--color-pearl', t.pearl);
  if (t.ink) r.setProperty('--color-ink', t.ink);
  if (t.gold) r.setProperty('--color-gold', t.gold);
  if (t.goldLight) r.setProperty('--color-gold-light', t.goldLight);
};

/* ---------- procedural Calacatta-gold marble (SVG noise, zero image weight) ---------- */
export const makeMarble = () => {
  const base = (C.theme && C.theme.white) || '#fbf8f2';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1400' height='1400'>
<filter id='v' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.0018 0.0055' numOctaves='6' seed='11'/><feComponentTransfer><feFuncR type='table' tableValues='0 0 0 0 0 0 0 0 .1 1 .1 0 0 0 0 0 0 0'/></feComponentTransfer><feColorMatrix type='matrix' values='0 0 0 0 .55 0 0 0 0 .51 0 0 0 0 .46 .2 0 0 0 0'/></filter>
<filter id='g' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.0026 0.0042' numOctaves='5' seed='3'/><feComponentTransfer><feFuncR type='table' tableValues='0 0 0 0 0 0 0 0 0 .25 1 .25 0 0 0 0 0 0 0 0'/></feComponentTransfer><feColorMatrix type='matrix' values='0 0 0 0 .8 0 0 0 0 .62 0 0 0 0 .3 .34 0 0 0 0'/></filter>
<filter id='c' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.0035' numOctaves='3' seed='5'/><feColorMatrix type='matrix' values='0 0 0 0 .62 0 0 0 0 .58 0 0 0 0 .52 .06 0 0 0 0'/></filter>
<rect width='100%' height='100%' fill='${base}'/><rect width='100%' height='100%' filter='url(#c)'/><rect width='100%' height='100%' filter='url(#v)'/><rect width='100%' height='100%' filter='url(#g)'/></svg>`;
  const uri = 'data:image/svg+xml,' + encodeURIComponent(svg).replace(/'/g, '%27');
  document.documentElement.style.setProperty('--marble', `url("${uri}")`);
};

/* ---------- paper grain tile ---------- */
export const makeNoise = () => {
  try {
    const c = document.createElement('canvas'); c.width = c.height = 160;
    const x = c.getContext('2d'), d = x.createImageData(160, 160);
    for (let i = 0; i < d.data.length; i += 4) { const v = 120 + Math.random() * 135; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0);
    document.documentElement.style.setProperty('--noise', `url(${c.toDataURL('image/png')})`);
  } catch { /* noop */ }
};
