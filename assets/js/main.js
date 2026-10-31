/**
 * SKJAL - Modern GSAP Animation & Interaction Controller
 * Enterprise performance, buttery-smooth Lenis inertial scrolling,
 * staggered letter spin/roll micro-interactions, real-time sync preloader.
 */

(function () {
  'use strict';

  // 0a. Register Service Worker for Instant Return Visits & Cache Acceleration
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  // 0b. Initialize Lenis Smooth Inertial Scrolling Engine (Desktop & Mobile Touch Sync)
  let lenisInstance = null;
  if (typeof window.Lenis !== 'undefined') {
    lenisInstance = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false,



    });
    window.lenis = lenisInstance;

    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      window.ScrollTrigger.config({ ignoreMobileResize: true });
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
      requestAnimationFrame(() => window.ScrollTrigger.refresh());
      setTimeout(() => window.ScrollTrigger.refresh(), 120);
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
      const isReturnVisitor = !!localStorage.getItem('skjal_visited');
      const minDisplayTime = isReturnVisitor ? 180 : 850;
      const counterVal = { val: isReturnVisitor ? 75 : 0 };
      try { localStorage.setItem('skjal_visited', 'true'); } catch (e) {}

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
            duration: 0.55,
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
        const destinationLogo = document.querySelector('.header .brand-logo') || document.querySelector('.brand-logo');
        const destinationText = document.querySelector('.header .brand-wording strong') || document.querySelector('.brand-wording strong');
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
          padding: '0',
          zIndex: '1000002',
          pointerEvents: 'none',
          willChange: 'transform, opacity',
          transformOrigin: 'top left',
        });
        document.body.appendChild(clone);
        logoEl.style.visibility = 'hidden';
        destinationLogo.style.opacity = '0';

        const morphDuration = 1.15;

        gsap.to(clone, {
          x: to.left - from.left,
          y: to.top - from.top,
          scaleX: to.width / from.width,
          scaleY: to.height / from.height,
          duration: morphDuration,
          ease: 'power3.inOut'
        });

        // Also animate brand name "SKJAL" with exact matching typography
        let cloneT = null;
        if (preloaderBrandText && destinationText) {
          const fromT = preloaderBrandText.getBoundingClientRect();
          const toT = destinationText.getBoundingClientRect();
          if (fromT.width && toT.width) {
            cloneT = document.createElement('span');
            cloneT.textContent = preloaderBrandText.textContent;
            const destComputed = window.getComputedStyle(destinationText);
            Object.assign(cloneT.style, {
              position: 'fixed',
              top: `${fromT.top}px`,
              left: `${fromT.left}px`,
              fontFamily: destComputed.fontFamily || 'var(--font-display)',
              fontSize: window.getComputedStyle(preloaderBrandText).fontSize,
              fontWeight: destComputed.fontWeight || '700',
              letterSpacing: destComputed.letterSpacing || '0.08em',
              textTransform: 'uppercase',
              lineHeight: '1',
              color: destComputed.color || '#0b0d10',
              margin: '0',
              padding: '0',
              zIndex: '1000002',
              pointerEvents: 'none',
              willChange: 'transform, opacity',
              transformOrigin: 'top left',
            });
            document.body.appendChild(cloneT);
            preloaderBrandText.style.visibility = 'hidden';
            destinationText.style.opacity = '0';

            const scaleT = toT.height / fromT.height;
            gsap.to(cloneT, {
              x: toT.left - fromT.left,
              y: toT.top - fromT.top,
              scale: scaleT,
              duration: morphDuration,
              ease: 'power3.inOut'
            });
          }
        }

        // Glitch-free optical merge: smoothly crossfade clones into destination elements
        const crossfadeDelay = morphDuration - 0.22;
        const crossfadeDuration = 0.24;

        gsap.to([destinationLogo, destinationText].filter(Boolean), {
          opacity: 1,
          duration: crossfadeDuration,
          delay: crossfadeDelay,
          ease: 'power2.out'
        });

        gsap.to([clone, cloneT].filter(Boolean), {
          opacity: 0,
          duration: crossfadeDuration,
          delay: crossfadeDelay,
          ease: 'power2.out',
          onComplete: () => {
            clone.remove();
            if (cloneT) cloneT.remove();
            destinationLogo.style.opacity = '';
            if (destinationText) destinationText.style.opacity = '';
            enablePageScroll();
          }
        });

        return true;
      };

      const finishPreloader = () => {
        if (isFinished) return;
        isFinished = true;

        if (window.gsap) {
          gsap.to(counterVal, {
            val: 100,
            duration: 0.45,
            ease: 'power3.out',
            onUpdate: () => {
              if (counterEl) counterEl.textContent = Math.min(100, Math.floor(counterVal.val));
            },
            onComplete: () => {
              morphStarted = morphLogoToLanding();
              window.dispatchEvent(new Event('preloader:done'));
              gsap.to(preloader, {
                yPercent: -100,
                duration: 1.15,
                ease: 'power4.inOut',
                onComplete: () => {
                  preloader.style.display = 'none';
                  const dl = document.querySelector('.header .brand-logo');
                  const dt = document.querySelector('.header .brand-wording strong');
                  if (dl) dl.style.opacity = '1';
                  if (dt) dt.style.opacity = '1';
                  enablePageScroll();
                }
              });
              if (counterEl) {
                gsap.to(counterEl, { opacity: 0, y: 15, duration: 0.45, ease: 'power2.in' });
              }
            }
          });
        } else {
          counterEl.textContent = 100;
          preloader.style.display = 'none';
          const dl = document.querySelector('.header .brand-logo');
          const dt = document.querySelector('.header .brand-wording strong');
          if (dl) dl.style.opacity = '1';
          if (dt) dt.style.opacity = '1';
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
        const dl = document.querySelector('.header .brand-logo');
        const dt = document.querySelector('.header .brand-wording strong');
        if (dl) dl.style.opacity = '1';
        if (dt) dt.style.opacity = '1';
      }, 2200);

      updateProgress();
    }
  } else {
    enablePageScroll();
  }

  // 1b. Landing Page Curtain Reveal Animation (nrkportfolio.in Luxury Standard)
  function initLandingReveal() {
    if (!window.gsap) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const heroTitleLines = document.querySelectorAll('.hero-line-inner');
    const heroLede = document.querySelector('.hero-lede');
    const heroActions = document.querySelector('.hero-actions');
    const heroVisual = document.querySelector('.hero-visual');
    const domainItems = document.querySelectorAll('.domain-band .domain-item');
    const headerWrap = document.querySelector('.header-wrap');
    const isTransition = sessionStorage.getItem('isPageTransition') === 'true';

    if (prefersReducedMotion) {
      if (headerWrap) gsap.set(headerWrap, { opacity: 1, y: 0 });
      return;
    }

    // Set initial hidden states before entrance
    if (headerWrap && !isTransition) {
      gsap.set(headerWrap, { y: -60, opacity: 0 });
    }
    if (heroTitleLines.length && !isTransition) {
      gsap.set(heroTitleLines, { yPercent: 125 });
    }
    if (heroLede && !isTransition) {
      gsap.set(heroLede, { y: 35, opacity: 0 });
    }
    if (heroActions && !isTransition) {
      gsap.set(heroActions, { y: 30, opacity: 0 });
    }
    if (heroVisual && !isTransition) {
      gsap.set(heroVisual, { y: 50, scale: 0.94, opacity: 0 });
    }
    if (domainItems.length && !isTransition) {
      gsap.set(domainItems, { y: 25, opacity: 0 });
    }

    const startReveal = () => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      // 1. Header slides smoothly into place (from portfolio Navbar drop)
      if (headerWrap && !isTransition) {
        tl.to(headerWrap, {
          y: 0,
          opacity: 1,
          duration: 1.4,
          ease: 'power4.out',
          clearProps: 'transform,opacity'
        }, 0.1);
      }

      // 2. Headline typography lines reveal smoothly from overflow mask
      if (heroTitleLines.length && !isTransition) {
        tl.to(heroTitleLines, {
          yPercent: 0,
          duration: 1.3,
          stagger: 0.12,
          ease: 'power4.out'
        }, 0.15);
      }

      // 3. Hero Visual expands with rich scale and glide
      if (heroVisual && !isTransition) {
        tl.to(heroVisual, {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 1.45,
          ease: 'power3.out'
        }, 0.25);
      }

      // 4. Hero description paragraph fades and glides up
      if (heroLede && !isTransition) {
        tl.to(heroLede, {
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'power3.out'
        }, 0.4);
      }

      // 5. Action CTA buttons slide in
      if (heroActions && !isTransition) {
        tl.to(heroActions, {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out'
        }, 0.52);
      }

      // 6. Domain capabilities band items stagger in
      if (domainItems.length && !isTransition) {
        tl.to(domainItems, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out'
        }, 0.62);
      }
    };

    const preloaderEl = document.getElementById('skjal-preloader');
    if (preloaderEl && preloaderEl.style.display !== 'none' && !isTransition) {
      window.addEventListener('preloader:done', startReveal, { once: true });
    } else {
      startReveal();
    }
  }

  initLandingReveal();

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
      // Smoothly reset accordion if open so next open is in clean state
      const accordion = menu.querySelector('.mobile-accordion');
      const accordionBtn = menu.querySelector('#mobile-products-toggle');
      const accordionContent = menu.querySelector('.mobile-accordion-content');
      if (accordion && accordion.classList.contains('open')) {
        accordion.classList.remove('open');
        if (accordionBtn) accordionBtn.setAttribute('aria-expanded', 'false');
        if (accordionContent) {
          accordionContent.style.maxHeight = '0px';
          accordionContent.style.opacity = '0';
          accordionContent.style.transform = 'translateY(-6px)';
        }
      }
    }

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      if (menu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Event delegation on mobile menu: handle link clicks & accordion toggling
    menu.addEventListener('click', function (e) {
      // Check if accordion toggle button was clicked
      const accordionBtn = e.target.closest('#mobile-products-toggle');
      if (accordionBtn) {
        e.preventDefault();
        e.stopPropagation();
        const accordionContainer = accordionBtn.closest('.mobile-accordion');
        if (accordionContainer) {
          const content = accordionContainer.querySelector('.mobile-accordion-content');
          const isOpen = accordionContainer.classList.contains('open');
          if (isOpen) {
            accordionContainer.classList.remove('open');
            accordionBtn.setAttribute('aria-expanded', 'false');
            if (content) {
              content.style.maxHeight = '0px';
              content.style.opacity = '0';
              content.style.transform = 'translateY(-6px)';
            }
          } else {
            accordionContainer.classList.add('open');
            accordionBtn.setAttribute('aria-expanded', 'true');
            if (content) {
              content.style.maxHeight = (content.scrollHeight + 16) + 'px';
              content.style.opacity = '1';
              content.style.transform = 'translateY(0)';
            }
          }
        }
        return;
      }

      // If any navigation link was tapped, close drawer
      const link = e.target.closest('a');
      if (link) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  // 3b. Staggered Character Spin/Roll Animation Initializer
  // Letters spin one-by-one with cascading delays on hover. Button background stays solid.
  function initStaggeredTextRoll() {
    const targets = document.querySelectorAll('.btn, .btn-buy-now, .footer-cta-button, .product-link, [data-roll]');
    targets.forEach(el => {
      if (el.querySelector('.char-roll')) return; // already transformed

      let text = '';
      Array.from(el.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          text += node.textContent;
        }
      });
      text = text.replace(/\s+/g, ' ').trim();
      if (!text) return;

      if (!el.getAttribute('aria-label')) {
        el.setAttribute('aria-label', text);
      }

      const rollWrapper = document.createElement('span');
      rollWrapper.className = 'roll-text';
      rollWrapper.setAttribute('aria-hidden', 'true');

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
          charSpan.innerHTML = `<span class="char-primary">${char}</span><span class="char-clone" aria-hidden="true">${char}</span>`;
          rollWrapper.appendChild(charSpan);
        }
      }

      const svg = el.querySelector('svg');

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

  // 4. Global Smart Scroll Header (Direct from nrkportfolio.in: Instant response, zero latency, zero threshold buffering)
  const headerWrap = document.querySelector('.header-wrap');
  const mobileMenu = document.getElementById('mobile-menu');

  if (headerWrap) {
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    let isTicking = false;

    function updateHeader() {
      if (document.body.classList.contains('menu-open') || (mobileMenu && mobileMenu.classList.contains('open'))) {
        headerWrap.classList.remove('header-hidden');
        return;
      }

      // If user has a dropdown open, keep header visible
      const hasOpenDropdown = document.querySelector('.nav-dropdown.is-open');
      if (hasOpenDropdown) {
        headerWrap.classList.remove('header-hidden');
        return;
      }

      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (currentScrollY > lastScrollY && currentScrollY > 20) {
        headerWrap.classList.add('header-hidden');
      } else if (currentScrollY < lastScrollY) {
        headerWrap.classList.remove('header-hidden');
      }
      lastScrollY = currentScrollY;
    }

    function onScrollTick() {
      if (!isTicking) {
        window.requestAnimationFrame(() => {
          updateHeader();
          isTicking = false;
        });
        isTicking = true;
      }
    }

    window.addEventListener('scroll', onScrollTick, { passive: true });

    if (window.lenis && typeof window.lenis.on === 'function') {
      window.lenis.on('scroll', onScrollTick);
    }

    window.addEventListener('resize', () => {
      lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      updateHeader();
    }, { passive: true });

    // Initialize state
    updateHeader();
  }

  // Bracket Animation Helper (nrkportfolio.in style: guarantees [ text ] structure)
  document.querySelectorAll('.nav a:not(.nav-cta), .nav-dropdown-trigger').forEach(link => {
    if (!link.querySelector('.navbar__bracket')) {
      const arrow = link.querySelector('svg');
      let text = '';
      link.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          text += node.textContent.trim();
          node.remove();
        }
      });
      if (text) {
        const left = document.createElement('span');
        left.className = 'navbar__bracket';
        left.textContent = '[';
        const textSpan = document.createElement('span');
        textSpan.className = 'navbar__link-text';
        textSpan.textContent = text;
        const right = document.createElement('span');
        right.className = 'navbar__bracket';
        right.textContent = ']';
        if (arrow) {
          link.insertBefore(left, arrow);
          link.insertBefore(textSpan, arrow);
          link.insertBefore(right, arrow);
        } else {
          link.appendChild(left);
          link.appendChild(textSpan);
          link.appendChild(right);
        }
      }
    }
  });

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

  // 5b. Smooth Scroll for Anchor Links & In-Page Section Redirections
  function scrollToTargetSection(targetSelector, updateHistory = true) {
    if (!targetSelector || targetSelector === '#') return;
    if (targetSelector === '#top') {
      if (window.lenis) {
        window.lenis.scrollTo(0, { duration: 1.0 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (updateHistory && history.pushState) history.pushState(null, null, window.location.pathname);
      return;
    }

    try {
      const target = document.querySelector(targetSelector);
      if (target) {
        // Close mobile drawer if currently open
        const mobileMenu = document.getElementById('mobile-menu');
        const menuToggle = document.getElementById('menu-toggle');
        if (mobileMenu && mobileMenu.classList.contains('open')) {
          mobileMenu.classList.remove('open');
          if (menuToggle) {
            menuToggle.classList.remove('is-active');
            menuToggle.setAttribute('aria-expanded', 'false');
          }
          document.body.classList.remove('menu-open');
        }

        if (window.lenis) {
          window.lenis.scrollTo(target, { offset: -70, duration: 1.1 });
        } else {
          const top = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - 70;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        if (updateHistory && history.pushState) history.pushState(null, null, targetSelector);
      }
    } catch (err) {}
  }

  // Handle all same-page anchor clicks (both #section and /#section when on home)
  document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const rawHref = this.getAttribute('href');
      if (!rawHref) return;

      const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname === '';
      let targetSelector = '';

      if (rawHref.startsWith('#')) {
        targetSelector = rawHref;
      } else if (rawHref.startsWith('/#') && isHome) {
        targetSelector = rawHref.substring(1); // e.g. "/#services" -> "#services"
      }

      if (targetSelector) {
        const el = document.querySelector(targetSelector);
        if (el) {
          e.preventDefault();
          scrollToTargetSection(targetSelector, true);
        }
      }
    });
  });

  // Automatically scroll to section if URL was opened with a hash (e.g. from redirect or direct link)
  if (window.location.hash) {
    const initialHash = window.location.hash;
    window.addEventListener('load', () => {
      setTimeout(() => {
        scrollToTargetSection(initialHash, false);
      }, 350);
    });
  }

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
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      heroTl.fromTo(
        heroTitle,
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.95 }
      );

      if (heroLede) {
        heroTl.fromTo(
          heroLede,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.82 },
          '-=0.6'
        );
      }

      if (heroActions) {
        heroTl.fromTo(
          heroActions,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.72 },
          '-=0.55'
        );
      }

      if (heroVisual) {
        heroTl.fromTo(
          heroVisual,
          { scale: 0.96, opacity: 0, y: 14 },
          { scale: 1, opacity: 1, y: 0, duration: 1.05, ease: 'power3.out' },
          '-=0.65'
        );
      }
    }

    // B. Smooth, Rich ScrollTrigger Reveals
    if (window.ScrollTrigger) {
      // Capability Band Stagger
      const domainItems = document.querySelectorAll('.domain-item');
      if (domainItems.length > 0) {
        gsap.fromTo(
          domainItems,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.1,
            ease: 'power3.out',
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
            duration: 0.68,
            stagger: 0.08,
            ease: 'power3.out',
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
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.78,
            stagger: 0.1,
            ease: 'power3.out',
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

      // Products Cards
      const productCards = document.querySelectorAll('.product-card');
      if (productCards.length > 0) {
        gsap.fromTo(
          productCards,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.82,
            stagger: 0.12,
            ease: 'power3.out',
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
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.1,
            ease: 'power3.out',
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
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.1,
            ease: 'power3.out',
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
            { y: 18, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.75,
              ease: 'power3.out',
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
            scrub: 1.2
          }
        });
      }

      // Masked Banner Reveal
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
          mbTl.fromTo(maskedEyebrow, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' });
        }

        mbTl.fromTo(maskedBannerTitle,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out' },
          '-=0.35'
        );

        if (maskedBannerDesc) {
          mbTl.fromTo(maskedBannerDesc,
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out' },
            '-=0.5'
          );
        }
      }

      // Section Headings Scroll Reveal
      const sectionTops = document.querySelectorAll('.section-top, .contact-header');
      sectionTops.forEach(st => {
        const heading = st.querySelector('.section-heading');
        const eyebrow = st.querySelector('.section-eyebrow');
        const bodyCopy = st.querySelector('.body-copy, .contact-desc');

        if (heading) {
          const stTl = gsap.timeline({
            scrollTrigger: {
              trigger: st,
              start: 'top 88%',
              toggleActions: 'play none none none'
            }
          });

          if (eyebrow) {
            stTl.fromTo(eyebrow, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' });
          }

          stTl.fromTo(heading,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
            eyebrow ? '-=0.25' : 0
          );

          if (bodyCopy) {
            stTl.fromTo(bodyCopy,
              { y: 12, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
              '-=0.45'
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
            duration: 0.85, ease: 'power3.out',
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
            duration: 0.85, ease: 'power3.out',
            scrollTrigger: {
              trigger: footerCta,
              start: 'top 92%',
              toggleActions: 'play none none none'
            }
          }
        );
      }
    }

    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  }

  // Expose global animation re-init for blink-free transitions
  window.initPageAnimations = function() {
    initStaggeredTextRoll();
    initGSAP();
  };

  // Initialize once DOM is ready or after GSAP scripts load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGSAP);
  } else {
    initGSAP();
  }
})();
