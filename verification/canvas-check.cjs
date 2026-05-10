const path = require("path");
let chromium;

try {
  ({ chromium } = require("playwright"));
} catch (error) {
  ({ chromium } = require("C:/tmp/skjal-pwverify/node_modules/playwright"));
}

const fileUrl = `file:///${path.resolve("index.html").replace(/\\/g, "/")}?verify=1`;

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 }
];

(async () => {
  const browser = await chromium.launch();

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3200);

    const result = await page.evaluate(() => {
      const images = Array.from(document.images);
      const hero = document.querySelector(".hero");
      const systemCards = Array.from(document.querySelectorAll(".system-card"));
      const hasCanvas = Boolean(document.querySelector("canvas"));
      const loadedImages = images.filter((img) => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);
      const coloredDefaultCards = systemCards.filter((card) => {
        const style = getComputedStyle(card);
        return style.color === "rgb(255, 255, 255)" || style.backgroundImage !== "none";
      }).length;

      return {
        ok: Boolean(hero) && !hasCanvas && loadedImages.length >= 3 && coloredDefaultCards === 0,
        images: images.length,
        loadedImages: loadedImages.length,
        hasCanvas,
        coloredDefaultCards,
        horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth)
      };
    });

    console.log(`${viewport.name}: ${JSON.stringify(result)}`);
    await page.close();

    if (!result.ok || result.horizontalOverflow > 2) {
      await browser.close();
      process.exit(1);
    }
  }

  await browser.close();
})();
