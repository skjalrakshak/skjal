/**
 * SKJAL - Signature Curved Curtain Page Transition Controller
 * Continuous, Zero-Blink Seamless Transition Engine with Centered Animated Brand Typography
 * 
 * Flow:
 *   1. Exit sweep: Curved curtain sweeps UP from bottom, covering viewport in rich #0A0A0A black.
 *   2. Brand animation: Animated SKJAL typography rises gracefully into the center of the dark curtain.
 *   3. DOM swap: While screen is covered, new page content (main, nav, mobile drawer, footer) is swapped seamlessly.
 *   4. Entry reveal: Letters glide upward into the sweep, and the curved curtain sweeps UP out of viewport,
 *      cleanly revealing the newly loaded page with parallax and header slide-in.
 *   5. Zero document unload = ZERO WHITE BLINK.
 */

// Global curtain builder with Animated SKJAL Typography
function buildCurtainHTML(panelTransform, curveBottomScale = '0', curveTopScale = '0') {
    const charStyle = 'style="transform:translateY(120%); opacity:0;"';
    return `
        <div class="skjal-transition-panel" style="transform:${panelTransform}">
            <svg class="skjal-curve-top" viewBox="0 0 100 100" preserveAspectRatio="none" style="transform:scaleY(${curveTopScale})">
                <path d="M0,100 C50,0 100,100 100,100 Z"></path>
            </svg>
            <svg class="skjal-curve-bottom" viewBox="0 0 100 100" preserveAspectRatio="none" style="transform:scaleY(${curveBottomScale})">
                <path d="M0,0 C50,100 100,0 100,0 Z"></path>
            </svg>
        </div>
        <div class="skjal-transition-text-wrap" style="opacity:0;" aria-hidden="true">
            <div class="skjal-transition-text">
                <div class="skjal-transition-word">
                    <span class="skjal-transition-char" ${charStyle}>S</span>
                    <span class="skjal-transition-char" ${charStyle}>K</span>
                    <span class="skjal-transition-char" ${charStyle}>J</span>
                    <span class="skjal-transition-char" ${charStyle}>A</span>
                    <span class="skjal-transition-char" ${charStyle}>L</span>
                </div>
            </div>
        </div>`;
}

