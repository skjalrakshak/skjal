const fs = require('fs');

const filesToCheck = [
  'index.html',
  'jala-rakshak.html',
  'shield.html',
  'energy-monitoring.html',
  'README.md',
  'vercel.json',
  'script.js',
  'improve-product-content.js'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace text occurrences
    content = content.replace(/Jala Rakshak/g, 'Jal Rakshak');
    content = content.replace(/jala-rakshak/g, 'jal-rakshak');
    content = content.replace(/Jala-Rakshak/g, 'Jal-Rakshak');

    fs.writeFileSync(file, content);
    console.log('Updated text in ' + file);
  }
});

// Rename the file if it exists
if (fs.existsSync('jala-rakshak.html')) {
  fs.renameSync('jala-rakshak.html', 'jal-rakshak.html');
  console.log('Renamed jala-rakshak.html to jal-rakshak.html');
}
