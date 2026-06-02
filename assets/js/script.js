/* ═══ SK JALRAKSHAK — ANIMATION ENGINE v6 ═══ */

// ── LENIS ──
const hasGsap = Boolean(window.gsap);
const hasScrollTrigger = Boolean(window.ScrollTrigger);
const hasLenis = Boolean(window.Lenis);

function runAnimationCallback(vars) {
  if (vars && typeof vars.onComplete === 'function') {
    window.setTimeout(vars.onComplete, 0);
  }
}

const noopTween = {
  to(target, vars) { runAnimationCallback(vars); return this; },
  call(fn) { if (typeof fn === 'function') fn(); return this; },
  set() { return this; }
};

const gsap = window.gsap || {
  registerPlugin() {},
  timeline(config = {}) {
    const tween = Object.create(noopTween);
    runAnimationCallback(config);
    return tween;
  },
  to(target, vars) { runAnimationCallback(vars); return {}; },
  from() { return {}; },
  fromTo(target, fromVars, toVars) { runAnimationCallback(toVars); return {}; },
  set() {},
  ticker: { add() {}, lagSmoothing() {} }
};

const ScrollTrigger = window.ScrollTrigger || {
  update() {},
  refresh() {},
  create() { return { kill() {} }; }
};

const lenis = hasLenis ? new window.Lenis({
  duration: 1.3,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true, mouseMultiplier: 0.7,
  smoothTouch: false, touchMultiplier: 2,
}) : {
  on() {},
  raf() {},
  scrollTo(target, options = {}) {
    const offset = options.offset || 0;
    const behavior = options.immediate ? 'auto' : 'smooth';
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior });
      return;
    }
    if (target && typeof target.getBoundingClientRect === 'function') {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset, behavior });
    }
  }
};

if (hasGsap && hasScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.clearScrollMemory("manual");
  window.scrollTo(0, 0);
}
lenis.on('scroll', ScrollTrigger.update);
if (hasGsap) {
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
} else if (hasLenis) {
  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

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
  try {
    localStorage.setItem('skj-theme', t);
  } catch (err) {
    /* Theme persistence is optional when storage is blocked. */
  }
}

function getHashTarget(hash) {
  if (!hash || hash === '#') return null;
  try {
    const id = decodeURIComponent(hash.slice(1));
    return document.getElementById(id) || document.querySelector(hash);
  } catch (err) {
    return null;
  }
}

