const fs = require('fs');
const path = require('path');

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const internalLinks = [];
const missing = [];

htmlFiles.forEach(file => {
  const html = fs.readFileSync(file, 'utf8');
  const regex = /href=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      continue;
    }
    
    // Parse target file and anchor (strip query parameters first)
    const cleanHref = href.split('?')[0];
    let [targetPath, hash] = cleanHref.split('#');
    if (!targetPath && hash) {
      // Anchor on same page
      targetPath = file;
    } else if (targetPath === '/' || targetPath === '') {
      targetPath = 'index.html';
    } else if (targetPath.startsWith('/')) {
      targetPath = targetPath.slice(1);
    }

    // Resolve relative path
    const resolvedPath = path.resolve(targetPath);
    const exists = fs.existsSync(resolvedPath);

    internalLinks.push({ file, href, targetPath, hash, exists });

    if (!exists) {
      missing.push({ file, href, targetPath });
    }
  }
});

console.log('Total internal links:', internalLinks.length);
console.log('Missing targets:', missing);

// Check anchors as well
const brokenAnchors = [];
internalLinks.forEach(item => {
  if (item.exists && item.hash) {
    const targetHtml = fs.readFileSync(item.targetPath, 'utf8');
    const hasId = targetHtml.includes(`id="${item.hash}"`) || targetHtml.includes(`id='${item.hash}'`) || targetHtml.includes(`name="${item.hash}"`);
    if (!hasId) {
      brokenAnchors.push(item);
    }
  }
});

console.log('Broken anchors:', brokenAnchors);
