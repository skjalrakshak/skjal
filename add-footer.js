const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

// Extract footer
const footerMatch = indexHtml.match(/<footer id="footer">[\s\S]*?<\/footer>/);
if (!footerMatch) {
  console.error("Footer not found in index.html");
  process.exit(1);
}

const footerHtml = '\n  ' + footerMatch[0] + '\n';

const files = ['jala-rakshak.html', 'shield.html', 'energy-monitoring.html'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if footer already exists
    if (!content.includes('<footer id="footer">')) {
      // Find where to insert (before the first script tag that comes after the main content)
      // They all have <script>\n    // Theme toggle
      content = content.replace(/<script>\s*\/\/\s*Theme toggle/, footerHtml + '\n  <script>\n    // Theme toggle');
      fs.writeFileSync(file, content);
      console.log('Added footer to ' + file);
    } else {
      console.log(file + ' already has footer');
    }
  }
});
