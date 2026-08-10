/* ==========================================================================
   Escavox — Cold Chain Intelligence experience · WebGL scene engine
   Step 2: Scene 1 (network globe + trade-lane arcs) and Scene 2 (chain torus
   that illuminates in sequence and breaks). Single fixed canvas behind the DOM.

   Colour discipline: blue = in spec/connected, orange = warning, red = breach.
   Gates: mobile, prefers-reduced-motion and no-WebGL all keep the static CSS
   fallback and never start the renderer. The DOM already carries all meaning.
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

// Gate: bail to the static CSS fallback under any of these conditions.
if (isMobile || reduce || !webglSupported()) {
  // nothing to do — .canvas-fallback + per-scene ::before tints stay visible.
} else {
  try { start(); } catch (e) { console.warn('[experience] WebGL init failed, using static fallback:', e); }
}

function start() {
  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('webgl-on');   // CSS drops the scene-1/2 tints so particles read cleanly

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(DPR);
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5.4);

  const COL = {
    blue:   new THREE.Color('#00A5E6'),
    blue2:  new THREE.Color('#00B9F1'),
    orange: new THREE.Color('#EF8131'),
    red:    new THREE.Color('#CF5547'),
  };

  const lowPerf = (window.innerWidth < 1100);
  const GLOBE_N = lowPerf ? 8000 : 12000;
  const TORUS_N = lowPerf ? 5500 : 8000;

  /* ---- helpers --------------------------------------------------------- */
  const latLonToVec3 = (lat, lon, r) => {
    const phi = (90 - lat) * Math.PI / 180, theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  };

  const pointFrag = `
    precision mediump float;
    uniform vec3 uColor; varying float vAlpha;
    void main(){
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.0, d);
      gl_FragColor = vec4(uColor, a * vAlpha);
    }`;

  /* ---- Scene 1: network globe ----------------------------------------- */
  const g1 = new THREE.Group(); scene.add(g1);
  g1.position.x = 0.95; g1.scale.setScalar(0.92);   // sit to the right; copy stays dominant

  const gPos = new Float32Array(GLOBE_N * 3);
  const gPhase = new Float32Array(GLOBE_N);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < GLOBE_N; i++) {
    const y = 1 - (i / (GLOBE_N - 1)) * 2, r = Math.sqrt(1 - y * y), t = golden * i;
    gPos[i*3] = Math.cos(t) * r * 1.6; gPos[i*3+1] = y * 1.6; gPos[i*3+2] = Math.sin(t) * r * 1.6;
    gPhase[i] = Math.random();
  }
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
  gGeo.setAttribute('aPhase', new THREE.BufferAttribute(gPhase, 1));
  const gMat = new THREE.ShaderMaterial({
    uniforms: { uTime:{value:0}, uSize:{value: DPR*9.0}, uOpacity:{value:1}, uColor:{value: COL.blue2} },
    vertexShader: `
      uniform float uTime, uSize, uOpacity; attribute float aPhase; varying float vAlpha;
      void main(){
        vec3 p = position + normalize(position) * sin(uTime*0.6 + aPhase*6.2831)*0.02;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        gl_PointSize = uSize / -mv.z;
        gl_Position = projectionMatrix * mv;
        vAlpha = uOpacity * (0.28 + 0.30*sin(uTime*0.9 + aPhase*6.2831));
      }`,
    fragmentShader: pointFrag,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  g1.add(new THREE.Points(gGeo, gMat));

  // Trade-lane arcs: southern Africa → Europe, UK, Middle East, SE Asia.
  const SA = latLonToVec3(-30, 22, 1.6);
  const dests = [ latLonToVec3(50,10,1.6), latLonToVec3(54,-2,1.6), latLonToVec3(25,50,1.6), latLonToVec3(6,110,1.6) ];
  const arcMats = [];
  dests.forEach((d, k) => {
    const mid = SA.clone().add(d).multiplyScalar(0.5).setLength(1.6 + 0.55);
    const curve = new THREE.QuadraticBezierCurve3(SA, mid, d);
    const N = 120, pos = new Float32Array(N*3), tt = new Float32Array(N);
    curve.getPoints(N-1).forEach((p,i)=>{ pos[i*3]=p.x; pos[i*3+1]=p.y; pos[i*3+2]=p.z; tt[i]=i/(N-1); });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    geo.setAttribute('aT', new THREE.BufferAttribute(tt,1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uHead:{value:-0.2}, uColor:{value: COL.blue2}, uOpacity:{value:1} },
      vertexShader: `
        uniform float uHead, uOpacity; attribute float aT; varying float vA;
        void main(){
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
          float behind = smoothstep(0.18, 0.0, uHead - aT);      // trail behind the head
          float ahead  = step(aT, uHead);
          vA = uOpacity * behind * ahead;
        }`,
      fragmentShader: `precision mediump float; uniform vec3 uColor; varying float vA;
        void main(){ if(vA<=0.01) discard; gl_FragColor = vec4(uColor, vA); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const line = new THREE.Line(geo, mat);
    g1.add(line); arcMats.push({ mat, offset: k * 0.9 });
  });

  /* ---- Scene 2: the chain torus --------------------------------------- */
  const g2 = new THREE.Group(); g2.rotation.x = -0.5; g2.visible = false; scene.add(g2);

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
      uTime:{value:0}, uSize:{value: DPR*10.0}, uOpacity:{value:0}, uReveal:{value:0},
      uBlue:{value: COL.blue}, uOrange:{value: COL.orange}, uRed:{value: COL.red},
    },
    vertexShader: `
      uniform float uTime,uSize,uReveal; attribute float aAngle,aRand;
      varying float vAngle;
      void main(){
        vec3 p = position;
        float brk = smoothstep(0.05,0.0,abs(aAngle-0.82)) * smoothstep(0.75,1.0,uReveal);
        p += normalize(vec3(position.x,position.y,0.0)) * brk * 0.7;   // ring breaks outward
        p += normalize(position) * sin(uTime*0.8 + aRand*6.2831)*0.012;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        gl_PointSize = uSize / -mv.z;
        gl_Position = projectionMatrix * mv;
        vAngle = aAngle;
      }`,
    fragmentShader: `
      precision mediump float;
      uniform vec3 uBlue,uOrange,uRed; uniform float uReveal,uOpacity;
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

  // Acts 1→2 crossfade + torus reveal, scrubbed across hero..chain.
  ScrollTrigger.create({
    trigger: heroEl, start: 'top top', endTrigger: chainEl, end: 'bottom bottom', scrub: true,
    onUpdate: (self) => {
      const p = self.progress;                         // 0 at hero top → 1 at chain bottom
      const cross = THREE.MathUtils.clamp((p - 0.34) / 0.16, 0, 1);
      gMat.uniforms.uOpacity.value = 1 - cross;
      tMat.uniforms.uOpacity.value = cross;
      g2.visible = cross > 0.001;
      tMat.uniforms.uReveal.value = THREE.MathUtils.clamp((p - 0.5) / 0.48, 0, 1);
      camera.position.z = 5.4 - cross * 1.9;           // ease inward toward the ring
    },
  });

  // Fade the whole canvas out as scene 3 (field) arrives; the CSS tints take over.
  ScrollTrigger.create({
    trigger: fieldEl, start: 'top bottom', end: 'top top', scrub: true,
    onUpdate: (self) => { canvas.style.opacity = String(1 - self.progress); },
  });

  /* ---- Lenis smooth scroll (optional enhancement) --------------------- */
  (async () => {
    try {
      const { default: Lenis } = await import('lenis');
      const lenis = new Lenis({ lerp: 0.1 });
      lenis.on('scroll', ScrollTrigger.update);
      const loop = (t) => { lenis.raf(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    } catch (e) { /* smooth scroll is a nice-to-have; native scroll is fine */ }
  })();

  /* ---- Render loop ----------------------------------------------------- */
  const clock = new THREE.Clock();
  function tick() {
    const t = clock.getElapsedTime();
    gMat.uniforms.uTime.value = t;
    tMat.uniforms.uTime.value = t;
    g1.rotation.y = t * 0.06;
    arcMats.forEach(({ mat, offset }) => {
      mat.uniforms.uHead.value = ((t * 0.28 + offset) % 1.6) - 0.2; // draw then fade, looping
    });
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
