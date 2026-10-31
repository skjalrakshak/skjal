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
      let displayedVal = counterVal.val;
      if (counterEl) counterEl.textContent = displayedVal;
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
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto',
            onUpdate: () => {
              if (counterEl) {
                const nextVal = Math.min(100, Math.floor(counterVal.val));
                if (nextVal > displayedVal) {
                  displayedVal = nextVal;
                  counterEl.textContent = displayedVal;
                }
              }
            }
          });
        } else {
          if (target > displayedVal) {
            displayedVal = target;
            counterEl.textContent = displayedVal;
          }
        }

        if ((loaded === images.length || elapsed >= minDisplayTime) && !isFinished) {
          finishPreloader();
        }
      };

      const morphLogoToLanding = () => {
        const logoEl = preloaderLogo;
        const destinationLogo = document.querySelector('.site-brand .brand-logo') || document.querySelector('.header .brand-logo') || document.querySelector('.brand-logo');
        const destinationText = document.querySelector('.site-brand .brand-wording strong') || document.querySelector('.header .brand-wording strong') || document.querySelector('.brand-wording strong');
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
        clearInterval(interval);

        if (window.gsap) {
          gsap.killTweensOf(counterVal);
          gsap.to(counterVal, {
            val: 100,
            duration: 0.35,
            ease: 'power2.out',
            overwrite: true,
            onUpdate: () => {
              if (counterEl) {
                const nextVal = Math.min(100, Math.floor(counterVal.val));
                if (nextVal > displayedVal) {
                  displayedVal = nextVal;
                  counterEl.textContent = displayedVal;
                }
              }
            },
            onComplete: () => {
              displayedVal = 100;
              if (counterEl) counterEl.textContent = 100;
              morphStarted = morphLogoToLanding();
              window.dispatchEvent(new Event('preloader:done'));
              gsap.to(preloader, {
                yPercent: -100,
                duration: 1.15,
                ease: 'power4.inOut',
                onComplete: () => {
                  preloader.style.display = 'none';
                  const dl = document.querySelector('.site-brand .brand-logo') || document.querySelector('.brand-logo');
                  const dt = document.querySelector('.site-brand .brand-wording strong') || document.querySelector('.brand-wording strong');
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
          displayedVal = 100;
          counterEl.textContent = 100;
          preloader.style.display = 'none';
          const dl = document.querySelector('.site-brand .brand-logo') || document.querySelector('.brand-logo');
          const dt = document.querySelector('.site-brand .brand-wording strong') || document.querySelector('.brand-wording strong');
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
        const dl = document.querySelector('.site-brand .brand-logo') || document.querySelector('.brand-logo');
        const dt = document.querySelector('.site-brand .brand-wording strong') || document.querySelector('.brand-wording strong');
        if (dl) dl.style.opacity = '1';
        if (dt) dt.style.opacity = '1';
      }, 2200);

      updateProgress();
    }
  } else {
    enablePageScroll();
  }

  // 1b. Landing Page Curtain Reveal Animation (nrkportfolio.in Luxury Standard - Crisp, Immediate)
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

    if (prefersReducedMotion || isTransition) {
      if (headerWrap) gsap.set(headerWrap, { opacity: 1, y: 0, clearProps: 'transform,opacity' });
      document.querySelectorAll('.hero-line').forEach(el => {
        el.style.overflow = 'visible';
      });
      if (heroTitleLines.length) gsap.set(heroTitleLines, { clearProps: 'transform,willChange' });
      if (prefersReducedMotion) return;
    }

    // Set initial hidden states before entrance (low displacement for swift, crisp emergence)
    if (headerWrap && !isTransition) {
      gsap.set(headerWrap, { y: -45, opacity: 0 });
    }
    if (heroTitleLines.length && !isTransition) {
      gsap.set(heroTitleLines, { yPercent: 118 });
    }
    if (heroLede && !isTransition) {
      gsap.set(heroLede, { y: 22, opacity: 0 });
    }
    if (heroActions && !isTransition) {
      gsap.set(heroActions, { y: 18, opacity: 0 });
    }
    if (heroVisual && !isTransition) {
      gsap.set(heroVisual, { y: 30, scale: 0.96, opacity: 0 });
    }
    if (domainItems.length && !isTransition) {
      gsap.set(domainItems, { y: 18, opacity: 0 });
    }

    const startReveal = () => {
      const tl = gsap.timeline({
        defaults: { ease: 'power4.out' },
        onComplete: () => {
          document.querySelectorAll('.hero-line').forEach(el => {
            el.style.overflow = 'visible';
          });
          if (heroTitleLines.length) {
            gsap.set(heroTitleLines, { clearProps: 'transform,willChange' });
          }
        }
      });

      // 1. Header slides smoothly into place (from portfolio Navbar drop)
      if (headerWrap && !isTransition) {
        tl.to(headerWrap, {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power4.out',
          clearProps: 'transform,opacity'
        }, 0.04);
      }

      // 2. Headline typography lines reveal smoothly from overflow mask
      if (heroTitleLines.length && !isTransition) {
        tl.to(heroTitleLines, {
          yPercent: 0,
          duration: 0.85,
          stagger: 0.08,
          ease: 'power4.out',
          onComplete: () => {
            document.querySelectorAll('.hero-line').forEach(el => {
              el.style.overflow = 'visible';
            });
            gsap.set(heroTitleLines, { clearProps: 'transform,willChange' });
          }
        }, 0.06);
      }

      // 3. Hero Visual expands with rich scale and glide
      if (heroVisual && !isTransition) {
        tl.to(heroVisual, {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.88,
          ease: 'power3.out',
          clearProps: 'transform'
        }, 0.12);
      }

      // 4. Hero description paragraph fades and glides up
      if (heroLede && !isTransition) {
        tl.to(heroLede, {
          y: 0,
          opacity: 1,
          duration: 0.68,
          ease: 'power3.out',
          clearProps: 'transform'
        }, 0.18);
      }

      // 5. Action CTA buttons slide in
      if (heroActions && !isTransition) {
        tl.to(heroActions, {
          y: 0,
          opacity: 1,
          duration: 0.62,
          ease: 'power3.out',
          clearProps: 'transform'
        }, 0.25);
      }

      // 6. Domain capabilities band items stagger in
      if (domainItems.length && !isTransition) {
        tl.to(domainItems, {
          y: 0,
          opacity: 1,
          duration: 0.62,
          stagger: 0.05,
          ease: 'power3.out',
          clearProps: 'transform'
        }, 0.32);
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

  // 4. Global Smart Scroll Header (Direct from nrkportfolio.in: Instant response, zero latency, rock-solid mobile stability)
  const headerWrap = document.querySelector('.header-wrap');
  const mobileMenu = document.getElementById('mobile-menu');

  if (headerWrap) {
    let lastScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    let isTicking = false;
    const SCROLL_DOWN_THRESHOLD = 20; // Matches nrkportfolio.in standard (> 20px)

    function updateHeader() {
      // Keep header visible if mobile drawer is open
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

      const currentScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);

      // At the very top of the page: always visible in its fixed place
      if (currentScrollY <= SCROLL_DOWN_THRESHOLD) {
        headerWrap.classList.remove('header-hidden');
        lastScrollY = currentScrollY;
        return;
      }

      // Scrolling DOWN -> hide header immediately so it does NOT follow along with the scroll
      if (currentScrollY > lastScrollY) {
        if (window.gsap && gsap.isTweening(headerWrap)) {
          gsap.killTweensOf(headerWrap);
          headerWrap.style.transform = '';
          headerWrap.style.opacity = '';
        }
        headerWrap.classList.add('header-hidden');
      }
      // Scrolling UP -> reveal header instantly
      else if (currentScrollY < lastScrollY) {
        if (window.gsap && gsap.isTweening(headerWrap)) {
          gsap.killTweensOf(headerWrap);
          headerWrap.style.transform = '';
          headerWrap.style.opacity = '';
        }
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

    // Native scroll event listener (matches nrkportfolio.in architecture)
    window.addEventListener('scroll', onScrollTick, { passive: true });

    // Also sync with Lenis scroll if available so inertial scrolling is instantaneous
    if (window.lenis) {
      window.lenis.on('scroll', onScrollTick);
    }

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

  // 6. GSAP ScrollTrigger Reveals - Award-Winning Luxury Standard (Awwwards / FWA Grade - Low Latency, Immediate)
  function initGSAP() {
    if (!window.gsap) return;

    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Ensure all elements are immediately visible for accessibility
      document.querySelectorAll('.hero-line').forEach(el => {
        el.style.overflow = 'visible';
      });
      return;
    }

    if (!window.ScrollTrigger) return;

    // A. Capabilities Band Staggered Lift (.domain-band)
    const domainItems = document.querySelectorAll('.domain-band .domain-item');
    if (domainItems.length > 0) {
      gsap.fromTo(
        domainItems,
        { y: 20, autoAlpha: 0, scale: 0.98 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 0.65,
          stagger: 0.05,
          ease: 'power4.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: '.domain-band',
            start: 'top 96%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // B. Enterprise Partners Ecosystem (.partner-strip)
    const partnerTitle = document.querySelector('.partner-ecosystem-title');
    const partnerCards = document.querySelectorAll('.partner-cards-grid .partner-card');
    const partnerMarks = document.querySelectorAll('.partner-wordmark, .make-in-india-mark');

    if (partnerTitle) {
      gsap.fromTo(
        partnerTitle,
        { y: 16, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.65,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.partner-ecosystem-header',
            start: 'top 96%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    if (partnerCards.length > 0) {
      gsap.fromTo(
        partnerCards,
        { y: 24, autoAlpha: 0, scale: 0.98 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 0.75,
          stagger: 0.06,
          ease: 'power4.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: '.partner-cards-grid',
            start: 'top 96%',
            toggleActions: 'play none none none'
          }
        }
      );
    } else if (partnerMarks.length > 0) {
      gsap.fromTo(
        partnerMarks,
        { scale: 0.97, autoAlpha: 0, y: 16 },
        {
          scale: 1,
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.05,
          ease: 'power4.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: '.partner-strip',
            start: 'top 96%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // C. Masked Value Proposition Banner (.masked-banner)
    const maskedBanner = document.querySelector('.masked-banner');
    if (maskedBanner) {
      const mbEyebrow = maskedBanner.querySelector('.section-eyebrow');
      const mbTitle = maskedBanner.querySelector('.masked-banner-title');
      const mbDesc = maskedBanner.querySelector('.masked-banner-desc');

      const mbTl = gsap.timeline({
        scrollTrigger: {
          trigger: maskedBanner,
          start: 'top 96%',
          toggleActions: 'play none none none'
        }
      });

      if (mbEyebrow) {
        mbTl.fromTo(mbEyebrow, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' });
      }
      if (mbTitle) {
        mbTl.fromTo(mbTitle, { y: 22, scale: 0.98, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: 'power4.out' }, '-=0.35');
      }
      if (mbDesc) {
        mbTl.fromTo(mbDesc, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65, ease: 'power3.out' }, '-=0.55');
      }
    }

    // D. Universal Section Headings Reveal with Architectural Tilt (.section-top, .contact-header, .subhead-row)
    const sectionTops = document.querySelectorAll('.section-top, .contact-header, .subhead-row');
    sectionTops.forEach(st => {
      const eyebrow = st.querySelector('.section-eyebrow');
      const heading = st.querySelector('.section-heading, h2, h3');
      const bodyCopy = st.querySelector('.body-copy, .contact-desc, p');

      if (heading) {
        const stTl = gsap.timeline({
          scrollTrigger: {
            trigger: st,
            start: 'top 96%',
            toggleActions: 'play none none none'
          }
        });

        if (eyebrow) {
          stTl.fromTo(eyebrow, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' });
        }

        stTl.fromTo(
          heading,
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.75, ease: 'power4.out', clearProps: 'transform' },
          eyebrow ? '-=0.35' : 0
        );

        if (bodyCopy) {
          stTl.fromTo(
            bodyCopy,
            { y: 14, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.65, ease: 'power3.out', clearProps: 'transform' },
            '-=0.55'
          );
        }
      }
    });

    // E. Services Rows Staggered Reveal with Internal Tag Cascade (.service-row)
    const serviceRows = document.querySelectorAll('.service-row');
    if (serviceRows.length > 0) {
      serviceRows.forEach((row, idx) => {
        const rowTags = row.querySelectorAll('.service-tags span');
        const rTl = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            start: 'top 96%',
            toggleActions: 'play none none none'
          }
        });

        rTl.fromTo(
          row,
          { y: 22, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.75, ease: 'power4.out', clearProps: 'transform' }
        );

        if (rowTags.length > 0) {
          rTl.fromTo(
            rowTags,
            { y: 6, scale: 0.95, autoAlpha: 0 },
            { y: 0, scale: 1, autoAlpha: 1, stagger: 0.025, duration: 0.45, ease: 'back.out(1.2)', clearProps: 'transform' },
            '-=0.55'
          );
        }
      });
    }

    // F. Sticky Steps Interactive Showcase Controller (Abatable Pattern)
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

    // G. Products Suite Grid - Cinematic Dual-Plane Camera Pullback (.product-card)
    const productGrid = document.querySelector('.product-grid');
    const productCards = document.querySelectorAll('.product-card');
    const productPhotos = document.querySelectorAll('.product-photo');
    const productNote = document.querySelector('.product-note');

    if (productCards.length > 0) {
      const pTl = gsap.timeline({
        scrollTrigger: {
          trigger: productGrid || productCards[0],
          start: 'top 96%',
          toggleActions: 'play none none none'
        }
      });

      // Card physical lift & emergence
      pTl.fromTo(
        productCards,
        { y: 24, autoAlpha: 0, scale: 0.98 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 0.78,
          stagger: 0.06,
          ease: 'power4.out',
          clearProps: 'transform'
        }
      );

      // Camera lens zoom settling inside card media
      if (productPhotos.length > 0) {
        pTl.fromTo(
          productPhotos,
          { scale: 1.06 },
          { scale: 1.0, duration: 0.9, ease: 'power3.out', clearProps: 'transform' },
          0.05
        );
      }

      // Specs list internal cascade
      productCards.forEach((card, cIdx) => {
        const specItems = card.querySelectorAll('.spec-list li');
        if (specItems.length > 0) {
          pTl.fromTo(
            specItems,
            { y: 8, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, stagger: 0.02, duration: 0.45, ease: 'power3.out', clearProps: 'transform' },
            0.2 + cIdx * 0.06
          );
        }
      });

      if (productNote) {
        pTl.fromTo(
          productNote,
          { y: 14, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.65, ease: 'power3.out' },
          '-=0.45'
        );
      }
    }

    // H. Industries Grid Staggered Reveal (.industry-card)
    const industryGrid = document.querySelector('.industry-grid');
    const industryCards = document.querySelectorAll('.industry-card');
    if (industryCards.length > 0) {
      gsap.fromTo(
        industryCards,
        { y: 24, autoAlpha: 0, scale: 0.98 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 0.75,
          stagger: 0.06,
          ease: 'power4.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: industryGrid || industryCards[0],
            start: 'top 96%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // I. Company / About Main Section (.company-main)
    const companyMain = document.querySelector('.company-main');
    if (companyMain) {
      const companyNote = companyMain.querySelector('.company-note');
      const companyCopyParas = companyMain.querySelectorAll('.company-copy p');
      const companyTags = companyMain.querySelectorAll('.company-tags span');

      const cTl = gsap.timeline({
        scrollTrigger: {
          trigger: companyMain,
          start: 'top 96%',
          toggleActions: 'play none none none'
        }
      });

      if (companyNote) {
        cTl.fromTo(
          companyNote,
          { x: -20, y: 10, rotation: -0.8, autoAlpha: 0, scale: 0.98 },
          { x: 0, y: 0, rotation: 0, autoAlpha: 1, scale: 1, duration: 0.78, ease: 'power4.out', clearProps: 'transform' }
        );
      }

      if (companyCopyParas.length > 0) {
        cTl.fromTo(
          companyCopyParas,
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.68, stagger: 0.05, ease: 'power4.out', clearProps: 'transform' },
          companyNote ? '-=0.6' : 0
        );
      }

      if (companyTags.length > 0) {
        cTl.fromTo(
          companyTags,
          { scale: 0.92, y: 8, autoAlpha: 0 },
          { scale: 1, y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.025, ease: 'back.out(1.4)', clearProps: 'transform' },
          '-=0.45'
        );
      }
    }

    // J. Leadership & Advisory Profiles (.person)
    const people = document.querySelectorAll('.person');
    if (people.length > 0) {
      const pTeamTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.people-grid',
          start: 'top 96%',
          toggleActions: 'play none none none'
        }
      });

      pTeamTl.fromTo(
        people,
        { y: 22, autoAlpha: 0, scale: 0.98 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 0.75,
          stagger: 0.06,
          ease: 'power4.out',
          clearProps: 'transform'
        }
      );

      const personPhotos = document.querySelectorAll('.person-photo');
      if (personPhotos.length > 0) {
        pTeamTl.fromTo(
          personPhotos,
          { scale: 1.05 },
          { scale: 1.0, duration: 0.85, ease: 'power3.out', clearProps: 'transform' },
          0.06
        );
      }
    }

    // K. Direct Engineering Consultation Buttons (.contact-channels)
    const contactChannels = document.querySelector('.contact-channels');
    if (contactChannels) {
      const channelBtns = contactChannels.querySelectorAll('.btn');
      if (channelBtns.length > 0) {
        gsap.fromTo(
          channelBtns,
          { y: 16, autoAlpha: 0, scale: 0.96 },
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.05,
            ease: 'back.out(1.2)',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: contactChannels,
              start: 'top 96%',
              toggleActions: 'play none none none'
            }
          }
        );
      }
    }

    // L. Product Inner Pages Specs & Flow (.spec-card, .arch-step, .timeline-card)
    const specCards = document.querySelectorAll('.spec-card');
    if (specCards.length > 0) {
      gsap.fromTo(
        specCards,
        { y: 22, autoAlpha: 0, scale: 0.98 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 0.75,
          stagger: 0.06,
          ease: 'power4.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: '.product-specs-grid',
            start: 'top 96%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    const archSteps = document.querySelectorAll('.arch-step');
    if (archSteps.length > 0) {
      gsap.fromTo(
        archSteps,
        { y: 20, autoAlpha: 0, scale: 0.98 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 0.75,
          stagger: 0.06,
          ease: 'power4.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: '.arch-flow',
            start: 'top 96%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // M. Subpage Hero Section (.product-hero)
    const productHero = document.querySelector('.product-hero');
    if (productHero) {
      const phVisual = productHero.querySelector('.hero-visual');
      const phCopyElements = productHero.querySelectorAll('.hero-copy > *');

      if (phCopyElements.length > 0) {
        gsap.fromTo(
          phCopyElements,
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.05, ease: 'power4.out', clearProps: 'transform' }
        );
      }
      if (phVisual) {
        gsap.fromTo(
          phVisual,
          { y: 24, autoAlpha: 0, scale: 0.96 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 0.85, ease: 'power4.out', clearProps: 'transform' }
        );
      }
    }

    // N. Parallax Scrub on Hero Media
    const heroDevice = document.querySelector('.hero-device');
    if (heroDevice) {
      gsap.to(heroDevice, {
        y: -32,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.4
        }
      });
    }

    // O. Footer Staggered Reveal (.footer)
    const footer = document.querySelector('.footer');
    if (footer) {
      const footerBrand = footer.querySelector('.footer-brand');
      const footerCols = footer.querySelectorAll('.footer-col');
      const footerBottom = footer.querySelector('.footer-bottom');

      const fTl = gsap.timeline({
        scrollTrigger: {
          trigger: footer,
          start: 'top 96%',
          toggleActions: 'play none none none'
        }
      });

      if (footerBrand) {
        fTl.fromTo(footerBrand, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65, ease: 'power4.out', clearProps: 'transform' });
      }
      if (footerCols.length > 0) {
        fTl.fromTo(
          footerCols,
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.05, ease: 'power4.out', clearProps: 'transform' },
          footerBrand ? '-=0.45' : 0
        );
      }
      if (footerBottom) {
        fTl.fromTo(
          footerBottom,
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.out', clearProps: 'transform' },
          '-=0.4'
        );
      }
    }

    // P. CTA Banners (.cta-banner, .footer-cta)
    const ctaBanners = document.querySelectorAll('.cta-banner, .footer-cta');
    ctaBanners.forEach(banner => {
      gsap.fromTo(
        banner,
        { y: 22, autoAlpha: 0, scale: 0.98 },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 0.75,
          ease: 'power4.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: banner,
            start: 'top 96%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Refresh ScrollTrigger calculations
    ScrollTrigger.refresh();
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
