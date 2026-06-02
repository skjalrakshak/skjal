const puppeteer = require('puppeteer');
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    const browser = await puppeteer.launch({ headless: "new", dumpio: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    console.log("Navigating to shield.html...");
    await page.goto('http://localhost:5173/shield.html');
    await wait(2000); 
    
    console.log("Clicking Jal Rakshak link in dropdown from shield.html...");
    await page.evaluate(() => {
        document.querySelector('.nav-dropdown-item[href="jal-rakshak.html"]').click();
    });
    
    await wait(3000);
    
    const wasTransitionTriggered = await page.evaluate(() => {
        return sessionStorage.getItem('isPageTransition') === 'true' || document.querySelector('.skjal-transition-wrap') !== null;
    });
    
    console.log("WAS TRANSITION TRIGGERED ON SHIELD? :", wasTransitionTriggered);
    
    await browser.close();
})();
