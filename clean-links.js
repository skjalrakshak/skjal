const fs = require('fs');
['index.html', 'jala-rakshak.html', 'shield.html'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/href=\"jala-rakshak\.html\"/g, 'href=\"/jala-rakshak\"');
  content = content.replace(/href=\"shield\.html\"/g, 'href=\"/shield\"');
  fs.writeFileSync(file, content);
});
console.log('Clean links applied');
