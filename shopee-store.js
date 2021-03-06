////// 輸入蝦皮商家網址，爬取指定頁面之商品資訊 //////
const puppeteer = require('puppeteer');
const fs = require('fs');
const csvjson = require('csvjson');


////// 爬蟲程式控制欄位 //////

const enterURL = 'https://shopee.tw/cxsjeremy?page=0&shopCollection=21734347'; // 輸入欲爬取之商家頁面網址
const scrapePage = 5; // 輸入欲爬取商家之頁面數
const fileName = '蝦皮商家結果'; // 輸入儲存檔案名稱

////// 程式控制欄位結束 //////


let scrape = async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(enterURL);
    const data = [];

    // for (let i = 1; i <= scrapePage; i++) {
    i = 1;
    do {
        await page.waitForSelector('.shopee-page-controller'); // 等待須爬取頁面載入完成
        const results = await page.evaluate(async () => {
            const data = [];

            let elements = document.querySelectorAll('.shop-search-result-view__item');    
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
            };
            return data;
        });
        data.push(results);

        const nextPageValue = await page.evaluate(async () => {
            const nextPage = await parseInt(document.querySelector('.shopee-button-solid--primary').nextSibling.innerText);
            return nextPage
        })

        if ( isNaN(nextPageValue) ) {
            break;
        }

        await page.evaluate(async () => {
            const ele = await document.querySelector('.shopee-button-solid--primary').nextSibling;  
            await ele.click({delay: 2000});
        }) 

        await page.waitFor(2000)
        i ++;
        
    } while ( i < scrapePage + 1 );
    browser.close(); // Close Google Chrome browser
    return data;
};

// Save as CSV File
scrape().then((value) => {
    // fs.writeFileSync(`./store.json`, JSON.stringify(value, null, 2))
    console.log('檔案轉換中...')
    const csvData = csvjson.toCSV(value, {
        headers: 'key'
    });
    fs.writeFile(`./${fileName}.csv`, csvData, (err) => {
        if(err) {
            console.log(err); // Do something to handle the error or just throw it
            throw new Error(err);
        }
        console.log('CSV 建檔成功!');
    });
    console.log('Finished')
});