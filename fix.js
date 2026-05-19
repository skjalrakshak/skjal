const fs = require('fs');
['jala-rakshak.html', 'shield.html'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/href=\"\/jala-rakshak\.html\"/g, 'href=\"jala-rakshak.html\"');
  content = content.replace(/href=\"\/shield\.html\"/g, 'href=\"shield.html\"');
  content = content.replace(/href=\"\/#([a-zA-Z0-9_-]+)\"/g, 'href=\"index.html#$1\"');
  content = content.replace(/href=\"\/#\"/g, 'href=\"index.html\"');
  content = content.replace(/href=\"\/\"/g, 'href=\"index.html\"');
  fs.writeFileSync(file, content);
});
console.log('Done!');
