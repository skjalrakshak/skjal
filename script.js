/* ═══ SK JALRAKSHAK — ANIMATION ENGINE v2 ═══ */

// ── Lenis Smooth Scroll ──
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  mouseMultiplier: 0.8,
  smoothTouch: false,
  touchMultiplier: 2,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// ── GSAP Setup ──
gsap.registerPlugin(ScrollTrigger);

// Sync Lenis with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── Preloader ──
lenis.stop();
const preloaderTL = gsap.timeline();

preloaderTL
  .to(".preloader-text", {
    y: "0%",
    opacity: 1,
    duration: 1.2,
    ease: "power3.out",
    delay: 0.3
  })
  .to(".preloader-bar", {
    width: "100%",
    duration: 1.8,
    ease: "power2.inOut"
  }, "-=0.6")
  .to(".preloader-text", {
    y: "-120%",
    opacity: 0,
    duration: 0.8,
    ease: "power3.inOut",
    delay: 0.3
  })
  .to("#preloader", {
    yPercent: -100,
    duration: 1.2,
    ease: "power4.inOut",
    onComplete: () => {
      lenis.start();
      document.getElementById('preloader').style.display = 'none';
    }
  }, "-=0.3")
  // Hero lines stagger in
  .to(".hero-line", {
    y: "0%",
    duration: 1.4,
    stagger: 0.12,
    ease: "power4.out"
  }, "-=0.6")
  .to(".hero-fade", {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: "power2.out"
  }, "-=0.8");

// ── Navbar scroll state ──
ScrollTrigger.create({
  start: "top -80",
  onUpdate: (self) => {
    const nav = document.getElementById('navbar');
    if (self.progress > 0) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
});

// ── Scroll Reveals ──
document.querySelectorAll('.gs-reveal').forEach((el) => {
  gsap.fromTo(el,
    { y: 50, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none none"
      }
    }
  );
});

// ── Image Parallax ──
document.querySelectorAll('.image-parallax').forEach((img) => {
  gsap.to(img, {
    yPercent: 12,
    ease: "none",
    scrollTrigger: {
      trigger: img.closest('.img-reveal, .image-parallax-container') || img.parentElement,
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
});

// ── Image Reveal (clip-path) ──
document.querySelectorAll('.img-reveal').forEach((container) => {
  gsap.fromTo(container,
    { clipPath: "inset(15% 15% 15% 15% round 28px)" },
    {
      clipPath: "inset(0% 0% 0% 0% round 28px)",
      ease: "power2.out",
      scrollTrigger: {
        trigger: container,
        start: "top 80%",
        end: "top 20%",
        scrub: true
      }
    }
  );
});

// ── FAQ Accordion ──
document.querySelectorAll('.faq-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isActive = item.classList.contains('active');

    // Close all
    document.querySelectorAll('.faq-item.active').forEach((openItem) => {
      openItem.classList.remove('active');
      openItem.querySelector('.faq-toggle').setAttribute('aria-expanded', 'false');
    });

    // Open clicked (if it wasn't already open)
    if (!isActive) {
      item.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});
