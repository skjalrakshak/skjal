/* ═══ SK JALRAKSHAK — ANIMATION ENGINE v6 ═══ */

// ── LENIS ──
const lenis = new Lenis({
  duration: 1.3,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true, mouseMultiplier: 0.7,
  smoothTouch: false, touchMultiplier: 2,
});
// Let GSAP Ticker handle Lenis for perfect sync and performance
// function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
// requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ═══════════════════════
// 1. CINEMATIC THEME TOGGLE (Dual-Blade Warp Shutter)
// ═══════════════════════
let toggleBusy = false;
const THEME_BG = { dark: '#0a0a0a', light: '#ffffff' };

function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_BG[t]);
  localStorage.setItem('skj-theme', t);
}

// Restore saved theme before paint
(function() {
  const saved = localStorage.getItem('skj-theme');
  if (saved) setTheme(saved);
})();

document.getElementById('themeToggle')?.addEventListener('click', (e) => {
  if (toggleBusy) return;
  toggleBusy = true;

  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';

  // Get toggle button center coordinates
  const btn = document.getElementById('themeToggle');
  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  // Satisfying button press micro-animation
  gsap.timeline()
    .to(btn, { scale: 0.75, duration: 0.12, ease: 'power3.in' })
    .to(btn, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });

  // Calculate max radius to cover every corner of the screen
  const maxR = Math.ceil(Math.hypot(
    Math.max(cx, window.innerWidth - cx),
    Math.max(cy, window.innerHeight - cy)
  ));

  // ── Glow halo (expands slightly ahead, creates frosted edge depth) ──
  const glowColor = next === 'dark'
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(0,0,0,0.04)';
  const halo = document.createElement('div');
  halo.style.cssText = `
    position: fixed; inset: 0; z-index: 9997;
    pointer-events: none;
    background: radial-gradient(circle at ${cx}px ${cy}px,
      transparent 0%, ${glowColor} 98%, transparent 100%
    );
    clip-path: circle(0px at ${cx}px ${cy}px);
    will-change: clip-path;
  `;

  // ── Main reveal circle ──
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9998;
    background: ${THEME_BG[next]};
    pointer-events: none;
    clip-path: circle(0px at ${cx}px ${cy}px);
    will-change: clip-path;
  `;

  document.body.appendChild(halo);
  document.body.appendChild(overlay);

  const tl = gsap.timeline({
    onComplete: () => {
      overlay.remove();
      halo.remove();
      toggleBusy = false;
    }
  });

  // Halo leads slightly ahead — creates the glowing edge effect
  tl.to(halo, {
    clipPath: `circle(${maxR * 1.15}px at ${cx}px ${cy}px)`,
    duration: 1.0,
    ease: 'power3.out',
  }, 0);

  // Main circle expands with premium easing
  tl.to(overlay, {
    clipPath: `circle(${maxR}px at ${cx}px ${cy}px)`,
    duration: 0.85,
    ease: 'power3.inOut',
  }, 0.04);

  // Switch theme at ~70% expansion (circle already covers viewport)
  tl.call(() => setTheme(next), null, 0.6);

  // ── SMOOTH DISSOLVE: overlay fades out gracefully after full coverage ──
  tl.to(overlay, {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out',
  }, 0.85);

  // Halo fades out softly
  tl.to(halo, {
    opacity: 0,
    duration: 0.4,
    ease: 'power2.out',
  }, 0.8);
});

// ═══════════════════════
// 2. CINEMATIC PRELOADER (Film-Grade v2 — Full Dark Cinema)
// ═══════════════════════
lenis.stop();

// Generate enhanced ambient particle field
// (Particles removed per user request — clean dark background)
(function generateParticles() {
  // Intentionally empty — no particles
})();

const preloaderTL = gsap.timeline({
  onComplete: () => {
    lenis.start();
    const pre = document.getElementById('preloader');
    if (pre) {
      pre.style.pointerEvents = 'none';
      // Allow GPU to reclaim memory
      requestAnimationFrame(() => { pre.style.display = 'none'; });
    }
    ScrollTrigger.refresh();
  }
});

const counterObj = { val: 0 };
const counterEl = document.getElementById('preCounter');
const progressLine = document.querySelector('#preProgressLine');

// ── PRELOADER MASTER TIMELINE ──
preloaderTL
  // Phase 1: Logo mark — dramatic scale-in with elastic spring + subtle rotation
  .to('.pre-logo-mark', {
    opacity: 1, scale: 1, rotate: 0,
    duration: 1.4,
    ease: 'elastic.out(1.1, 0.45)',
  }, 0.2)
  // Phase 2: Progress bar and bottom info slide in
  .to('.pre-progress-line', {
    opacity: 1, duration: 0.6, ease: 'power2.out',
  }, 0.5)
  .to('.pre-bottom', {
    opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
  }, 0.6)
  // Phase 3: Counter — cinematic count with custom easing
  .to(counterObj, {
    val: 100, duration: 3.0,
    ease: 'power2.inOut',
    onUpdate: () => {
      const pct = Math.floor(counterObj.val);
      if (counterEl) counterEl.innerText = pct + '%';
      if (progressLine) progressLine.style.setProperty('--pre-fill', pct + '%');
    }
  }, 0.5)
  // Phase 4: Characters cascade in with 3D depth rotation + stagger
  .to('.pre-char', {
    opacity: 1, y: '0%', scale: 1, rotateX: 0,
    duration: 1.4,
    stagger: { each: 0.045, from: 'start' },
    ease: 'elastic.out(1, 0.35)',
  }, 0.7)
  // Phase 5: Tagline drifts in with a silky fade
  .to('#preTagline', {
    opacity: 0.5, y: 0,
    duration: 1.0, ease: 'power2.out',
  }, 1.4)
  // ── HOLD — dramatic beat (audience absorbs the brand) ──
  // Phase 6: Exit sequence — characters fly upward with blur
  .to('.pre-char', {
    opacity: 0, y: '-130%', scale: 1.15,
    filter: 'blur(6px)',
    duration: 0.5,
    stagger: { each: 0.025, from: 'end' },
    ease: 'power4.in',
  }, 3.6)
  .to('#preTagline', {
    opacity: 0, y: -24, filter: 'blur(4px)',
    duration: 0.4, ease: 'power4.in',
  }, 3.6)
  // Phase 7: Logo mark implodes with spin
  .to('.pre-logo-mark', {
    scale: 0.05, opacity: 0, rotate: 200,
    duration: 0.9, ease: 'power4.inOut',
  }, 3.5)
  // Phase 8: Progress bar + bottom collapse
  .to('.pre-progress-line', {
    opacity: 0, scaleX: 0, transformOrigin: 'center',
    duration: 0.5, ease: 'power4.in',
  }, 3.5)
  .to('.pre-bottom', {
    opacity: 0, y: -20, duration: 0.4, ease: 'power4.in',
  }, 3.6)
  // Phase 9: CINEMATIC SWIPE REVEAL — preloader slides up like a curtain
  .set('#preloader', {
    transformOrigin: 'top center',
    willChange: 'transform',
  }, 3.9)
  .to('#preloader', {
    yPercent: -100,
    duration: 1.4,
    ease: 'power4.inOut',
  }, 3.9)
  // Phase 10: Hero lines sweep in from below — overlapping with swipe for fluid motion
  .to('.hero-line', {
    y: '0%', duration: 1.6,
    stagger: { each: 0.1, from: 'start' },
    ease: 'expo.out',
  }, 4.1)
  .to('.hero-fade', {
    opacity: 1, y: 0,
    duration: 1.2, ease: 'power3.out',
  }, 4.5);

// ═══════════════════════
// 3. NAVBAR
// ═══════════════════════
ScrollTrigger.create({
  start: 'top -60',
  onUpdate: (self) => document.getElementById('navbar').classList.toggle('scrolled', self.progress > 0)
});

// Hide navbar/logo/top-right at footer
(function initFooterHide() {
  const footer = document.querySelector('footer');
  if (!footer) return;
  const navbar = document.getElementById('navbar');
  const siteLogo = document.getElementById('siteLogo');
  const topRight = document.getElementById('topRightActions');
  ScrollTrigger.create({
    trigger: footer,
    start: 'top 90%',
    end: 'bottom bottom',
    onEnter: () => {
      navbar?.classList.add('nav-hidden');
      siteLogo?.classList.add('logo-hidden');
      topRight?.classList.add('tr-hidden');
    },
    onLeaveBack: () => {
      navbar?.classList.remove('nav-hidden');
      siteLogo?.classList.remove('logo-hidden');
      topRight?.classList.remove('tr-hidden');
    },
  });
})();

// ═══════════════════════
// 14. NAVBAR HIDE ON SCROLL
// ═══════════════════════
const siteLogo = document.getElementById('siteLogo');
const topRightActions = document.getElementById('topRightActions');
const navbar = document.getElementById('navbar');

let lastScrollY = window.scrollY;
let scrollTicking = false;

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      
      // Hide permanently if past 100vh
      if (currentScrollY > window.innerHeight) {
        siteLogo?.classList.add('logo-hidden');
        topRightActions?.classList.add('tr-hidden');
        navbar?.classList.add('nav-hidden');
      } else {
        // Show when in the first 100vh
        siteLogo?.classList.remove('logo-hidden');
        topRightActions?.classList.remove('tr-hidden');
        navbar?.classList.remove('nav-hidden');
      }
      
      // Add scrolled background effect
      if (currentScrollY > 50) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
      
      lastScrollY = currentScrollY;
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

const navPills = document.getElementById('navPills');
const navCursor = document.getElementById('navCursor');
const navLinks = document.querySelectorAll('.nav-link');

if (navPills && navCursor) {
  function moveCursor(link) {
    const r = link.getBoundingClientRect();
    const p = navPills.getBoundingClientRect();
    navCursor.style.width = r.width + 'px';
    navCursor.style.transform = `translateX(${r.left - p.left}px)`;
    navCursor.style.opacity = '1';
    navLinks.forEach(l => l.classList.remove('is-hovered'));
    link.classList.add('is-hovered');
  }
  navLinks.forEach(l => l.addEventListener('mouseenter', () => moveCursor(l)));
  navPills.addEventListener('mouseleave', () => {
    navCursor.style.opacity = '0';
    navLinks.forEach(l => l.classList.remove('is-hovered'));
  });
}

// ═══════════════════════
// 4. SCROLL PROGRESS
// ═══════════════════════
const progressBar = document.getElementById('scrollProgress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (window.scrollY / h * 100) + '%';
  }, { passive: true });
}

// ═══════════════════════
// 5. SCROLL REVEALS (Cinematic Split-Text + Cascade)
// ═══════════════════════
document.querySelectorAll('.gs-reveal').forEach(el => {
  if (el.tagName.match(/^H[1-6]$/) || el.classList.contains('sec-title') || el.classList.contains('sys-name')) {
    // Cinematic Split-Text with word-level stagger
    const text = el.innerText;
    el.innerHTML = '';
    const words = text.split(' ');
    words.forEach((word) => {
      const wSpan = document.createElement('span');
      wSpan.className = 'split-line';
      const cSpan = document.createElement('span');
      cSpan.className = 'split-char';
      cSpan.innerText = word;
      wSpan.appendChild(cSpan);
      el.appendChild(wSpan);
      el.appendChild(document.createTextNode(' '));
    });
    gsap.fromTo(el.querySelectorAll('.split-char'), { y: '130%', opacity: 0, rotateX: 15 }, {
      y: '0%', opacity: 1, rotateX: 0,
      duration: 1.2,
      stagger: { each: 0.04, from: 'start' },
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
    });
  } else {
    // Standard Reveal with subtle scale
    gsap.fromTo(el, { y: 50, opacity: 0, scale: 0.98 }, {
      y: 0, opacity: 1, scale: 1,
      duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
    });
  }
});

// ═══════════════════════
// 6. SYSTEMS cascade slide-in
// ═══════════════════════
document.querySelectorAll('.sys-row').forEach((row, i) => {
  gsap.fromTo(row, { opacity: 0, x: -25, filter: 'blur(3px)' }, {
    opacity: 1, x: 0, filter: 'blur(0px)',
    duration: 0.9,
    delay: i * 0.06,
    ease: 'power3.out',
    scrollTrigger: { trigger: row, start: 'top 88%', toggleActions: 'play none none none' }
  });
});

// ═══════════════════════
// 7. TESTIMONIALS blur reveal
// ═══════════════════════
const testimonialSec = document.getElementById('testimonials');
const systemsSec = document.getElementById('systems');

if (testimonialSec) {
  const mw = document.getElementById('marqueeWrap') || document.querySelector('.testi-list');
  if (mw) {
    gsap.fromTo(mw, { opacity:0, y:50 }, {
      opacity:1, y:0, duration:1.2, ease:'power2.out',
      scrollTrigger: { trigger:testimonialSec, start:'top 60%', toggleActions:'play none none reverse' }
    });
  }
}

// ═══════════════════════
// 8. STATS pop-in
// ═══════════════════════
document.querySelectorAll('.stat').forEach((s, i) => {
  gsap.fromTo(s, { y:25, opacity:0 }, {
    y:0, opacity:1, duration:.6, delay:i*.08, ease:'power2.out',
    scrollTrigger: { trigger:s, start:'top 92%', toggleActions:'play none none none' }
  });
});

// ═══════════════════════
// 9. CTA scale reveal
// ═══════════════════════
const ctaTitle = document.querySelector('.cta-title');
if (ctaTitle) {
  gsap.fromTo(ctaTitle, { scale:0.88, opacity:0 }, {
    scale:1, opacity:1, duration:1, ease:'power3.out',
    scrollTrigger: { trigger:ctaTitle, start:'top 80%', toggleActions:'play none none none' }
  });
}

// ═══════════════════════
// 10. PARALLAX headings
// ═══════════════════════
document.querySelectorAll('.sec-title-lg').forEach(h => {
  gsap.fromTo(h, { y:20 }, {
    y:-15, ease:'none',
    scrollTrigger: { trigger:h, start:'top bottom', end:'bottom top', scrub:0.6 }
  });
});

// ═══════════════════════
// 11. SMOOTH ANCHOR
// ═══════════════════════
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const overlay = document.querySelector('.page-transition-overlay');
      const isMobile = window.innerWidth < 768;
      
      if(overlay && !isMobile) {
        gsap.timeline()
          .to(overlay, { y: '0%', duration: 0.6, ease: 'power3.inOut' })
          .call(() => { lenis.scrollTo(target, { offset: -80, immediate: true }); })
          .to(overlay, { y: '100%', duration: 0.6, ease: 'power3.inOut', delay: 0.1 })
          .set(overlay, { y: '-100%' });
      } else {
        lenis.scrollTo(target, { offset: -80 });
      }
    }
  });
});

// ═══════════════════════
// 12. FLOATING HERO MEDIA
// ═══════════════════════
const hero = document.getElementById('hero');
const fm1 = document.querySelector('.fm-1');
const fm2 = document.querySelector('.fm-2');

if (hero && fm1 && fm2) {
  // Parallax on scroll
  gsap.to(fm1, { y: 80, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to(fm2, { y: -60, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });

  // Subtle mouse movement
  hero.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 40;
    const y = (clientY / window.innerHeight - 0.5) * 40;
    
    gsap.to(fm1, { x: x, y: y, duration: 1, ease: 'power2.out', overwrite: 'auto' });
    gsap.to(fm2, { x: -x * 1.5, y: -y * 1.5, duration: 1, ease: 'power2.out', overwrite: 'auto' });
  });
}

// ═══════════════════════
// 13. CLIP REVEALS
// ═══════════════════════
// document.querySelectorAll('.gs-clip-reveal').forEach(el => {
//   const media = el.querySelector('img, video');
//   if (media) gsap.set(media, { scale: 1.2 });
//   
//   gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, {
//     clipPath: 'inset(0% 0 0 0)',
//     duration: 1.4, ease: 'power3.out',
//     scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
//   });
//   
//   if (media) {
//     gsap.to(media, {
//       scale: 1, duration: 1.4, ease: 'power3.out',
//       scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
//     });
//   }
// });

// ═══════════════════════
// 14. FLOWART STORY SCROLL (Pinning + Rotation)
// ═══════════════════════
(function initFlowArt() {
  const container = document.getElementById('flow-art');
  const navbar = document.getElementById('navbar');
  const siteLogo = document.getElementById('siteLogo');
  const topRight = document.getElementById('topRightActions');
  if (!container) return;

  // Respect reduced-motion preference or mobile screens
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;

  const sections = container.querySelectorAll('[data-flow-section]');
  if (!sections.length) return;

  const triggers = [];

  // Auto-hide navbar, logo, and top-right when inside FlowArt
  const hideAll = () => {
    navbar?.classList.add('nav-hidden');
    siteLogo?.classList.add('logo-hidden');
    topRight?.classList.add('tr-hidden');
  };
  const showAll = () => {
    navbar?.classList.remove('nav-hidden');
    siteLogo?.classList.remove('logo-hidden');
    topRight?.classList.remove('tr-hidden');
  };

  triggers.push(
    ScrollTrigger.create({
      trigger: container,
      start: 'top 80px',
      end: 'bottom top',
      onEnter: hideAll,
      onLeave: showAll,
      onEnterBack: hideAll,
      onLeaveBack: showAll,
    })
  );

  sections.forEach((section, i) => {
    gsap.set(section, { zIndex: i + 1 });

    const inner = section.querySelector('.flow-art-container');
    if (!inner) return;

    // Straight parallax slide entrance for all panels except the first
    if (i > 0) {
      gsap.set(inner, { y: '50%' });
      const tween = gsap.to(inner, {
        y: '0%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'top 10%',
          scrub: true,
        },
      });
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);

      // Cinematic background crossfade (fade-in) REMOVED entirely per user request
      // The background gradient will now simply bleed physically as it slides up

    }

    // Pin and shrink all except the last section
    if (i < sections.length - 1) {
      // "Boxes go back" effect
      const bg = section.querySelector('.flow-bg-gradient');
      
      // Dynamically wrap the background and inner content into a single physical card
      const cardWrap = document.createElement('div');
      cardWrap.className = 'flow-card-wrap';
      cardWrap.style.position = 'absolute';
      cardWrap.style.inset = '0';
      cardWrap.style.width = '100%';
      cardWrap.style.height = '100%';
      cardWrap.style.overflow = 'hidden';
      cardWrap.style.borderRadius = '0 0 24px 24px';
      
      // Explicitly force the background of the section to be white so the shrinking gap is perfectly white
      section.style.backgroundColor = '#ffffff';

      section.insertBefore(cardWrap, bg);
      cardWrap.appendChild(bg);
      cardWrap.appendChild(inner);

      // Explicitly set initial brightness to prevent GSAP from tweening from 0 (pitch black bug)
      gsap.set(cardWrap, { filter: 'brightness(1)' });
      
      const tween = gsap.to(cardWrap, {
        scale: 0.80,
        rotate: -3,
        filter: 'brightness(0.5)',
        transformOrigin: "50% 50%",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          pin: true,
          pinSpacing: false,
          scrub: true,
        }
      });
      triggers.push(tween.scrollTrigger);
    }
  });

  ScrollTrigger.refresh();
})();

// ═══════════════════════
// 15. ANIMATED THEME TOGGLER (Sun ↔ Moon — 5-Stage Cinematic Morph)
// ═══════════════════════
(function initAnimatedToggler() {
  const svg = document.getElementById('attSvg');
  const body = document.getElementById('attBody');
  const mask = document.getElementById('attMaskCircle');
  const rays = document.getElementById('attRays');
  if (!svg || !body || !mask || !rays) return;

  // 5-stage cinematic morph — smooth and silky (not fast)
  function syncATT() {
    const isDark = getTheme() === 'dark';
    const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });

    // Stage 1: Gentle squish — soft scale down
    tl.to(svg, {
      scale: 0.55, scaleX: 0.9,
      duration: 0.2, ease: 'power2.in',
    })
    // Stage 2: Shape morph — body radius + mask shift
    .to(body, {
      attr: { r: isDark ? 9 : 5 },
      duration: 0.5, ease: 'power2.inOut',
    }, 0.15)
    .to(mask, {
      attr: { cx: isDark ? 17 : 33, cy: isDark ? 8 : 0 },
      duration: 0.5, ease: 'power2.inOut',
    }, 0.15)
    // Stage 3: Spring recovery — smooth elastic with gentle overshoot
    .to(svg, {
      rotation: isDark ? 300 : 0,
      scale: 1, scaleX: 1,
      duration: 1.4,
      ease: 'elastic.out(1.0, 0.4)',
    }, 0.2)
    // Stage 4: Rays — smooth fade (sun) or gentle collapse (moon)
    .to(rays, {
      opacity: isDark ? 0 : 1,
      scale: isDark ? 0 : 1,
      rotation: isDark ? -90 : 0,
      duration: isDark ? 0.5 : 0.9,
      ease: isDark ? 'power2.inOut' : 'elastic.out(1.0, 0.45)',
    }, isDark ? 0.1 : 0.3)
    // Stage 5: Subtle breathe — micro-pulse settle
    .to(svg, {
      scale: 1.05, duration: 0.2, ease: 'power2.out',
    }, isDark ? 1.2 : 1.4)
    .to(svg, {
      scale: 1, duration: 0.4, ease: 'power2.inOut',
    }, isDark ? 1.4 : 1.6);
  }

  // Initial set without animation
  const isDarkInit = getTheme() === 'dark';
  gsap.set(svg, { rotation: isDarkInit ? 300 : 0 });
  gsap.set(body, { attr: { r: isDarkInit ? 9 : 5 } });
  gsap.set(mask, { attr: { cx: isDarkInit ? 17 : 33, cy: isDarkInit ? 8 : 0 } });
  gsap.set(rays, { opacity: isDarkInit ? 0 : 1, scale: isDarkInit ? 0 : 1, rotation: isDarkInit ? -90 : 0 });

  // Observe theme changes
  const observer = new MutationObserver(syncATT);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Cinematic haptic click — dual-tone
  let audioCtx = null;
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const rate = audioCtx.sampleRate;
      // Primary click tone
      const len = Math.floor(rate * 0.015);
      const buf = audioCtx.createBuffer(1, len, rate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        const freq = 2800 + t * 600; // ascending chirp
        ch[i] = (Math.sin(2 * Math.PI * freq * t) * 0.35 + (Math.random() * 2 - 1) * 0.15) * Math.pow(1 - t, 4);
      }
      const src = audioCtx.createBufferSource();
      const gain = audioCtx.createGain();
      src.buffer = buf;
      gain.gain.value = 0.04;
      src.connect(gain);
      gain.connect(audioCtx.destination);
      src.start();
    } catch(e) { /* silent */ }
  });
})();

// ═══════════════════════
// 16. AWWWARDS SOTD FEATURES
// ═══════════════════════
(function initSOTD() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 768) return;

  // Magnetic Buttons
  document.querySelectorAll('.nav-cta, .flow-cta-pill').forEach(btn => {
    btn.classList.add('magnetic-btn');
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
      gsap.to(btn, { x: x, y: y, duration: 0.4, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
    });
  });

  // Light-Trace Glow
  document.querySelectorAll('.why-card, .sys-row').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // Stat Counter Cinematic
  document.querySelectorAll('.stat-val').forEach(stat => {
    const rawVal = stat.innerText;
    const match = rawVal.match(/[\d.]+/);
    if (match) {
      const num = parseFloat(match[0]);
      const suffix = rawVal.replace(match[0], '');
      const obj = { val: 0 };
      
      gsap.to(obj, {
        val: num,
        duration: 2.5,
        ease: 'power3.out',
        scrollTrigger: { trigger: stat, start: 'top 85%', toggleActions: 'play none none none' },
        onUpdate: () => {
          const formatted = (num % 1 !== 0) ? obj.val.toFixed(1) : Math.floor(obj.val);
          stat.innerText = formatted + suffix;
        }
      });
    }
  });

  // FlowArt visibility is now handled purely by classes via initFlowArt ScrollTrigger
  // No aggressive inline style overrides needed
})();

// ═══════════════════════
// 17. FAQ ACCORDION (Radix UI Style)
// ═══════════════════════
(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all others
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('is-open')) {
          otherItem.classList.remove('is-open');
          otherItem.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
          otherItem.querySelector('.faq-content').style.height = '0px';
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        content.style.height = '0px';
      } else {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        content.style.height = 'auto';
        const innerHeight = content.scrollHeight;
        content.style.height = '0px';
        // Force reflow then animate
        content.offsetHeight;
        content.style.height = innerHeight + 'px';
      }
    });
  });

  // Handle window resize to adjust open accordion height
  window.addEventListener('resize', () => {
    const openItem = document.querySelector('.faq-item.is-open');
    if (openItem) {
      const content = openItem.querySelector('.faq-content');
      const innerHeight = openItem.querySelector('.faq-content-inner').offsetHeight;
      content.style.height = innerHeight + 'px';
    }
  });
})();

// ═══════════════════════
// 18. DYNAMIC ISLAND CONTROLLER
// ═══════════════════════
(function initDynamicIsland() {
  const wrapper = document.getElementById('dynamicIsland');
  const trigger = document.getElementById('diTrigger');
  const label   = document.getElementById('diLabel');
  const pctEl   = document.getElementById('diScrollPct');
  const panel   = document.getElementById('diPanel');
  if (!wrapper || !trigger) return;

  // Toggle open/close
  trigger.addEventListener('click', () => {
    const isOpen = wrapper.classList.contains('is-open');
    if (isOpen) {
      wrapper.classList.remove('is-open');
      label.textContent = 'Menu';
    } else {
      wrapper.classList.add('is-open');
      label.textContent = 'Close';
    }
  });

  // Close on panel link click + smooth scroll
  panel.querySelectorAll('.di-panel-link').forEach(link => {
    link.addEventListener('click', () => {
      wrapper.classList.remove('is-open');
      label.textContent = 'Menu';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (wrapper.classList.contains('is-open') && !wrapper.contains(e.target)) {
      wrapper.classList.remove('is-open');
      label.textContent = 'Menu';
    }
  });

  // Scroll percentage
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
    if (pctEl) pctEl.textContent = pct + '%';
  }, { passive: true });

  // Menu bar stays visible at all times — no auto-hide
})();

// ═══════════════════════
// 19. ANIMATED TESTIMONIALS (Glassmorphism slider)
// ═══════════════════════
(function initAnimatedTestimonials() {
  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Chief Engineer",
      company: "L&T Construction",
      content: "The real-time dashboards have completely transformed how we monitor our urban water projects. The predictive maintenance alerts save us thousands.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d"
    },
    {
      name: "Priya Sharma",
      role: "Home Maker",
      content: "SK Jalrakshak's IoT integration seamlessly scales across hundreds of villages. The data accuracy is unparalleled in the industry.",
      rating: 4,
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
    },
    {
      name: "Amit Patel",
      role: "Operations Head",
      company: "Tata Projects",
      content: "We reduced our water leakage incidents by 40% within the first three months of deployment. Thanks to sk jalrakshak and their hardworking team.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=a04258a2462d826712d"
    }
  ];

  const wrap = document.getElementById('testiCardsWrap');
  const dotsContainer = document.getElementById('testiDots');
  if (!wrap || !dotsContainer) return;

  let activeIndex = 0;
  let autoRotate;

  // Render cards
  testimonials.forEach((t, i) => {
    // Card HTML
    const card = document.createElement('div');
    card.className = 'animated-testi-card';
    if (i === 0) card.classList.add('active');
    
    let stars = '';
    for(let j=0; j<5; j++) {
      stars += `<svg class="testi-star ${j < t.rating ? 'filled' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }

    card.innerHTML = `
      <div class="testi-stars">${stars}</div>
      <blockquote class="testi-quote">"${t.content}"</blockquote>
      <div class="testi-author">
        <img src="${t.avatar}" alt="${t.name}">
        <div class="testi-author-info">
          <strong>${t.name}</strong>
          <span>${t.role}, ${t.company}</span>
        </div>
      </div>
    `;
    wrap.appendChild(card);

    // Dot HTML
    const dot = document.createElement('button');
    dot.className = 'testi-dot';
    dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToTestimonial(i));
    dotsContainer.appendChild(dot);
  });

  const cards = wrap.querySelectorAll('.animated-testi-card');
  const dots = dotsContainer.querySelectorAll('.testi-dot');

  function goToTestimonial(index) {
    if (index === activeIndex) return;
    
    const oldCard = cards[activeIndex];
    const newCard = cards[index];

    // GSAP Animation - cinematic 3D slide and rotate
    gsap.to(oldCard, { 
      opacity: 0, scale: 0.9, x: -100, rotateY: -20, rotateZ: -4, duration: 0.6, ease: 'power3.inOut', 
      onComplete: () => { 
        oldCard.classList.remove('active'); 
        oldCard.style.zIndex = 0; 
      }
    });

    newCard.classList.add('active');
    newCard.style.zIndex = 1;
    gsap.fromTo(newCard, 
      { opacity: 0, scale: 0.8, x: 100, rotateY: 20, rotateZ: 4 }, 
      { opacity: 1, scale: 1, x: 0, rotateY: 0, rotateZ: 0, duration: 0.8, ease: 'expo.out' }
    );

    dots[activeIndex].classList.remove('active');
    dots[index].classList.add('active');

    activeIndex = index;
    resetRotate();
  }

  function nextTestimonial() {
    let next = (activeIndex + 1) % testimonials.length;
    goToTestimonial(next);
  }

  function resetRotate() {
    clearInterval(autoRotate);
    autoRotate = setInterval(nextTestimonial, 6000);
  }

  resetRotate();
})();
