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

  // 1. Update image extensions to WebP
  content = content.replace(/src="(img\/[^"]+)\.(png|jpg|jpeg)(\?v=\d+)?"/g, 'src="$1.webp$3"');
  
  // Also update open graph / twitter images if they use local cloudinary link that can't be touched, but local img/ can
  content = content.replace(/content="(img\/[^"]+)\.(png|jpg|jpeg)(\?v=\d+)?"/g, 'content="$1.webp$3"');

  // 2. Add eager to hero banner explicitly (hero banner often contains 'hero')
  content = content.replace(/<img([^>]+src="img\/[^"]*hero[^"]*"[^>]*)>/g, (match, p1) => {
    if (!p1.includes('fetchpriority')) {
      return `<img${p1} fetchpriority="high" loading="eager" decoding="sync">`;
    }
    return match;
  });

  // Add lazy loading to ALL OTHER images that don't have eager or lazy
  content = content.replace(/<img([^>]+)>/g, (match, p1) => {
    if (!p1.includes('loading=') && !match.includes('hero')) {
      return `<img${p1} loading="lazy" decoding="async">`;
    }
    return match;
  });

  // 3. Update CSS reference to style.min.css
  content = content.replace(/href="assets\/css\/style\.css(\?v=[\d\.]+)?">/, 'href="assets/css/style.min.css$1">');

  // 4. Update font-display=swap
  if (!content.includes('display=swap')) {
    content = content.replace(/(family=[^"&]+)(?=")/g, '$1&display=swap');
  }

  // 5. Add defer to scripts if not present
  content = content.replace(/<script src="(assets\/js\/[^"]+)"(?!.*defer)><\/script>/g, '<script defer src="$1"></script>');
  content = content.replace(/<script src="assets\/js\/init\.js"><\/script>/g, '<script defer src="assets/js/init.js"></script>');

  fs.writeFileSync(file, content);
  console.log(`Processed ${path.basename(file)}`);
}
