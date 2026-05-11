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
  .to('.hero-fade', { opacity:1, duration:1, ease:'power2.out' }, '-=0.6')
  .fromTo('.fm-1', { clipPath: 'inset(100% 0 0 0)', scale: 1.2 }, { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1.5, ease: 'power4.out' }, '-=1')
  .fromTo('.fm-2', { clipPath: 'inset(100% 0 0 0)', scale: 1.2 }, { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1.5, ease: 'power4.out' }, '-=1.2');

// ═══════════════════════
// 3. NAVBAR
// ═══════════════════════
ScrollTrigger.create({
  start: 'top -60',
  onUpdate: (self) => document.getElementById('navbar').classList.toggle('scrolled', self.progress > 0)
});

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
// 14. HORIZONTAL SCROLL
// ═══════════════════════
const deepDiveSec = document.querySelector('.deep-dive-sec');
const deepDiveWrap = document.querySelector('.deep-dive-wrap');
if (deepDiveSec && deepDiveWrap) {
  gsap.to(deepDiveWrap, {
    x: () => -(deepDiveWrap.scrollWidth - window.innerWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: deepDiveSec,
      pin: true,
      start: 'top top',
      end: () => `+=${deepDiveWrap.scrollWidth - window.innerWidth}`,
      scrub: 1,
      invalidateOnRefresh: true
    }
  });
}
