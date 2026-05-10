let chromium;

try {
  ({ chromium } = require("playwright"));
} catch (error) {
  ({ chromium } = require("C:/tmp/skjal-pwverify/node_modules/playwright"));
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    const transfer = resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
    const scripts = resources.filter((entry) => entry.initiatorType === "script").length;
    const images = resources.filter((entry) => entry.initiatorType === "img").length;

    return {
      domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
      loadMs: Math.round(nav.loadEventEnd),
      resourceCount: resources.length,
      scriptRequests: scripts,
      imageRequests: images,
      transferredKb: Math.round(transfer / 1024)
    };
  });

  console.log(JSON.stringify(metrics));
  await browser.close();
})();
