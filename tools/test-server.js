const http = require('http');

const PORT = 5173;

const routesToTest = [
  '/',
  '/index.html',
  '/jal-rakshak',
  '/jal-rakshak.html',
  '/shield',
  '/shield.html',
  '/energy-monitoring',
  '/energy-monitoring.html',
  '/about',
  '/about.html',
  '/services',
  '/services.html',
  '/industries',
  '/industries.html',
  '/contact',
  '/contact.html',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/assets/img/heroes/skjal-iot-hero.webp',
  '/assets/img/gallery/electronics-bench.webp',
  '/assets/img/brand/kltiflogo.png',
  '/nonexistent-route-xyz'
];

function testRoute(route) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}${route}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          route,
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          contentLength: data.length
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing dev server endpoints...');
  let failed = false;

  for (const route of routesToTest) {
    try {
      const res = await testRoute(route);
      const expectedStatus = route.includes('nonexistent') ? 404 : 200;
      if (res.statusCode === expectedStatus) {
        console.log(`[PASS] ${route} -> Status ${res.statusCode} (${res.contentType}, ${res.contentLength} bytes)`);
      } else {
        console.error(`[FAIL] ${route} -> Expected ${expectedStatus}, got ${res.statusCode}`);
        failed = true;
      }
    } catch (err) {
      console.error(`[ERROR] Failed to connect to ${route}:`, err.message);
      failed = true;
    }
  }

  if (failed) {
    console.error('Some route tests failed.');
    process.exit(1);
  } else {
    console.log('All server endpoints responded correctly!');
    process.exit(0);
  }
}

run();

