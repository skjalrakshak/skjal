const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const files = ['index.html', 'water-monitoring.html', 'energy-monitoring.html', 'custom-engineering.html', 'shield.html', '404.html'];

const replacements = [
  // Canonical and Full URLs
  { from: /https:\/\/www\.skjal\.in\/water-monitoring\.html/g, to: 'https://www.skjal.in/water-monitoring' },
  { from: /https:\/\/www\.skjal\.in\/energy-monitoring\.html/g, to: 'https://www.skjal.in/energy-monitoring' },
  { from: /https:\/\/www\.skjal\.in\/custom-engineering\.html/g, to: 'https://www.skjal.in/custom-engineering' },
  { from: /https:\/\/www\.skjal\.in\/shield\.html/g, to: 'https://www.skjal.in/shield' },

  { from: /https:\/\/skjal\.in\/water-monitoring\.html/g, to: 'https://skjal.in/water-monitoring' },
  { from: /https:\/\/skjal\.in\/energy-monitoring\.html/g, to: 'https://skjal.in/energy-monitoring' },
  { from: /https:\/\/skjal\.in\/custom-engineering\.html/g, to: 'https://skjal.in/custom-engineering' },
  { from: /https:\/\/skjal\.in\/shield\.html/g, to: 'https://skjal.in/shield' },

  // Internal Links (with or without leading slash, with or without hash)
  { from: /href="\/water-monitoring\.html([#"'])/g, to: 'href="/water-monitoring$1' },
  { from: /href="water-monitoring\.html([#"'])/g, to: 'href="/water-monitoring$1' },

  { from: /href="\/energy-monitoring\.html([#"'])/g, to: 'href="/energy-monitoring$1' },
  { from: /href="energy-monitoring\.html([#"'])/g, to: 'href="/energy-monitoring$1' },

  { from: /href="\/custom-engineering\.html([#"'])/g, to: 'href="/custom-engineering$1' },
  { from: /href="custom-engineering\.html([#"'])/g, to: 'href="/custom-engineering$1' },

  { from: /href="\/shield\.html([#"'])/g, to: 'href="/shield$1' },
  { from: /href="shield\.html([#"'])/g, to: 'href="/shield$1' }
];

files.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated clean URLs in ${file}`);
  } else {
    console.log(`No changes needed in ${file}`);
  }
});

