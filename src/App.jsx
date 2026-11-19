/* ==========================================================================
   MAISON AARAV & MEHER — Haute Joaillerie Edition
   stage: "loading" (gold ring preloader) → "foil" (scratch to unveil) → "site"
   A single WebGL layer (the rings) floats behind the content for the whole
   visit; each section asks the rings to take a new pose.
   ========================================================================== */
import { useEffect, useRef, useState } from 'react';
import C from './config.js';
import { gsap, ScrollTrigger } from './lib/gsap.js';
import { env, store, wait, img, applyTheme, makeMarble, makeNoise } from './lib/utils.js';
import { initLenis, unlockScroll } from './lib/scroll.js';
import { createRings, ringState } from './lib/rings.js';
import { SvgDefs } from './components/Ui.jsx';
import { Dock, Cursor, Wipe } from './components/Chrome.jsx';
import Preloader from './intro/Preloader.jsx';
import FoilReveal from './intro/FoilReveal.jsx';
import Hero from './sections/Hero.jsx';
import Manifesto from './sections/Manifesto.jsx';
import Story from './sections/Story.jsx';
import TheDate from './sections/TheDate.jsx';
import Programme from './sections/Programme.jsx';
import Venue from './sections/Venue.jsx';
import Lookbook from './sections/Lookbook.jsx';
import Concierge from './sections/Concierge.jsx';
import Rsvp from './sections/Rsvp.jsx';
import Finale from './sections/Finale.jsx';

const returning = store.get('maison-unveiled') === '1' || env.reduced;
const preload = (src) => new Promise((res) => { const i = new Image(); i.onload = i.onerror = res; i.src = src; });
const m = env.isMobile;

/* where the rings stand in each chapter (x/y: -1…1 of the viewport) */
const POSES = {
  hero: { x: 0, y: m ? 0.04 : 0, scale: 1, rx: 0.35, ry: -0.5, sep: 0, opacity: 1 },
  manifesto: { x: m ? 0.52 : 0.62, y: m ? 0.72 : 0.4, scale: m ? 0.32 : 0.5, rx: 0.9, ry: 0.4, sep: 0.25, opacity: 0.95 },
  story: { x: 1.2, opacity: 0, scale: 0.4 },
  date: { opacity: 0 }, programme: { opacity: 0 }, venue: { opacity: 0 },
  lookbook: { x: 0, y: m ? -0.12 : -0.08, scale: m ? 0.5 : 0.42, rx: 0.2, ry: 0, sep: 0, opacity: 1 },
  concierge: { opacity: 0 }, rsvp: { opacity: 0 },
  finale: { x: 0, y: m ? 0.6 : 0.5, scale: m ? 0.6 : 0.5, rx: 0.3, ry: -0.3, sep: 0, opacity: 1 }
};

export default function App() {
  const [stage, setStage] = useState('loading');
  const [fontsReady, setFontsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [preGone, setPreGone] = useState(false);
  const [foilGone, setFoilGone] = useState(returning);
  const [webgl, setWebgl] = useState(true);
  const ringsCanvas = useRef(null);

  /* boot */
  useEffect(() => {
    applyTheme(); makeMarble(); makeNoise(); initLenis();
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    const fonts = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), wait(3500)]).then(() => setFontsReady(true));
    const jobs = [fonts, preload(img(C.story[0].image, 800)), preload(img(C.venue.image, 2000)), wait(600)];
    let done = 0;
    jobs.forEach((j) => j.then(() => setProgress(Math.min(1, ++done / jobs.length))));
    Promise.race([Promise.all(jobs), wait(7000)]).then(() => setLoaded(true));
  }, []);

  /* the WebGL rings */
  useEffect(() => {
    const r = createRings(ringsCanvas.current);
    if (!r) setWebgl(false);
    return () => r && r.destroy();
  }, []);

  /* choreography: once the film is mounted, every section sets a pose */
  useEffect(() => {
    if (!fontsReady) return;
    const triggers = [];
    requestAnimationFrame(() => {
      Object.entries(POSES).forEach(([id, pose]) => {
        let el = document.getElementById(id);
        if (!el) return;
        if (el.parentElement && el.parentElement.classList.contains('pin-spacer')) el = el.parentElement;
        triggers.push(ScrollTrigger.create({
          trigger: el, start: 'top 55%', end: 'bottom 55%',
          onToggle: (self) => self.isActive && gsap.to(ringState, { ...pose, duration: 1.9, ease: 'power3.inOut', overwrite: 'auto' })
        }));
      });
      ScrollTrigger.refresh();
    });
    return () => triggers.forEach((t) => t.kill());
  }, [fontsReady]);

  /* enter the site */
  useEffect(() => {
    if (stage !== 'site') return;
    document.documentElement.classList.remove('is-locked');
    unlockScroll();
    ScrollTrigger.refresh();
    store.set('maison-unveiled', '1');
    if (location.hash && document.querySelector(location.hash)) setTimeout(() => document.querySelector(location.hash).scrollIntoView(), 1200);
  }, [stage]);

  return (
    <>
      <SvgDefs />
      <div className="marble" aria-hidden="true" />
      <div className="paper-grain" aria-hidden="true" />
      <canvas ref={ringsCanvas} className="pointer-events-none fixed inset-0 z-[1] size-full" aria-hidden="true" />

      {fontsReady && (
        <main id="site">
          <Hero entered={stage === 'site'} animateIn={returning} webgl={webgl} />
          <Manifesto />
          <Story />
          <TheDate />
          <Programme />
          <Venue />
          <Lookbook />
          <Concierge />
          <Rsvp />
          <Finale />
        </main>
      )}

      <Dock visible={stage === 'site'} />
      <Wipe />
      <Cursor />
      <canvas id="burst" className="pointer-events-none fixed inset-0 z-[970] hidden size-full" aria-hidden="true" />

      {!foilGone && fontsReady && (
        <FoilReveal active={stage === 'foil'} onReveal={() => setStage('site')} onGone={() => setFoilGone(true)} />
      )}
      {!preGone && (
        <Preloader progress={progress} loaded={loaded} quick={returning}
          onOpen={() => setStage(returning ? 'site' : 'foil')} onGone={() => setPreGone(true)} />
      )}
    </>
  );
}
