const http = require('http');

const PORT = 5173;

const routesToTest = [
  { route: '/', expected: 200 },
  { route: '/index.html', expected: 200 },
  { route: '/water-monitoring', expected: 200 },
  { route: '/shield', expected: 200 },
  { route: '/energy-monitoring', expected: 200 },
  { route: '/custom-engineering', expected: 200 },
  { route: '/water-monitoring.html', expected: 302, location: '/water-monitoring' },
  { route: '/shield.html', expected: 302, location: '/shield' },
  { route: '/energy-monitoring.html', expected: 302, location: '/energy-monitoring' },
  { route: '/custom-engineering.html', expected: 302, location: '/custom-engineering' },
  { route: '/jal-rakshak', expected: 302, location: '/water-monitoring' },
  { route: '/jal-rakshak.html', expected: 302, location: '/water-monitoring' },
  { route: '/water-monitoring-vizag', expected: 302, location: '/water-monitoring' },
  { route: '/energy-monitoring-vizag', expected: 302, location: '/energy-monitoring' },
  { route: '/about', expected: 302, location: '/#about' },
  { route: '/about.html', expected: 302, location: '/#about' },
  { route: '/services', expected: 302, location: '/#services' },
  { route: '/services.html', expected: 302, location: '/#services' },
  { route: '/industries', expected: 302, location: '/#industries' },
  { route: '/industries.html', expected: 302, location: '/#industries' },
  { route: '/contact', expected: 302, location: '/#contact' },
  { route: '/contact.html', expected: 302, location: '/#contact' },
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
          contentType: res.headers['content-type'],
          contentLength: data.length
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing dev server endpoints and redirection rules...');
  let failed = false;

  for (const item of routesToTest) {
    try {
      const res = await testRoute(item);
      const pass = res.statusCode === item.expected && (!item.location || res.resLocation === item.location);
      if (pass) {
        console.log(`[PASS] ${res.route} -> Status ${res.statusCode}${res.resLocation ? ' -> ' + res.resLocation : ''}`);
      } else {
        console.error(`[FAIL] ${res.route} -> Expected ${item.expected} (${item.location}), got ${res.statusCode} (${res.resLocation})`);
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
