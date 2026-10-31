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

// Global curtain builder
function buildCurtainHTML(panelTransform, curveBottomScale, curveTopScale = '0') {
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
                    <span class="skjal-transition-char">S</span>
                    <span class="skjal-transition-char">K</span>
                    <span class="skjal-transition-char">J</span>
                    <span class="skjal-transition-char">A</span>
                    <span class="skjal-transition-char">L</span>
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
            const chars = wrap.querySelectorAll(".skjal-transition-char");
            const textWrap = wrap.querySelector(".skjal-transition-text-wrap");
            const sweepOffset = window.innerHeight + (window.innerWidth * 0.15);
            const headerElements = document.querySelectorAll('.site-logo-wrap, .main-nav, .header-wrap');

            if (window.gsap) {
                window.gsap.set(mainContainer, { opacity: 1 });
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
                    }
                });

                tl.call(() => scrollToHashTarget(window.location.hash, true), [], 0);

                // SKJAL name glides UP smoothly into the sweep
                tl.to(chars, {
                    yPercent: -100,
                    opacity: 0,
                    duration: 0.38,
                    ease: "power3.in",
                    stagger: 0.02
                }, 0.08);

                // Text wrapper sweeps up with panel so it never lingers in viewport
                if (textWrap) {
                    tl.to(textWrap, {
                        y: -sweepOffset,
                        opacity: 0,
                        duration: 0.75,
                        ease: "power3.inOut"
                    }, 0.15);
                }

                // Curtain panel sweeps UP
                tl.to(panel, {
                    y: -sweepOffset,
                    duration: 0.75,
                    ease: "power4.inOut",
                    overwrite: "auto"
                }, 0.15);

                // Bottom curve flattens
                tl.to(panelBottom, {
                    scaleY: 0,
                    duration: 0.75,
                    ease: "power4.inOut"
                }, 0.15);

                // Parallax page content
                if (mainContainer) {
                    tl.fromTo(mainContainer, { y: "6dvh" }, { y: "0dvh", duration: 0.75, ease: "power4.inOut", clearProps: "y" }, 0.15);
                }

                // Slide header (stationary brand logo + name AND navbar) down together in unison
                if (headerElements.length) {
                    tl.fromTo(headerElements, 
                        { yPercent: -100, opacity: 0 }, 
                        { yPercent: 0, opacity: 1, duration: 0.65, ease: "power4.out", clearProps: "all" }, 
                        0.25
                    );
                }

                if (footer) {
                    tl.to(footer, { visibility: 'visible', opacity: 1, duration: 0.3, ease: "power2.out" }, 0.75);
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

    // =============================================
    // 2. CONTINUOUS BLINK-FREE TRANSITION (Fetch Swap)
    // =============================================
    async function executeSeamlessTransition(href, targetHash, pushToHistory = true) {
        if (isTransitioning) return;
        isTransitioning = true;

        closeMenus();

        // Start prefetching destination page HTML immediately with fresh server revalidation
        let newDoc = null;
        const fetchPromise = fetch(href, { credentials: 'same-origin', cache: 'no-cache' })
            .then(res => {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.text();
            })
            .then(html => {
                const parser = new DOMParser();
                newDoc = parser.parseFromString(html, 'text/html');
            })
            .catch(err => {
                console.warn('Transition fetch error:', err);
            });

        // Inject Exit Curtain with text hidden by default
        const exitCurtain = document.createElement('div');
        exitCurtain.className = 'skjal-transition-wrap';
        exitCurtain.innerHTML = buildCurtainHTML('translateY(100%)', '0', '1');
        exitCurtain.style.display = 'flex';
        document.body.appendChild(exitCurtain);

        const panel = exitCurtain.querySelector(".skjal-transition-panel");
        const curveTop = exitCurtain.querySelector(".skjal-curve-top");
        const chars = exitCurtain.querySelectorAll(".skjal-transition-char");
        const panelBottom = exitCurtain.querySelector(".skjal-curve-bottom");
        const textWrap = exitCurtain.querySelector(".skjal-transition-text-wrap");
        const headerElements = document.querySelectorAll('.site-logo-wrap, .main-nav, .header-wrap');

        // Set initial positions cleanly via GSAP: characters start positioned below their line box
        window.gsap.set(chars, { yPercent: 110, opacity: 0 });
        window.gsap.set(textWrap, { opacity: 0, y: 0 });

        // Play Exit Timeline:
        // 1. Header elements (both stationary brand name & navbar) glide up and fade out
        // 2. Curtain sweeps UP from bottom to cover the screen (duration 0.75s)
        // 3. Top curve expands
        // 4. Once curtain covers the screen (at 0.38s), the SKJAL letters rise up smoothly into place
        // 5. Deliberate hold beat so the brand name rests cleanly and stably in the center
        const exitTl = window.gsap.timeline();
        if (headerElements.length) {
            exitTl.to(headerElements, { yPercent: -100, opacity: 0, duration: 0.4, ease: "power3.inOut" }, 0);
        }
        exitTl.to(panel, { y: "0%", duration: 0.75, ease: "power3.inOut" }, 0);
        exitTl.to(curveTop, { scaleY: 1, duration: 0.75, ease: "power3.inOut" }, 0);

        // Make text wrapper active on the dark curtain
        exitTl.set(textWrap, { opacity: 1 }, 0.38);

        // Animate characters up into view
        exitTl.to(chars, {
            yPercent: 0,
            opacity: 1,
            duration: 0.45,
            ease: "power3.out",
            stagger: 0.04
        }, 0.42);

        // Hold beat: gives SKJAL brand name a calm, premium pause in the center of the dark curtain
        exitTl.to({}, { duration: 0.28 });

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
        const currentMain = document.getElementById('main') || document.querySelector('main');
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
        if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh();
        }

        // =============================================
        // ENTRY REVEAL (Curtain sweeps UP, revealing new page)
        // =============================================
        const sweepOffset = window.innerHeight + (window.innerWidth * 0.15);
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
            }
        });

        // 1. Letters glide UPWARD and fade out gracefully into the upward sweep (no jarring rotation)
        entryTl.to(chars, {
            yPercent: -100,
            opacity: 0,
            duration: 0.38,
            ease: "power3.in",
            stagger: 0.02
        }, 0);

        // 2. Text wrapper sweeps up with the panel and fades to 0
        entryTl.to(textWrap, {
            y: -sweepOffset,
            opacity: 0,
            duration: 0.75,
            ease: "power3.inOut"
        }, 0.12);

        // 3. Curtain panel sweeps UP to top, cleanly revealing the newly loaded page
        entryTl.to(panel, {
            y: -sweepOffset,
            duration: 0.75,
            ease: "power4.inOut"
        }, 0.12);

        // 4. Bottom curve flattens
        entryTl.to(panelBottom, {
            scaleY: 0,
            duration: 0.75,
            ease: "power4.inOut"
        }, 0.12);

        // 5. Parallax content up
        if (currentMain) {
            entryTl.fromTo(currentMain, { y: "6dvh" }, { y: "0dvh", duration: 0.75, ease: "power4.inOut", clearProps: "y" }, 0.12);
        }

        // 6. Header (stationary brand logo + name AND navbar) slide down into place in unison
        if (headerElements.length) {
            entryTl.fromTo(headerElements, 
                { yPercent: -100, opacity: 0 }, 
                { yPercent: 0, opacity: 1, duration: 0.65, ease: "power4.out", clearProps: "all" }, 
                0.22
            );
        }
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
