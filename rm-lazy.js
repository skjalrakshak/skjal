const fs = require('fs');
['index.html', 'jala-rakshak.html', 'shield.html'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Remove loading="lazy"
  content = content.replace(/ loading="lazy"/g, '');
  // Optionally, we can add fetchpriority="high" to the very first image like the app mockup or hero images, but removing lazy will prevent the late loading.
  fs.writeFileSync(file, content);
});
console.log('Lazy loading removed');
