/* ═══════════════════════════════════════════════
   SK JALRAKSHAK — WEBGL PARTICLE ENGINE
   Three.js r152 · GLSL Shaders · Cursor Force Field
   ═══════════════════════════════════════════════ */

(function() {
  'use strict';

  // ── GPU TIER DETECTION ──
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  const cores = navigator.hardwareConcurrency || 4;
  const lowTier = isMobile || cores <= 2;
  const PARTICLE_COUNT = lowTier ? 40000 : 150000;

  // ── REDUCED MOTION CHECK ──
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return; // skip WebGL entirely

  const canvas = document.getElementById('webgl');
  if (!canvas) return;

  // ── RENDERER ──
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: false, alpha: true, powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // ── SCENE + CAMERA ──
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 12);

  // ── MOUSE TRACKING ──
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  document.addEventListener('mousemove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
  }, { passive: true });

  // ── SCROLL TRACKING ──
  let scrollProgress = 0;
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = h > 0 ? window.scrollY / h : 0;
  }, { passive: true });

  // ── THEME TRACKING ──
  function isDarkTheme() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  // ═══════════════════════════════════
  // VERTEX SHADER — PARTICLE SYSTEM
  // ═══════════════════════════════════
  const particleVert = `
    uniform float uTime;
    uniform float uScroll;
    uniform vec2 uMouse;
    uniform float uRepel;
    uniform float uSpread;
    attribute float aRandom;
    attribute float aPhase;
    attribute float aSize;
    varying float vAlpha;
    varying float vRandom;

    // Simplex noise helpers
    vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314*r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }

    void main() {
      vRandom = aRandom;
      vec3 pos = position;

      // Noise displacement — organic flow
      float t = uTime * 0.15 + aPhase;
      float noiseScale = 0.3;
      pos.x += snoise(vec3(pos.x*noiseScale, pos.y*noiseScale, t)) * 0.6 * uSpread;
      pos.y += snoise(vec3(pos.y*noiseScale, pos.z*noiseScale, t + 100.0)) * 0.6 * uSpread;
      pos.z += snoise(vec3(pos.z*noiseScale, pos.x*noiseScale, t + 200.0)) * 0.3;

      // Scroll: spread particles outward
      pos *= 1.0 + uScroll * 0.4;
      pos.y -= uScroll * 3.0;

      // Cursor repulsion force field
      vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
      vec4 projected = projectionMatrix * mvPos;
      vec2 screen = projected.xy / projected.w;
      vec2 toMouse = screen - uMouse;
      float dist = length(toMouse);
      float radius = 0.4;
      float force = uRepel * smoothstep(radius, 0.0, dist) * 2.0;
      pos.x += toMouse.x * force;
      pos.y += toMouse.y * force;

      // Depth-based alpha
      float depth = length(mvPos.xyz);
      vAlpha = smoothstep(20.0, 2.0, depth) * (0.3 + aRandom * 0.7);
      vAlpha *= 1.0 - uScroll * 0.3;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = aSize * (300.0 / depth);
    }
  `;

  // ═══════════════════════════════════
  // FRAGMENT SHADER — SOFT CIRCLES
  // ═══════════════════════════════════
  const particleFrag = `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vAlpha;
    varying float vRandom;

    void main() {
      // Circular point sprite with soft edges
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      if (dist > 0.5) discard;

      float alpha = smoothstep(0.5, 0.1, dist) * vAlpha * uOpacity;

      // Slight color variation per particle
      vec3 col = uColor + vRandom * 0.08;

      gl_FragColor = vec4(col, alpha);
    }
  `;

  // ═══════════════════════════════════
  // PARTICLE GEOMETRY
  // ═══════════════════════════════════
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const randoms = new Float32Array(PARTICLE_COUNT);
  const phases = new Float32Array(PARTICLE_COUNT);
  const sizes = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Distribute in a sphere-like volume
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.pow(Math.random(), 0.5) * 12;
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi) - 4;
    randoms[i] = Math.random();
    phases[i] = Math.random() * Math.PI * 2;
    sizes[i] = 0.8 + Math.random() * 2.5;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  // ═══════════════════════════════════
  // MATERIAL
  // ═══════════════════════════════════
  const mat = new THREE.ShaderMaterial({
    vertexShader: particleVert,
    fragmentShader: particleFrag,
    uniforms: {
      uTime:    { value: 0 },
      uScroll:  { value: 0 },
      uMouse:   { value: new THREE.Vector2(0, 0) },
      uRepel:   { value: 1.0 },
      uSpread:  { value: 1.0 },
      uColor:   { value: new THREE.Color(0.45, 0.45, 0.45) },
      uOpacity: { value: 0.65 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // ═══════════════════════════════════
  // RENDER LOOP — SINGLE RAF
  // ═══════════════════════════════════
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Smooth mouse lerp
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;

    // Update uniforms
    mat.uniforms.uTime.value = elapsed;
    mat.uniforms.uScroll.value = scrollProgress;
    mat.uniforms.uMouse.value.set(mouse.x, mouse.y);

    // Theme-reactive colors
    const dark = isDarkTheme();
    const targetColor = dark
      ? new THREE.Color(0.4, 0.4, 0.4)
      : new THREE.Color(0.15, 0.12, 0.1);
    mat.uniforms.uColor.value.lerp(targetColor, 0.05);
    mat.uniforms.uOpacity.value += ((dark ? 0.6 : 0.3) - mat.uniforms.uOpacity.value) * 0.05;

    // Camera parallax from mouse
    camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.03;
    camera.position.y += (mouse.y * 0.8 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    // Slow rotation
    particles.rotation.y = elapsed * 0.02;
    particles.rotation.x = Math.sin(elapsed * 0.01) * 0.1;

    renderer.render(scene, camera);
  }

  animate();

  // ── RESIZE ──
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Expose scroll sync for script.js
  window.__webgl = { scrollProgress: (v) => { scrollProgress = v; } };
})();
