const fs = require('fs');

let css = fs.readFileSync('assets/css/style.css', 'utf-8');

// Update .innovation-grid to 1 column so the horizontal cards take full width
css = css.replace(/\.innovation-grid\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(3,\s*1fr\);\s*gap:\s*32px;\s*\}/g, 
  '.innovation-grid {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 32px;\n  max-width: 1000px;\n  margin: 0 auto;\n}');

// Change card to flex row
css = css.replace(/\.innovation-card\s*\{\s*display:\s*flex;\s*flex-direction:\s*column;/g, 
  '.innovation-card {\n  display: flex;\n  flex-direction: row;\n  align-items: stretch;');

// Update img container to take up 45% width instead of 100% width via aspect-ratio
css = css.replace(/\.innovation-card-img\s*\{\s*position:\s*relative;\s*overflow:\s*hidden;\s*aspect-ratio:\s*4\/3;/g, 
  '.innovation-card-img {\n  position: relative;\n  overflow: hidden;\n  width: 45%;\n  flex-shrink: 0;\n  min-height: 100%;');

// Update card body padding
css = css.replace(/\.innovation-card-body\s*\{\s*padding:\s*32px;\s*display:\s*flex;\s*flex-direction:\s*column;\s*flex-grow:\s*1;/g, 
  '.innovation-card-body {\n  padding: 40px;\n  display: flex;\n  flex-direction: column;\n  flex-grow: 1;\n  justify-content: center;');

// Make the text layout match the new layout
css += '\n@media (max-width: 900px) {\n  .innovation-card { flex-direction: column; }\n  .innovation-card-img { width: 100%; aspect-ratio: 4/3; }\n  .innovation-card-body { padding: 24px; }\n}\n';

fs.writeFileSync('assets/css/style.css', css);
console.log('Done modifying CSS.');
