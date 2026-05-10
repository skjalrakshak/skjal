let chromium;

try {
  ({ chromium } = require("playwright"));
} catch (error) {
  ({ chromium } = require("C:/tmp/skjal-pwverify/node_modules/playwright"));
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.hover('nav a[href="#about"]');
  await page.click('nav a[href="#about"]');
  await page.waitForTimeout(1200);

  const result = await page.evaluate(() => {
    const aboutTop = document.querySelector("#about").getBoundingClientRect().top;
    const cursor = document.querySelector(".nav-cursor");
    const cursorStyle = cursor ? getComputedStyle(cursor) : null;

    return {
      hash: location.hash,
      aboutNearViewport: aboutTop > -120 && aboutTop < 140,
      cursorVisible: cursorStyle ? Number(cursorStyle.opacity) > 0.2 : false
    };
  });

  console.log(JSON.stringify(result));
  await browser.close();

  if (!result.hash.includes("about") || !result.aboutNearViewport || !result.cursorVisible) {
    process.exit(1);
  }
})();
