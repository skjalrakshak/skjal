/**
 * SKJAL - Signature Curved Curtain Page Transition Controller
 * Continuous, Zero-Blink Seamless Transition Engine
 * 
 * Flow:
 *   1. Exit sweep: Curtain sweeps UP with curved leading edge and SKJAL letters.
 *   2. DOM swap: While screen is covered in rich black, new page content is swapped via fetch.
 *   3. Entry reveal: Curtain sweeps UP from bottom, revealing new page with parallax and navbar slide-in.
 *   4. Zero document unload = ZERO WHITE BLINK.
 */

// Global curtain builder (Pure Curved Curtain Wipe)
function buildCurtainHTML(panelTransform, curveBottomScale = '0', curveTopScale = '0') {
    return `
        <div class="skjal-transition-panel" style="transform:${panelTransform}">
            <svg class="skjal-curve-top" viewBox="0 0 100 100" preserveAspectRatio="none" style="transform:scaleY(${curveTopScale})">
                <path d="M0,100 C30,0 70,0 100,100 Z"></path>
            </svg>
            <svg class="skjal-curve-bottom" viewBox="0 0 100 100" preserveAspectRatio="none" style="transform:scaleY(${curveBottomScale})">
                <path d="M0,0 C30,100 70,100 100,0 Z"></path>
            </svg>
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
            const sweepOffset = window.innerHeight + 180;
            const headerElements = document.querySelectorAll('.site-logo-wrap, .main-nav, .header-wrap');

            if (window.gsap) {
                window.gsap.set(mainContainer, { opacity: 1 });
                window.gsap.set(panelBottom, { scaleY: 1 });
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

                // Pure Curtain panel sweeps UP to reveal page with smooth power3.out glide
                tl.to(panel, {
                    y: -sweepOffset,
                    duration: 0.8,
                    ease: "power3.out",
                    overwrite: "auto"
                }, 0);

                // Bottom curve maintains arch and gently relaxes as it exits
                tl.fromTo(panelBottom, {
                    scaleY: 1
                }, {
                    scaleY: 0.15,
                    duration: 0.8,
                    ease: "power2.in"
                }, 0);

                // Subtle organic glide for new page content
                if (mainContainer) {
                    tl.fromTo(mainContainer, { y: 25, opacity: 0.92 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", clearProps: "y,opacity" }, 0);
                }

                // Slide header down smoothly into place
                if (headerElements.length) {
                    tl.fromTo(headerElements, 
                        { y: -18, opacity: 0 }, 
                        { y: 0, opacity: 1, duration: 0.55, ease: "power2.out", clearProps: "all" }, 
                        0.2
                    );
                }

                if (footer) {
                    tl.to(footer, { visibility: 'visible', opacity: 1, duration: 0.3, ease: "power2.out" }, 0.5);
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
    const pageCache = new Map();

    function prefetchPage(href) {
        if (!href || isTransitioning) return;
        try {
            const url = new URL(href, window.location.origin);
            if (url.origin !== window.location.origin) return;
            const targetPath = normalizePathname(url.pathname);
            const currentPath = normalizePathname(window.location.pathname);
            if (targetPath === currentPath) return;
            if (pageCache.has(targetPath)) return;

            fetch(url.href, { credentials: 'same-origin' })
                .then(res => {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.text();
                })
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    pageCache.set(targetPath, doc);
                    pageCache.set(url.href, doc);
                })
                .catch(() => {});
        } catch (e) {}
    }

    // =============================================
    // 2. CONTINUOUS BLINK-FREE TRANSITION (Fetch Swap)
    // =============================================
    async function executeSeamlessTransition(href, targetHash, pushToHistory = true) {
        if (isTransitioning) return;
        isTransitioning = true;

        closeMenus();

        const url = new URL(href, window.location.origin);
        const normPath = normalizePathname(url.pathname);

        // Fetch or pull from in-memory cache instantly
        let newDoc = pageCache.get(normPath) || pageCache.get(href);
        let fetchPromise = null;
        if (!newDoc) {
            fetchPromise = fetch(href, { credentials: 'same-origin' })
                .then(res => {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.text();
                })
                .then(html => {
                    const parser = new DOMParser();
                    newDoc = parser.parseFromString(html, 'text/html');
                    pageCache.set(normPath, newDoc);
                    pageCache.set(href, newDoc);
                })
                .catch(err => {
                    console.warn('Transition fetch error:', err);
                });
        }

        // Inject Exit Curtain (starts completely below viewport with zero peek)
        const exitCurtain = document.createElement('div');
        exitCurtain.className = 'skjal-transition-wrap';
        exitCurtain.innerHTML = buildCurtainHTML('translateY(calc(100% + 150px))', '0', '0');
        exitCurtain.style.display = 'flex';
        document.body.appendChild(exitCurtain);

        const panel = exitCurtain.querySelector(".skjal-transition-panel");
        const curveTop = exitCurtain.querySelector(".skjal-curve-top");
        const panelBottom = exitCurtain.querySelector(".skjal-curve-bottom");
        const headerElements = document.querySelectorAll('.site-logo-wrap, .main-nav, .header-wrap');
        const currentMain = document.getElementById('main') || document.querySelector('main');

        // Play Exit Timeline:
        // 1. Header slides up softly
        // 2. Curtain sweeps UP with curved leading edge covering the screen
        const exitTl = window.gsap.timeline({
            defaults: { ease: "power3.inOut" }
        });
        if (headerElements.length) {
            exitTl.to(headerElements, { y: -20, opacity: 0, duration: 0.35, ease: "power2.in" }, 0);
        }
        if (currentMain) {
            exitTl.to(currentMain, { y: -25, opacity: 0.88, duration: 0.65, ease: "power3.inOut" }, 0);
        }
        exitTl.to(panel, { y: "0%", duration: 0.65, ease: "power3.inOut" }, 0);
        exitTl.to(curveTop, { scaleY: 1, duration: 0.65, ease: "power2.out" }, 0);

        // Wait for exit curtain to fully cover the screen (and fetch if still resolving)
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

        const currentMobileMenu = document.getElementById('mobile-menu');
        const incomingMobileMenu = newDoc.getElementById('mobile-menu');
        if (currentMobileMenu && incomingMobileMenu) {
            currentMobileMenu.innerHTML = incomingMobileMenu.innerHTML;
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

        // Double-rAF: Ensure layout reflow and initial GPU rasterization occur completely behind the black curtain
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        // =============================================
        // ENTRY REVEAL (Curtain sweeps UP, revealing new page)
        // =============================================
        const sweepOffset = window.innerHeight + 180;
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

        // 1. Curtain panel sweeps smoothly UP and off the top with silky power3.out glide
        entryTl.to(panel, {
            y: -sweepOffset,
            duration: 0.8,
            ease: "power3.out"
        }, 0);

        // 2. Bottom curve holds its arch through the screen and gently relaxes as it exits
        entryTl.fromTo(panelBottom, 
            { scaleY: 1 }, 
            { scaleY: 0.15, duration: 0.8, ease: "power2.in" }, 
            0
        );

        // 3. New page content glides smoothly upward into place
        if (currentMain) {
            entryTl.fromTo(currentMain, 
                { y: 25, opacity: 0.92 }, 
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", clearProps: "y,opacity" }, 
                0
            );
        }

        // 4. Header elements glide in smoothly in sync
        if (headerElements.length) {
            entryTl.fromTo(headerElements, 
                { y: -18, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.55, ease: "power2.out", clearProps: "all" }, 
                0.2
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

            // Prefetch destination page on hover/touch for zero network lag
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
