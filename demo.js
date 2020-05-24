const puppeteer = require('puppeteer');

let scrape = async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('http://books.toscrape.com/');

    const result = await page.evaluate(() => { // 使用 DOM 元素
        let data = []; // 初始化空陣列來儲存資料
        let elements = document.querySelectorAll('.product_pod'); // 獲取所有書籍元素
        for (var element of elements){ // 迴圈
            let title = element.childNodes[5].innerText; // 獲取標題
            let price = element.childNodes[7].children[0].innerText; // 獲取價格
            data.push({title, price}); // 存入陣列
        }
        return data; // 返回資料
    });
    browser.close();
    return result;
};

scrape().then((value) => {
    console.log(value); // Success!
});