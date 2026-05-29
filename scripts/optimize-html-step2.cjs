const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');
const htmlFiles = [
  'index.html', 'about.html', 'contact.html',
  'energy-monitoring.html', 'jal-rakshak.html',
  'resources.html', 'shield.html'
].map(f => path.join(baseDir, f));

for (const file of htmlFiles) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf-8');

  // Remove webgl.js script tag (we'll load it dynamically)
  content = content.replace(/<script[^>]*src="assets\/js\/webgl\.js(\?v=[0-9\.]+)?"><\/script>/g, '');

  // Add preconnect and dns-prefetch
  if (!content.includes('dns-prefetch" href="https://cdnjs.cloudflare.com"')) {
    const preconnects = `
  <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
  <link rel="dns-prefetch" href="https://unpkg.com">
  <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preconnect" href="https://unpkg.com" crossorigin>
    `.trim();
    // Insert after meta charset
    content = content.replace(/(<meta charset="UTF-8">)/, `$1\n  ${preconnects}`);
  }

  // Preload hero image if it exists
  const heroMatch = content.match(/<img[^>]+src="(img\/[^"]*hero[^"]*\.webp(\?v=\d+)?)"[^>]*fetchpriority="high"[^>]*>/);
  if (heroMatch && !content.includes('rel="preload" as="image"')) {
    const heroSrc = heroMatch[1];
    content = content.replace(/(<\/head>)/, `  <link rel="preload" as="image" href="${heroSrc}" fetchpriority="high">\n$1`);
  }
  
  // Preload critical CSS (style.min.css) if not already preloading
  if (!content.includes('rel="preload" as="style" href="assets/css/style.min.css"')) {
    content = content.replace(/(<link rel="stylesheet" href="assets\/css\/style\.min\.css(\?v=[\d\.]+)?">)/, `$1\n  <link rel="preload" as="style" href="assets/css/style.min.css">`);
  }

  fs.writeFileSync(file, content);
  console.log(`Processed ${path.basename(file)}`);
}
