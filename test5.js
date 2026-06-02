const puppeteer = require('puppeteer');
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    const browser = await puppeteer.launch({ headless: "new", dumpio: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    let transitionDetected = false;
    
    page.on('console', msg => {
        console.log('PAGE LOG:', msg.text());
        if (msg.text().includes('Wipe Out Transition Failed')) transitionDetected = false;
    });

    console.log("Navigating to shield.html...");
    await page.goto('http://localhost:5173/shield.html');
    await wait(2000); 
    
    // Check if transition element exists at all during the process
    const checkInterval = setInterval(async () => {
        try {
            const hasCurtain = await page.evaluate(() => document.querySelector('.skjal-transition-wrap') !== null);
            if (hasCurtain) transitionDetected = true;
        } catch(e){}
    }, 50);

    console.log("Clicking Jal Rakshak link in dropdown from shield.html...");
    await page.evaluate(() => {
        document.querySelector('.nav-dropdown-item[href="jal-rakshak.html"]').click();
    });
    
    await wait(3000);
    clearInterval(checkInterval);
    
    console.log("CURRENT URL:", await page.url());
    console.log("WAS TRANSITION CURTAIN SEEN? :", transitionDetected);
    
    await browser.close();
})();
