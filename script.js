/* ═══════════════════════════════════════════════
   SK JALRAKSHAK — ANIMATION ENGINE v5
   GSAP 3.12.5 + Lenis 1.1.18
   ═══════════════════════════════════════════════ */

// ── LENIS SMOOTH SCROLL ──
const lenis = new Lenis({
  duration: 1.3,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  mouseMultiplier: 0.7,
  smoothTouch: false,
  touchMultiplier: 2,
});
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// ── GSAP + LENIS SYNC ──
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ════════════════════════════
// 1. PRELOADER
// ════════════════════════════
lenis.stop();

const preloaderTL = gsap.timeline({
  onComplete: () => {
    lenis.start();
    document.getElementById('preloader').style.display = 'none';
    // Refresh ScrollTrigger after preloader is gone
    ScrollTrigger.refresh();
  }
});

preloaderTL
  .to('.pre-letter', {
    opacity: 1, y: '0%',
    duration: 0.7, stagger: 0.04,
    ease: 'power3.out', delay: 0.2
  })
  .to('.pre-sub', { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2')
  .to('.pre-bar-fill', { width: '100%', duration: 1.4, ease: 'power2.inOut' }, '-=0.3')
  .to('.pre-letter', {
    opacity: 0, y: '-80%',
    duration: 0.4, stagger: 0.025, ease: 'power3.inOut'
  }, '+=0.3')
  .to('.pre-sub, .pre-bar-track', { opacity: 0, duration: 0.25 }, '-=0.2')
  .to('#preloader', { yPercent: -100, duration: 1, ease: 'power4.inOut' }, '-=0.1')
  // Hero entrance
  .to('.hero-line', {
    y: '0%', duration: 1.2, stagger: 0.1, ease: 'power4.out'
  }, '-=0.5')
  .to('.hero-fade', { opacity: 1, duration: 1, ease: 'power2.out' }, '-=0.6');

// ════════════════════════════
// 2. NAVBAR
// ════════════════════════════
ScrollTrigger.create({
  start: 'top -60',
  onUpdate: (self) => {
    document.getElementById('navbar').classList.toggle('scrolled', self.progress > 0);
  }
});

// Cursor pill
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

// ════════════════════════════
// 3. SCROLL REVEALS
// ════════════════════════════
document.querySelectorAll('.gs-reveal').forEach(el => {
  gsap.fromTo(el,
    { y: 40, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: 0.9, ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none none'
      }
    }
  );
});

// ════════════════════════════
// 4. SYSTEMS — Row slide-in
// ════════════════════════════
document.querySelectorAll('.sys-row').forEach(row => {
  gsap.fromTo(row,
    { opacity: 0.2, x: -15 },
    {
      opacity: 1, x: 0,
      duration: 0.7, ease: 'power2.out',
      scrollTrigger: {
        trigger: row,
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    }
  );
});

// ════════════════════════════
// 5. TESTIMONIALS — Ashley Brooke blur reveal
// ════════════════════════════
const testimonialSec = document.getElementById('testimonials');
const systemsSec = document.getElementById('systems');

if (testimonialSec && systemsSec) {
  // Background blur: systems section blurs as testimonials enter
  gsap.to(systemsSec, {
    filter: 'blur(6px)',
    opacity: 0.25,
    ease: 'none',
    scrollTrigger: {
      trigger: testimonialSec,
      start: 'top bottom',
      end: 'top 30%',
      scrub: 1,
    }
  });

  // Marquee blur-in
  const mw = document.getElementById('marqueeWrap');
  if (mw) {
    gsap.fromTo(mw,
      { filter: 'blur(14px)', opacity: 0, y: 50 },
      {
        filter: 'blur(0px)', opacity: 1, y: 0,
        duration: 1.2, ease: 'power2.out',
        scrollTrigger: {
          trigger: testimonialSec,
          start: 'top 60%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }
}

// ════════════════════════════
// 6. STATS — Pop-in
// ════════════════════════════
document.querySelectorAll('.stat').forEach((s, i) => {
  gsap.fromTo(s,
    { y: 25, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: 0.6, delay: i * 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: s,
        start: 'top 92%',
        toggleActions: 'play none none none'
      }
    }
  );
});

// ════════════════════════════
// 7. CTA — Scale reveal
// ════════════════════════════
const ctaTitle = document.querySelector('.cta-title');
if (ctaTitle) {
  gsap.fromTo(ctaTitle,
    { scale: 0.88, opacity: 0 },
    {
      scale: 1, opacity: 1,
      duration: 1, ease: 'power3.out',
      scrollTrigger: {
        trigger: ctaTitle,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );
}

// ════════════════════════════
// 8. PARALLAX HEADINGS
// ════════════════════════════
document.querySelectorAll('.sec-title-lg').forEach(h => {
  gsap.fromTo(h,
    { y: 20 },
    {
      y: -15, ease: 'none',
      scrollTrigger: {
        trigger: h,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6,
      }
    }
  );
});

// ════════════════════════════
// 9. SMOOTH ANCHOR SCROLL
// ════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80 });
    }
  });
});
