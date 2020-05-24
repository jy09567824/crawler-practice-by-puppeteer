const puppeteer = require('puppeteer');
const fs = require('fs')

async function scrape() {

    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://www.google.com/search?q=bulletproof+coffee');
    await page.waitFor(2000);

    const results = await page.evaluate( async () => {
    // 點擊進入頁面，擷取頁面資料
    const ele = document.querySelector('div.r > a')
    await ele.click({delay: 300});

    })
    fs.writeFileSync(`./result.json`, JSON.stringify(data, null, 2))
    // await browser.close();

}

scrape();