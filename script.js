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

const counterObj = { val: 0 };
const counterEl = document.getElementById('preCounter');

preloaderTL
  .to(counterObj, {
    val: 100,
    duration: 2.2,
    ease: 'power3.inOut',
    onUpdate: () => {
      if (counterEl) counterEl.innerText = Math.floor(counterObj.val) + '%';
    }
  })
  .to('.pre-bottom', { opacity: 1, duration: 0.5 }, 0)
  .to('.pre-logo-mark', { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)' }, 0.5)
  .to('.pre-char', { opacity: 1, y: '0%', scale: 1, duration: 0.8, stagger: 0.05, ease: 'power3.out' }, 0.8)
  .to('.pre-char', { opacity: 0, y: '-100%', duration: 0.5, stagger: 0.02, ease: 'power3.inOut' }, 2.8)
  .to('.pre-logo-mark', { scale: 0, opacity: 0, duration: 0.5, ease: 'power3.inOut' }, 2.9)
  .to('.pre-bottom', { opacity: 0, duration: 0.3 }, 3.0)
  .to('#preloader', { yPercent: -100, duration: 1.2, ease: 'power4.inOut' }, 3.2)
  .to('.hero-line', { y: '0%', duration: 1.5, stagger: 0.1, ease: 'power4.out' }, 3.5)
  .to('.hero-fade', { opacity: 1, duration: 1.2, ease: 'power2.out' }, 3.8);

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
      const isDownScroll = currentScrollY > lastScrollY;
      const delta = Math.abs(currentScrollY - lastScrollY);
      
      // Only trigger hide/show with meaningful scroll (not micro-jitters)
      if (delta > 5 && currentScrollY > window.innerHeight) {
        if (isDownScroll) {
          siteLogo?.classList.add('logo-hidden');
          topRightActions?.classList.add('tr-hidden');
          navbar?.classList.add('nav-hidden');
        } else {
          siteLogo?.classList.remove('logo-hidden');
          topRightActions?.classList.remove('tr-hidden');
          navbar?.classList.remove('nav-hidden');
        }
      } else if (currentScrollY <= window.innerHeight) {
        // Always show if we are near the top
        siteLogo?.classList.remove('logo-hidden');
        topRightActions?.classList.remove('tr-hidden');
        navbar?.classList.remove('nav-hidden');
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
// 5. SCROLL REVEALS
// ═══════════════════════
// Clean Text-Split Reveal Fallback (Snappy, No Blur)
document.querySelectorAll('.gs-reveal').forEach(el => {
  if (el.tagName.match(/^H[1-6]$/) || el.classList.contains('sec-title') || el.classList.contains('sys-name')) {
    // Custom Split-Text
    const text = el.innerText;
    el.innerHTML = '';
    const words = text.split(' ');
    words.forEach(word => {
      const wSpan = document.createElement('span');
      wSpan.className = 'split-line';
      const cSpan = document.createElement('span');
      cSpan.className = 'split-char';
      cSpan.innerText = word + ' ';
      wSpan.appendChild(cSpan);
      el.appendChild(wSpan);
    });
    gsap.fromTo(el.querySelectorAll('.split-char'), { y: '120%', opacity: 0 }, {
      y: '0%', opacity: 1, duration: 0.9, stagger: 0.02, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
    });
  } else {
    // Standard Reveal
    gsap.fromTo(el, { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1.0, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' }
    });
  }
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

      // "Boxes go back" effect: Exact 2D twist and scale down matching Fourmula.ai parity
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
      
      gsap.to(cardWrap, {
        scale: 0.94,
        rotate: -2.5,
        filter: 'brightness(0.85)',
        transformOrigin: "50% 50%",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: 'bottom bottom',
          end: 'bottom top',
          scrub: true,
        }
      });
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

// ═══════════════════════
// 16. AWWWARDS SOTD FEATURES
// ═══════════════════════
(function initSOTD() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 768) return;

  // Magnetic Buttons
  document.querySelectorAll('.btn-primary, .btn-outline, .nav-link, .nav-cta, .flow-cta-pill').forEach(btn => {
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
