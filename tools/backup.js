/**
 * SKJAL Automated Daily Backup Script
 * Generates an integrity-checksummed, timestamped backup of all website assets, code, and configurations.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const BACKUPS_DIR = path.join(ROOT_DIR, 'backups');

// Files and directories to back up
const INCLUDE_PATHS = [
  'index.html',
  'water-monitoring.html',
  'energy-monitoring.html',
  'custom-engineering.html',
  'shield.html',
  'privacy.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'sw.js',
  'vercel.json',
  '_headers',
  '.htaccess',
  'package.json',
  'README.md',
  'assets'
];

function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function copyRecursive(src, dest, manifest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry), manifest);
    }
  } else {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    const relPath = path.relative(ROOT_DIR, src).replace(/\\/g, '/');
    const hash = getFileHash(src);
    manifest.files[relPath] = {
      bytes: stats.size,
      sha256: hash
    };
  }
}

function runBackup() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const targetDirName = `backup_${timestamp}`;
  const targetPath = path.join(BACKUPS_DIR, targetDirName);

  console.log('====================================================');
  console.log('         SKJAL AUTOMATED BACKUP ENGINE              ');
  console.log('====================================================');
  console.log(`Starting backup at: ${now.toISOString()}`);
  console.log(`Target archive path: ${targetPath}\n`);

  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }

  const manifest = {
    version: '1.0',
    timestamp: now.toISOString(),
    archiveName: targetDirName,
    company: 'SK Jalrakshak Innovations Private Limited',
    files: {}
  };

  for (const item of INCLUDE_PATHS) {
    const srcPath = path.join(ROOT_DIR, item);
    if (fs.existsSync(srcPath)) {
      const destPath = path.join(targetPath, item);
      copyRecursive(srcPath, destPath, manifest);
      console.log(`[BACKUP] Copied: ${item}`);
    } else {
      console.warn(`[WARN] Path not found, skipped: ${item}`);
    }
  }

  const fileCount = Object.keys(manifest.files).length;
  manifest.totalFiles = fileCount;

  // Write manifest
  const manifestPath = path.join(targetPath, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('\n----------------------------------------------------');
  console.log(`Backup completed successfully!`);
  console.log(`Total files archived: ${fileCount}`);
  console.log(`Manifest written to: ${manifestPath}`);
  console.log('====================================================');

  return { targetPath, manifest };
}

if (require.main === module) {
  runBackup();
}

module.exports = { runBackup };

