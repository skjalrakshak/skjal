const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'about.html',
  'services.html',
  'industries.html',
  'contact.html',
  'jal-rakshak.html',
  'shield.html',
  'energy-monitoring.html',
  '404.html'
];

for (const file of files) {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace <span>Connected monitoring</span> inside brand-wording
  const before = (content.match(/<span>Connected monitoring<\/span>/g) || []).length;
  content = content.replace(/(<span class="brand-wording">\s*<strong>SKJAL<\/strong>)\s*<span>Connected monitoring<\/span>(\s*<\/span>)/g, '$1$2');
  const after = (content.match(/<span>Connected monitoring<\/span>/g) || []).length;
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`${file}: removed ${before - after}, remaining ${after}`);
}

