// Initialize Lenis Smooth Scrolling
const lenis = new Lenis({
  duration: 1.5, // slightly slower for cinematic feel
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 0.8, // softer scroll on mouse wheel
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Integrate Lenis with GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Preloader & Hero Animation
const tl = gsap.timeline();

// Lock scroll during preloader
lenis.stop();
document.body.style.overflow = 'hidden';

// Entrance sequence
tl.to(".preloader-text", {
  y: "0%",
  duration: 1.6,
  ease: "power4.out",
  delay: 0.2
})
.to(".preloader-text", {
  y: "-100%",
  duration: 1.2,
  ease: "power4.inOut",
  delay: 0.8
})
.to(".preloader-screen", {
  yPercent: -100,
  duration: 1.4,
  ease: "power4.inOut",
  onComplete: () => {
    lenis.start();
    document.body.style.overflow = '';
  }
}, "-=0.4")
.to(".hero-line", {
  y: "0%",
  duration: 1.8,
  stagger: 0.15,
  ease: "power4.out"
}, "-=0.8")
.to(".hero-fade", {
  opacity: 1,
  duration: 2,
  ease: "power2.out"
}, "-=1.2");

// Global Scroll Reveals (Text blocks, stats)
const revealElements = document.querySelectorAll('.gs-reveal');
revealElements.forEach((el) => {
  gsap.fromTo(el, 
    { 
      y: 80, 
      opacity: 0 
    },
    {
      y: 0,
      opacity: 1,
      duration: 1.6,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%", // Trigger when element is 85% from top of viewport
        toggleActions: "play none none reverse"
      }
    }
  );
});

// Image Parallax (Inner scale/y translation)
const parallaxImages = document.querySelectorAll('.image-parallax');
parallaxImages.forEach((img) => {
  gsap.to(img, {
    yPercent: 15,
    ease: "none",
    scrollTrigger: {
      trigger: img.parentElement,
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
});
