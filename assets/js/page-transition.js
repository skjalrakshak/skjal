(function() {
    // Inject CSS for the Custom Ease approximation if CustomEase is not loaded
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        
        /* The transition wrapper covers the viewport */
        .skjal-transition-wrap {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            z-index: 2147483647; pointer-events: none;
            visibility: hidden; opacity: 0;
            overflow: visible;
        }
        
        /* The main moving panel */
        .skjal-transition-panel {
            background-color: #111823;
            width: 100vw; height: 100vh;
            position: absolute;
            left: 0; top: 0;
            will-change: transform;
        }
        
        /* Top and bottom accents (curved edges) */
        .skjal-curve-top {
            position: absolute;
            top: -14.9vw; left: 0; width: 100vw; height: 15vw;
            fill: #111823;
            transform-origin: bottom;
            will-change: transform;
        }
        
        .skjal-curve-bottom {
            position: absolute;
            bottom: -14.9vw; left: 0; width: 100vw; height: 15vw;
            fill: #111823;
            transform-origin: top;
            will-change: transform;
        }
        
        /* Text animation container */
        .skjal-transition-text-wrap {
            z-index: 3;
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
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
            gap: 2vw; /* Space between words */
        }
        .skjal-transition-word {
            display: flex;
            overflow: hidden;
        }
        .skjal-transition-char {
            display: inline-block;
            will-change: transform, opacity;
            transform-origin: 50% 100%;
            /* initial transform is handled by GSAP */
        }
    `;
    document.head.appendChild(style);

    // If we are in the middle of a transition, inject curtain immediately covering screen
    if (sessionStorage.getItem('isPageTransition') === 'true') {
        const html = `
            <div class="skjal-transition-wrap" id="skjal-entry-curtain" style="visibility: visible; opacity: 1;">
                <div class="skjal-transition-panel" style="transform: translateY(0px);">
                    <svg class="skjal-curve-top" viewBox="0 0 100 100" preserveAspectRatio="none" style="transform: scaleY(0);">
                        <path d="M0,100 C50,0 100,100 100,100 Z"></path>
                    </svg>
                    <svg class="skjal-curve-bottom" viewBox="0 0 100 100" preserveAspectRatio="none" style="transform: scaleY(1);">
                        <path d="M0,0 C50,100 100,0 100,0 Z"></path>
                    </svg>
                </div>
                <div class="skjal-transition-text-wrap" style="visibility: visible; opacity: 1;">
                    <div class="skjal-transition-text">
                        <div class="skjal-transition-word">
                            <span class="skjal-transition-char" style="transform: translateY(0%) rotateZ(0deg);">S</span>
                            <span class="skjal-transition-char" style="transform: translateY(0%) rotateZ(0deg);">K</span>
                        </div>
                        <div class="skjal-transition-word">
                            <span class="skjal-transition-char" style="transform: translateY(0%) rotateZ(0deg);">J</span>
                            <span class="skjal-transition-char" style="transform: translateY(0%) rotateZ(0deg);">A</span>
                            <span class="skjal-transition-char" style="transform: translateY(0%) rotateZ(0deg);">L</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        if (document.body) {
            document.body.insertAdjacentHTML('beforeend', html);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.insertAdjacentHTML('beforeend', html);
            });
        }
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    // Define easing variables with fallbacks
    let osmoEase = "power4.inOut";
    let expoOut = "expo.out";
    let expoInOut = "expo.inOut";

    if (window.gsap && "CustomEase" in window) {
        // Register exactly one CustomEase to avoid overwriting or conflicts
        osmoEase = CustomEase.create("osmo", "0.625, 0.05, 0, 1");
    }

    // Select the main content container to push it up/down (Parallax effect)
    const mainContainer = document.querySelector('main') || document.body;

    // --- 1. Handle WIPE IN (Arrival / runPageEnterAnimation) ---
    if (sessionStorage.getItem('isPageTransition') === 'true') {
        sessionStorage.removeItem('isPageTransition');
        
        const wrap = document.getElementById('skjal-entry-curtain');
        if (wrap && window.gsap) {
            // Fix deadlock: Browsers pause requestAnimationFrame if document is hidden!
            // Restore visibility synchronously so GSAP can tick, the curtain covers the screen anyway.
            document.documentElement.style.visibility = '';
            document.documentElement.style.backgroundColor = '';

            try {
                const panel = wrap.querySelector(".skjal-transition-panel");
                const panelBottom = wrap.querySelector(".skjal-curve-bottom");
                const chars = wrap.querySelectorAll(".skjal-transition-char");

                const tl = window.gsap.timeline();
                
                // Set initial state of new page container
                window.gsap.set(mainContainer, { opacity: 1 });

                // Start entering
                tl.add("startEnter", 0.4);
                
            // Calculate offsets based on viewport
            const sweepOffset = window.innerHeight + (window.innerWidth * 0.15);

            // Curtain sweeps upwards (from covering screen to above screen)
            tl.fromTo(panel, {
                y: 0,
            }, {
                y: -sweepOffset,
                duration: 1,
                ease: osmoEase,
                overwrite: "auto",
                immediateRender: false
            }, "startEnter");

            // Bottom panel scales down
            tl.fromTo(panelBottom, {
                scaleY: 1
            }, {
                scaleY: 0,
                duration: 1,
                ease: osmoEase
            }, "startEnter");

            // Hide the wrapper after sweep
            tl.set(wrap, {
                autoAlpha: 0
            }, ">");

            // Text animates out
            tl.fromTo(chars, {
                yPercent: 0,
                rotationZ: 0
            }, {
                yPercent: -120,
                rotationZ: -10,
                duration: 1.0,
                ease: expoInOut,
                stagger: 0.04
            }, "startEnter-=0.4");

            // Optional: New page content parallax
            tl.fromTo(mainContainer, {
                y: "15dvh"
            }, {
                y: "0dvh",
                duration: 1,
                ease: osmoEase
            }, "startEnter");

                tl.add("pageReady");
                tl.call(() => {
                    wrap.remove();
                    window.gsap.set(mainContainer, { clearProps: "all" });
                }, [], "pageReady");

            } catch (e) {
                console.error("Page transition Wipe In failed:", e);
                document.documentElement.style.visibility = '';
                document.documentElement.style.backgroundColor = '';
                if (wrap) wrap.remove();
            }
            
        } else {
            // Failsafe: if GSAP is missing, immediately unhide the page
            document.documentElement.style.visibility = '';
            document.documentElement.style.backgroundColor = '';
            if (wrap) wrap.remove();
        }
    }

    let isTransitioning = false;
    let transitionTimeout;

    // --- 2. Handle WIPE OUT (Departure / runPageLeaveAnimation) ---
    document.querySelectorAll("a:not([data-transition-bound])").forEach(link => {
        link.dataset.transitionBound = 'true';
        link.addEventListener("click", function(e) {
            // Respect preventDefault from other scripts (e.g. barba, custom tabs)
            if (e.defaultPrevented) return;
            
            if (isTransitioning) {
                e.preventDefault();
                return;
            }

            const href = this.getAttribute("href");
            const target = this.getAttribute("target");
            
            if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || target === "_blank") {
                return;
            }
            if (e.ctrlKey || e.metaKey) return;
            if (this.hostname !== window.location.hostname) return;
            
            // PREVENT SAME-PAGE HASH NAVIGATION FROM GETTING STUCK
            const currentUrl = new URL(window.location.href);
            const linkUrl = new URL(this.href);
            if (currentUrl.pathname === linkUrl.pathname && currentUrl.search === linkUrl.search) {
                // Only ignore if the link has a hash (anchor scroll)
                if (linkUrl.hash || this.getAttribute("href").startsWith("#")) {
                    return;
                }
                // If it's the exact same page with NO hash (e.g. clicking current product in navbar),
                // we SHOULD do the transition because the browser is going to reload the page.
            }
            
            isTransitioning = true;
            e.preventDefault();
            
            // Failsafe timeout to prevent permanent lockups
            clearTimeout(transitionTimeout);
            transitionTimeout = setTimeout(() => {
                if (isTransitioning) {
                    window.location.href = href;
                }
            }, 2500);
            
            // Clean up any stale curtains before creating a new one
            document.querySelectorAll('.skjal-transition-wrap').forEach(c => c.remove());
            
            // Create exit curtain DOM elements matching Hadi structure
            const exitWrap = document.createElement("div");
            exitWrap.className = "skjal-transition-wrap";
            exitWrap.id = "skjal-exit-curtain";
            
            const exitPanel = document.createElement("div");
            exitPanel.className = "skjal-transition-panel";

            exitPanel.innerHTML = `
                <svg class="skjal-curve-top" viewBox="0 0 100 100" preserveAspectRatio="none" style="transform: scaleY(0);">
                    <path d="M0,100 C50,0 100,100 100,100 Z"></path>
                </svg>
                <svg class="skjal-curve-bottom" viewBox="0 0 100 100" preserveAspectRatio="none" style="transform: scaleY(0);">
                    <path d="M0,0 C50,100 100,0 100,0 Z"></path>
                </svg>
            `;
            
            const exitTextWrap = document.createElement("div");
            exitTextWrap.className = "skjal-transition-text-wrap";
            exitTextWrap.innerHTML = `
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
            `;
            
            exitWrap.appendChild(exitPanel);
            exitWrap.appendChild(exitTextWrap);
            document.body.appendChild(exitWrap);
            
            if (window.gsap) {
                try {
                    const tl = window.gsap.timeline({
                        onComplete: () => {
                            sessionStorage.setItem('isPageTransition', 'true');
                            window.location.href = href;
                        }
                    });

                    const chars = exitTextWrap.querySelectorAll('.skjal-transition-char');
                    const curveTop = exitPanel.querySelector('.skjal-curve-top');
                    const curveBottom = exitPanel.querySelector('.skjal-curve-bottom');

                    // Init states
                    tl.set(exitWrap, { autoAlpha: 1 }, 0);
                    tl.set(curveTop, { scaleY: 1 }, 0); // Leading edge curved
                    tl.set(curveBottom, { scaleY: 0 }, 0); // Trailing edge flat
                    tl.set(exitTextWrap, { autoAlpha: 1 }, 0);
                    tl.set(chars, { yPercent: 120, rotationZ: 10 }, 0);

                    // Calculate offsets based on viewport
                    const sweepOffset = window.innerHeight + (window.innerWidth * 0.15);

                    // Panel moves from completely below screen (including curve) to covering screen
                    tl.fromTo(exitPanel, {
                        y: sweepOffset
                    }, {
                        y: 0,
                        duration: 1,
                        ease: osmoEase
                    }, 0);

                    // Reveal text
                    tl.fromTo(chars, {
                        yPercent: 120, rotationZ: 10
                    }, {
                        yPercent: 0,
                        rotationZ: 0,
                        duration: 0.8,
                        ease: expoOut,
                        stagger: 0.05
                    }, 0.3); // Starts slightly after curtain

                    // Current page pushes down slightly
                    tl.fromTo(mainContainer, {
                        y: "0vh"
                    }, {
                        y: "-15dvh",
                        duration: 1,
                        ease: osmoEase
                    }, 0);
                } catch(e) {
                    console.error("Wipe Out Transition Failed:", e);
                    window.location.href = href;
                }
            } else {
                window.location.href = href;
            }
        });
    });

    // 3. Handle Back/Forward Cache (BFCache)
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            isTransitioning = false;
            sessionStorage.removeItem('isPageTransition');
            document.querySelectorAll('.skjal-transition-wrap').forEach(c => c.remove());
            window.gsap.set(mainContainer, { clearProps: "all" });
            if (window.gsap) window.gsap.globalTimeline.clear();
        }
    });
});
