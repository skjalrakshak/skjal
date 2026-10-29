const fs = require('fs');
const css = fs.readFileSync('assets/css/style.css', 'utf8');

const regex = /((\.[\w-]+|section|\bfooter\b)[^{]*)\{([^}]+)\}/g;
let match;
console.log('--- SECTION & COMPONENT SPACING AUDIT ---');
while ((match = regex.exec(css)) !== null) {
  const selector = match[1].trim();
  const body = match[3];
  if (selector.includes('.hero') || selector.includes('.services') || selector.includes('.products') || selector.includes('.industries') || selector.includes('.company') || selector.includes('.footer') || selector.includes('.domain') || selector.includes('.partner') || selector.includes('.product-hero') || selector.includes('.about-hero') || selector.includes('.specs-section') || selector.includes('.timeline-section')) {
    const pad = body.match(/padding:[^;]+/);
    const mar = body.match(/margin:[^;]+/);
    if (pad || mar) {
      console.log(selector.split('\n')[0].substring(0, 40) + ' -> ' + (pad ? pad[0] : '') + ' ' + (mar ? mar[0] : ''));
    }
  }
}

