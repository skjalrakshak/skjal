const fs = require('fs');
const path = require('path');

const targetFiles = [
  'about.html',
  'services.html',
  'industries.html',
  'contact.html',
  'jal-rakshak.html',
  'shield.html',
  'energy-monitoring.html',
  '404.html'
];

const preloaderReplacement = `  <div id="skjal-preloader" class="preloader-container" role="status" aria-live="polite">
    <div class="preloader-brand-wrapper">
      <img src="assets/img/brand/logo.webp" alt="SKJAL" class="preloader-logo" id="preloader-logo" width="60" height="60" fetchpriority="high" decoding="sync" />
      <span class="preloader-brand-name" id="preloader-brand-name">SKJAL</span>
    </div>
    <div class="preloader-counter" id="preloader-counter">0</div>
  </div>`;

const desktopDropdownReplacement = `          <div class="dropdown-menu" role="menu">
            <a href="jal-rakshak.html" class="dropdown-item" role="menuitem">
              <span class="dropdown-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
              </span>
              <div>
                <strong>Jal Rakshak</strong>
                <span>Water quality &amp; environmental telemetry</span>
              </div>
            </a>
            <a href="shield.html" class="dropdown-item" role="menuitem">
              <span class="dropdown-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </span>
              <div>
                <strong>S.H.I.E.L.D.</strong>
                <span>Driver wellbeing &amp; whole-body vibration</span>
              </div>
            </a>
            <a href="energy-monitoring.html" class="dropdown-item" role="menuitem">
              <span class="dropdown-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </span>
              <div>
                <strong>Energy Monitoring</strong>
                <span>Substation, 3-phase power &amp; consumption</span>
              </div>
            </a>
          </div>`;

const mobileAccordionReplacement = `      <div class="mobile-accordion-content" id="mobile-products-menu" role="region" aria-labelledby="mobile-products-toggle">
        <a href="jal-rakshak.html" class="mobile-nav-sub">Jal Rakshak (Water Telemetry) <span>→</span></a>
        <a href="shield.html" class="mobile-nav-sub">S.H.I.E.L.D. (Driver Safety) <span>→</span></a>
        <a href="energy-monitoring.html" class="mobile-nav-sub">Energy Monitoring (Power) <span>→</span></a>
      </div>`;

const scriptsReplacement = `  <!-- Scripts: Local Vendor Libraries (Zero-latency GSAP + ScrollTrigger + Lenis) -->
  <script defer src="assets/js/vendor/gsap.min.js"></script>
  <script defer src="assets/js/vendor/ScrollTrigger.min.js"></script>
  <script defer src="assets/js/vendor/lenis.min.js"></script>
  <script defer src="assets/js/main.js"></script>
  <script defer src="assets/js/page-transition.js"></script>`;

targetFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.log('Skipping missing file:', file);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Update Preloader
  content = content.replace(
    /<div id="skjal-preloader" class="preloader-container" role="status" aria-live="polite">[\s\S]*?<div class="preloader-counter" id="preloader-counter">\d+<\/div>\s*<\/div>/,
    preloaderReplacement
  );

  // 2. Update Desktop Dropdown
  content = content.replace(
    /<div class="dropdown-menu" role="menu">[\s\S]*?<\/div>\s*<\/div>/,
    `${desktopDropdownReplacement}\n        </div>`
  );

  // 3. Update Mobile Accordion Content
  content = content.replace(
    /<div class="mobile-accordion-content" id="mobile-products-menu" role="region" aria-labelledby="mobile-products-toggle">[\s\S]*?<\/div>/,
    mobileAccordionReplacement
  );

  // 4. Remove Breadcrumbs
  content = content.replace(/<div class="breadcrumb"[\s\S]*?<\/div>/g, '');

  // 5. Remove Badges (Engineering Craftsmen • Visakhapatnam, etc.)
  content = content.replace(/<span class="product-hero-badge">[\s\S]*?<\/span>/g, '');

  // 6. Update scripts at bottom
  content = content.replace(
    /(?:<!-- Scripts:.*?-->\s*)?<script defer src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/gsap[\s\S]*?<script defer src="assets\/js\/page-transition\.js"><\/script>/,
    scriptsReplacement
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', file);
});
