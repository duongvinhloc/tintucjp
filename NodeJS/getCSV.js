const puppeteer = require('puppeteer');
//const puppeteer = require('puppeteer-core');
const path = require("path");
require('dotenv').config();

//var USER_EMAIL = process.env.MY_USER_EMAIL;
//var PASSWORD = process.env.MY_PASSWORD;

const pc = {
    'name': 'Chrome Mac',
    'userAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
    'viewport': {
        'width': 1200,
        'height': 800,
        'deviceScaleFactor': 1,
        'isMobile': false,
        'hasTouch': false,
        'isLandscape': false
    }
};

async function downloadCSV () {
    const browser = await puppeteer.launch({
        headless: true,
        slowMo: 100,
        //executablePath: '/usr/bin/chromium-browser', 
        //args: ['--no-sandbox'] 
    });
    try {
        const page = await browser.newPage();
        //await page.emulate(pc);

        // ページ開いて表示されるまで待機
        await page.goto('https://www.nyusatsu-king.com/user/login/')
        await page.waitForSelector('#USER_EMAIL');

        // ユーザ名、パスワード入力
        await page.type('input[name="USER_EMAIL"]', "nyusatsu_site@detomo.co.jp");
        await page.type('input[name="USER_PASSWORD"]', "Nyu#0413P@s");

        // ログイン
        await page.evaluate(() => {
            document.querySelector('button[id="userSubmit"]').click();
        });

        // Home画面かどうかをチェック
        await page.waitForNavigation({ timeout: 60000, waitUntil: "domcontentloaded" });

        // 検索ページに遷移
        await page.goto('https://www.nyusatsu-king.com/both_item_search');


        //保存した検索条件の呼び出し
        await page.evaluate(() => {
            document.querySelector('a[class="nk-btn both-item-search__btn--call-saved js-saved-open"]').click({ clickCount: 1, delay: 5000 });
        });
        await page.waitForSelector('.saved-item-call');
        await page.evaluate(() => {
            document.querySelector('a[class="saved-item-call"]').click({ clickCount: 1, delay: 1000 });
        });
        //検索条件
        //入札・落札同時検索項目
        //検索キーワード
        //検索Or div id= subjectORTable, class : 4 subjectOR, 16 subjectOR subject-more
        // await page.waitForSelector('#subjectORTable');
        // await page.evaluate(() => {
        //     document.querySelector('span[id="subjectORInput"]').click({ clickCount: 3, delay: 100 });
        // });

        // await page.$eval('#subjectORTable input:nth-child(1)', el => el.value = 'システム');
        // await page.$eval('#subjectORTable input:nth-child(2)', el => el.value = 'ホームページ');
        // await page.$eval('#subjectORTable input:nth-child(3)', el => el.value = 'ウェブサイト');
        // await page.$eval('#subjectORTable input:nth-child(4)', el => el.value = 'ポータル');

        // await page.$eval('#subjectORTable input:nth-child(5)', el => el.value = 'プログラム');
        // await page.$eval('#subjectORTable input:nth-child(6)', el => el.value = 'アプリ');
        // await page.$eval('#subjectORTable input:nth-child(7)', el => el.value = 'データベース');
        // await page.$eval('#subjectORTable input:nth-child(8)', el => el.value = 'Web');
        // await page.$eval('#subjectORTable input:nth-child(9)', el => el.value = 'チャットボット');
        // await page.$eval('#subjectORTable input:nth-child(10)', el => el.value = '');

        // //and 検索：div id = subjectANDTable, class: subjectAND

        // //not 検索：div id = subjectNOTTable, class : subjectNOT
        // await page.$eval('#subjectNOTTable input:nth-child(1)', el => el.value = '意見招請');

        //発注機関選択 id = frmS_BLOCK_NAME, value= 特定の発注機関が選択されています


        //検索期間選択
        var d = new Date();  //Today!
        var yesterday = new Date(Date.now() - 86400000);

        var S_year = yesterday.getFullYear();
        var S_month = yesterday.getMonth() + 1;
        var S_day = yesterday.getDate();
        var E_year = d.getFullYear();
        var E_month = d.getMonth() + 1;
        var E_day = d.getDate();

        await page.waitForSelector('#reg_Syear');
        //START    
        await page.select('select[name="searchForm.dateREGISTDATE_S.year"]', S_year.toString());
        await page.select('select[name="searchForm.dateREGISTDATE_S.month"]', S_month.toString());
        await page.select('select[name="searchForm.dateREGISTDATE_S.day"]', S_day.toString());
        //END
        await page.select('select[name="searchForm.dateREGISTDATE_E.year"]', E_year.toString());
        await page.select('select[name="searchForm.dateREGISTDATE_E.month"]', E_month.toString());
        await page.select('select[name="searchForm.dateREGISTDATE_E.day"]', E_day.toString());

        // //発注地域 id = nyusatsuFrmAREA_NAME

        // //業種カテゴリ id = js-category-list value 17,27

        // //入札種別
        // await page.evaluate(() => {
        //     document.querySelector('#bidClassAll').checked = true;
        //     document.querySelector('#bidClass1').checked = false;
        //     document.querySelector('#bidClass2').checked = false;
        // });
        // //資格ランク
        // await page.evaluate(() => {
        //     document.querySelector('#rank_A').checked = false;
        //     document.querySelector('#rank_B').checked = false;
        //     document.querySelector('#rank_C').checked = false;
        //     document.querySelector('#rank_D').checked = true;
        //     document.querySelector('#rank_E').checked = true;
        // });

        // //検索種別

        // //入札案件配信アドレス

        // //入札日（締切日）

        //検索ボタンをクリック
        await page.evaluate(() => {
            document.querySelector('a[id="btn_form_submit"]').click({ clickCount: 1, delay: 1000 });
        });
        await page.waitForSelector("#export_csv");

        //csvダウンロードボタンクリック
        const downloadPath = path.resolve('./download');
        const client = await page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: downloadPath
        });
        const form = await page.$('a#export_csv');
        await form.evaluate(form => form.click({ clickCount: 1, delay: 1000 }));

        // await page.evaluate(() => {
        //     document.querySelector('a[id="export_csv"]').click();
        // });
    } catch (e) {
        // 何かしらエラー処理
        // 呼び出し元でcatchするのであればここのcatchは不要
        throw e;
    }
};
module.exports = downloadCSV;