// Restore saved theme before paint
(function() {
  let saved = null;
  try {
    saved = localStorage.getItem('skj-theme');
  } catch (err) {
    saved = null;
  }
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
// 2. CINEMATIC PRELOADER (Intro Scene + Intro Reveal)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const preloaderEl = document.getElementById('preloader');

if (preloaderEl && !hasGsap) {
  if (typeof lenis.start === 'function') lenis.start();
  preloaderEl.style.pointerEvents = 'none';
  preloaderEl.style.display = 'none';
  document.querySelectorAll('.hero-line').forEach((line) => {
    line.style.transform = 'translateY(0)';
    line.style.opacity = '1';
  });
  document.querySelectorAll('.hero-fade, .hero-app-mockup, .main-nav').forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
} else if (preloaderEl) {
  if (typeof lenis.stop === 'function') lenis.stop();

  const preloaderTL = gsap.timeline({
    onComplete: () => {
      if (typeof lenis.start === 'function') lenis.start();
      preloaderEl.style.pointerEvents = 'none';
      requestAnimationFrame(() => { preloaderEl.style.display = 'none'; });
      ScrollTrigger.refresh();
    }
  });

  const counterObj = { val: 0 };
  const counterEl = document.getElementById('preCounter');
  const progressLine = document.querySelector('#preProgressLine');

  preloaderTL
    .to('.pre-logo-mark', {
      opacity: 1, scale: 1, rotate: 0,
      duration: 1.4,
      ease: 'elastic.out(1.1, 0.45)',
    }, 0.2)
    .to('.pre-progress-line', {
      opacity: 1, duration: 0.6, ease: 'power2.out',
    }, 0.5)
    .to('.pre-bottom', {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
    }, 0.6)
    .to(counterObj, {
      val: 100, duration: 3.0,
      ease: 'power2.inOut',
      onUpdate: () => {
        const pct = Math.floor(counterObj.val);
        if (counterEl) counterEl.innerText = pct + '%';
        if (progressLine) progressLine.style.setProperty('--pre-fill', pct + '%');
      }
    }, 0.5)
    .to('.pre-char', {
      opacity: 1, y: '0%', scale: 1, rotateX: 0,
      duration: 1.4,
      stagger: { each: 0.045, from: 'start' },
      ease: 'elastic.out(1, 0.35)',
    }, 0.7)
    .to('#preTagline', {
      opacity: 0.5, y: 0,
      duration: 1.0, ease: 'power2.out',
    }, 1.4)
    .to('.pre-char', {
      opacity: 0, y: '-130%', scale: 1.15,
      duration: 0.5,
      stagger: { each: 0.025, from: 'end' },
      ease: 'power4.in',
    }, 3.6)
    .to('#preTagline', {
      opacity: 0, y: -24,
      duration: 0.4, ease: 'power4.in',
    }, 3.6)
    .to('.pre-logo-mark', {
      scale: 0.05, opacity: 0, rotate: 200,
      duration: 0.9, ease: 'power4.inOut',
    }, 3.5)
    .to('.pre-progress-line', {
      opacity: 0, scaleX: 0, transformOrigin: 'center',
      duration: 0.5, ease: 'power4.in',
    }, 3.5)
    .to('.pre-bottom', {
      opacity: 0, y: -20, duration: 0.4, ease: 'power4.in',
    }, 3.6)
    .set('#preloader', {
      transformOrigin: 'top center',
      willChange: 'transform',
    }, 3.9)
    .to('#preloader', {
      yPercent: -100,
      duration: 1.4,
      ease: 'power4.inOut',
    }, 3.9);

  // ─── FAST HERO REVEAL PREP ───
  gsap.set('.main-nav', { y: '-100%', opacity: 0 });
  gsap.set('.hero-line', { y: '100%', opacity: 0 });
  gsap.set('.hero-fade', { opacity: 0, y: 20 });
  gsap.set('.hero-app-mockup', { scale: 1.05, opacity: 0, y: 30 });

  preloaderTL.to('.main-nav', { y: '0%', opacity: 1, duration: 0.6, ease: 'power2.out' }, 3.8)
    .to('.hero-line', {
      y: '0%', opacity: 1,
      duration: 0.8, stagger: 0.1,
      ease: 'power3.out'
    }, 3.8)
    .to('.hero-app-mockup', {
      scale: 1, opacity: 1, y: 0,
      duration: 1.0, ease: 'power3.out'
    }, 3.9)
    .to('.hero-fade', {
      opacity: 1, y: 0,
      duration: 0.8, ease: 'power3.out', stagger: 0.05
    }, 4.0);
} else {
  if (typeof lenis !== 'undefined' && typeof lenis.start === 'function') lenis.start();
  
  gsap.set('.main-nav', { y: '-100%', opacity: 0 });
  gsap.set('.hero-line', { y: '100%', opacity: 0 });
  gsap.set('.hero-fade', { opacity: 0, y: 20 });
  gsap.set('.hero-app-mockup', { scale: 1.05, opacity: 0, y: 30 });

  const t = gsap.timeline({ delay: 0.1 });
  t.to('.main-nav', { y: '0%', opacity: 1, duration: 0.6, ease: 'power2.out' }, 0)
    .to('.hero-line', {
      y: '0%', opacity: 1,
      duration: 0.8, stagger: 0.1,
      ease: 'power3.out'
    }, 0)
    .to('.hero-app-mockup', {
      scale: 1, opacity: 1, y: 0,
      duration: 1.0, ease: 'power3.out'
    }, 0.1)
    .to('.hero-fade', {
      opacity: 1, y: 0,
      duration: 0.8, ease: 'power3.out', stagger: 0.05
    }, 0.2);
}





// ═══════════════════════
// 11. AWWWARDS BARBA.JS TRANSITION
// ═══════════════════════
function createTransitionOverlay() {
  let overlay = document.getElementById('skj-transition-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'skj-transition-overlay';
    // Deep black or brand primary for premium feel
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; pointer-events:none; z-index:999999; display:flex; justify-content:center; align-items:center; background: transparent;';
    
    overlay.innerHTML = `
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; position:absolute; top:0; left:0;">
        <path class="skj-transition-path" d="M 0 100 V 100 Q 50 100 100 100 V 100 z" fill="#0ea5e9" />
      </svg>
    `;
    document.body.appendChild(overlay);
  }
  return overlay;
}

if (typeof barba !== 'undefined') {
  barba.init({
    prevent: ({ el }) => el.hash && el.pathname === window.location.pathname,
    transitions: [{
      name: 'award-winning',
      leave(data) {
        const done = this.async();
        createTransitionOverlay();
        const path = document.querySelector('.skj-transition-path');
        
        // Fluid SVG wave animation
        const tl = gsap.timeline({ onComplete: done });
        
        tl.set(path, { attr: { d: 'M 0 100 V 100 Q 50 100 100 100 V 100 z' } })
          .to(path, {
            duration: 0.6,
            ease: 'power4.in',
            attr: { d: 'M 0 100 V 50 Q 50 0 100 50 V 100 z' }
          })
          .to(path, {
            duration: 0.4,
            ease: 'power2.out',
            attr: { d: 'M 0 100 V 0 Q 50 0 100 0 V 100 z' }
          });
      },
      enter(data) {
        // Scroll to top instantly
        window.scrollTo(0, 0);
        if (typeof lenis !== 'undefined') lenis.scrollTo(0, { immediate: true });
        
        // Kill old ScrollTriggers to prevent duplication
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.getAll().forEach(t => t.kill());
        }

        // Re-initialize all scripts for the new page
        if (typeof window.SkjInitAll === 'function') {
            window.SkjInitAll();
        }

        const path = document.querySelector('.skj-transition-path');
        const tl = gsap.timeline();
        
        tl.set(path, { attr: { d: 'M 0 100 V 0 Q 50 0 100 0 V 100 z' } })
          .to(path, {
            duration: 0.4,
            ease: 'power2.in',
            attr: { d: 'M 0 0 V 0 Q 50 50 100 0 V 0 z' }
          })
          .to(path, {
            duration: 0.6,
            ease: 'power4.out',
            attr: { d: 'M 0 0 V 0 Q 50 0 100 0 V 0 z' }
          });
      }
    }]
  });
}

// Global initialization function to run on page load AND barba enter
window.SkjInitAll = function() {

  // ==========================================
  // GISI-Style Curtain Footer & Scroll Reveals
  // ==========================================
  (function initGisiAnimations() {
    // 1. Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal-up');
    
    if (revealElements.length > 0) {
      const revealOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0
      };

      const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      };

      const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
      revealElements.forEach(el => revealObserver.observe(el));
    }

    // 2. Curtain Footer Parallax Height Calculation
    const footer = document.querySelector('#footer');
    // STRICT TARGETING: Select the main element to prevent layout breakage
    const mainWrapper = document.querySelector('main');

    if (footer && mainWrapper) {
      document.body.classList.add('has-curtain-footer');
      mainWrapper.classList.add('curtain-main');
      footer.classList.add('curtain-footer-active');

      function updateFooterHeight() {
        const fHeight = footer.offsetHeight;
        mainWrapper.style.marginBottom = fHeight + 'px';
      }

      updateFooterHeight();
      window.addEventListener('resize', updateFooterHeight);
      setTimeout(updateFooterHeight, 500);
      setTimeout(updateFooterHeight, 1500);
    }
  })();


  

  // ═══════════════════════
