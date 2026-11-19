/* <Reveal> — rise & fade.  <Lines> — SplitText masked line reveal (reverts after). */
import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap.js';
import { EASE } from '../lib/utils.js';

export function Reveal({ as: Tag = 'div', children, className = '', delay = 0, y = 40, start = 'top 90%', ...rest }) {
  const ref = useRef(null);
  useGSAP(() => {
    gsap.fromTo(ref.current, { opacity: 0, y }, { opacity: 1, y: 0, duration: 1.7, delay, ease: EASE, scrollTrigger: { trigger: ref.current, start, once: true } });
  }, { scope: ref });
  return <Tag ref={ref} className={className} {...rest}>{children}</Tag>;
}

export function Lines({ as: Tag = 'h2', children, className = '', delay = 0, start = 'top 88%', ...rest }) {
  const ref = useRef(null);
  useGSAP(() => {
    const split = SplitText.create(ref.current, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, { yPercent: 115, rotate: 2, duration: 1.8, stagger: 0.12, delay, ease: EASE, scrollTrigger: { trigger: ref.current, start, once: true }, onComplete: () => split.revert() });
    return () => split.revert();
  }, { scope: ref });
  return <Tag ref={ref} className={className} {...rest}>{children}</Tag>;
}
