/* Lenis inertial scroll + a gold-leaf wipe for menu navigation */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { env } from './utils.js';
import { audio } from './audio.js';

export const scroll = { lenis: null };

export function initLenis() {
  if (env.reduced || scroll.lenis) return scroll.lenis;
  const lenis = new Lenis({ duration: 1.6, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
  scroll.lenis = lenis;
  return lenis;
}
export const lockScroll = () => scroll.lenis && scroll.lenis.stop();
export const unlockScroll = () => scroll.lenis && scroll.lenis.start();

export function navigate(hash) {
  const target = document.querySelector(hash);
  if (!target) return;
  const jump = () => {
    if (scroll.lenis) scroll.lenis.scrollTo(target, { immediate: true, force: true });
    else target.scrollIntoView();
    ScrollTrigger.update();
  };
  const w = document.getElementById('wipe');
  if (env.reduced || !w) return jump();
  audio.sfx('swish');
  gsap.timeline()
    .set(w, { xPercent: -110, display: 'block' })
    .to(w, { xPercent: 0, duration: 0.9, ease: 'power3.inOut' })
    .add(jump)
    .to(w, { xPercent: 110, duration: 1, ease: 'power3.inOut', delay: 0.12 })
    .set(w, { display: 'none' });
}
