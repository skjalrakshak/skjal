const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'about.html',
  'contact.html',
  'services.html',
  'industries.html',
  'jal-rakshak.html',
  'shield.html',
  'energy-monitoring.html',
  '404.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // Change <a class="nav-dropdown-trigger ...">Products ... </a> to <button class="nav-dropdown-trigger ..." type="button">Products ... </button>
  html = html.replace(
    /<a class="nav-dropdown-trigger([^"]*)" href="#" role="button" aria-haspopup="true" aria-expanded="false">\s*Products\s*([\s\S]*?)<\/a>/g,
    '<button class="nav-dropdown-trigger$1" type="button" aria-haspopup="true" aria-expanded="false">\n            Products\n            $2</button>'
  );

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Updated ${file} successfully`);
});
