const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');
const stylePath = path.join(baseDir, 'assets/css/style.min.css');
const style = fs.readFileSync(stylePath, 'utf8');

const htmlFiles = [
  'index.html', 'about.html', 'contact.html',
  'energy-monitoring.html', 'jal-rakshak.html',
  'resources.html', 'shield.html'
].map(f => path.join(baseDir, f));

for (const file of htmlFiles) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf-8');
  
  content = content.replace(/<link rel="stylesheet" href="assets\/css\/style\.min\.css[^>]*>/, '<style>' + style + '</style>');
  content = content.replace(/<link rel="preload" as="style" href="assets\/css\/style\.min\.css">\s*/, '');
  
  fs.writeFileSync(file, content);
  console.log(`Inlined CSS in ${path.basename(file)}`);
}
