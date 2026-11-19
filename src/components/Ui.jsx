/* Shared building blocks: rich text, gradients, monogram, icons, ornaments */
import { Fragment } from 'react';
import C from '../config.js';

export function Rich({ text, em = 'gold-text' }) {
  return String(text || '').split(/(\*[^*]+\*|~[^~]+~)/).map((p, i) => {
    if (/^\*.*\*$/.test(p)) return <em key={i} className={`italic ${em}`}>{p.slice(1, -1)}</em>;
    if (/^~.*~$/.test(p)) return <span key={i} className="text-outline-gold">{p.slice(1, -1)}</span>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export function SvgDefs() {
  return (
    <svg className="absolute h-0 w-0 overflow-hidden" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="mg-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7a5a1f" /><stop offset=".25" stopColor="#c9a24f" /><stop offset=".45" stopColor="#f6e3a8" />
          <stop offset=".6" stopColor="#b8893a" /><stop offset=".82" stopColor="#e9cf8a" /><stop offset="1" stopColor="#8c6a2a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Lozenge monogram — a diamond-cut frame with interlaced initials */
export function Monogram({ variant = '', className = '' }) {
  const [a, b] = C.couple.initials;
  return (
    <svg className={`lozenge ${variant === 'draw' ? 'is-drawing' : ''} block h-auto w-full overflow-visible ${className}`} viewBox="0 0 200 200" role="img" aria-label={`${a} & ${b}`}>
      <path className="l-frame" pathLength="1" d="M100 4 L196 100 L100 196 L4 100Z" />
      <path className="l-frame l-thin" pathLength="1" d="M100 18 L182 100 L100 182 L18 100Z" />
      <path className="l-frame l-thin" pathLength="1" d="M58 100 H74 M126 100 H142" />
      <circle className="l-dot" cx="100" cy="4" r="3" /><circle className="l-dot" cx="100" cy="196" r="3" />
      <circle className="l-dot" cx="4" cy="100" r="3" /><circle className="l-dot" cx="196" cy="100" r="3" />
      <text className="l-text" x="78" y="96" fontSize="62" textAnchor="middle">{a}</text>
      <text className="l-text" x="122" y="142" fontSize="62" textAnchor="middle">{b}</text>
      <text className="l-amp" x="101" y="122" fontSize="34" textAnchor="middle">&amp;</text>
    </svg>
  );
}
export function drawMonogram(gsap, root, k = 1) {
  const q = (s) => root.querySelectorAll(s);
  return gsap.timeline({ defaults: { ease: 'power2.inOut' } })
    .to(q('.l-frame'), { strokeDashoffset: 0, duration: 2 * k, stagger: 0.25 * k })
    .to(q('.l-text'), { opacity: 1, duration: 1.4 * k, stagger: 0.2 * k }, 0.9 * k)
    .to(q('.l-amp, .l-dot'), { opacity: 1, duration: 1.2 * k }, 1.4 * k);
}

/* Gold line-art icons for the programme */
const ICONS = {
  moon: <><path d="M40 12a18 18 0 1 0 12 30A15 15 0 0 1 40 12Z" /><path d="M8 50c5-3 9-3 14 0s9 3 14 0 9-3 14 0 6 2 6 2M12 57c4-2 8-2 12 0s8 2 12 0 8-2 12 0" /><path d="M16 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1z M24 28l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></>,
  lotus: <><path d="M32 52C20 44 18 30 32 14c14 16 12 30 0 38Z" /><path d="M32 52C18 50 8 40 8 26c12 2 20 10 24 26ZM32 52c14-2 24-12 24-26-12 2-20 10-24 26Z" /><path d="M10 56h44M18 60h28" /></>,
  mandap: <><path d="M8 24h48M12 24c0-10 9-16 20-16s20 6 20 16" /><path d="M14 24v32M50 24v32M24 24v32M40 24v32" /><path d="M14 30c5 6 15 6 18 0 3 6 13 6 18 0" /><path d="M6 58h52M32 4v4" /><circle cx="32" cy="3" r="1.5" /></>,
  chandelier: <><path d="M32 4v12M18 22h28M32 16v14" /><path d="M10 30c4 8 18 10 22 0 4 10 18 8 22 0" /><path d="M18 22c-4 4-8 6-8 8M46 22c4 4 8 6 8 8" /><path d="M10 30v6M54 30v6M32 30v8M21 34v6M43 34v6" /><path d="M10 36l-1.5 3 1.5 3 1.5-3zM54 36l-1.5 3 1.5 3 1.5-3zM32 38l-2 4 2 4 2-4zM21 40l-1.5 3 1.5 3 1.5-3zM43 40l-1.5 3 1.5 3 1.5-3z" /></>,
  champagne: <><path d="M10 14h18c0 10-4 15-9 15S10 24 10 14ZM36 14h18c0 10-4 15-9 15s-9-5-9-15Z" transform="rotate(-10 19 20)" /><path d="M19 29v20M13 49h12M45 29v20M39 49h12" /><path d="M30 8l2-4 2 4M24 6l-1-3M40 6l1-3" /><circle cx="18" cy="20" r="1" /><circle cx="46" cy="22" r="1" /></>
};
export function EventIcon({ name, className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="url(#mg-gold)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name] || ICONS.moon}
    </svg>
  );
}

/* Ornamental divider: rule · lozenge · rule */
export function Ornament({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="gild-rule h-px w-16" /><span className="size-2 rotate-45 gold-fill" /><span className="gild-rule h-px w-16" />
    </div>
  );
}

export function Label({ children, className = '' }) {
  return <p className={`caps text-gold-deep ${className}`}>{children}</p>;
}
