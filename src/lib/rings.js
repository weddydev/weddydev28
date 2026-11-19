/* ==========================================================================
   THE RINGS — two interlocked gold rings in real-time 3D (Three.js).
   Ring A: engagement ring with a faceted brilliant and four claws.
   Ring B: a wider champagne-gold wedding band.
   Studio reflections come from RoomEnvironment (no HDR download).
   GSAP choreographs `ringState`; this module only renders it.
   ========================================================================== */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { env } from './utils.js';

export const ringState = { x: 0, y: 0, scale: 1, rx: 0.35, ry: -0.5, sep: 0, spin: 1, opacity: 1, glow: 0 };
export const pointer = { x: 0, y: 0 };

if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (e) => { pointer.x = (e.clientX / window.innerWidth) * 2 - 1; pointer.y = (e.clientY / window.innerHeight) * 2 - 1; }, { passive: true });
}
export function enableGyro() {
  const on = (e) => { if (e.gamma == null) return; pointer.x = Math.max(-1, Math.min(1, e.gamma / 25)); pointer.y = Math.max(-1, Math.min(1, (e.beta - 45) / 25)); };
  const DOE = window.DeviceOrientationEvent;
  if (!DOE) return;
  if (typeof DOE.requestPermission === 'function') DOE.requestPermission().then((s) => s === 'granted' && window.addEventListener('deviceorientation', on, { passive: true })).catch(() => {});
  else window.addEventListener('deviceorientation', on, { passive: true });
}

/* domed band cross-section, revolved around Y */
function band(inner, thick, height, seg) {
  const h = height / 2, pts = [];
  pts.push(new THREE.Vector2(inner, -h * 0.86), new THREE.Vector2(inner, h * 0.86));
  for (let i = 0; i <= 14; i++) {
    const a = Math.PI / 2 - (i / 14) * Math.PI;           // top → bottom over the outer dome
    pts.push(new THREE.Vector2(inner + thick * 0.25 + Math.cos(a) * thick * 0.75, Math.sin(a) * h));
  }
  pts.push(new THREE.Vector2(inner, -h * 0.86));
  const g = new THREE.LatheGeometry(pts, seg);
  g.computeVertexNormals();
  return g;
}

/* round brilliant: culet → pavilion → girdle → crown → table */
function brilliant(r) {
  const pts = [[0.001, -0.62], [r, -0.02], [r, 0.02], [r * 0.82, 0.12], [r * 0.58, 0.22], [0.001, 0.22]].map(([x, y]) => new THREE.Vector2(x, y * r * 2.2));
  return new THREE.LatheGeometry(pts, 16);
}

function starTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.12, 'rgba(255,248,225,.9)'); g.addColorStop(0.4, 'rgba(255,230,170,.15)'); g.addColorStop(1, 'rgba(255,230,170,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  x.globalCompositeOperation = 'lighter';
  [[0, 1], [1, 0]].forEach(([dx, dy]) => {
    const l = x.createLinearGradient(64 - dx * 64, 64 - dy * 64, 64 + dx * 64, 64 + dy * 64);
    l.addColorStop(0, 'rgba(255,255,255,0)'); l.addColorStop(0.5, 'rgba(255,255,255,.95)'); l.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = l;
    if (dx) x.fillRect(0, 62, 128, 4); else x.fillRect(62, 0, 4, 128);
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function createRings(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch { return null; }
  if (!renderer.getContext()) return null;

  const mobile = env.isMobile;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const key = new THREE.DirectionalLight(0xfff3dc, 2.2); key.position.set(3, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.2); rim.position.set(-4, -2, -3); scene.add(rim);

  const gold = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#f0c56c'), metalness: 1, roughness: 0.13, clearcoat: 0.5, clearcoatRoughness: 0.06, envMapIntensity: 1.3 });
  const champagne = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#f6dca6'), metalness: 1, roughness: 0.2, clearcoat: 0.35, clearcoatRoughness: 0.1, envMapIntensity: 1.25 });
  const stone = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#f7f9ff'), metalness: 0.95, roughness: 0.02, flatShading: true, envMapIntensity: 2.8, clearcoat: 1, clearcoatRoughness: 0, iridescence: 0.6, iridescenceIOR: 1.6 });

  const root = new THREE.Group(); scene.add(root);

  // Ring A — engagement ring in the XY plane
  const A = new THREE.Group(); root.add(A);
  const aBand = new THREE.Mesh(band(0.97, 0.11, 0.17, mobile ? 120 : 180), gold);
  aBand.rotation.x = Math.PI / 2; A.add(aBand);
  const head = new THREE.Group(); head.position.set(0, 1.07, 0); A.add(head);
  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.07, 0.16, 24, 1, true), gold); basket.position.y = 0.06; head.add(basket);
  const gem = new THREE.Mesh(brilliant(0.24), stone); gem.position.y = 0.33; head.add(gem);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const claw = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.3, 4, 8), gold);
    claw.position.set(Math.cos(a) * 0.2, 0.26, Math.sin(a) * 0.2);
    claw.lookAt(Math.cos(a) * 0.26, 0.6, Math.sin(a) * 0.26);
    claw.rotateX(Math.PI / 2);
    head.add(claw);
  }
  const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 }));
  glint.position.set(0.05, 0.45, 0.2); glint.scale.setScalar(0.7); head.add(glint);

  // Ring B — wedding band in the XZ plane, threaded through A
  const B = new THREE.Group(); root.add(B);
  const bBand = new THREE.Mesh(band(0.95, 0.12, 0.26, mobile ? 120 : 180), champagne);
  B.add(bBand);

  let w = 0, h = 0, fitScale = 1, visW = 1, visH = 1;
  let resizeTimer = 0;
  const resize = () => {
    w = canvas.clientWidth; h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    visH = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
    visW = visH * camera.aspect;
    fitScale = Math.min(1, (visW * 0.94) / 3.05);
  };
  resize();
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); };
  window.addEventListener('resize', onResize);

  const cur = { x: 0, y: 0 };
  let raf = 0, t0 = performance.now(), last = t0, spinAngle = 0, running = true;
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const s = ringState;
    canvas.style.opacity = String(s.opacity);
    if (s.opacity < 0.01 || document.hidden || !running) return;
    const t = (now - t0) / 1000;
    cur.x += (pointer.x - cur.x) * 0.05; cur.y += (pointer.y - cur.y) * 0.05;
    spinAngle += dt * 0.35 * s.spin;

    const d = 0.5 + s.sep;
    A.position.set(-d, 0, 0);
    B.position.set(d, 0, 0);
    root.position.set((s.x * visW) / 2, (s.y * visH) / 2 + Math.sin(t * 0.9) * 0.06, 0);
    root.scale.setScalar(fitScale * s.scale);
    root.rotation.set(s.rx + cur.y * 0.25 + Math.sin(t * 0.5) * 0.05, s.ry + spinAngle + cur.x * 0.45, Math.sin(t * 0.4) * 0.06);

    const tw = 0.55 + 0.45 * Math.pow(Math.max(0, Math.sin(t * 1.7)), 6) + s.glow;
    glint.scale.setScalar(0.35 + tw * 0.55);
    glint.material.opacity = Math.min(1, 0.4 + tw * 0.6);
    glint.material.rotation = t * 0.3;

    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);

  return {
    pause() { running = false; },
    play() { running = true; },
    destroy() {
      cancelAnimationFrame(raf); clearTimeout(resizeTimer); window.removeEventListener('resize', onResize);
      renderer.dispose(); pmrem.dispose();
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    }
  };
}
