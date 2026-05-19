const fs = require('fs');

const files = ['index.html', 'jala-rakshak.html', 'shield.html', 'energy-monitoring.html'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace all instances of target="_blank" that are associated with internal links
    // Specifically targeting the navigation links and product cards
    content = content.replace(/<a([^>]+)target="_blank"([^>]*)>/g, (match, p1, p2) => {
      // If it's a link to one of our internal product pages, remove target="_blank"
      if (p1.includes('href="/jala-rakshak"') || p2.includes('href="/jala-rakshak"') ||
          p1.includes('href="/shield"') || p2.includes('href="/shield"') ||
          p1.includes('href="/energy-monitoring"') || p2.includes('href="/energy-monitoring"')) {
        return `<a${p1}${p2}>`;
      }
      // If it's something else (like an external link or something), leave it alone
      // Actually, looking at index.html, they want ALL product pages to open in the same tab.
      // So stripping it if it matches our internal product hrefs is perfect.
      return match;
    });

    fs.writeFileSync(file, content);
  }
});
console.log('Removed target="_blank" from product links');
