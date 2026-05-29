const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function optimizeImages() {
  console.log('Starting Image Optimization...');
  const baseDir = path.join(__dirname, '..');
  const imgDir = path.join(baseDir, 'img');
  
  if (!fs.existsSync(imgDir)) return;

  const htmlFiles = [
    'index.html', 'about.html', 'contact.html',
    'energy-monitoring.html', 'jal-rakshak.html',
    'resources.html', 'shield.html'
  ].map(f => path.join(baseDir, f));

  // 1. Scan for used images
  let usedImages = new Set();
  const fileContents = htmlFiles.map(f => fs.existsSync(f) ? fs.readFileSync(f, 'utf-8') : '');
  const cssPath = path.join(baseDir, 'assets/css/style.css');
  const cssContent = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf-8') : '';

  const allContent = fileContents.join('\n') + '\n' + cssContent;
  
  // Basic regex to find img/ something
  const imgMatches = allContent.match(/img\/[a-zA-Z0-9_.-]+/g) || [];
  imgMatches.forEach(match => usedImages.add(match));

  // 2. Scan img folder and find unused
  const allImages = fs.readdirSync(imgDir).map(file => `img/${file}`);
  
  let deletedCount = 0;
  for (const imgPath of allImages) {
    if (!usedImages.has(imgPath)) {
      const fullPath = path.join(baseDir, imgPath);
      // Let's explicitly check if it's pdf_img_page* or if we are sure it's unused
      // Also ignore video files or other things we might accidentally delete
      if (fs.statSync(fullPath).isFile() && !imgPath.endsWith('.mp4')) {
         fs.unlinkSync(fullPath);
         console.log(`Deleted unused image: ${imgPath}`);
         deletedCount++;
      }
    }
  }
  console.log(`Deleted ${deletedCount} unused images.`);

  // 3. Convert used images to WebP
  let convertedCount = 0;
  for (const usedImg of Array.from(usedImages)) {
    const fullPath = path.join(baseDir, usedImg);
    if (!fs.existsSync(fullPath)) continue;

    if (usedImg.endsWith('.png') || usedImg.endsWith('.jpg') || usedImg.endsWith('.jpeg')) {
      const webpPath = fullPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
      
      if (!fs.existsSync(webpPath)) {
        console.log(`Converting ${usedImg} to WebP...`);
        try {
          await sharp(fullPath)
            .webp({ quality: 80 })
            .toFile(webpPath);
          convertedCount++;
        } catch (e) {
          console.error(`Failed to convert ${usedImg}:`, e);
        }
      }
    }
  }
  
  console.log(`Converted ${convertedCount} images to WebP.`);
}

optimizeImages().catch(console.error);
