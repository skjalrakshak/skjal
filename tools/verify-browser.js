const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_PROFILE = path.join(os.tmpdir(), 'chrome_test_profile_' + Date.now());
const PORT = 9222;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Connecting to Chrome on port ' + PORT + '...');
  let connected = false;
  let wsUrl = null;

  for (let i = 0; i < 15; i++) {
    try {
      const version = await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
      console.log('Chrome connected:', version['Browser']);
      connected = true;
      break;
    } catch (e) {
      await sleep(300);
    }
  }

  if (!connected) {
    console.error('Could not connect to Chrome DevTools port');
    process.exit(1);
  }

  // Get active page target
  const targets = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  wsUrl = pageTarget.webSocketDebuggerUrl;
  console.log('Connecting to page WebSocket:', wsUrl);

  const ws = new WebSocket(wsUrl);
  let msgId = 1;
  const pendingRequests = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pendingRequests.has(data.id)) {
      const { resolve, reject } = pendingRequests.get(data.id);
      pendingRequests.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise((resolve) => ws.onopen = resolve);
  console.log('WebSocket connected. Initializing protocol...');

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');
  await sendCommand('DOM.enable');

  async function capturePage(url, outputFilename, width = 1440, height = 1080, isMobile = false) {
    console.log(`Navigating to ${url} (${width}x${height}, isMobile=${isMobile})...`);
    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: isMobile
    });
    await sendCommand('Page.navigate', { url });
    // Wait for preloader & animations
    await sleep(2400);

    const shot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shot.data, 'base64');
    const outPath = path.join(__dirname, outputFilename);
    fs.writeFileSync(outPath, buffer);
    console.log(`Saved screenshot: ${outputFilename} (${buffer.length} bytes)`);
  }

  // 1. Desktop Homepage (Header, Liquid Glass, Preloader completion, Partners ecosystem)
  await capturePage('http://localhost:5173/', 'shot-desktop-home.png', 1440, 1080, false);

  // 2. Mobile View & Accordion
  console.log('Testing Mobile Menu and Products Accordion...');
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sendCommand('Page.navigate', { url: 'http://localhost:5173/' });
  await sleep(2200);

  // Open mobile menu
  await sendCommand('Runtime.evaluate', {
    expression: "document.getElementById('menu-toggle').click();"
  });
  await sleep(400);

  // Accordion is closed by default - capture shot
  const shotClosed = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'shot-mobile-menu-closed.png'), Buffer.from(shotClosed.data, 'base64'));
  console.log('Saved screenshot: shot-mobile-menu-closed.png');

  // Click Products Accordion to expand it
  await sendCommand('Runtime.evaluate', {
    expression: "document.getElementById('mobile-products-toggle').click();"
  });
  await sleep(450);

  // Capture open accordion shot
  const shotOpen = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'shot-mobile-menu-open.png'), Buffer.from(shotOpen.data, 'base64'));
  console.log('Saved screenshot: shot-mobile-menu-open.png');

  // 3. Services Page
  await capturePage('http://localhost:5173/services.html', 'shot-services.png', 1440, 1080, false);

  // 4. Industries Page
  await capturePage('http://localhost:5173/industries.html', 'shot-industries.png', 1440, 1080, false);

  // 5. Contact Page
  await capturePage('http://localhost:5173/contact.html', 'shot-contact.png', 1440, 1080, false);

  // 6. Test Text Roll Hover
  console.log('Testing Text Roll Hover state...');
  const textRollInfo = await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const cta = document.querySelector('.nav-cta');
        const rollInner = cta ? cta.querySelector('.roll-text-inner') : null;
        return {
          hasRollWrapper: !!cta.querySelector('.roll-text'),
          hasRollInner: !!rollInner,
          primaryText: cta.querySelector('.roll-text-primary')?.textContent?.trim(),
          cloneText: cta.querySelector('.roll-text-clone')?.textContent?.trim(),
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Text Roll Verification Result:', textRollInfo.result.value);

  ws.close();
  console.log('All browser verifications finished successfully!');
}

main().catch(err => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
