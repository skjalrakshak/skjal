const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'about.html',
  'contact.html',
  'services.html',
  'industries.html',
  'jal-rakshak.html',
  'shield.html',
  'energy-monitoring.html',
  '404.html'
];

const targetScript = `  <script>
    if (sessionStorage.getItem('isPageTransition') === 'true') {
      document.write('<style>#skjal-entry-curtain { display: flex !important; } #skjal-preloader { display: none !important; }</style>');
      document.documentElement.style.overflow = 'hidden';
    }
  </script>`;

const curtainHTML = `  <!-- SKJAL Page Transition Curtain (Hardcoded for zero-flash) -->
  <div class="skjal-transition-wrap" id="skjal-entry-curtain" style="display: none;">
    <div class="skjal-transition-panel">
      <svg class="skjal-curve-top" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0,100 C50,0 100,100 100,100 Z"></path>
      </svg>
      <svg class="skjal-curve-bottom" viewBox="0 0 100 100" preserveAspectRatio="none">
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
    </div>
  </div>`;

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping missing ${file}`);
    return;
  }
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Replace or insert the head script
  if (html.includes('isPageTransition')) {
    html = html.replace(/<script>[\s\S]*?isPageTransition[\s\S]*?<\/script>/i, targetScript.trim());
  } else {
    html = html.replace('</head>', `${targetScript}\n</head>`);
  }

  // 2. Ensure curtain HTML exists right after <body...>
  if (!html.includes('id="skjal-entry-curtain"')) {
    html = html.replace(/(<body[^>]*>)/i, `$1\n${curtainHTML}`);
  }

  // 3. Ensure header-wrap has main-nav class so page-transition.js animates it smoothly
  html = html.replace(/<div class="header-wrap"(?! main-nav)/g, '<div class="header-wrap main-nav"');

  // 4. Ensure page-transition.js is loaded
  if (!html.includes('assets/js/page-transition.js')) {
    html = html.replace('</body>', '  <script defer src="assets/js/page-transition.js"></script>\n</body>');
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Updated ${file} successfully`);
});

