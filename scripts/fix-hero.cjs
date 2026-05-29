const fs = require('fs');
const path = require('path');

const baseDir = process.cwd();
const htmlFiles = [
  'index.html', 'about.html', 'contact.html',
  'energy-monitoring.html', 'jal-rakshak.html',
  'resources.html', 'shield.html'
].map(f => path.join(baseDir, f));

for (const file of htmlFiles) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf-8');

  // Change align-items to flex-start and add top margin to image to align perfectly with text
  content = content.replace(
    /\.product-hero-grid\s*\{[^}]*\}/g,
    '.product-hero-grid { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 64px; align-items: start; }'
  );

  content = content.replace(
    /\.product-hero-img-inner\s*\{[^}]*\}/g,
    '.product-hero-img-inner { position: relative; border-radius: 24px; overflow: hidden; aspect-ratio: 1/1; max-width: 95%; box-shadow: 0 24px 48px rgba(0,0,0,0.12); background: var(--bg-alt); border: 1px solid var(--border); margin-top: 12px; }'
  );

  fs.writeFileSync(file, content);
  console.log(`Updated ${path.basename(file)}`);
}
