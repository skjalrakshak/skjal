const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Fix target="_blank" without rel="noopener noreferrer"
  // This regex finds <a ... target="_blank" ... >
  content = content.replace(/<a([^>]+)target=["']_blank["']([^>]*)>/gi, (match, p1, p2) => {
    if (!match.includes('rel=')) {
      return `<a${p1}target="_blank" rel="noopener noreferrer"${p2}>`;
    }
    if (match.includes('rel=') && !match.includes('noopener')) {
      // Very basic patching
      return match.replace(/rel=["']([^"']*)["']/, 'rel="$1 noopener noreferrer"');
    }
    return match;
  });

  // 2. Fix images without alt tags
  content = content.replace(/<img([^>]+)>/gi, (match, p1) => {
    if (!match.includes('alt=')) {
      return `<img${p1} alt="skjal image">`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
  } else {
    console.log(`No changes needed for ${file}`);
  }
});
