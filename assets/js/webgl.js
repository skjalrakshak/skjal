/* ═══════════════════════════════════════════════
   SK JALRAKSHAK — WEBGL PARTICLE ENGINE
   Three.js r152 · GLSL Shaders · Cursor Force Field
   ═══════════════════════════════════════════════ */

(function() {
  'use strict';

  if (typeof window.THREE === 'undefined') return;

  // ── GPU TIER DETECTION ──
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  const cores = navigator.hardwareConcurrency || 4;
  const lowTier = isMobile || cores <= 2;

  // ── REDUCED MOTION CHECK ──
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return; // skip WebGL entirely

  const canvas = document.getElementById('webgl');
  if (!canvas) return;

  // ── RENDERER ──
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: false, alpha: true, powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
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

  // ── SCROLL TRACKING & VELOCITY ──
  let scrollProgress = 0;
  let scrollVelocity = 0;
  let lastScrollY = window.scrollY;
  let lastScrollTime = Date.now();
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = h > 0 ? window.scrollY / h : 0;
    
    const now = Date.now();
    const dt = Math.max(1, now - lastScrollTime);
    const dy = window.scrollY - lastScrollY;
    scrollVelocity = Math.min(Math.abs(dy / dt), 1.5); // cap velocity
    lastScrollY = window.scrollY;
    lastScrollTime = now;
  }, { passive: true });

  // ── THEME TRACKING ──
  function isDarkTheme() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  // ═══════════════════════════════════
  // VERTEX SHADER — LIQUID TOPOGRAPHY
  // ═══════════════════════════════════
  const liquidVert = `
    uniform float uTime;
    uniform float uScroll;
    uniform float uVelocity;
    uniform vec2 uMouse;
    
    varying vec2 vUv;
    varying vec3 vPos;
    varying float vElevation;

    // Simplex 3D Noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
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
      vec4 x = x_*ns.x + ns.yyyy;
      vec4 y = y_*ns.x + ns.yyyy;
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
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Calculate complex wave elevation
      float elevation = snoise(vec3(pos.x * 0.8, pos.y * 0.8 + uScroll * 1.5, uTime * 0.2)) * 0.5;
      elevation += snoise(vec3(pos.x * 2.0, pos.y * 2.0 - uTime * 0.1, 0.0)) * 0.15;
      
      // Velocity distortion: wave gets extremely choppy when scrolling fast
      elevation *= (1.0 + uVelocity * 3.0);
      
      // Mouse interaction (localized ripple/bulge)
      float dist = distance(vUv, uMouse * 0.5 + 0.5);
      float influence = smoothstep(0.4, 0.0, dist);
      elevation += influence * 0.6 * sin(dist * 20.0 - uTime * 5.0);

      pos.z += elevation * 3.0; // scale elevation to physical z-height
      
      vElevation = elevation;
      vPos = pos;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  // ═══════════════════════════════════
  // FRAGMENT SHADER — METALLIC / IRIDESCENT
  // ═══════════════════════════════════
  const liquidFrag = `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uOpacity;
    
    varying vec2 vUv;
    varying vec3 vPos;
    varying float vElevation;

    void main() {
      // Base color mix based on elevation (creates topographical lines/shading)
      float mixStrength = (vElevation + 0.5) * 0.8;
      vec3 color = mix(uColorA, uColorB, mixStrength);
      
      // Fake topographical contour lines (creates a techy/data vibe)
      float contour = fract(vElevation * 8.0);
      float lineThickness = smoothstep(0.0, 0.05, contour) - smoothstep(0.05, 0.1, contour);
      color += lineThickness * 0.15; // add subtle lines
      
      // Edge fading for seamless blending into background
      float edgeAlpha = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x) *
                        smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);

      gl_FragColor = vec4(color, uOpacity * edgeAlpha * 0.85);
    }
  `;

  // ═══════════════════════════════════
  // PLANE GEOMETRY (High density)
  // ═══════════════════════════════════
  // Use less segments on mobile to preserve 60fps
  const segments = lowTier ? 64 : 128;
  const geo = new THREE.PlaneGeometry(24, 24, segments, segments);

  // ═══════════════════════════════════
  // MATERIAL
  // ═══════════════════════════════════
  const mat = new THREE.ShaderMaterial({
    vertexShader: liquidVert,
    fragmentShader: liquidFrag,
    uniforms: {
      uTime:    { value: 0 },
      uScroll:  { value: 0 },
      uVelocity:{ value: 0 },
      uMouse:   { value: new THREE.Vector2(0, 0) },
      uColorA:  { value: new THREE.Color(0x0a0a0a) }, // Deep background color
      uColorB:  { value: new THREE.Color(0x2a2a2a) }, // Highlight color
      uOpacity: { value: 1.0 },
    },
    transparent: true,
    wireframe: false, // Set to true for a very cool matrix look, but solid looks more liquid
    depthWrite: false,
    blending: THREE.AdditiveBlending, // Use additive for glowy water
  });

  const liquidPlane = new THREE.Mesh(geo, mat);
  // Tilt the plane so it looks like a surface we are looking across
  liquidPlane.rotation.x = -Math.PI * 0.25; 
  liquidPlane.position.y = -2;
  scene.add(liquidPlane);

  // ═══════════════════════════════════
  // RENDER LOOP — SINGLE RAF
  // ═══════════════════════════════════
  const clock = new THREE.Clock();

  // ── VISIBILITY + INTERSECTION BASED PAUSE ──
  let isVisible = true;
  let isOnScreen = true;

  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
  });

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(([entry]) => {
      isOnScreen = entry.isIntersecting;
    }, { threshold: 0 });
    obs.observe(canvas);
  }

  function animate() {
    requestAnimationFrame(animate);

    if (!isVisible || !isOnScreen) return;

    const elapsed = clock.getElapsedTime();

    // Smooth mouse lerp
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;

    // Smooth scroll velocity decay
    scrollVelocity += (0 - scrollVelocity) * 0.06;

    // Update uniforms
    mat.uniforms.uTime.value = elapsed;
    mat.uniforms.uScroll.value = scrollProgress;
    mat.uniforms.uVelocity.value = scrollVelocity;
    mat.uniforms.uMouse.value.set(mouse.x, mouse.y);

    // Theme-reactive colors
    const dark = isDarkTheme();
    
    // Dark Theme: Deep charcoal liquid with subtle silver/blue highlights
    const darkColorA = new THREE.Color(0.04, 0.04, 0.04);
    const darkColorB = new THREE.Color(0.12, 0.15, 0.18);
    
    // Light Theme: Bright icy water with soft blue highlights
    const lightColorA = new THREE.Color(0.9, 0.92, 0.95);
    const lightColorB = new THREE.Color(0.6, 0.7, 0.85);

    mat.uniforms.uColorA.value.lerp(dark ? darkColorA : lightColorA, 0.05);
    mat.uniforms.uColorB.value.lerp(dark ? darkColorB : lightColorB, 0.05);
    mat.uniforms.uOpacity.value += ((dark ? 0.8 : 0.6) - mat.uniforms.uOpacity.value) * 0.05;
    
    // Change blending mode dynamically (Additive is too bright for light mode)
    mat.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;

    // Camera parallax from mouse
    camera.position.x += (mouse.x * 2.0 - camera.position.x) * 0.03;
    camera.position.y += ((mouse.y * 1.5 + 2.0) - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  // ── RESIZE (throttled) ──
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }, 150);
  });

  // Expose scroll sync for script.js
  window.__webgl = { scrollProgress: (v) => { scrollProgress = v; } };
})();
