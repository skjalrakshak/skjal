/**
 * SKJAL Restoration & Rollback Tool
 * Validates archive integrity using SHA256 checksums and restores production state from any backup.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const BACKUPS_DIR = path.join(ROOT_DIR, 'backups');

function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function listBackups() {
  if (!fs.existsSync(BACKUPS_DIR)) return [];
  return fs.readdirSync(BACKUPS_DIR)
    .filter(name => name.startsWith('backup_'))
    .sort()
    .reverse();
}

function verifyBackup(backupDirName) {
  const backupPath = path.join(BACKUPS_DIR, backupDirName);
  const manifestPath = path.join(backupPath, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found in: ${backupPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`[VERIFY] Validating archive: ${backupDirName}`);
  console.log(`[VERIFY] Timestamp: ${manifest.timestamp}`);

  let errors = 0;
  let verified = 0;

  for (const [relPath, info] of Object.entries(manifest.files)) {
    const filePath = path.join(backupPath, relPath);
    if (!fs.existsSync(filePath)) {
      console.error(`[FAIL] Missing file: ${relPath}`);
      errors++;
      continue;
    }
    const currentHash = getFileHash(filePath);
    if (currentHash !== info.sha256) {
      console.error(`[FAIL] Hash mismatch for: ${relPath}`);
      errors++;
    } else {
      verified++;
    }
  }

  console.log(`[VERIFY] ${verified} files verified matching SHA256 checksums.`);
  if (errors > 0) {
    throw new Error(`Integrity check failed with ${errors} error(s)!`);
  }
  console.log(`[PASS] Backup archive is 100% integral and ready for rollback/restoration.\n`);
  return { manifest, backupPath };
}

function restoreBackup(backupDirName, isDryRun = false) {
  const { manifest, backupPath } = verifyBackup(backupDirName);

  console.log(`[RESTORE] Mode: ${isDryRun ? 'DRY RUN (Verification only)' : 'ACTIVE ROLLBACK'}`);

  let restored = 0;
  for (const relPath of Object.keys(manifest.files)) {
    const src = path.join(backupPath, relPath);
    const dest = path.join(ROOT_DIR, relPath);

    if (!isDryRun) {
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(src, dest);
    }
    restored++;
  }

  console.log(`[SUCCESS] Restored ${restored} files from ${backupDirName}.`);
}

function main() {
  console.log('====================================================');
  console.log('      SKJAL DISASTER RECOVERY & ROLLBACK SUITE      ');
  console.log('====================================================');

  const backups = listBackups();
  if (backups.length === 0) {
    console.log('No backup archives found in backups/ directory.');
    return;
  }

  console.log(`Found ${backups.length} backup archive(s). Latest: ${backups[0]}`);
  
  // Test verify the latest backup
  verifyBackup(backups[0]);
}

if (require.main === module) {
  main();
}

module.exports = { listBackups, verifyBackup, restoreBackup };

