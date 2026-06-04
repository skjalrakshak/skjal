/**
 * SKJAL Page Transition System
 * Cinematic curtain wipe with "SK JAL" text reveal
 *
 * Flow:
 *   EXIT  (old page): curtain sweeps UP from bottom → covers screen → navigate
 *   ENTRY (new page): curtain sweeps UP from covering → reveals new page
 *
 * Anti-flash strategy:
 *   1. Inline <script> in <head> sets html.page-transitioning (visibility:hidden, bg:#111823)
 *   2. This IIFE injects a covering curtain div immediately (before DOMContentLoaded)
 *   3. On DOMContentLoaded, we unhide the html ONLY after confirming the curtain covers the screen
 *   4. Then animate the curtain away
 */

(function() {
    // --- Inject transition CSS ---
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');

        .skjal-transition-wrap {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            z-index: 2147483647;
            pointer-events: none;
            visibility: hidden; opacity: 0;
            overflow: visible;
        }

        .skjal-transition-panel {
            background-color: #111823;
            width: 100%; height: 100%;
            position: absolute;
            left: 0; top: 0;
            will-change: transform;
        }

        .skjal-curve-top {
            position: absolute;
            top: -14.9vw; left: 0; width: 100%; height: 15vw;
            fill: #111823;
            transform-origin: bottom;
            will-change: transform;
        }

        .skjal-curve-bottom {
            position: absolute;
            bottom: -14.9vw; left: 0; width: 100%; height: 15vw;
            fill: #111823;
            transform-origin: top;
            will-change: transform;
        }

        .skjal-transition-text-wrap {
            z-index: 3;
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            display: flex; flex-direction: column;
            justify-content: center; align-items: center;
            visibility: hidden; opacity: 0;
            perspective: 1000px;
        }

        .skjal-transition-text {
            font-family: 'Syne', sans-serif;
            font-size: clamp(3rem, 10vw, 10rem);
            font-weight: 800;
            color: #F8F9FA;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            display: flex;
            gap: 2vw;
        }

        .skjal-transition-word {
            display: flex;
            overflow: hidden;
        }

        .skjal-transition-char {
            display: inline-block;
            will-change: transform, opacity;
            transform-origin: 50% 100%;
        }

        /* Hide footer during transitions to prevent bleed-through */
        html.page-transitioning #footer,
        html.page-transitioning .curtain-footer-active {
            visibility: hidden !important;
            opacity: 0 !important;
        }
    `;
    document.head.appendChild(style);

    // --- Build curtain HTML (reusable) ---
    function buildCurtainHTML(panelTransform, curveBottomScale, charsTransform) {
        return `
            <div class="skjal-transition-panel" style="transform:${panelTransform}">
                <svg class="skjal-curve-top" viewBox="0 0 100 100" preserveAspectRatio="none" style="transform:scaleY(0)">
                    <path d="M0,100 C50,0 100,100 100,100 Z"></path>
                </svg>
                <svg class="skjal-curve-bottom" viewBox="0 0 100 100" preserveAspectRatio="none" style="transform:scaleY(${curveBottomScale})">
                    <path d="M0,0 C50,100 100,0 100,0 Z"></path>
                </svg>
            </div>
            <div class="skjal-transition-text-wrap" style="visibility:visible;opacity:1">
                <div class="skjal-transition-text">
                    <div class="skjal-transition-word">
                        <span class="skjal-transition-char" style="transform:${charsTransform}">S</span>
                        <span class="skjal-transition-char" style="transform:${charsTransform}">K</span>
                    </div>
                    <div class="skjal-transition-word">
                        <span class="skjal-transition-char" style="transform:${charsTransform}">J</span>
                        <span class="skjal-transition-char" style="transform:${charsTransform}">A</span>
                        <span class="skjal-transition-char" style="transform:${charsTransform}">L</span>
                    </div>
                </div>
            </div>`;
    }

    // --- If arriving via transition, inject covering curtain IMMEDIATELY ---
    if (sessionStorage.getItem('isPageTransition') === 'true') {
        const wrap = document.createElement('div');
        wrap.className = 'skjal-transition-wrap';
        wrap.id = 'skjal-entry-curtain';
        wrap.style.cssText = 'visibility:visible;opacity:1';
        wrap.innerHTML = buildCurtainHTML(
            'translateY(0)',   // panel covering screen
            '1',              // bottom curve visible
            'translateY(0%) rotateZ(0deg)' // text visible in place
        );

        // Append as early as possible
        if (document.body) {
            document.body.appendChild(wrap);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(wrap);
            });
        }
    }
})();


// === DOMContentLoaded: Run animations & bind links ===
document.addEventListener("DOMContentLoaded", () => {

    // --- Footer link 3D rolls ---
    try {
        document.querySelectorAll('#footer .foot-links a').forEach(link => {
            if (link.querySelector('.roll-text-container')) return;
            const svg = link.querySelector('svg');
            const originalText = link.textContent.trim();

            link.innerHTML = '';
            if (svg) link.appendChild(svg);

            const rollContainer = document.createElement('span');
            rollContainer.className = 'roll-text-container';
            const line1 = document.createElement('span');
            line1.className = 'roll-line-1';
            const line2 = document.createElement('span');
            line2.className = 'roll-line-2';

            originalText.split('').forEach((char, index) => {
                const span1 = document.createElement('span');
                span1.className = 'roll-char';
                span1.textContent = char === ' ' ? '\u00A0' : char;
                span1.style.transitionDelay = `${index * 0.015}s`;
                line1.appendChild(span1);

                const span2 = document.createElement('span');
                span2.className = 'roll-char';
                span2.textContent = char === ' ' ? '\u00A0' : char;
                span2.style.transitionDelay = `${index * 0.015}s`;
                line2.appendChild(span2);
            });

            rollContainer.appendChild(line1);
            rollContainer.appendChild(line2);
            link.appendChild(rollContainer);
        });
    } catch (err) {
        console.warn("Footer rolls init failed:", err);
    }

    // --- Easing ---
    let osmoEase = "power4.inOut";
    let expoOut  = "expo.out";
    let expoInOut = "expo.inOut";

    if (window.gsap && "CustomEase" in window) {
        osmoEase = CustomEase.create("osmo", "0.625, 0.05, 0, 1");
    }

    const mainContainer = document.querySelector('main') || document.body;
    const footer = document.getElementById('footer');

    // =============================================
    // 1. ENTRY ANIMATION (arriving on new page)
    // =============================================
    if (sessionStorage.getItem('isPageTransition') === 'true') {
        sessionStorage.removeItem('isPageTransition');

        const wrap = document.getElementById('skjal-entry-curtain');
        if (wrap && window.gsap) {
            try {
                const panel = wrap.querySelector(".skjal-transition-panel");
                const panelBottom = wrap.querySelector(".skjal-curve-bottom");
                const chars = wrap.querySelectorAll(".skjal-transition-char");
                const sweepOffset = window.innerHeight + (window.innerWidth * 0.15);

                // CRITICAL: Unhide the page ONLY now that we've confirmed the curtain
                // is in the DOM and covering the screen. The curtain z-index is max.
                document.documentElement.classList.remove('page-transitioning');
                document.documentElement.style.visibility = '';
                document.documentElement.style.backgroundColor = '';

                // Ensure main is visible but footer stays hidden until curtain clears
                window.gsap.set(mainContainer, { opacity: 1 });
                if (footer) {
                    footer.style.visibility = 'hidden';
                    footer.style.opacity = '0';
                }

                const tl = window.gsap.timeline({
                    onComplete: () => {
                        wrap.remove();
                        window.gsap.set(mainContainer, { clearProps: "all" });
                        // Restore footer
                        if (footer) {
                            footer.style.visibility = '';
                            footer.style.opacity = '';
                        }
                    }
                });

                // Handle hash scrolling
                tl.call(() => {
                    const hash = window.location.hash;
                    if (hash && hash !== '#') {
                        try {
                            const target = document.querySelector(hash);
                            if (target) {
                                if (window.lenis) {
                                    window.lenis.scrollTo(target, { immediate: true });
                                } else {
                                    window.scrollTo(0, target.offsetTop);
                                }
                            }
                        } catch (err) {
                            console.warn("Invalid hash:", hash);
                        }
                    }
                }, [], 0);

                // Text exits UPWARD (chars fly out as curtain lifts)
                tl.to(chars, {
                    yPercent: -120,
                    rotationZ: -10,
                    duration: 0.6,
                    ease: expoInOut,
                    stagger: 0.03
                }, 0.1);

                // Curtain panel sweeps UP to reveal page
                tl.to(panel, {
                    y: -sweepOffset,
                    duration: 1.0,
                    ease: osmoEase,
                    overwrite: "auto"
                }, 0.3);

                // Bottom curve flattens as panel lifts
                tl.to(panelBottom, {
                    scaleY: 0,
                    duration: 1.0,
                    ease: osmoEase
                }, 0.3);

                // Page content parallax up from below
                tl.fromTo(mainContainer, {
                    y: "12dvh"
                }, {
                    y: "0dvh",
                    duration: 1.0,
                    ease: osmoEase
                }, 0.3);

                // Restore footer visibility right as curtain clears
                if (footer) {
                    tl.to(footer, {
                        visibility: 'visible',
                        opacity: 1,
                        duration: 0.3,
                        ease: "power2.out"
                    }, 0.9);
                }

                // Final cleanup: hide the wrapper
                tl.set(wrap, { autoAlpha: 0 }, ">");

            } catch (e) {
                console.error("Entry transition failed:", e);
                document.documentElement.classList.remove('page-transitioning');
                document.documentElement.style.visibility = '';
                document.documentElement.style.backgroundColor = '';
                if (footer) { footer.style.visibility = ''; footer.style.opacity = ''; }
                if (wrap) wrap.remove();
            }
        } else {
            // Failsafe: no GSAP
            document.documentElement.classList.remove('page-transitioning');
            document.documentElement.style.visibility = '';
            document.documentElement.style.backgroundColor = '';
            if (footer) { footer.style.visibility = ''; footer.style.opacity = ''; }
            const wrap = document.getElementById('skjal-entry-curtain');
            if (wrap) wrap.remove();
        }
    }

    // =============================================
    // 2. EXIT ANIMATION (leaving current page)
    // =============================================
    let isTransitioning = false;
    let transitionTimeout;

    function normalizePathname(p) {
        if (!p) return '/';
        let res = p;
        if (res.endsWith('/')) res = res.slice(0, -1);
        if (res.endsWith('/index.html')) res = res.slice(0, -11);
        else if (res === 'index.html' || res === '/index.html') res = '';
        if (!res.startsWith('/')) res = '/' + res;
        return res;
    }

    document.querySelectorAll("a:not([data-transition-bound])").forEach(link => {
        link.dataset.transitionBound = 'true';
        link.addEventListener("click", function(e) {
            if (e.defaultPrevented) return;
            if (isTransitioning) { e.preventDefault(); return; }

            const href = this.getAttribute("href");
            const target = this.getAttribute("target");

            // Skip non-navigating links
            if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || target === "_blank") return;
            if (e.ctrlKey || e.metaKey) return;
            if (this.hostname !== window.location.hostname) return;

            // Handle same-page hash navigation
            const currentUrl = new URL(window.location.href);
            const linkUrl = new URL(this.href);
            const currentPath = normalizePathname(currentUrl.pathname);
            const linkPath = normalizePathname(linkUrl.pathname);

            if (currentPath === linkPath && currentUrl.search === linkUrl.search) {
                const hash = linkUrl.hash || (href.startsWith("#") ? href : '');
                if (hash) {
                    e.preventDefault();
                    try {
                        const targetEl = (hash && hash !== '#') ? document.querySelector(hash) : document.body;
                        if (targetEl) {
                            if (window.lenis) window.lenis.scrollTo(targetEl);
                            else targetEl.scrollIntoView({ behavior: 'smooth' });
                            history.pushState(null, null, hash);
                        }
                    } catch (err) { console.warn("Hash nav error:", err); }
                    return;
                }
            }

            // === Start exit transition ===
            isTransitioning = true;
            e.preventDefault();

            // Failsafe: navigate after 2.5s no matter what
            clearTimeout(transitionTimeout);
            transitionTimeout = setTimeout(() => {
                if (isTransitioning) {
                    sessionStorage.setItem('isPageTransition', 'true');
                    window.location.href = href;
                }
            }, 2500);

            // Remove any stale curtains
            document.querySelectorAll('.skjal-transition-wrap').forEach(c => c.remove());

            // Build exit curtain
            const exitWrap = document.createElement("div");
            exitWrap.className = "skjal-transition-wrap";
            exitWrap.id = "skjal-exit-curtain";
            exitWrap.innerHTML = buildCurtainHTML(
                'translateY(0)',  // will be overridden by GSAP
                '0',             // bottom curve starts flat
                'translateY(120%) rotateZ(10deg)' // chars start below
            );
            document.body.appendChild(exitWrap);

            // Helper to safely build curtain HTML (closure captures outer function)
            function buildCurtainHTML(panelTransform, curveBottomScale, charsTransform) {
                return `
                    <div class="skjal-transition-panel" style="transform:${panelTransform}">
                        <svg class="skjal-curve-top" viewBox="0 0 100 100" preserveAspectRatio="none" style="transform:scaleY(1)">
                            <path d="M0,100 C50,0 100,100 100,100 Z"></path>
                        </svg>
                        <svg class="skjal-curve-bottom" viewBox="0 0 100 100" preserveAspectRatio="none" style="transform:scaleY(${curveBottomScale})">
                            <path d="M0,0 C50,100 100,0 100,0 Z"></path>
                        </svg>
                    </div>
                    <div class="skjal-transition-text-wrap">
                        <div class="skjal-transition-text">
                            <div class="skjal-transition-word">
                                <span class="skjal-transition-char">S</span>
                                <span class="skjal-transition-char">K</span>
                            </div>
                            <div class="skjal-transition-word">
                                <span class="skjal-transition-char">J</span>
                                <span class="skjal-transition-char">A</span>
                                <span class="skjal-transition-char">L</span>
                            </div>
                        </div>
                    </div>`;
            }

            if (window.gsap) {
                try {
                    const exitPanel = exitWrap.querySelector('.skjal-transition-panel');
                    const chars = exitWrap.querySelectorAll('.skjal-transition-char');
                    const exitTextWrap = exitWrap.querySelector('.skjal-transition-text-wrap');
                    const sweepOffset = window.innerHeight + (window.innerWidth * 0.15);

                    const tl = window.gsap.timeline({
                        onComplete: () => {
                            // Cancel failsafe timeout — animation completed successfully
                            clearTimeout(transitionTimeout);
                            // Lock everything dark BEFORE navigation
                            document.documentElement.style.backgroundColor = '#111823';
                            document.documentElement.style.visibility = 'hidden';
                            document.documentElement.classList.add('page-transitioning');
                            sessionStorage.setItem('isPageTransition', 'true');
                            window.location.href = href;
                        }
                    });

                    // Show the wrapper
                    tl.set(exitWrap, { autoAlpha: 1 }, 0);
                    tl.set(exitTextWrap, { autoAlpha: 1 }, 0);

                    // Hide footer immediately to prevent bleed-through
                    if (footer) {
                        tl.set(footer, { visibility: 'hidden', opacity: 0 }, 0);
                    }

                    // Panel sweeps from below screen to covering screen
                    tl.fromTo(exitPanel, {
                        y: sweepOffset
                    }, {
                        y: 0,
                        duration: 1.0,
                        ease: osmoEase
                    }, 0);

                    // Text chars reveal (stagger in from below)
                    tl.fromTo(chars, {
                        yPercent: 120, rotationZ: 10
                    }, {
                        yPercent: 0,
                        rotationZ: 0,
                        duration: 0.8,
                        ease: expoOut,
                        stagger: 0.04
                    }, 0.25);

                    // Current page content pushes up
                    tl.to(mainContainer, {
                        y: "-15dvh",
                        duration: 1.0,
                        ease: osmoEase
                    }, 0);

                } catch(e) {
                    console.error("Exit transition failed:", e);
                    sessionStorage.setItem('isPageTransition', 'true');
                    window.location.href = href;
                }
            } else {
                // No GSAP
                sessionStorage.setItem('isPageTransition', 'true');
                window.location.href = href;
            }
        });
    });

    // =============================================
    // 3. BFCache (Back/Forward)
    // =============================================
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            isTransitioning = false;
            sessionStorage.removeItem('isPageTransition');
            document.documentElement.classList.remove('page-transitioning');
            document.documentElement.style.visibility = '';
            document.documentElement.style.backgroundColor = '';
            document.querySelectorAll('.skjal-transition-wrap').forEach(c => c.remove());
            if (footer) { footer.style.visibility = ''; footer.style.opacity = ''; }
            if (window.gsap) {
                window.gsap.set(mainContainer, { clearProps: "all" });
                window.gsap.globalTimeline.clear();
            }
        }
    });
});
