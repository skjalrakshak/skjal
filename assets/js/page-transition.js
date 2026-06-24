
// Global curtain builder for Exit animations
function buildCurtainHTML(panelTransform, curveBottomScale, charsTransform, curveTopScale = '0') {
    return `
        <div class="skjal-transition-panel" style="transform:${panelTransform}">
            <svg class="skjal-curve-top" viewBox="0 0 100 100" preserveAspectRatio="none" style="transform:scaleY(${curveTopScale})">
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

document.addEventListener("DOMContentLoaded", () => {
    const mainContainer = document.querySelector('main') || document.querySelector('.wrap');
    const footer = document.getElementById('footer');

    // =============================================
    // 1. ENTRY ANIMATION (arriving on new page)
    // =============================================
    let gsapPollCount = 0;
    const gsapPollMax = 50;

    function forceRevealNoAnimation() {
            document.documentElement.style.overflow = '';
            var f = document.getElementById('footer');
            if (f) { f.style.visibility = ''; f.style.opacity = ''; }
            var w = document.getElementById('skjal-entry-curtain');
            if (w) w.remove();
        }

        function runEntryAnimation() {
            var wrap = document.getElementById('skjal-entry-curtain');
            if (!wrap) { forceRevealNoAnimation(); return; }

            try {
                var panel = wrap.querySelector(".skjal-transition-panel");
                var panelBottom = wrap.querySelector(".skjal-curve-bottom");
                var chars = wrap.querySelectorAll(".skjal-transition-char");
                var sweepOffset = window.innerHeight + (window.innerWidth * 0.15);

                window.gsap.set(mainContainer, { opacity: 1 });
                if (footer) {
                    footer.style.visibility = 'hidden';
                    footer.style.opacity = '0';
                }

                var tl = window.gsap.timeline({
                    onComplete: function() {
                        wrap.remove();
                        window.gsap.set(mainContainer, { clearProps: "all" });
                        if (footer) {
                            footer.style.visibility = '';
                            footer.style.opacity = '';
                        }
                        document.documentElement.style.overflow = '';
                    }
                });

                // Handle hash scrolling
                tl.call(function() {
                    var hash = window.location.hash;
                    if (hash && hash !== '#') {
                        try {
                            var rawId = decodeURIComponent(hash.slice(1));
                            var target = rawId ? document.getElementById(rawId) : null;
                            if (target) {
                                if (window.lenis) {
                                    window.lenis.scrollTo(target, { immediate: true });
                                } else {
                                    window.scrollTo(0, target.offsetTop);
                                }
                            }
                        } catch (err) {}
                    }
                }, [], 0);

                // Text exits UPWARD
                tl.to(chars, {
                    yPercent: -120,
                    rotationZ: -10,
                    duration: 0.6,
                    ease: "power4.inOut",
                    stagger: 0.03
                }, 0.1);

                // Curtain panel sweeps UP
                tl.to(panel, {
                    y: -sweepOffset,
                    duration: 1.0,
                    ease: "power4.inOut",
                    overwrite: "auto"
                }, 0.3);

                // Bottom curve flattens
                tl.to(panelBottom, {
                    scaleY: 0,
                    duration: 1.0,
                    ease: "power4.inOut"
                }, 0.3);

                // Page content parallax up
                if (mainContainer) {
                    tl.fromTo(mainContainer, { y: "12dvh" }, { y: "0dvh", duration: 1.0, ease: "power4.inOut" }, 0.3);
                }
                
                // Slide navbar down smoothly
                const mainNav = document.querySelector('.main-nav');
                if (mainNav) {
                    document.querySelectorAll('.nav-dropdown-menu').forEach(m => m.style.display = '');
                    tl.fromTo(mainNav, { yPercent: -100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.0, ease: "power4.inOut" }, 0.3);
                }

                // Restore footer
                if (footer) {
                    tl.to(footer, { visibility: 'visible', opacity: 1, duration: 0.3, ease: "power2.out" }, 0.9);
                }

                tl.set(wrap, { autoAlpha: 0 }, ">");

            } catch (e) {
                forceRevealNoAnimation();
            }
        }

    function waitForGsapAndRun() {
        if (window.gsap) {
            runEntryAnimation();
        } else if (gsapPollCount < gsapPollMax) {
            gsapPollCount++;
            setTimeout(waitForGsapAndRun, 50);
        } else {
            forceRevealNoAnimation();
        }
    }

    if (sessionStorage.getItem('isPageTransition') === 'true') {
        sessionStorage.removeItem('isPageTransition');
        waitForGsapAndRun();
    }

    // =============================================
    // 2. EXIT ANIMATION (leaving current page)
    // =============================================
    let isTransitioning = false;

    // Handle BFCache (back/forward navigation)
    window.addEventListener("pageshow", function(event) {
        if (event.persisted) {
            isTransitioning = false;
            // Remove any stuck exit curtains
            document.querySelectorAll('.skjal-transition-wrap').forEach(c => c.remove());
            
            // Re-create the entry curtain to simulate transition when going back
            const entryCurtain = document.createElement('div');
            entryCurtain.className = 'skjal-transition-wrap';
            entryCurtain.id = 'skjal-entry-curtain';
            entryCurtain.innerHTML = buildCurtainHTML('translateY(0%)', '1', 'translateY(0%)', '0');
            entryCurtain.style.display = 'flex';
            document.body.appendChild(entryCurtain);
            
            // Play the entry animation
            if (window.gsap) {
                runEntryAnimation();
            } else {
                forceRevealNoAnimation();
            }
        }
    });

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

            if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || target === "_blank") return;
            if (e.ctrlKey || e.metaKey) return;
            if (this.hostname !== window.location.hostname) return;

            const currentUrl = new URL(window.location.href);
            const linkUrl = new URL(this.href);
            const currentPath = normalizePathname(currentUrl.pathname);
            const linkPath = normalizePathname(linkUrl.pathname);

            if (currentPath === linkPath && currentUrl.search === linkUrl.search) {
                const hash = linkUrl.hash || (href.startsWith("#") ? href : '');
                if (hash) {
                    try {
                        var rawId = hash.startsWith('#') ? decodeURIComponent(hash.slice(1)) : null;
                        var targetEl = rawId ? document.getElementById(rawId) : null;
                        if (targetEl) {
                            e.preventDefault();
                            if (window.lenis) {
                                window.lenis.scrollTo(targetEl, { immediate: false, duration: 1.2 });
                            } else {
                                targetEl.scrollIntoView({ behavior: 'smooth' });
                            }
                            history.pushState(null, null, hash);
                        }
                    } catch(err) {}
                }
                return;
            }

            e.preventDefault();
            if (!window.gsap) {
                window.location.href = href;
                return;
            }

            isTransitioning = true;
            sessionStorage.setItem('isPageTransition', 'true');

            // Instantly close mobile drawer and overlay so they don't glitch over transition
            document.querySelectorAll('.nav-dropdown-menu').forEach(m => m.style.display = 'none');
            const mobileDrawer = document.getElementById('navDrawer');
            const drawerOverlay = document.getElementById('navOverlay');
            if (mobileDrawer) {
                mobileDrawer.style.transition = 'none';
                mobileDrawer.classList.remove('is-open');
            }
            if (drawerOverlay) drawerOverlay.classList.remove('is-open');

            // Inject Exit Curtain
            const exitCurtain = document.createElement('div');
            exitCurtain.className = 'skjal-transition-wrap';
            exitCurtain.innerHTML = buildCurtainHTML('translateY(100%)', '0', 'translateY(100%)');
            exitCurtain.style.display = 'flex';
            document.body.appendChild(exitCurtain);

            const panel = exitCurtain.querySelector(".skjal-transition-panel");
            const curveTop = exitCurtain.querySelector(".skjal-curve-top");
            const chars = exitCurtain.querySelectorAll(".skjal-transition-char");

            const tl = window.gsap.timeline({
                onComplete: () => {
                    window.location.href = href;
                }
            });

            const mainNav = document.querySelector('.main-nav');
            if (mainNav) {
                tl.to(mainNav, { yPercent: -100, opacity: 0, duration: 0.6, ease: "power4.inOut" }, 0);
            }

            tl.to(panel, { y: "0%", duration: 1.0, ease: "power4.inOut" }, 0.1);
            tl.to(curveTop, { scaleY: 1, duration: 1.0, ease: "power4.inOut" }, 0.1);
            
            tl.to(chars, {
                yPercent: -100,
                duration: 0.8,
                ease: "power4.inOut",
                stagger: 0.03
            }, 0.4);
        });
    });
});
