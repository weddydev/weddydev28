/* Gold (filled, shimmering) or line (fills with gold) — magnetic on desktop */
import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap.js';
import { env, EASE } from '../lib/utils.js';

export function useMagnetic(ref, strength = 0.3) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !env.finePointer || env.reduced) return;
    const move = (e) => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, duration: 1, ease: EASE }); };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 1.5, ease: EASE });
    el.addEventListener('mousemove', move); el.addEventListener('mouseleave', leave);
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); };
  }, [ref, strength]);
}

export default function Button({ as: Tag = 'button', variant = 'gold', size = '', className = '', children, ...rest }) {
  const ref = useRef(null);
  useMagnetic(ref);
  const props = Tag === 'button' ? { type: 'button', ...rest } : rest;
  return <Tag ref={ref} className={`btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${className}`} {...props}><span>{children}</span></Tag>;
}
