const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier');

const baseDir = path.join(__dirname, '..');
const htmlFiles = [
  'index.html', 'about.html', 'contact.html',
  'energy-monitoring.html', 'jal-rakshak.html',
  'resources.html', 'shield.html'
].map(f => path.join(baseDir, f));

for (const file of htmlFiles) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf-8');
  
  try {
    const minified = minify(content, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true
    });
    fs.writeFileSync(file, minified);
    console.log(`Minified ${path.basename(file)}`);
  } catch (e) {
    console.error(`Error minifying ${path.basename(file)}:`, e.message);
  }
}
