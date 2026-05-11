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
// 1. CURTAIN THEME TOGGLE
// ═══════════════════════
const CURTAIN_DUR = 550;
const CURTAIN_EASE = 'cubic-bezier(0.76, 0, 0.24, 1)';
let curtainBusy = false;

// Theme token map for curtain color
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

document.getElementById('themeToggle')?.addEventListener('click', () => {
  if (curtainBusy) return;
  curtainBusy = true;

  const next = getTheme() === 'dark' ? 'light' : 'dark';
  const curtain = document.getElementById('curtain');
  curtain.style.background = THEME_BG[next];
  curtain.style.transformOrigin = 'top';
  curtain.style.transition = `transform ${CURTAIN_DUR}ms ${CURTAIN_EASE}`;
  curtain.style.transform = 'scaleY(1)';

  setTimeout(() => {
    setTheme(next);
    curtain.style.transformOrigin = 'bottom';
    curtain.style.transform = 'scaleY(0)';
    setTimeout(() => { curtainBusy = false; }, CURTAIN_DUR + 50);
  }, CURTAIN_DUR);
});

// ═══════════════════════
// 2. PRELOADER
// ═══════════════════════
lenis.stop();

const preloaderTL = gsap.timeline({
  onComplete: () => {
    lenis.start();
    document.getElementById('preloader').style.display = 'none';
    ScrollTrigger.refresh();
  }
});

preloaderTL
  .to('.pre-letter', { opacity:1, y:'0%', duration:.7, stagger:.04, ease:'power3.out', delay:.2 })
  .to('.pre-sub', { opacity:1, duration:.5, ease:'power2.out' }, '-=0.2')
  .to('.pre-bar-fill', { width:'100%', duration:1.4, ease:'power2.inOut' }, '-=0.3')
  .to('.pre-letter', { opacity:0, y:'-80%', duration:.4, stagger:.025, ease:'power3.inOut' }, '+=0.3')
  .to('.pre-sub, .pre-bar-track', { opacity:0, duration:.25 }, '-=0.2')
  .to('#preloader', { yPercent:-100, duration:1, ease:'power4.inOut' }, '-=0.1')
  .to('.hero-line', { y:'0%', duration:1.2, stagger:.1, ease:'power4.out' }, '-=0.5')
  .to('.hero-fade', { opacity:1, duration:1, ease:'power2.out' }, '-=0.6');

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
// 5. SCROLL REVEALS
// ═══════════════════════
document.querySelectorAll('.gs-reveal').forEach(el => {
  gsap.fromTo(el, { y:40, opacity:0 }, {
    y:0, opacity:1, duration:.9, ease:'power3.out',
    scrollTrigger: { trigger:el, start:'top 90%', toggleActions:'play none none none' }
  });
});

// ═══════════════════════
// 6. SYSTEMS slide-in
// ═══════════════════════
document.querySelectorAll('.sys-row').forEach(row => {
  gsap.fromTo(row, { opacity:0.2, x:-15 }, {
    opacity:1, x:0, duration:.7, ease:'power2.out',
    scrollTrigger: { trigger:row, start:'top 88%', toggleActions:'play none none none' }
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
    if (target) { e.preventDefault(); lenis.scrollTo(target, { offset:-80 }); }
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
document.querySelectorAll('.gs-clip-reveal').forEach(el => {
  const media = el.querySelector('img, video');
  if (media) gsap.set(media, { scale: 1.2 });
  
  gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, {
    clipPath: 'inset(0% 0 0 0)',
    duration: 1.4, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
  });
  
  if (media) {
    gsap.to(media, {
      scale: 1, duration: 1.4, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
    });
  }
});

// ═══════════════════════
// 14. FLOWART STORY SCROLL (Pinning + Rotation)
// ═══════════════════════
(function initFlowArt() {
  const container = document.getElementById('flow-art');
  const navbar = document.getElementById('navbar');
  const siteLogo = document.getElementById('siteLogo');
  const topRight = document.getElementById('topRightActions');
  if (!container) return;

  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

    // Rotation entrance for all panels except the first (reduced from 30° to 12°)
    if (i > 0) {
      gsap.set(inner, { rotation: 12, transformOrigin: 'bottom left' });
      const tween = gsap.to(inner, {
        rotation: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'top 25%',
          scrub: true,
        },
      });
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    }

    // Pin all except the last section
    if (i < sections.length - 1) {
      triggers.push(
        ScrollTrigger.create({
          trigger: section,
          start: 'bottom bottom',
          end: 'bottom top',
          pin: true,
          pinSpacing: false,
        }),
      );
    }
  });

  ScrollTrigger.refresh();
})();

// ═══════════════════════
// 15. ANIMATED THEME TOGGLER (Sun ↔ Moon SVG morph)
// ═══════════════════════
(function initAnimatedToggler() {
  const svg = document.getElementById('attSvg');
  const body = document.getElementById('attBody');
  const mask = document.getElementById('attMaskCircle');
  const rays = document.getElementById('attRays');
  if (!svg || !body || !mask || !rays) return;

  // Sync initial state
  function syncATT() {
    const isDark = getTheme() === 'dark';
    gsap.to(svg, { rotation: isDark ? 270 : 0, duration: 0.6, ease: 'back.out(1.5)' });
    gsap.to(body, { attr: { r: isDark ? 9 : 5 }, duration: 0.6, ease: 'back.out(1.5)' });
    gsap.to(mask, { attr: { cx: isDark ? 17 : 33, cy: isDark ? 8 : 0 }, duration: 0.6, ease: 'back.out(1.5)' });
    gsap.to(rays, { opacity: isDark ? 0 : 1, scale: isDark ? 0 : 1, rotation: isDark ? -30 : 0, duration: 0.5, ease: 'back.out(1.5)' });
  }

  // Initial set without animation
  const isDarkInit = getTheme() === 'dark';
  gsap.set(svg, { rotation: isDarkInit ? 270 : 0 });
  gsap.set(body, { attr: { r: isDarkInit ? 9 : 5 } });
  gsap.set(mask, { attr: { cx: isDarkInit ? 17 : 33, cy: isDarkInit ? 8 : 0 } });
  gsap.set(rays, { opacity: isDarkInit ? 0 : 1, scale: isDarkInit ? 0 : 1, rotation: isDarkInit ? -30 : 0 });

  // Observe theme changes (fired by existing toggle handler)
  const observer = new MutationObserver(syncATT);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Subtle click sound
  let audioCtx = null;
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const rate = audioCtx.sampleRate;
      const len = Math.floor(rate * 0.006);
      const buf = audioCtx.createBuffer(1, len, rate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        ch[i] = (Math.sin(2 * Math.PI * 3400 * t) * 0.6 + (Math.random() * 2 - 1) * 0.4) * Math.pow(1 - t, 3);
      }
      const src = audioCtx.createBufferSource();
      const gain = audioCtx.createGain();
      src.buffer = buf;
      gain.gain.value = 0.08;
      src.connect(gain);
      gain.connect(audioCtx.destination);
      src.start();
    } catch(e) { /* silent */ }
  });
})();
