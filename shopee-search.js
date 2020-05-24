////// 輸入蝦皮關鍵字搜尋網址，爬取指定頁面之商品資訊 //////
const puppeteer = require('puppeteer');
const fs = require('fs');
const csvjson = require('csvjson');


////// 爬蟲程式控制欄位 //////

const enterURL = 'https://shopee.tw/search?keyword=%E9%91%BD%E7%9F%B3&shop=164984605'; // 輸入欲爬取之商家頁面網址
const scrapePage = 2; // 輸入欲爬取商家之頁面數
const fileName = '蝦皮搜尋結果'; // 輸入儲存檔案名稱

////// 程式控制欄位結束 //////

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    await page.goto(enterURL);
    await page.setViewport({
        width: 1200,
        height: 800
    });
    const data = [];

    i = 1;
    
    do {
        await page.waitForSelector('.shopee-page-controller')
        await autoScroll(page); // 捲動頁面至底部

        const results = await page.evaluate(async () => {
            const data = []

            // 取得所有商品欄位
            let elements = document.querySelectorAll('.shopee-search-item-result__items > .shopee-search-item-result__item');  
            for( var element of elements) {
                // 取得商品名稱
                let name = element.querySelector('._1NoI8_').innerText;
                // 取得價格範圍，最低價與最高價（移除逗點與其餘特殊符號）
                let lowPrice = element.querySelector('._1w9jLI').innerText.replace(/,/g,"").replace(/[&\|\\*^%$#@\-]/g,"").split("  ")[0];
                let highPrice = element.querySelector('._1w9jLI').innerText.replace(/,/g,"").replace(/[&\|\\*^%$#@\-]/g,"").split("  ")[1];
                // 取得月銷量或總銷量文字
                let saleName = element.querySelector('._18SLBt').innerText.replace(',',"").split(' ')[0];
                // 取得月銷量或總銷量的值
                let saleAmount = element.querySelector('._18SLBt').innerText.replace(',',"").split(' ')[1];
                // 取得商品連結
                let slug = element.querySelector('a').getAttribute('href');
                let link = 'https://shopee.tw'+slug+'/';
                data.push({name, link, saleName, saleAmount, lowPrice, highPrice});
            }
            return data;
        });
        data.push(results);

        const nextPageValue = await page.evaluate(async () =>{
            const nextPage = await parseInt(document.querySelector('.shopee-page-controller > .shopee-button-solid--primary').nextSibling.innerText);
            return nextPage;
        })
        // console.log(nextPageValue); // Check value of next page
        if ( isNaN(nextPageValue) ) {
            break;
        }

        await page.evaluate(async () =>{
            const ele = await document.querySelector('.shopee-page-controller > .shopee-button-solid--primary').nextSibling;  
            await ele.click({delay: 2000});
        })
        // Set Timeout
        await page.waitFor(1000);
        i ++;

    } while ( i < scrapePage + 1 )
    browser.close(); // Close Google Chrome browser
    return data;

})().then((value) => {
    // fs.writeFileSync(`./search.json`, JSON.stringify(value, null, 2))
    console.log('JSON to CSV...')
    const csvData = csvjson.toCSV(value, {
        headers: 'key'
    });
    fs.writeFile(`./${fileName}.csv`, csvData, (err) => {
        if(err) {
            console.log(err); // Do something to handle the error or just throw it
            throw new Error(err);
        }
        console.log('CSV file is saved.');
    });
    console.log('Finished!')
});

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}