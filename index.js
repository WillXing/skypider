const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://bbs.skykiwi.com/forum.php?mod=forumdisplay&fid=55');
  await page.screenshot({path: 'example.png'});

  await browser.close();
})();