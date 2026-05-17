const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({ 
  cloud_name: 'dv8ruocdg', 
  api_key: '688375986377322', 
  api_secret: 'ybBud5HYkyAMEdTbLhhCqX4WqZk' 
});

const imgDir = path.join(__dirname, 'img');

async function uploadImages() {
  const files = fs.readdirSync(imgDir);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      const publicId = `skjal/${path.parse(file).name}`;
      console.log(`Uploading ${file} to ${publicId}...`);
      try {
        const result = await cloudinary.uploader.upload(path.join(imgDir, file), {
          public_id: publicId,
          overwrite: true
        });
        console.log(`Successfully uploaded ${file}: ${result.secure_url}`);
      } catch (err) {
        console.error(`Error uploading ${file}:`, err);
      }
    }
  }
}

uploadImages();