// 3. NAVBAR
// ═══════════════════════
ScrollTrigger.create({
  start: 'top -60',
  onUpdate: (self) => document.getElementById('mainNav')?.classList.toggle('scrolled', self.progress > 0)
});

// Hide navbar/logo/top-right at footer
(function initFooterHide() {
  const footer = document.querySelector('footer');
  if (!footer) return;
  const navbar = document.getElementById('mainNav');
  const siteLogo = document.getElementById('navLogo');
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
  let progressTicking = false;
  window.addEventListener('scroll', () => {
    if (progressTicking) return;
    progressTicking = true;
    window.requestAnimationFrame(() => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0%';
      progressTicking = false;
    });
  }, { passive: true });
}

// ═══════════════════════
// 10A. CINEMATIC SPLIT-TEXT REVEALS (.gs-split)
// ═══════════════════════
function wrapWords(el) {
  const words = el.innerText.split(' ');
  el.replaceChildren();
  words.forEach(word => {
    const wordSpan = document.createElement('span');
    wordSpan.style.display = 'inline-block';
    wordSpan.style.overflow = 'hidden';
    wordSpan.style.verticalAlign = 'bottom';
    const innerSpan = document.createElement('span');
    innerSpan.style.display = 'inline-block';
    innerSpan.style.willChange = 'transform';
    innerSpan.innerText = word + '\u00A0';
    wordSpan.appendChild(innerSpan);
    el.appendChild(wordSpan);
  });
  return el.querySelectorAll('span > span');
}

