const fs = require('fs');

function addPreloads(file, images) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  let preloads = images.map(img => `<link rel="preload" as="image" href="${img}">`).join('\n  ');
  
  // Insert preloads before the </head> tag
  if (!content.includes('rel="preload" as="image"')) {
    content = content.replace('</head>', `  ${preloads}\n</head>`);
  }

  // Add fetchpriority="high" decoding="sync" to the actual img tags
  images.forEach(img => {
    const regex = new RegExp(`(<img[^>]*src="${img}"[^>]*)>`, 'g');
    content = content.replace(regex, (match, p1) => {
      if (!p1.includes('fetchpriority')) {
        return `${p1} fetchpriority="high" decoding="sync">`;
      }
      return match;
    });
  });

  fs.writeFileSync(file, content);
}

// Index page
addPreloads('index.html', ['img/skjal-hero-banner.png', 'img/shield-hero.png', 'img/energy-monitoring.jpeg']);

// Product pages
addPreloads('jala-rakshak.html', ['img/skjal-hero-banner.png']);
addPreloads('shield.html', ['img/shield-hero.png']);
addPreloads('energy-monitoring.html', ['img/energy-monitoring.jpeg']);

console.log('Optimized image loading across all pages');