document.addEventListener("DOMContentLoaded", () => {
    let mainContainer = document.querySelector('main') || document.querySelector('.wrap') || document.getElementById('main');
    let footer = document.getElementById('footer') || document.querySelector('.footer');
    let isTransitioning = false;

    // Helper: normalize paths for comparison
    function normalizePathname(p) {
        if (!p) return '/';
        let res = p;
        if (res.endsWith('/')) res = res.slice(0, -1);
        if (res.endsWith('/index.html')) res = res.slice(0, -11);
        else if (res === 'index.html' || res === '/index.html') res = '';
        if (!res.startsWith('/')) res = '/' + res;
        return res;
    }

    // Scroll to hash target smoothly
    function scrollToHashTarget(hash, immediate) {
        if (!hash || hash === '#') return;
        try {
            const rawId = decodeURIComponent(hash.slice(1));
            const target = rawId ? document.getElementById(rawId) : null;
            if (!target) return;
            if (window.lenis) {
                if (typeof window.lenis.resize === 'function') window.lenis.resize();
                window.lenis.scrollTo(target, { immediate: !!immediate, force: true, offset: -70 });
            }
            window.scrollTo({
                top: target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - 70,
                behavior: immediate ? 'auto' : 'smooth'
            });
        } catch (err) {}
    }

    // Update active nav link classes across desktop and mobile
    function updateActiveNavLinks(targetHref) {
        try {
            const targetUrl = new URL(targetHref, window.location.origin);
            const targetPath = normalizePathname(targetUrl.pathname);

            // Desktop nav links never carry .active (links stay unified neutral color, no brackets on idle)
            document.querySelectorAll('.nav-link, .nav a, .nav-dropdown-trigger').forEach(link => {
                link.classList.remove('active');
            });

            // Prevent any mobile menu drawer links from holding rogue .active classes
            document.querySelectorAll('.mobile-menu a').forEach(link => {
                link.classList.remove('active');
            });
        } catch (e) {}
    }

    // Close mobile drawer and dropdowns instantly
    function closeMenus() {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuToggle = document.getElementById('menu-toggle');
        if (mobileMenu) mobileMenu.classList.remove('open');
        if (menuToggle) {
            menuToggle.classList.remove('is-active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
        document.body.classList.remove('menu-open');
        document.querySelectorAll('.nav-dropdown').forEach(dd => dd.classList.remove('is-open'));
        document.querySelectorAll('.nav-dropdown-menu').forEach(m => m.style.display = 'none');
    }

    // =============================================
    // 1. INITIAL ENTRY ANIMATION (hard refresh / direct hit)
    // =============================================
    function runInitialEntryAnimation() {
        const wrap = document.getElementById('skjal-entry-curtain');
        if (!wrap) {
            document.documentElement.style.overflow = '';
            scrollToHashTarget(window.location.hash, true);
            return;
        }

        try {
            const panel = wrap.querySelector(".skjal-transition-panel");
            const panelBottom = wrap.querySelector(".skjal-curve-bottom");
            const textWrap = wrap.querySelector(".skjal-transition-text-wrap");
            const chars = wrap.querySelectorAll(".skjal-transition-char");
            const sweepOffset = window.innerHeight + (window.innerWidth * 0.15);
            const headerElements = document.querySelectorAll('.site-logo-wrap, .main-nav, .header-wrap');

            if (window.gsap) {
                window.gsap.set(mainContainer, { opacity: 1 });
                window.gsap.set(panelBottom, { scaleY: 1 });
                if (textWrap) window.gsap.set(textWrap, { opacity: 1, y: 0 });
                if (chars) window.gsap.set(chars, { opacity: 1, yPercent: 0 });
                if (footer) {
                    footer.style.visibility = 'hidden';
                    footer.style.opacity = '0';
                }

                const tl = window.gsap.timeline({
                    onComplete: function() {
                        wrap.remove();
                        window.gsap.set(mainContainer, { clearProps: "all" });
                        if (footer) {
                            footer.style.visibility = '';
                            footer.style.opacity = '';
                        }
                        if (headerElements.length) {
                            headerElements.forEach(el => {
                                el.style.transform = '';
                                el.style.opacity = '';
                            });
                        }
                        document.documentElement.style.overflow = '';
                        scrollToHashTarget(window.location.hash, true);
                        if (window.ScrollTrigger) {
                            window.ScrollTrigger.refresh();
                        }
                    }
                });

                tl.call(() => scrollToHashTarget(window.location.hash, true), [], 0);

                // SKJAL name glides UP smoothly into the sweep
                if (chars && chars.length) {
                    tl.to(chars, {
                        yPercent: -100,
                        opacity: 0,
                        duration: 0.45,
                        ease: "power3.in",
                        stagger: 0.02
                    }, 0);
                }

                if (textWrap) {
                    tl.to(textWrap, {
                        y: -sweepOffset,
                        opacity: 0,
                        duration: 0.95,
                        ease: "power3.inOut"
                    }, 0.15);
                }

                // Pure Curtain panel sweeps UP to reveal page
                tl.to(panel, {
                    y: -sweepOffset,
                    duration: 0.95,
                    ease: "power4.inOut",
                    overwrite: "auto"
                }, 0.15);

                // Bottom curve flattens
                tl.to(panelBottom, {
                    scaleY: 0,
                    duration: 0.95,
                    ease: "power4.inOut"
                }, 0.15);

                // Parallax page content
                if (mainContainer) {
                    tl.fromTo(mainContainer, { y: "6dvh" }, { y: "0dvh", duration: 0.95, ease: "power4.inOut", clearProps: "y" }, 0.15);
                }

                // Slide header down into place
                if (headerElements.length) {
                    tl.fromTo(headerElements, 
                        { yPercent: -100, opacity: 0 }, 
                        { yPercent: 0, opacity: 1, duration: 0.8, ease: "power4.out", clearProps: "all" }, 
                        0.25
                    );
                }

                if (footer) {
                    tl.to(footer, { visibility: 'visible', opacity: 1, duration: 0.35, ease: "power2.out" }, 0.6);
                }
            } else {
                wrap.remove();
                document.documentElement.style.overflow = '';
                scrollToHashTarget(window.location.hash, true);
            }
        } catch (e) {
            wrap.remove();
            document.documentElement.style.overflow = '';
            scrollToHashTarget(window.location.hash, true);
        }
    }

    if (sessionStorage.getItem('isPageTransition') === 'true') {
        sessionStorage.removeItem('isPageTransition');
        runInitialEntryAnimation();
    } else {
        const wrap = document.getElementById('skjal-entry-curtain');
        if (wrap) wrap.remove();
    }

    // In-memory HTML cache for instantaneous 0ms transitions without network lag
    const pageHtmlCache = new Map();

    function prefetchPage(href) {
        if (!href || isTransitioning) return;
        try {
            if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
            const url = new URL(href, window.location.origin);
            if (url.origin !== window.location.origin) return;
            const targetPath = normalizePathname(url.pathname);
            const currentPath = normalizePathname(window.location.pathname);
            if (targetPath === currentPath) return;
            if (pageHtmlCache.has(targetPath)) return;

            fetch(url.href, { credentials: 'same-origin' })
                .then(res => res.ok ? res.text() : null)
                .then(html => {
                    if (html) pageHtmlCache.set(targetPath, html);
                })
                .catch(() => {});
        } catch (e) {}
    }

    // =============================================
    // 2. CONTINUOUS BLINK-FREE TRANSITION (Fetch Swap with Brand Typography)
    // =============================================
    async function executeSeamlessTransition(href, targetHash, pushToHistory = true) {
        if (isTransitioning) return;
        isTransitioning = true;

        closeMenus();

        const url = new URL(href, window.location.origin);
        const normPath = normalizePathname(url.pathname);

        // Fetch or pull from in-memory cache instantly
        let newDoc = null;
        let fetchPromise = null;
        const cachedHtml = pageHtmlCache.get(normPath);
        if (cachedHtml) {
            try {
                const parser = new DOMParser();
                newDoc = parser.parseFromString(cachedHtml, 'text/html');
            } catch (e) {}
        }

        if (!newDoc) {
            fetchPromise = fetch(href, { credentials: 'same-origin' })
                .then(res => {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.text();
                })
                .then(html => {
                    pageHtmlCache.set(normPath, html);
                    const parser = new DOMParser();
                    newDoc = parser.parseFromString(html, 'text/html');
                })
                .catch(err => {
                    console.warn('Transition fetch error:', err);
                });
        }

        // Inject Exit Curtain with text hidden by default
        const exitCurtain = document.createElement('div');
        exitCurtain.className = 'skjal-transition-wrap';
        exitCurtain.innerHTML = buildCurtainHTML('translateY(100%)', '0', '1');
        exitCurtain.style.display = 'flex';
        document.body.appendChild(exitCurtain);

        const panel = exitCurtain.querySelector(".skjal-transition-panel");
        const curveTop = exitCurtain.querySelector(".skjal-curve-top");
        const panelBottom = exitCurtain.querySelector(".skjal-curve-bottom");
        const textWrap = exitCurtain.querySelector(".skjal-transition-text-wrap");
        const chars = exitCurtain.querySelectorAll(".skjal-transition-char");
        const headerElements = document.querySelectorAll('.site-logo-wrap, .main-nav, .header-wrap');
        const currentMain = document.getElementById('main') || document.querySelector('main');

        // Set initial positions cleanly via GSAP (avoids any split-second text flash)
        window.gsap.set(chars, { yPercent: 120, opacity: 0 });
        window.gsap.set(textWrap, { opacity: 0, y: 0 });

        // Play Exit Timeline (Slowed down by ~30% for a smooth, cinematic tempo):
        // 1. Header slides up softly (0.5s)
        // 2. Curtain sweeps UP from bottom covering screen (0.9s)
        // 3. SKJAL letters animate gracefully up into the exact center of the curtain (0.55s)
        // 4. Elegant hold beat in the dark center (0.35s)
        const exitTl = window.gsap.timeline();
        if (headerElements.length) {
            exitTl.to(headerElements, { yPercent: -100, opacity: 0, duration: 0.5, ease: "power3.inOut" }, 0);
        }
        if (currentMain) {
            exitTl.to(currentMain, { y: "-6dvh", duration: 0.9, ease: "power3.inOut" }, 0);
        }
        exitTl.to(panel, { y: "0%", duration: 0.9, ease: "power3.inOut" }, 0);
        exitTl.to(curveTop, { scaleY: 1, duration: 0.9, ease: "power3.inOut" }, 0);

        // Make text wrapper active on dark curtain
        exitTl.set(textWrap, { opacity: 1 }, 0.45);

        // Letters rise up gracefully into view
        exitTl.to(chars, {
            yPercent: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power3.out",
            stagger: 0.04
        }, 0.48);

        // Calm hold beat
        exitTl.to({}, { duration: 0.35 });

        // Wait for both exit animation AND page fetch
        await Promise.all([exitTl, fetchPromise]);

        // If fetch failed, fallback to hard navigation
        if (!newDoc) {
            sessionStorage.setItem('isPageTransition', 'true');
            window.location.href = href;
            return;
        }

        // =============================================
        // DOM SWAP (Happens behind the black curtain — ZERO BLINK!)
        // =============================================
        const incomingMain = newDoc.getElementById('main') || newDoc.querySelector('main');

        if (currentMain && incomingMain) {
            currentMain.innerHTML = incomingMain.innerHTML;
            currentMain.className = incomingMain.className;
        }

        const currentNav = document.querySelector('.main-nav') || document.querySelector('.header-wrap');
        const incomingNav = newDoc.querySelector('.main-nav') || newDoc.querySelector('.header-wrap');
        if (currentNav && incomingNav) {
            currentNav.innerHTML = incomingNav.innerHTML;
        }

        const currentMobileMenu = document.getElementById('mobile-menu');
        const incomingMobileMenu = newDoc.getElementById('mobile-menu');
        if (currentMobileMenu && incomingMobileMenu) {
            currentMobileMenu.innerHTML = incomingMobileMenu.innerHTML;
        }

        const currentFooter = document.getElementById('footer') || document.querySelector('footer') || document.querySelector('.footer');
        const incomingFooter = newDoc.getElementById('footer') || newDoc.querySelector('footer') || newDoc.querySelector('.footer');
        if (currentFooter && incomingFooter) {
            currentFooter.innerHTML = incomingFooter.innerHTML;
        }

        // Update Document Title
        if (newDoc.title) {
            document.title = newDoc.title;
        }

        // Update URL in browser history
        if (pushToHistory) {
            history.pushState(null, '', href);
        }

        // Update active nav links
        updateActiveNavLinks(href);

        // Reset scroll position
        if (window.lenis) {
            window.lenis.scrollTo(0, { immediate: true, force: true });
            if (typeof window.lenis.resize === 'function') window.lenis.resize();
        }
        window.scrollTo(0, 0);

        // Re-bind transition links on the newly swapped DOM
        bindTransitionLinks();

        // Re-initialize page animations (ScrollTrigger, letter rolls)
        if (typeof window.initPageAnimations === 'function') {
            window.initPageAnimations();
        }
        if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh();
        }

        // =============================================
        // ENTRY REVEAL (Curtain sweeps UP, revealing new page)
        // =============================================
        const sweepOffset = window.innerHeight + (window.innerWidth * 0.15);
        window.gsap.set(panelBottom, { scaleY: 1 });
        window.gsap.set(curveTop, { scaleY: 0 });

        const entryTl = window.gsap.timeline({
            onComplete: () => {
                exitCurtain.remove();
                isTransitioning = false;
                if (headerElements.length) {
                    headerElements.forEach(el => {
                        el.style.transform = '';
                        el.style.opacity = '';
                    });
                }
                const mainNav = document.querySelector('.main-nav') || document.querySelector('.header-wrap');
                if (mainNav) {
                    mainNav.style.position = 'absolute';
                    mainNav.style.top = '0px';
                    mainNav.style.transform = 'none';
                }
                if (targetHash) {
                    scrollToHashTarget(targetHash, false);
                }
                if (window.ScrollTrigger) {
                    window.ScrollTrigger.refresh();
                }
            }
        });

        // 1. Letters glide UPWARD and fade out gracefully into the upward sweep
        entryTl.to(chars, {
            yPercent: -100,
            opacity: 0,
            duration: 0.45,
            ease: "power3.in",
            stagger: 0.02
        }, 0);

        // 2. Text wrapper sweeps up with the panel
        entryTl.to(textWrap, {
            y: -sweepOffset,
            opacity: 0,
            duration: 0.95,
            ease: "power3.inOut"
        }, 0.15);

        // 3. Curtain panel sweeps UP to top, cleanly revealing the newly loaded page
        entryTl.to(panel, {
            y: -sweepOffset,
            duration: 0.95,
            ease: "power4.inOut"
        }, 0.15);

        // 4. Bottom curve flattens
        entryTl.to(panelBottom, {
            scaleY: 0,
            duration: 0.95,
            ease: "power4.inOut"
        }, 0.15);

        // 5. Parallax content up
        if (currentMain) {
            entryTl.fromTo(currentMain, { y: "6dvh" }, { y: "0dvh", duration: 0.95, ease: "power4.inOut", clearProps: "y" }, 0.15);
        }

        // 6. Header (stationary brand logo + name AND navbar) slide down into place in unison
        if (headerElements.length) {
            entryTl.fromTo(headerElements, 
                { yPercent: -100, opacity: 0 }, 
                { yPercent: 0, opacity: 1, duration: 0.8, ease: "power4.out", clearProps: "all" }, 
                0.25
            );
        }
    }

    // Handle browser Back / Forward buttons without any blink
    window.addEventListener("popstate", () => {
        executeSeamlessTransition(window.location.href, window.location.hash, false);
    });

    // Handle BFCache
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            isTransitioning = false;
            document.querySelectorAll('.skjal-transition-wrap').forEach(c => c.remove());
        }
    });

    // Bind all navigation links to the seamless transition controller
    function bindTransitionLinks() {
        document.querySelectorAll("a:not([data-transition-bound])").forEach(link => {
            link.dataset.transitionBound = 'true';

            // Prefetch destination page on hover/touch for instantaneous response
            link.addEventListener("mouseenter", function() {
                prefetchPage(this.href);
            }, { passive: true });
            link.addEventListener("touchstart", function() {
                prefetchPage(this.href);
            }, { passive: true });

            link.addEventListener("click", function(e) {
                if (e.defaultPrevented) return;
                if (isTransitioning) { e.preventDefault(); return; }

                const href = this.getAttribute("href");
                const target = this.getAttribute("target");

                if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || target === "_blank") return;
                if (e.ctrlKey || e.metaKey || e.shiftKey) return;
                if (this.hostname !== window.location.hostname) return;

                const currentUrl = new URL(window.location.href);
                const linkUrl = new URL(this.href);
                const currentPath = normalizePathname(currentUrl.pathname);
                const linkPath = normalizePathname(linkUrl.pathname);

                // If link is on the same page (hash jump)
                if (currentPath === linkPath && currentUrl.search === linkUrl.search) {
                    const hash = linkUrl.hash || (href.startsWith("#") ? href : '');
                    if (hash) {
                        e.preventDefault();
                        closeMenus();
                        scrollToHashTarget(hash, false);
                        history.pushState(null, null, hash);
                    }
                    return;
                }

                // Internal page transition
                e.preventDefault();
                if (!window.gsap) {
                    window.location.href = href;
                    return;
                }

                const targetHash = linkUrl.hash || '';
                executeSeamlessTransition(this.href, targetHash, true);
            });
        });
    }

    bindTransitionLinks();
});
