const fs = require('fs');

const files = ['index.html', 'jala-rakshak.html', 'shield.html', 'energy-monitoring.html'];

const faviconTag = '\n  <link rel="icon" type="image/svg+xml" href="/favicon.svg">';

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    if (!content.includes('rel="icon"')) {
      content = content.replace('</head>', faviconTag + '\n</head>');
      fs.writeFileSync(file, content);
      console.log('Added favicon to ' + file);
    }
  }
});

// Also need to add favicon.svg to vercel.json includeFiles
let vercel = fs.readFileSync('vercel.json', 'utf8');
if (!vercel.includes('"favicon.svg"')) {
  vercel = vercel.replace('"index.html",', '"favicon.svg",\n          "index.html",');
  fs.writeFileSync('vercel.json', vercel);
  console.log('Added favicon to vercel.json');
}
