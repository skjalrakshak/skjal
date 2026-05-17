const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

const cloudName = 'dv8ruocdg';
const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto`;

function optimizeImage(match, src, attrs) {
  const filename = path.basename(src); 
  const publicId = `skjal/${filename}`;
  
  let widths = [400, 800, 1200];
  let sizes = '(max-width: 768px) 100vw, 50vw';
  
  if (filename.includes('logo')) {
    widths = [100, 200];
    sizes = '100px';
  } else if (['s1.png','s2.png','s3.png','p1.png','p2.png','t1.png','team.png','gemini-2.jpg','cloud-dashboard.png','a1.jpg'].includes(filename)) {
    // FlowArt cards / smaller images
    widths = [200, 400, 600];
    sizes = '(max-width: 768px) 160px, 200px';
  } else if (filename.includes('pdf_img_page')) {
    widths = [200, 400];
    sizes = '100px';
  } else if (filename.includes('p1-transparent')) {
    // Hero mockup
    widths = [400, 800];
    sizes = '(max-width: 768px) 280px, 420px';
  }
  
  const srcset = widths.map(w => `${baseUrl},w_${w}/${publicId} ${w}w`).join(', ');
  const fallbackSrc = `${baseUrl},w_${widths[widths.length-1]}/${publicId}`;
  
  const isAboveFold = filename.includes('logo') || filename.includes('p1-transparent');
  let newAttrs = attrs;
  if (!newAttrs.includes('loading=') && !isAboveFold) {
    newAttrs += ' loading="lazy"';
  }
  
  return `<img src="${fallbackSrc}" srcset="${srcset}" sizes="${sizes}" ${newAttrs.trim()}>`;
}

// Function to process <img> tag
html = html.replace(/<img\s+src="img\/([^"]+)"([^>]*)>/gi, (match, filename, restAttrs) => {
  return optimizeImage(match, `img/${filename}`, restAttrs);
});

html = html.replace(/<img([^>]*)src="img\/([^"]+)"([^>]*)>/gi, (match, before, filename, after) => {
  if(match.includes('srcset')) return match; 
  return optimizeImage(match, `img/${filename}`, before + " " + after);
});

fs.writeFileSync(htmlPath, html, 'utf-8');
console.log('HTML optimized again!');