document.querySelectorAll('.gs-split').forEach(el => {
  const words = wrapWords(el);
  gsap.from(words, {
    y: '150%',
    skewY: 8,
    opacity: 0,
    duration: 1.4,
    stagger: 0.05,
    ease: 'expo.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 90%',
      toggleActions: 'play none none none'
    }
  });
});

// ═══════════════════════
// 10B. SCROLL REVEAL ANIMATIONS (gs-reveal)
// ═══════════════════════
document.querySelectorAll('.gs-reveal').forEach((el, i) => {
  gsap.from(el, {
    opacity: 0, y: 40,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 92%',
      toggleActions: 'play none none none',
    }
  });
});

// ═══════════════════════
// 10. PARALLAX headings
// ═══════════════════════
document.querySelectorAll('.sec-title-lg').forEach(h => {
  gsap.fromTo(h, { y:20 }, {
    y:-15, ease:'none',
    scrollTrigger: { trigger:h, start:'top bottom', end:'bottom top', scrub:0.6 }
  });
});
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
  if (media) gsap.set(media, { scale: 1.4 });
  
  // Cinematic polygon unmask (from top-left diagonal wipe)
  gsap.fromTo(el, { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' }, {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    duration: 1.8, ease: 'expo.out',
    scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
  });
  
  // Unfold & Scale down and True Parallax
  if (media) {
    gsap.to(media, {
      scale: 1.0,
      duration: 1.8,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
    });
    gsap.fromTo(media, { y: '-15%' }, {
      y: '15%',
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }
});

// ═══════════════════════
// 14. FLOWART STORY SCROLL (Pinning + Rotation)
// ═══════════════════════
(function initFlowArt() {
  const container = document.getElementById('flow-art');
  const navbar = document.getElementById('mainNav');
  const siteLogo = document.getElementById('navLogo');
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
      cardWrap.style.overflow = 'visible';
      cardWrap.style.borderRadius = '0 0 24px 24px';
      
      // Explicitly force the background of the section to be white so the shrinking gap is perfectly white
      section.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#ffffff';

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

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    // Haptic click removed for performance
  });
})();

// ═══════════════════════
// 16. STAT COUNTER ANIMATION (works on all devices)
// ═══════════════════════
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

// ═══════════════════════
// 16B. AWWWARDS SOTD DESKTOP EFFECTS (mouse-only)
// ═══════════════════════
(function initSOTD() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 768) return;

  // Magnetic Buttons with 3D Tilt
  document.querySelectorAll('.nav-cta, .flow-cta-pill').forEach(btn => {
    btn.classList.add('magnetic-btn');
    btn.style.transformStyle = 'preserve-3d';
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
      const rotX = (e.clientY - rect.top - rect.height / 2) * -0.2;
      const rotY = (e.clientX - rect.left - rect.width / 2) * 0.2;
      gsap.to(btn, { x: x, y: y, rotationX: rotX, rotationY: rotY, duration: 0.4, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, rotationX: 0, rotationY: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
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
          const otherTrigger = otherItem.querySelector('.faq-trigger');
          const otherContent = otherItem.querySelector('.faq-content');
          otherItem.classList.remove('is-open');
          otherTrigger?.setAttribute('aria-expanded', 'false');
          if (otherContent) otherContent.style.height = '0px';
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

  // Handle window resize to adjust open accordion height (debounced)
  let faqResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(faqResizeTimer);
    faqResizeTimer = setTimeout(() => {
      const openItem = document.querySelector('.faq-item.is-open');
      if (openItem) {
        const content = openItem.querySelector('.faq-content');
        const inner = openItem.querySelector('.faq-content-inner');
        if (content && inner) {
          content.style.height = inner.offsetHeight + 'px';
        }
      }
    }, 150);
  });
})();

