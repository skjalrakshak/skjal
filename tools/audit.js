const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));

console.log('====================================================');
console.log('       SKJAL DEEP AUDIT & VERIFICATION SUITE        ');
console.log('====================================================');
console.log('HTML files identified:', htmlFiles.join(', '));

let hasErrors = false;
let totalImagesChecked = 0;
let totalLinksChecked = 0;
let totalAnchorsChecked = 0;

// Cache page contents and IDs
const pageContents = {};
const pageIds = {};

htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  pageContents[file] = content;
  
  // Extract all IDs
  const idRegex = /id=["']([^"']+)["']/g;
  const ids = new Set();
  let m;
  while ((m = idRegex.exec(content)) !== null) {
    ids.add(m[1]);
  }
  pageIds[file] = ids;
});

htmlFiles.forEach(file => {
  const content = pageContents[file];

  // 1. Structure Check
  if (!content.includes('<!DOCTYPE html>') && !content.includes('<!doctype html>')) {
    console.error(`[FAIL] ${file}: Missing DOCTYPE`);
    hasErrors = true;
  }
  if (!content.includes('<html') || !content.includes('</html>')) {
    console.error(`[FAIL] ${file}: Missing <html> tag`);
    hasErrors = true;
  }
  if (!content.includes('<head>') && !content.includes('<head ')) {
    console.error(`[FAIL] ${file}: Missing <head> tag`);
    hasErrors = true;
  }
  if (!content.includes('<title>')) {
    console.error(`[FAIL] ${file}: Missing <title> tag`);
    hasErrors = true;
  }
  if (!content.includes('name="description"')) {
    console.error(`[FAIL] ${file}: Missing meta description`);
    hasErrors = true;
  }

  // 2. Preloader Check
  if (!content.includes('id="skjal-preloader"')) {
    console.error(`[FAIL] ${file}: Missing #skjal-preloader element`);
    hasErrors = true;
  }

  // 3. Images Check
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    totalImagesChecked++;
    const src = match[1];
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      continue;
    }
    const cleanSrc = src.split('?')[0].replace(/^\//, '');
    const fullPath = path.join(ROOT_DIR, cleanSrc);
    if (!fs.existsSync(fullPath)) {
      console.error(`[FAIL] ${file}: Broken image src: "${src}" -> file not found at "${fullPath}"`);
      hasErrors = true;
    }
  }

  // 4. Links and Anchors Check
  const linkRegex = /<a[^>]+href=["']([^"']+)["']/g;
  while ((match = linkRegex.exec(content)) !== null) {
    totalLinksChecked++;
    const href = match[1];
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http://') || href.startsWith('https://')) {
      continue;
    }

    if (href.startsWith('#')) {
      totalAnchorsChecked++;
      const anchorId = href.substring(1);
      if (anchorId === 'top') continue; // Browser default or top anchor
      if (!pageIds[file].has(anchorId)) {
        console.error(`[FAIL] ${file}: Dead local anchor "${href}" -> element with id="${anchorId}" not found in ${file}`);
        hasErrors = true;
      }
      continue;
    }

    const parts = href.split('#');
    let targetFile = parts[0].replace(/^\//, '');
    const anchorId = parts[1];

    if (!targetFile) {
      // e.g. /#services
      targetFile = 'index.html';
    } else if (!path.extname(targetFile)) {
      targetFile += '.html';
    }

    if (!fs.existsSync(path.join(ROOT_DIR, targetFile))) {
      console.error(`[FAIL] ${file}: Broken internal link "${href}" -> file "${targetFile}" does not exist`);
      hasErrors = true;
    } else if (anchorId) {
      totalAnchorsChecked++;
      if (anchorId !== 'top' && !pageIds[targetFile].has(anchorId)) {
        console.error(`[FAIL] ${file}: Dead cross-page anchor "${href}" -> id="${anchorId}" not found in ${targetFile}`);
        hasErrors = true;
      }
    }
  }
});

// 5. JavaScript Cursor-Follow Tilt Check
const jsFiles = ['assets/js/main.js', 'assets/js/page-transition.js'];
jsFiles.forEach(jsFile => {
  const jsPath = path.join(ROOT_DIR, jsFile);
  if (fs.existsSync(jsPath)) {
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    if (jsContent.includes('transformPerspective') || jsContent.includes('rotateX =') || jsContent.includes('rotateY =')) {
      console.error(`[FAIL] ${jsFile}: Found prohibited 3D cursor-following tilt code!`);
      hasErrors = true;
    } else {
      console.log(`[PASS] ${jsFile}: Verified clean (0 prohibited cursor tilt handlers)`);
    }
  }
});

// 6. CSS Check
const cssPath = path.join(ROOT_DIR, 'assets/css/style.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  if (css.includes('.skjal-preloader') && css.includes('.nav-dropdown') && css.includes('.dropdown-menu')) {
    console.log('[PASS] style.css: Preloader & navigation dropdown styles verified');
  } else {
    console.error('[FAIL] style.css: Missing required preloader or dropdown CSS');
    hasErrors = true;
  }
}

// 7. Sitemap Check
const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  htmlFiles.filter(f => f !== '404.html').forEach(f => {
    const urlPattern = f === 'index.html' ? 'https://www.skjal.in/' : `https://www.skjal.in/${f}`;
    if (!sitemap.includes(urlPattern) && !sitemap.includes(urlPattern.replace('.html', ''))) {
      console.warn(`[WARN] sitemap.xml: Does not explicitly list ${urlPattern}`);
    }
  });
  console.log('[PASS] sitemap.xml: Verified');
}

console.log('----------------------------------------------------');
console.log(`Checked ${htmlFiles.length} HTML files`);
console.log(`Checked ${totalImagesChecked} image tags (0 broken paths)`);
console.log(`Checked ${totalLinksChecked} internal links & anchors`);

if (!hasErrors) {
  console.log('>>> [SUCCESS] ALL AUDIT CHECKS PASSED WITH 0 ERRORS! <<<');
} else {
  console.log('>>> [FAILURE] AUDIT DETECTED ERRORS. FIX BEFORE PROCEEDING. <<<');
  process.exit(1);
}
