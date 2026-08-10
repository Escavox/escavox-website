/* ==========================================================================
   Escavox — Cold Chain Intelligence experience · WebGL scene engine
   Scene 1: iridescent "shell" — a flowing curtain of particle strands
            (every strand a track in motion). Blue = in spec / connected.
   Scene 2: the chain torus — segments illuminate in sequence, one flares
            orange→red and the ring breaks (quality lost at a link).
   Single fixed canvas behind the DOM. Colour discipline: orange/red only
   where a threshold is crossed. Mobile / reduced-motion / no-WebGL keep the
   static CSS fallback and never start the renderer.
   ========================================================================== */

import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

const canvas   = document.getElementById('scene-canvas');
const reduce   = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 767px)').matches;

function webglSupported() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}

if (isMobile || reduce || !webglSupported()) {
  // static CSS fallback stays; no renderer.
} else {
  try { start(); } catch (e) { console.warn('[experience] WebGL init failed, using static fallback:', e); }
}

function start() {
  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('webgl-on');

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(DPR);
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 3.8);

  const COL = {
    blue:   new THREE.Color('#00A5E6'),
    blue2:  new THREE.Color('#00B9F1'),
    deep:   new THREE.Color('#0A3A63'),
    orange: new THREE.Color('#EF8131'),
    red:    new THREE.Color('#CF5547'),
  };

  const lowPerf = (window.innerWidth < 1100);

  /* ---- Scene 1: iridescent shell (particle curtain) ------------------- */
  const g1 = new THREE.Group(); scene.add(g1);

  const COLS = lowPerf ? 200 : 280;               // vertical strands
  const ROWS = lowPerf ? 48 : 68;                 // points per strand
  const N1 = COLS * ROWS;
  const cPos = new Float32Array(N1 * 3), cUV = new Float32Array(N1 * 2), cRand = new Float32Array(N1);
  let ix = 0;
  for (let ci = 0; ci < COLS; ci++) {
    for (let ri = 0; ri < ROWS; ri++) {
      const u = ci / (COLS - 1), v = ri / (ROWS - 1);
      cPos[ix*3]   = (u - 0.5) * 7.0;
      cPos[ix*3+1] = (v - 0.5) * 3.6;
      cPos[ix*3+2] = 0;
      cUV[ix*2] = u; cUV[ix*2+1] = v;
      cRand[ix] = Math.random();
      ix++;
    }
  }
  const cGeo = new THREE.BufferGeometry();
  cGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3));
  cGeo.setAttribute('aUV', new THREE.BufferAttribute(cUV, 2));
  cGeo.setAttribute('aRand', new THREE.BufferAttribute(cRand, 1));
  const gMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:{value:0}, uSize:{value: DPR*9.0}, uOpacity:{value:1},
      uBlue:{value: COL.blue}, uBlue2:{value: COL.blue2}, uDeep:{value: COL.deep},
    },
    vertexShader: `
      uniform float uTime, uSize; attribute vec2 aUV; attribute float aRand;
      varying vec2 vUV; varying float vGlow;
      void main(){
        vec3 p = position;
        float t = uTime;
        // coherent horizontal waves across strands + a depth ripple = flowing shell
        float wave = sin(aUV.x*9.0 + t*0.55)*0.42 + sin(aUV.x*20.0 - t*0.35)*0.14;
        p.z += wave + sin(aUV.y*3.5 + t*0.5)*0.18;
        p.x += sin(aUV.y*6.0 + aUV.x*12.0 + t*0.5)*0.05;   // gentle comb sway
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        gl_PointSize = uSize / -mv.z;
        gl_Position = projectionMatrix * mv;
        vUV = aUV;
        vGlow = 0.3 + (0.4 + 0.6*sin(t*0.8 + aRand*6.2831)) * (0.5 + 0.5*(wave+0.5));
      }`,
    fragmentShader: `
      precision mediump float; uniform vec3 uBlue,uBlue2,uDeep; uniform float uOpacity;
      varying vec2 vUV; varying float vGlow;
      void main(){
        float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
        vec3 col = mix(uDeep, uBlue, smoothstep(0.0,0.7,vUV.y));
        col = mix(col, uBlue2, smoothstep(0.6,1.0,vUV.y));
        gl_FragColor = vec4(col, a * vGlow * uOpacity * 1.5);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  g1.add(new THREE.Points(cGeo, gMat));

  /* ---- Scene 2: the chain torus --------------------------------------- */
  const g2 = new THREE.Group(); g2.rotation.x = -0.5; g2.visible = false; scene.add(g2);

  const TORUS_N = lowPerf ? 6000 : 9000;
  const R = 1.5, rr = 0.42;
  const tPos = new Float32Array(TORUS_N*3), tAng = new Float32Array(TORUS_N), tRand = new Float32Array(TORUS_N);
  for (let i = 0; i < TORUS_N; i++) {
    const u = Math.random()*Math.PI*2, v = Math.random()*Math.PI*2;
    tPos[i*3]   = (R + rr*Math.cos(v)) * Math.cos(u);
    tPos[i*3+1] = (R + rr*Math.cos(v)) * Math.sin(u);
    tPos[i*3+2] = rr * Math.sin(v);
    tAng[i] = u / (Math.PI*2);
    tRand[i] = Math.random();
  }
  const tGeo = new THREE.BufferGeometry();
  tGeo.setAttribute('position', new THREE.BufferAttribute(tPos,3));
  tGeo.setAttribute('aAngle', new THREE.BufferAttribute(tAng,1));
  tGeo.setAttribute('aRand', new THREE.BufferAttribute(tRand,1));
  const tMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:{value:0}, uSize:{value: DPR*9.0}, uOpacity:{value:0}, uReveal:{value:0},
      uBlue:{value: COL.blue}, uOrange:{value: COL.orange}, uRed:{value: COL.red},
    },
    vertexShader: `
      uniform float uTime,uSize,uReveal; attribute float aAngle,aRand; varying float vAngle;
      void main(){
        vec3 p = position;
        float brk = smoothstep(0.05,0.0,abs(aAngle-0.82)) * smoothstep(0.75,1.0,uReveal);
        p += normalize(vec3(position.x,position.y,0.0)) * brk * 0.7;
        p += normalize(position) * sin(uTime*0.8 + aRand*6.2831)*0.012;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        gl_PointSize = uSize / -mv.z;
        gl_Position = projectionMatrix * mv;
        vAngle = aAngle;
      }`,
    fragmentShader: `
      precision mediump float; uniform vec3 uBlue,uOrange,uRed; uniform float uReveal,uOpacity;
      varying float vAngle;
      void main(){
        float a = smoothstep(0.5,0.0,length(gl_PointCoord-0.5));
        float lit = step(vAngle, uReveal);
        vec3 col = mix(uBlue*0.28, uBlue, lit);
        float warn = smoothstep(0.09,0.0,abs(vAngle-0.82));
        col = mix(col, uOrange, warn*smoothstep(0.6,0.85,uReveal));
        col = mix(col, uRed,    warn*smoothstep(0.85,1.0,uReveal));
        gl_FragColor = vec4(col, a*uOpacity);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  g2.add(new THREE.Points(tGeo, tMat));

  /* ---- Scroll orchestration ------------------------------------------- */
  const heroEl  = document.querySelector('.scene-hero');
  const chainEl = document.querySelector('.scene-chain');
  const fieldEl = document.querySelector('.scene-field');

  ScrollTrigger.create({
    trigger: heroEl, start: 'top top', endTrigger: chainEl, end: 'bottom bottom', scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      const cross = THREE.MathUtils.clamp((p - 0.34) / 0.16, 0, 1);
      gMat.uniforms.uOpacity.value = 1 - cross;
      tMat.uniforms.uOpacity.value = cross;
      g2.visible = cross > 0.001;
      g1.visible = cross < 0.999;
      tMat.uniforms.uReveal.value = THREE.MathUtils.clamp((p - 0.5) / 0.48, 0, 1);
      camera.position.z = 3.8 - cross * 1.5;   // ease inward toward the ring
    },
  });

  ScrollTrigger.create({
    trigger: fieldEl, start: 'top bottom', end: 'top top', scrub: true,
    onUpdate: (self) => { canvas.style.opacity = String(1 - self.progress); },
  });

  /* ---- Lenis smooth scroll (optional) --------------------------------- */
  (async () => {
    try {
      const { default: Lenis } = await import('lenis');
      const lenis = new Lenis({ lerp: 0.1 });
      lenis.on('scroll', ScrollTrigger.update);
      const loop = (t) => { lenis.raf(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    } catch (e) { /* native scroll is fine */ }
  })();

  /* ---- Render loop ----------------------------------------------------- */
  const clock = new THREE.Clock();
  function tick() {
    const t = clock.getElapsedTime();
    gMat.uniforms.uTime.value = t;
    tMat.uniforms.uTime.value = t;
    g2.rotation.z = t * 0.04;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  /* ---- Resize ---------------------------------------------------------- */
  let rz;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      ScrollTrigger.refresh();
    }, 150);
  });
}
