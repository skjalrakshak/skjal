/* ============================================================
   SKJAL — product pages only (jal-rakshak, energy-monitoring, shield)
   1) Cinematic scroll animations   2) Contact chooser modal
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const blocks = document.querySelectorAll('.cinematic-block');
    const stickyImage = document.getElementById('cinematicImage');
    
    if (!blocks.length || !stickyImage) return;

    // Use a very forgiving intersection observer for desktop mode on small screens
    const observerOptions = {
        root: null,
        rootMargin: '-10% 0px -10% 0px',
        threshold: 0
    };

    let imageFadeTimeout = null;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active from all
                blocks.forEach(b => b.classList.remove('active'));
                
                // Add active to current
                const block = entry.target;
                block.classList.add('active');
                
                // Update Sticky Image with a crossfade effect
                const newSrc = block.getAttribute('data-image');
                if (newSrc && stickyImage.getAttribute('src') !== newSrc) {
                    stickyImage.style.opacity = 0;
                    // Clear any pending crossfade to prevent race conditions
                    if (imageFadeTimeout) clearTimeout(imageFadeTimeout);
                    imageFadeTimeout = setTimeout(() => {
                        stickyImage.setAttribute('src', newSrc);
                        stickyImage.style.opacity = 1;
                        imageFadeTimeout = null;
                    }, 300);
                }
            }
        });
    }, observerOptions);

    blocks.forEach(block => observer.observe(block));
    
    // Set initial image and make first block active
    if (blocks[0]) {
        blocks[0].classList.add('active');
        const src = blocks[0].getAttribute('data-image');
        if (src) stickyImage.setAttribute('src', src);
    }
    
    // Fallback: If scrolling is weird on some mobile desktop views, ensure at least one is active on scroll
    window.addEventListener('scroll', () => {
        let anyActive = false;
        blocks.forEach(b => {
            if (b.classList.contains('active')) anyActive = true;
        });
        if (!anyActive && blocks[0]) blocks[0].classList.add('active');
    }, { passive: true });
});

// Contact chooser modal for product-page CTAs.
// Any element with [data-contact-modal] opens a "Call us / Email us" dialog
// instead of navigating. The href stays as a no-JS fallback.
(function () {
  var PHONE = "+918978859246";
  var PHONE_DISPLAY = "+91 89788 59246";
  var EMAIL = "sales@skjal.in";

  var css =
    ".ccm-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(5,5,5,0.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);opacity:0;transition:opacity .28s ease;}" +
    ".ccm-overlay.is-open{opacity:1;}" +
    ".ccm-card{position:relative;width:100%;max-width:480px;background:#101010;border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:40px 36px 36px;transform:translateY(16px) scale(.97);transition:transform .32s cubic-bezier(.22,1,.36,1);box-shadow:0 30px 80px rgba(0,0,0,.55);}" +
    ".ccm-overlay.is-open .ccm-card{transform:translateY(0) scale(1);}" +
    ".ccm-kicker{font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#d4af37;margin-bottom:10px;font-weight:600;}" +
    ".ccm-title{font-size:1.6rem;line-height:1.2;color:#fff;margin:0 0 8px;font-weight:700;}" +
    ".ccm-sub{font-size:.95rem;color:rgba(255,255,255,0.6);margin:0 0 26px;line-height:1.55;}" +
    ".ccm-options{display:flex;flex-direction:column;gap:12px;}" +
    ".ccm-opt{display:flex;align-items:center;gap:16px;padding:16px 18px;border:1px solid rgba(255,255,255,0.12);border-radius:14px;text-decoration:none;background:rgba(255,255,255,0.03);transition:border-color .2s ease,background .2s ease,transform .2s ease;}" +
    ".ccm-opt:hover{border-color:#d4af37;background:rgba(212,175,55,0.08);transform:translateY(-2px);}" +
    ".ccm-opt:focus{outline:none;border-color:rgba(212,175,55,0.7);}" +
    ".ccm-opt:focus-visible{outline:2px solid #d4af37;outline-offset:2px;}" +
    ".ccm-opt-icon{flex:0 0 auto;width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:12px;background:rgba(212,175,55,0.12);color:#d4af37;}" +
    ".ccm-opt-label{font-size:1rem;font-weight:600;color:#fff;margin:0 0 2px;}" +
    ".ccm-opt-detail{font-size:.85rem;color:rgba(255,255,255,0.55);margin:0;}" +
    ".ccm-close{position:absolute;top:16px;right:16px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,0.14);border-radius:50%;background:transparent;color:rgba(255,255,255,0.7);cursor:pointer;font-size:16px;line-height:1;transition:color .2s ease,border-color .2s ease;}" +
    ".ccm-close:hover{color:#fff;border-color:rgba(255,255,255,0.4);}" +
    "@media(max-width:480px){.ccm-card{padding:32px 22px 24px;border-radius:16px;}.ccm-title{font-size:1.35rem;}}";

  var phoneIcon =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
  var mailIcon =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';

  var overlay = null;
  var lastFocus = null;

  function build(productName) {
    var subject = encodeURIComponent(
      "Demo Request — " + (productName || "SK Jalrakshak Innovations")
    );
    overlay = document.createElement("div");
    overlay.className = "ccm-overlay";
    overlay.innerHTML =
      '<div class="ccm-card" role="dialog" aria-modal="true" aria-label="Contact options">' +
      '<button type="button" class="ccm-close" aria-label="Close">&#10005;</button>' +
      '<p class="ccm-kicker">' + (productName || "Get in touch") + "</p>" +
      '<h3 class="ccm-title">Let’s talk.</h3>' +
      '<p class="ccm-sub">Choose how you’d like to reach our team — we usually respond within a few hours.</p>' +
      '<div class="ccm-options">' +
      '<a class="ccm-opt" href="tel:' + PHONE + '">' +
      '<span class="ccm-opt-icon">' + phoneIcon + "</span>" +
      '<span><span class="ccm-opt-label" style="display:block;">Call us</span>' +
      '<span class="ccm-opt-detail">' + PHONE_DISPLAY + "</span></span></a>" +
      '<a class="ccm-opt" href="mailto:' + EMAIL + "?subject=" + subject + '">' +
      '<span class="ccm-opt-icon">' + mailIcon + "</span>" +
      '<span><span class="ccm-opt-label" style="display:block;">Email us</span>' +
      '<span class="ccm-opt-detail">' + EMAIL + "</span></span></a>" +
      "</div></div>";

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    overlay.querySelector(".ccm-close").addEventListener("click", close);
    document.body.appendChild(overlay);
  }

  function open(productName) {
    if (overlay) close();
    lastFocus = document.activeElement;
    build(productName);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () {
      overlay.classList.add("is-open");
      var first = overlay.querySelector(".ccm-opt");
      if (first) first.focus();
    });
    document.addEventListener("keydown", onKey);
  }

  function close() {
    if (!overlay) return;
    var el = overlay;
    overlay = null;
    el.classList.remove("is-open");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKey);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) {
    if (e.key === "Escape") close();
  }

  function init() {
    var style = document.createElement("style");
    style.id = "ccm-styles";
    style.textContent = css;
    document.head.appendChild(style);

    document.addEventListener(
      "click",
      function (e) {
        var trigger = e.target.closest && e.target.closest("[data-contact-modal]");
        if (!trigger) return;
        e.preventDefault();
        e.stopPropagation();
        open(trigger.getAttribute("data-product"));
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
