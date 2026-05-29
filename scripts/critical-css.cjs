const { generate } = require('critical');
const fs = require('fs');
const path = require('path');

async function extractCritical() {
  const baseDir = path.join(__dirname, '..');
  const htmlFiles = [
    'index.html', 'about.html', 'contact.html',
    'energy-monitoring.html', 'jal-rakshak.html',
    'resources.html', 'shield.html'
  ];

  for (const file of htmlFiles) {
    const filePath = path.join(baseDir, file);
    if (!fs.existsSync(filePath)) continue;

    console.log(`Processing ${file} for critical CSS...`);
    try {
      const htmlContent = fs.readFileSync(filePath, 'utf-8');
      const { html } = await generate({
        html: htmlContent,
        base: baseDir,
        inline: true,
        dimensions: [
          { height: 500, width: 320 },
          { height: 1080, width: 1920 }
        ],
        extract: true,
      });
      fs.writeFileSync(filePath, html);
      console.log(`Successfully inlined critical CSS for ${file}`);
    } catch (e) {
      console.error(`Failed on ${file}:`, e.message);
    }
  }
}

extractCritical().catch(console.error);