// ═══════════════════════
// 18. DYNAMIC ISLAND CONTROLLER
// ═══════════════════════
// ═══════════════════════
// 18. ENTERPRISE NAVBAR
// ═══════════════════════
(function initEnterpriseNav() {
  const nav = document.getElementById('mainNav');
  const hamburger = document.getElementById('navHamburger');
  const drawer = document.getElementById('navDrawer');
  const drawerClose = document.getElementById('navDrawerClose');
  const overlay = document.getElementById('navOverlay');
  if (!nav) return;

  hamburger?.setAttribute('aria-controls', 'navDrawer');
  hamburger?.setAttribute('aria-expanded', 'false');
  drawer?.setAttribute('aria-hidden', 'true');

  // Scroll: add shadow + hide on scroll down, show on scroll up
  let lastScroll = 0;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScroll = window.scrollY;
        // Shadow
        if (currentScroll > 10) {
          nav.classList.add('nav-scrolled');
        } else {
          nav.classList.remove('nav-scrolled');
        }
        // Hide/show (only after scrolling past 200px)
        if (currentScroll > 200) {
          if (currentScroll > lastScroll + 5) {
            nav.classList.add('nav-hidden');
          } else if (currentScroll < lastScroll - 5) {
            nav.classList.remove('nav-hidden');
          }
        } else {
          nav.classList.remove('nav-hidden');
        }
        lastScroll = currentScroll;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Mobile drawer
  function openDrawer() {
    drawer?.classList.add('is-open');
    overlay?.classList.add('is-open');
    drawer?.setAttribute('aria-hidden', 'false');
    hamburger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer?.classList.remove('is-open');
    overlay?.classList.remove('is-open');
    drawer?.setAttribute('aria-hidden', 'true');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (hamburger) hamburger.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // Drawer accordion
  document.querySelectorAll('.nav-drawer-trigger').forEach(trigger => {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', () => {
      const group = trigger.closest('.nav-drawer-group');
      if (!group) return;
      const isOpen = group.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    });
  });

  // Close drawer on link click
  document.querySelectorAll('.nav-drawer-sublink, .nav-drawer-link:not(.nav-drawer-trigger)').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Close dropdown menus on link click (desktop)
  document.querySelectorAll('.nav-dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      // The dropdown closes naturally on mouseout
    });
  });
})();

// ═══════════════════════
// 19. ANIMATED TESTIMONIALS (Glassmorphism slider)
// ═══════════════════════
(function initAnimatedTestimonials() {
  const testimonials = [
    {
      name: "Ravi Chandra",
      role: "Chief Engineer",
      company: "L&T Construction",
      content: "The real-time dashboards have completely transformed how we monitor our urban water projects. The predictive maintenance alerts save us thousands.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d"
    },
    {
      name: "Satish Chandra",
      role: "Home Maker",
      content: "SK Jalrakshak's IoT integration seamlessly scales across hundreds of villages. The data accuracy is unparalleled in the industry.",
      rating: 4,
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
    },
    {
      name: "Koushik",
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
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  // Render cards
  testimonials.forEach((t, i) => {
    // Card HTML
    const card = document.createElement('div');
    card.className = 'animated-testi-card';
    if (i === 0) card.classList.add('active');
    const authorMeta = t.company ? `${t.role}, ${t.company}` : t.role;
    
    let stars = '';
    for(let j=0; j<5; j++) {
      stars += `<svg class="testi-star ${j < t.rating ? 'filled' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }

    card.innerHTML = `
      <div class="testi-stars">${stars}</div>
      <blockquote class="testi-quote">"${escapeHtml(t.content)}"</blockquote>
      <div class="testi-author">
        <img src="${escapeHtml(t.avatar)}" alt="${escapeHtml(t.name)}">
        <div class="testi-author-info">
          <strong>${escapeHtml(t.name)}</strong>
          <span>${escapeHtml(authorMeta)}</span>
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

  function stopRotate() {
    if (autoRotate) {
      clearInterval(autoRotate);
      autoRotate = null;
    }
  }

  function startRotate() {
    if (!autoRotate) {
      autoRotate = setInterval(nextTestimonial, 6000);
    }
  }

  function resetRotate() {
    stopRotate();
    startRotate();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopRotate();
    } else {
      resetRotate();
    }
  });
  window.addEventListener('pagehide', stopRotate, { once: true });
  resetRotate();
})();


// ═══════════════════════
// 15. CINEMATIC PAGE TRANSITION WIPE
// ═══════════════════════
window.addEventListener('DOMContentLoaded', () => {
  const wipe = document.querySelector('.cinematic-wipe');
  if (wipe) {
    gsap.fromTo(wipe, { scaleY: 1, transformOrigin: 'bottom' }, {
      scaleY: 0,
      duration: 1.2,
      ease: 'expo.inOut',
      delay: 0.1
    });
  }
});



// DYNAMIC WEBGL ENGINE LAZY LOAD
(function initWebGL() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const loadWebGL = () => {
    if (!document.getElementById('webgl-canvas')) return;
    const script = document.createElement('script');
    script.src = 'assets/js/webgl.js';
    script.defer = true;
    document.body.appendChild(script);
  };
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadWebGL, { timeout: 2000 });
  } else {
    setTimeout(loadWebGL, 500);
  }
})();

};

// Run it once on initial load
window.SkjInitAll();

