const puppeteer = require('puppeteer');
const fs = require('fs');

let scrape = async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://www.kkday.com/zh-tw/product/productlist/A01-001');
    await page.waitFor(3000); //等待時間

    const data = []

    // 輸入爬蟲爬取的頁面數量
    for (let i = 1; i <= 2; i++) {
        // 爬取每頁10筆資料
        const results = await page.evaluate(async () => {
            const data = []
            let elements = document.querySelectorAll('.product-detail');
            console.log(elements);
    
            for( var element of elements) {
                let product = element.querySelector('h3').innerText;
                let price = element.querySelector('.product-pricing').innerText;
                let location = element.querySelector('.product-place').innerText; 
                // let time = element.querySelector('.product-time').innerText;
                // let purchase = element.querySelector('.product-book').innerText;
                // let comment = element.querySelector('.text-grey-light').innerText;
                // let star = element.querySelector();
                data.push({product, price, location});
            }
   
            // 點擊當前頁面的下一筆資料 class="a-page"
            const ele = await document.querySelector('li.a-page.active').nextSibling;
            await ele.click({delay: 300});

            return data
        });

        data.push(results)

        // 等待
        await page.waitFor(3000);
    }
    
    // browser.close(); // 關閉瀏覽器
    fs.writeFileSync(`./result.json`, JSON.stringify(data, null, 2)) //存成json檔

    return data; // 返回資料
};

scrape().then((value) => {
    console.log(value); // 爬取成功
});