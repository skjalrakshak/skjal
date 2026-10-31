const http = require('http');

const PORT = 5173;

const routesToTest = [
  { route: '/', expected: 200 },
  { route: '/index.html', expected: 200 },
  { route: '/water-monitoring', expected: 200 },
  { route: '/shield', expected: 200 },
  { route: '/energy-monitoring', expected: 200 },
  { route: '/custom-engineering', expected: 200 },
  { route: '/water-monitoring.html', expected: 301, location: '/water-monitoring' },
  { route: '/shield.html', expected: 301, location: '/shield' },
  { route: '/energy-monitoring.html', expected: 301, location: '/energy-monitoring' },
  { route: '/custom-engineering.html', expected: 301, location: '/custom-engineering' },
  { route: '/jal-rakshak', expected: 301, location: '/water-monitoring' },
  { route: '/jal-rakshak.html', expected: 301, location: '/water-monitoring' },
  { route: '/water-monitoring-vizag', expected: 301, location: '/water-monitoring' },
  { route: '/energy-monitoring-vizag', expected: 301, location: '/energy-monitoring' },
  { route: '/about', expected: 301, location: '/#about' },
  { route: '/about.html', expected: 301, location: '/#about' },
  { route: '/services', expected: 301, location: '/#services' },
  { route: '/services.html', expected: 301, location: '/#services' },
  { route: '/industries', expected: 301, location: '/#industries' },
  { route: '/industries.html', expected: 301, location: '/#industries' },
  { route: '/contact', expected: 301, location: '/#contact' },
  { route: '/contact.html', expected: 301, location: '/#contact' },
  { route: '/assets/css/style.css', expected: 200 },
  { route: '/assets/js/main.js', expected: 200 },
  { route: '/sw.js', expected: 200 },
  { route: '/assets/img/heroes/skjal-iot-hero.webp', expected: 200 },
  { route: '/assets/img/gallery/electronics-bench.webp', expected: 200 },
  { route: '/assets/img/brand/kltiflogo.png', expected: 200 },
  { route: '/nonexistent-route-xyz', expected: 404 }
];

function testRoute(item) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}${item.route}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          route: item.route,
          expected: item.expected,
          location: item.location,
          statusCode: res.statusCode,
          resLocation: res.headers['location'],
          xFrameOptions: res.headers['x-frame-options'],
          xContentTypeOptions: res.headers['x-content-type-options'],
          csp: res.headers['content-security-policy'],
          hsts: res.headers['strict-transport-security'],
          contentType: res.headers['content-type'],
          contentLength: data.length
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing dev server endpoints, redirection rules, and security headers...');
  let failed = false;

  for (const item of routesToTest) {
    try {
      const res = await testRoute(item);
      const hasSecurity = res.xFrameOptions === 'DENY' && res.xContentTypeOptions === 'nosniff';
      const pass = res.statusCode === item.expected && (!item.location || res.resLocation === item.location) && hasSecurity;
      if (pass) {
        console.log(`[PASS] ${res.route} -> Status ${res.statusCode}${res.resLocation ? ' -> ' + res.resLocation : ''} [X-Frame-Options: ${res.xFrameOptions}, nosniff]`);
      } else {
        console.error(`[FAIL] ${res.route} -> Expected ${item.expected} (${item.location}), got ${res.statusCode} (${res.resLocation}), X-Frame-Options: ${res.xFrameOptions}`);
        failed = true;
      }
    } catch (e) {
      console.error(`[ERROR] ${item.route}: ${e.message}`);
      failed = true;
    }
  }

  if (failed) {
    console.error('\n>>> TEST FAILED <<<');
    process.exit(1);
  } else {
    console.log('\n>>> ALL 23 ENDPOINTS AND REDIRECTIONS PASSED! <<<');
  }
}

run();
