const { PurgeCSS } = require('purgecss');
const CleanCSS = require('clean-css');
const fs = require('fs');
const path = require('path');

async function optimizeCSS() {
  console.log('Starting CSS Optimization...');
  const cssPath = path.join(__dirname, '../assets/css/style.css').replace(/\\/g, '/');
  const cssSize = fs.statSync(cssPath).size;
  console.log(`Original CSS size: ${(cssSize / 1024).toFixed(2)} KB`);

  const htmlFiles = [
    '../index.html',
    '../about.html',
    '../contact.html',
    '../energy-monitoring.html',
    '../jal-rakshak.html',
    '../resources.html',
    '../shield.html'
  ].map(f => path.join(__dirname, f).replace(/\\/g, '/'));

  // Run PurgeCSS
  const purgeResult = await new PurgeCSS().purge({
    content: htmlFiles,
    css: [cssPath],
    safelist: {
      standard: [/^lenis/, /^gs-/, /^nav-/, 'active', 'scrolled', 'hidden', 'visible'],
      deep: [/page-transition/, /cinematic-wipe/, /faq/]
    }
  });

  if (!purgeResult || purgeResult.length === 0) {
    throw new Error('PurgeCSS failed to process the CSS file.');
  }

  const purgedCSS = purgeResult[0].css;
  console.log(`Purged CSS size: ${(purgedCSS.length / 1024).toFixed(2)} KB`);

  // Minify CSS
  const minifiedCSS = new CleanCSS({ level: 2 }).minify(purgedCSS);
  console.log(`Minified CSS size: ${(minifiedCSS.styles.length / 1024).toFixed(2)} KB`);

  const outPath = path.join(__dirname, '../assets/css/style.min.css');
  fs.writeFileSync(outPath, minifiedCSS.styles);
  console.log(`Saved optimized CSS to ${outPath}`);
}

optimizeCSS().catch(console.error);
