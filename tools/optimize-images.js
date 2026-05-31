const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Directories to scan. Adjust these based on the actual project structure.
// The prompt specified /src/assets/ and /public/, but currently the workspace 
// appears to use /assets/img/ and /img/. We will include all common paths.
const DIRS = [
  path.join(__dirname, '../assets/img'),
  path.join(__dirname, '../img'),
  path.join(__dirname, '../src/assets'),
  path.join(__dirname, '../public')
];

const OUTPUT_MANIFEST = path.join(__dirname, 'rename-manifest.json');

const keywords = [
  'industrial-iot',
  'energy-monitoring-device',
  'water-quality-telemetry',
  'smart-factory-sensor'
];
const location = 'visakhapatnam';

async function optimizeImages() {
  const manifest = {};
  let counter = 1;

  for (const dir of DIRS) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      // Skip non-images
      if (!['.jpg', '.jpeg', '.png', '.webp', '.tiff'].includes(ext)) continue;

      const oldPath = path.join(dir, file);
      
      // Determine service keyword randomly or sequentially
      const service = keywords[counter % keywords.length];
      
      // Generate new SEO optimized name
      const newFileName = `${service}-${location}-${counter}-skjalrakshak.webp`;
      const newPath = path.join(dir, newFileName);

      console.log(`Processing: ${file} -> ${newFileName}`);

      try {
        // Optimize, convert to WebP, and embed EXIF metadata description
        await sharp(oldPath)
          .webp({ quality: 80, effort: 6 })
          .withMetadata({
            exif: {
              IFD0: {
                ImageDescription: `SK Jalrakshak Innovations - ${service.replace(/-/g, ' ')} in ${location}`
              }
            }
          })
          .toFile(newPath);

        manifest[path.join(path.basename(dir), file)] = path.join(path.basename(dir), newFileName);
        
        // Remove original file if it was converted to a new name/format
        if (oldPath !== newPath) {
            fs.unlinkSync(oldPath);
        }

        counter++;
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }
  }

  // Save the manifest
  fs.writeFileSync(OUTPUT_MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(`Optimization complete! Manifest saved to ${OUTPUT_MANIFEST}`);
}

optimizeImages();
