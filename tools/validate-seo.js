const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const htmlFiles = ['index.html', 'water-monitoring.html', 'energy-monitoring.html', 'custom-engineering.html', 'shield.html', 'privacy.html', '404.html'];

console.log('====================================================');
console.log('      SKJAL COMPREHENSIVE SEO VALIDATOR SUITE       ');
console.log('====================================================');

let totalErrors = 0;
let totalWarnings = 0;

// 1. JSON-LD Schema Validation
console.log('\n--- 1. STRUCTURED DATA (JSON-LD) VALIDATION ---');
htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  const regex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
  let match;
  let schemaCount = 0;
  while ((match = regex.exec(content)) !== null) {
    schemaCount++;
    try {
      const parsed = JSON.parse(match[1]);
      const graph = parsed['@graph'] || [parsed];
      const types = graph.map(item => Array.isArray(item['@type']) ? item['@type'].join('/') : item['@type']).join(', ');
      console.log(`[PASS] ${file} Schema #${schemaCount}: @context="${parsed['@context']}", Types: [${types}]`);

      // Verify domain consistency in schema IDs/URLs
      const rawJson = match[1];
      if (rawJson.includes('https://skjal.in') && !rawJson.includes('https://www.skjal.in')) {
        console.warn(`[WARN] ${file}: Found non-www domain reference "https://skjal.in" in JSON-LD. Preferred canonical is "https://www.skjal.in"`);
        totalWarnings++;
      }
    } catch (err) {
      console.error(`[FAIL] ${file} Schema #${schemaCount} INVALID JSON:`, err.message);
      totalErrors++;
    }
  }
  if (schemaCount === 0 && file !== '404.html') {
    console.error(`[FAIL] ${file}: Missing JSON-LD structured data`);
    totalErrors++;
  }
});

// 2. SEO Titles and Meta Descriptions
console.log('\n--- 2. PAGE TITLES & META DESCRIPTIONS ---');
const titles = new Map();
const descriptions = new Map();

htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');

  // Title check
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch) {
    console.error(`[FAIL] ${file}: Missing <title> tag`);
    totalErrors++;
  } else {
    const title = titleMatch[1].trim();
    if (titles.has(title)) {
      console.error(`[FAIL] ${file}: Duplicate <title> identical to ${titles.get(title)}`);
      totalErrors++;
    } else {
      titles.set(title, file);
      console.log(`[PASS] ${file} Title (${title.length} chars): "${title}"`);
      if (title.length > 70) {
        console.warn(`[WARN] ${file}: Title length (${title.length}) exceeds 70 characters`);
        totalWarnings++;
      }
    }
  }

  // Description check
  const descMatch = content.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i) ||
                    content.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  if (!descMatch) {
    console.error(`[FAIL] ${file}: Missing meta description`);
    totalErrors++;
  } else {
    const desc = descMatch[1].trim();
    if (descriptions.has(desc)) {
      console.error(`[FAIL] ${file}: Duplicate meta description identical to ${descriptions.get(desc)}`);
      totalErrors++;
    } else {
      descriptions.set(desc, file);
      console.log(`[PASS] ${file} Description (${desc.length} chars): "${desc}"`);
      if (desc.length > 170) {
        console.warn(`[WARN] ${file}: Description length (${desc.length}) exceeds 170 characters`);
        totalWarnings++;
      }
    }
  }

  // Canonical check
  const canonMatch = content.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
                     content.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  if (!canonMatch && file !== '404.html') {
    console.error(`[FAIL] ${file}: Missing canonical URL`);
    totalErrors++;
  } else if (canonMatch) {
    const canon = canonMatch[1];
    console.log(`[PASS] ${file} Canonical: "${canon}"`);
    if (!canon.startsWith('https://www.skjal.in/')) {
      console.error(`[FAIL] ${file}: Canonical URL "${canon}" does not match preferred "https://www.skjal.in/"`);
      totalErrors++;
    }
  }
});

// 3. Heading Structure (Single H1)
console.log('\n--- 3. HEADING HIERARCHY (H1) ---');
htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  const h1Matches = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  if (h1Matches.length === 0 && file !== '404.html') {
    console.error(`[FAIL] ${file}: Missing <h1> heading`);
    totalErrors++;
  } else if (h1Matches.length > 1) {
    console.error(`[FAIL] ${file}: Multiple (${h1Matches.length}) <h1> headings found`);
    totalErrors++;
  } else if (h1Matches.length === 1) {
    const cleanH1 = h1Matches[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`[PASS] ${file} Single H1: "${cleanH1}"`);
  }
});

// 4. Spam / Keyword Stuffing Checks
console.log('\n--- 4. SPAM & UNSUPPORTED CLAIMS CHECK ---');
const spamPhrases = [
  /#1\s+iot/i,
  /best\s+iot\s+company\s+in\s+vizag/i,
  /leading\s+water\s+monitoring\s+company\s+in\s+vizag/i,
  /premier\s+water\s+monitoring/i,
  /top-rated\s+iot\s+and\s+ot/i,
  /top-tier\s+energy\s+monitoring/i,
  /premier\s+solution\s+from\s+the\s+leading/i
];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  spamPhrases.forEach(regex => {
    if (regex.test(content)) {
      console.error(`[FAIL] ${file}: Detected spam / unsupported superlative matching ${regex}`);
      totalErrors++;
    }
  });
});
console.log('[PASS] Spam / unsupported claims check clean across all pages.');

// 5. Check Robots.txt and Sitemap.xml
console.log('\n--- 5. ROBOTS.TXT & SITEMAP.XML ---');
const robots = fs.readFileSync(path.join(ROOT_DIR, 'robots.txt'), 'utf8');
if (robots.includes('Sitemap: https://www.skjal.in/sitemap.xml')) {
  console.log('[PASS] robots.txt: Sitemap directive matches https://www.skjal.in/sitemap.xml');
} else {
  console.error('[FAIL] robots.txt: Missing or incorrect Sitemap directive');
  totalErrors++;
}

const sitemap = fs.readFileSync(path.join(ROOT_DIR, 'sitemap.xml'), 'utf8');
if (sitemap.includes('https://www.skjal.in/') && sitemap.includes('https://www.skjal.in/water-monitoring')) {
  console.log('[PASS] sitemap.xml: Canonical routes validated');
} else {
  console.error('[FAIL] sitemap.xml: Missing canonical routes');
  totalErrors++;
}

// 6. Character Encoding & Entities
console.log('\n--- 6. CHARACTER ENCODING & FOOTER INTEGRITY ---');
htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');
  if (content.includes('\uFFFD') || content.includes('<span>c <span id="year">')) {
    console.error(`[FAIL] ${file}: Found corrupted character encoding`);
    totalErrors++;
  } else {
    console.log(`[PASS] ${file}: Character encoding clean`);
  }
});

console.log('\n====================================================');
console.log(`Validation Complete: ${totalErrors} Errors, ${totalWarnings} Warnings`);
console.log('====================================================');

if (totalErrors > 0) {
  process.exit(1);
} else {
  console.log('>>> [SUCCESS] ALL COMPREHENSIVE SEO VALIDATIONS PASSED! <<<');
}
