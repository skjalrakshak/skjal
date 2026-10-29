/**
 * SKJAL - Modern GSAP Animation & Interaction Controller
 * Enterprise performance, buttery-smooth Lenis inertial scrolling,
 * staggered letter spin/roll micro-interactions, real-time sync preloader.
 */

(function () {
  'use strict';

  // 0. Initialize Lenis Smooth Inertial Scrolling Engine
  let lenisInstance = null;
  if (typeof window.Lenis !== 'undefined') {
    lenisInstance = new window.Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.5,
    });
    window.lenis = lenisInstance;

    if (window.ScrollTrigger) {
      lenisInstance.on('scroll', window.ScrollTrigger.update);
    }

    if (window.gsap) {
      window.gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  function enablePageScroll() {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    if (window.lenis && typeof window.lenis.start === 'function') {
      window.lenis.start();
      window.lenis.resize();
    }
    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  }

  // 1. Preloader Controller - Real-time Sync & Dual Logo + Brand Text Morph
  const preloader = document.getElementById('skjal-preloader');
  const preloaderLogo = document.getElementById('preloader-logo');
  const preloaderBrandText = document.getElementById('preloader-brand-name');
  const counterEl = document.getElementById('preloader-counter');

  if (preloader && counterEl) {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      preloader.style.display = 'none';
      enablePageScroll();
      window.dispatchEvent(new Event('preloader:done'));
    } else {
      document.body.style.overflow = 'hidden';
      if (window.lenis && typeof window.lenis.stop === 'function') {
        window.lenis.stop();
      }
      let isFinished = false;
      let morphStarted = false;
      const startTime = Date.now();
      const minDisplayTime = 850;
      const counterVal = { val: 0 };

      const gatingImages = () =>
        Array.from(document.images).filter(
          img => !img.src.includes('data:image') && img.loading !== 'lazy' && img.id !== 'preloader-logo'
        );

      const updateProgress = () => {
        if (isFinished) return;
        const images = gatingImages();
        let loaded = 0;
        images.forEach(img => {
          if (img.complete && img.naturalHeight !== 0) loaded++;
          else if (!img._tracked) {
            img._tracked = true;
            img.addEventListener('load', updateProgress, { once: true });
            img.addEventListener('error', updateProgress, { once: true });
          }
        });

        const elapsed = Date.now() - startTime;
        let target = images.length > 0 ? Math.floor((loaded / images.length) * 100) : Math.floor((elapsed / minDisplayTime) * 100);
        target = Math.min(100, Math.max(counterVal.val, target));

        if (window.gsap) {
          gsap.to(counterVal, {
            val: target,
            duration: 0.35,
            ease: 'power2.out',
            onUpdate: () => {
              if (counterEl) counterEl.textContent = Math.min(100, Math.floor(counterVal.val));
            }
          });
        } else {
          counterEl.textContent = target;
        }

        if ((loaded === images.length || elapsed >= minDisplayTime) && !isFinished) {
          finishPreloader();
        }
      };

      const morphLogoToLanding = () => {
        const logoEl = preloaderLogo;
        const destinationLogo = document.querySelector('.brand-logo');
        const destinationText = document.querySelector('.brand-wording strong');
        if (!logoEl || !destinationLogo || !window.gsap) return false;

        const from = logoEl.getBoundingClientRect();
        const to = destinationLogo.getBoundingClientRect();
        if (!from.width || !from.height || !to.width || !to.height) return false;

        const clone = document.createElement('img');
        clone.src = logoEl.currentSrc || logoEl.src;
        clone.alt = '';
        clone.setAttribute('aria-hidden', 'true');
        Object.assign(clone.style, {
          position: 'fixed',
          top: `${from.top}px`,
          left: `${from.left}px`,
          width: `${from.width}px`,
          height: `${from.height}px`,
          margin: '0',
          zIndex: '1000000',
          pointerEvents: 'none',
          willChange: 'transform',
          transformOrigin: 'top left',
        });
        document.body.appendChild(clone);
        logoEl.style.visibility = 'hidden';
        destinationLogo.style.visibility = 'hidden';

        gsap.to(clone, {
          x: to.left - from.left,
          y: to.top - from.top,
          scaleX: to.width / from.width,
          scaleY: to.height / from.height,
          duration: 0.95,
          ease: 'power3.inOut',
          onComplete: () => {
            destinationLogo.style.visibility = '';
            clone.remove();
            enablePageScroll();
          }
        });

        // Also animate brand name if present
        if (preloaderBrandText && destinationText) {
          const fromT = preloaderBrandText.getBoundingClientRect();
          const toT = destinationText.getBoundingClientRect();
          if (fromT.width && toT.width) {
            const cloneT = document.createElement('span');
            cloneT.textContent = preloaderBrandText.textContent;
            Object.assign(cloneT.style, {
              position: 'fixed',
              top: `${fromT.top}px`,
              left: `${fromT.left}px`,
              fontFamily: 'var(--sans)',
              fontSize: window.getComputedStyle(preloaderBrandText).fontSize,
              fontWeight: '700',
              color: '#0b0d10',
              margin: '0',
              zIndex: '1000000',
              pointerEvents: 'none',
              transformOrigin: 'top left',
            });
            document.body.appendChild(cloneT);
            preloaderBrandText.style.visibility = 'hidden';
            destinationText.style.visibility = 'hidden';

            gsap.to(cloneT, {
              x: toT.left - fromT.left,
              y: toT.top - fromT.top,
              scale: toT.height / fromT.height,
              duration: 0.95,
              ease: 'power3.inOut',
              onComplete: () => {
                destinationText.style.visibility = '';
                cloneT.remove();
              }
            });
          }
        }
        return true;
      };

      const finishPreloader = () => {
        if (isFinished) return;
        isFinished = true;

        if (window.gsap) {
          gsap.to(counterVal, {
            val: 100,
            duration: 0.35,
            ease: 'power3.out',
            onUpdate: () => {
              if (counterEl) counterEl.textContent = Math.min(100, Math.floor(counterVal.val));
            },
            onComplete: () => {
              morphStarted = morphLogoToLanding();
              window.dispatchEvent(new Event('preloader:done'));
              gsap.to(preloader, {
                yPercent: -100,
                duration: 0.82,
                ease: 'power3.inOut',
                onComplete: () => {
                  preloader.style.display = 'none';
                  enablePageScroll();
                }
              });
            }
          });
        } else {
          counterEl.textContent = 100;
          preloader.style.display = 'none';
          enablePageScroll();
        }
      };

      const interval = setInterval(() => {
        updateProgress();
        if (!isFinished && Date.now() - startTime >= minDisplayTime && document.readyState === 'complete') {
          finishPreloader();
        }
      }, 80);

      window.addEventListener('load', () => {
        clearInterval(interval);
        finishPreloader();
      });

      // Failsafe timeout
      setTimeout(() => {
        clearInterval(interval);
        finishPreloader();
      }, 2200);

      updateProgress();
    }
  } else {
    enablePageScroll();
  }

  // 2. Dynamic Year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 3. Mobile Menu Controller & Accordion
  const body = document.body;
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');

  if (toggle && menu) {
    function openMenu() {
      menu.classList.add('open');
      toggle.classList.add('is-active');
      body.classList.add('menu-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation menu');
    }

    function closeMenu() {
      menu.classList.remove('open');
      toggle.classList.remove('is-active');
      body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
    }

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      if (menu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close when tapping links (excluding accordion toggle)
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        closeMenu();
      }
    });

    // Mobile Products Accordion Toggle ("in mobile version, if i tap on the products it should expand or else dont show")
    const accordionToggle = document.getElementById('mobile-products-toggle');
    const accordionContainer = document.querySelector('.mobile-accordion');
    if (accordionToggle && accordionContainer) {
      accordionToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = accordionContainer.classList.contains('open');
        if (isOpen) {
          accordionContainer.classList.remove('open');
          accordionToggle.setAttribute('aria-expanded', 'false');
        } else {
          accordionContainer.classList.add('open');
          accordionToggle.setAttribute('aria-expanded', 'true');
        }
      });
    }
  }

  // 3b. Staggered Character Spin/Roll Animation Initializer
  // Letters spin one-by-one with cascading delays on hover. Button background stays solid.
  function initStaggeredTextRoll() {
    const targets = document.querySelectorAll('.btn, .nav-cta, .footer-cta-button, .product-link, .service-discuss');
    targets.forEach(el => {
      if (el.querySelector('.char-roll')) return; // already transformed

      const svg = el.querySelector('svg');
      let text = '';
      Array.from(el.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          text += node.textContent.trim() + ' ';
        }
      });
      text = text.trim();
      if (!text) return;

      const rollWrapper = document.createElement('span');
      rollWrapper.className = 'roll-text';

      let charIdx = 0;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === ' ') {
          const space = document.createElement('span');
          space.className = 'char-space';
          space.innerHTML = '&nbsp;';
          rollWrapper.appendChild(space);
        } else {
          const charSpan = document.createElement('span');
          charSpan.className = 'char-roll';
          charSpan.style.setProperty('--char-idx', charIdx++);
          charSpan.innerHTML = `
            <span class="char-primary">${char}</span>
            <span class="char-clone" aria-hidden="true">${char}</span>
          `;
          rollWrapper.appendChild(charSpan);
        }
      }

      Array.from(el.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          el.removeChild(node);
        }
      });

      if (svg) {
        el.insertBefore(rollWrapper, svg);
      } else {
        el.appendChild(rollWrapper);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStaggeredTextRoll);
  } else {
    initStaggeredTextRoll();
  }

  // 4. Smart Header on Scroll (Abatable Pattern: Hide on scroll down, reveal on scroll up, theme-adaptive)
  const headerWrap = document.querySelector('.header-wrap');
  function updateHeaderTheme() {
    if (!headerWrap) return;
    const darkSections = document.querySelectorAll('.theme-dark, .footer');
    const headerRect = headerWrap.getBoundingClientRect();
    const headerCenter = headerRect.top + (headerRect.height || 64) / 2;
    let isOverDark = false;

    for (const sec of darkSections) {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= headerCenter && rect.bottom >= headerCenter) {
        isOverDark = true;
        break;
      }
    }

    if (isOverDark) {
      headerWrap.classList.add('header-dark');
    } else {
      headerWrap.classList.remove('header-dark');
    }
  }

  if (lenisInstance) {
    lenisInstance.on('scroll', updateHeaderTheme);
  }

  if (headerWrap) {
    let lastScrollTop = 0;
    const delta = 8;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const st = window.pageYOffset || document.documentElement.scrollTop;

          // Add shadow if scrolled past 20px
          if (st > 20) {
            headerWrap.classList.add('header-scrolled');
          } else {
            headerWrap.classList.remove('header-scrolled');
          }

          // Dynamic theme switching (light vs dark)
          updateHeaderTheme();

          // Abatable-style scroll-direction behavior (only on desktop > 860px)
          // On mobile view, the navbar and logo remain strictly fixed and visible at the top
          if (window.innerWidth > 860) {
            if (Math.abs(lastScrollTop - st) > delta) {
              if (st > 120 && st > lastScrollTop && (!menu || !menu.classList.contains('open'))) {
                headerWrap.classList.add('header-hidden');
              } else {
                headerWrap.classList.remove('header-hidden');
              }
              lastScrollTop = st <= 0 ? 0 : st;
            }
          } else {
            headerWrap.classList.remove('header-hidden');
          }

          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', updateHeaderTheme, { passive: true });
    window.addEventListener('load', updateHeaderTheme);
    updateHeaderTheme();
  }

  // 5. Robust Navbar Dropdown (Hover + Click/Touch Toggle + Keyboard + Click-Outside)
  const navDropdowns = document.querySelectorAll('.nav-dropdown');
  navDropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    const dropMenu = dropdown.querySelector('.dropdown-menu');
    if (!trigger || !dropMenu) return;

    function openDropdown() {
      dropdown.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function closeDropdown() {
      dropdown.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function toggleDropdown(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (dropdown.classList.contains('is-open')) {
        closeDropdown();
      } else {
        openDropdown();
      }
    }

    // Click / touch toggle on trigger
    trigger.addEventListener('click', toggleDropdown);

    // Mouse hover support
    dropdown.addEventListener('mouseenter', openDropdown);
    dropdown.addEventListener('mouseleave', closeDropdown);

    // Focus support
    dropdown.addEventListener('focusin', openDropdown);
    dropdown.addEventListener('focusout', (e) => {
      if (!dropdown.contains(e.relatedTarget)) {
        closeDropdown();
      }
    });

    // Close when any item inside the dropdown is clicked
    dropMenu.querySelectorAll('a').forEach(item => {
      item.addEventListener('click', () => {
        closeDropdown();
      });
    });

    // Escape key closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown.classList.contains('is-open')) {
        closeDropdown();
        trigger.focus();
      }
    });

    // Click outside closes
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        closeDropdown();
      }
    });
  });

  // 5b. Smooth Scroll for Anchor Links (with Lenis and Native Fallback)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      if (href === '#top') {
        e.preventDefault();
        if (window.lenis) {
          window.lenis.scrollTo(0, { duration: 1.2 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (history.pushState) history.pushState(null, null, ' ');
        return;
      }
      try {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          if (window.lenis) {
            window.lenis.scrollTo(target, { offset: -70, duration: 1.2 });
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
          if (history.pushState) history.pushState(null, null, href);
        }
      } catch (err) {}
    });
  });

  // 6. GSAP Animations Initialization - Fast, Non-blocking, Zero-Latency
  function initGSAP() {
    if (!window.gsap) return;

    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // A. Hero Entrance Animation
    const heroTitle = document.querySelector('.hero h1');
    const heroLede = document.querySelector('.hero-lede');
    const heroActions = document.querySelector('.hero-actions');
    const heroVisual = document.querySelector('.hero-visual');

    if (heroTitle) {
      const heroTl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      heroTl.fromTo(
        heroTitle,
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.62 }
      );

      if (heroLede) {
        heroTl.fromTo(
          heroLede,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.48 },
          '-=0.4'
        );
      }

      if (heroActions) {
        heroTl.fromTo(
          heroActions,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.42 },
          '-=0.35'
        );
      }

      if (heroVisual) {
        heroTl.fromTo(
          heroVisual,
          { scale: 0.96, opacity: 0, y: 14 },
          { scale: 1, opacity: 1, y: 0, duration: 0.68, ease: 'power2.out' },
          '-=0.52'
        );
      }
    }

    // B. Fast, Natural ScrollTrigger Reveals (start: 'top 94%', subtle displacement, no delay gaps)
    if (window.ScrollTrigger) {
      // Capability Band Stagger
      const domainItems = document.querySelectorAll('.domain-item');
      if (domainItems.length > 0) {
        gsap.fromTo(
          domainItems,
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.42,
            stagger: 0.07,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.domain-band',
              start: 'top 94%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      // Partner Marks
      const partnerMarks = document.querySelectorAll('.partner-wordmark, .make-in-india-mark');
      if (partnerMarks.length > 0) {
        gsap.fromTo(
          partnerMarks,
          { scale: 0.96, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.38,
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.partner-strip',
              start: 'top 95%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      // Services Stagger
      const serviceRows = document.querySelectorAll('.service-row');
      if (serviceRows.length > 0) {
        gsap.fromTo(
          serviceRows,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            stagger: 0.07,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.service-list',
              start: 'top 93%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      // Sticky Steps Interactive Showcase Controller (Abatable Signature Scroll Pattern)
      const stepCards = document.querySelectorAll('.sticky-step-card');
      const visualCards = document.querySelectorAll('.sticky-visual-card');

      if (stepCards.length > 0 && visualCards.length > 0) {
        stepCards.forEach((card, index) => {
          ScrollTrigger.create({
            trigger: card,
            start: 'top 55%',
            end: 'bottom 55%',
            onEnter: () => activateStep(index),
            onEnterBack: () => activateStep(index)
          });
        });

        function activateStep(idx) {
          visualCards.forEach((vc, i) => {
            if (i === idx) {
              vc.classList.add('active');
            } else {
              vc.classList.remove('active');
            }
          });
        }
      }

      // Products Cards (Completely stable - NO cursor tilt)
      const productCards = document.querySelectorAll('.product-card');
      if (productCards.length > 0) {
        gsap.fromTo(
          productCards,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.48,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.product-grid',
              start: 'top 92%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      // Industry Cards
      const industryCards = document.querySelectorAll('.industry-card');
      if (industryCards.length > 0) {
        gsap.fromTo(
          industryCards,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.42,
            stagger: 0.07,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.industry-grid',
              start: 'top 93%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      // People / Team Grid
      const people = document.querySelectorAll('.person');
      if (people.length > 0) {
        gsap.fromTo(
          people,
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.42,
            stagger: 0.07,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.people-grid',
              start: 'top 94%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      // Generic Reveals for Inner Pages (specs, timeline, architecture)
      const genericReveals = document.querySelectorAll('.spec-card, .timeline-card, .arch-step');
      if (genericReveals.length > 0) {
        genericReveals.forEach(el => {
          gsap.fromTo(
            el,
            { y: 15, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.42,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 94%',
                toggleActions: 'play none none none'
              }
            }
          );
        });
      }

      // Subtle Hero Parallax
      const heroDevice = document.querySelector('.hero-device');
      if (heroDevice) {
        gsap.to(heroDevice, {
          y: -16,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          }
        });
      }

      // Masked Banner Reveal (Abatable Section 3 Pattern)
      const maskedBannerTitle = document.querySelector('.masked-banner-title');
      const maskedBannerDesc = document.querySelector('.masked-banner-desc');
      const maskedEyebrow = document.querySelector('.masked-banner .section-eyebrow');

      if (maskedBannerTitle) {
        const mbTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.masked-banner',
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });

        if (maskedEyebrow) {
          mbTl.fromTo(maskedEyebrow, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
        }

        mbTl.fromTo(maskedBannerTitle,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
          '-=0.2'
        );

        if (maskedBannerDesc) {
          mbTl.fromTo(maskedBannerDesc,
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
            '-=0.35'
          );
        }
      }

      // Section Headings Scroll Reveal (generic for all section-top blocks)
      const sectionTops = document.querySelectorAll('.section-top');
      sectionTops.forEach(st => {
        const heading = st.querySelector('.section-heading');
        const eyebrow = st.querySelector('.section-eyebrow');
        const bodyCopy = st.querySelector('.body-copy');

        if (heading) {
          const stTl = gsap.timeline({
            scrollTrigger: {
              trigger: st,
              start: 'top 88%',
              toggleActions: 'play none none none'
            }
          });

          if (eyebrow) {
            stTl.fromTo(eyebrow, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
          }

          stTl.fromTo(heading,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out' },
            eyebrow ? '-=0.15' : 0
          );

          if (bodyCopy) {
            stTl.fromTo(bodyCopy,
              { y: 12, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
              '-=0.3'
            );
          }
        }
      });

      // Company Section Note Card Reveal
      const companyNote = document.querySelector('.company-note');
      if (companyNote) {
        gsap.fromTo(companyNote,
          { y: 18, opacity: 0, scale: 0.98 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.55, ease: 'power2.out',
            scrollTrigger: {
              trigger: companyNote,
              start: 'top 92%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      // Footer CTA Reveal
      const footerCta = document.querySelector('.footer-cta');
      if (footerCta) {
        gsap.fromTo(footerCta,
          { y: 20, opacity: 0 },
          {
            y: 0, opacity: 1,
            duration: 0.55, ease: 'power2.out',
            scrollTrigger: {
              trigger: footerCta,
              start: 'top 92%',
              toggleActions: 'play none none none'
            }
          }
        );
      }
    }
  }

  // Initialize once DOM is ready or after GSAP scripts load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGSAP);
  } else {
    initGSAP();
  }
})();
