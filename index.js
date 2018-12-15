const puppeteer = require('puppeteer');
const axios = require('axios');

async function crawlPostInfo(page) {
  return await page.evaluate(() => {
    return [...document.querySelectorAll('#moderate > table tbody > tr')].map(post => {
      const date = (post.querySelector('td:nth-child(3) > em > span') || post.querySelector('td:nth-child(3) > em') || {}).innerHTML;
      if (date === `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() - 1}`
        || date === `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`) {
        return {
          name: (post.querySelector('th .xst') || {}).innerHTML,
          date,
          link: (post.querySelector('th .xst') || {}).href
        };
      } else {
      }
    }).filter(post => !!post);
  });
}


(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://bbs.skykiwi.com/forum.php?mod=forumdisplay&fid=55&page=1');

  const pageMax = await page.evaluate(() => {
    return document.querySelector('#pgt > div > a.last').innerHTML.split(' ')[1] * 1;
  });

  const allPosts = [];
  for (let pageNum = 1; pageNum <= 20; pageNum++) {
    await page.goto(`http://bbs.skykiwi.com/forum.php?mod=forumdisplay&fid=55&page=${pageNum}`);
    allPosts.push(...await crawlPostInfo(page));
  }

  await axios.delete('https://wd3796420644tzvndi.wilddogio.com/jobs.json');

  for (let i = 0; i < allPosts.length; i++) {
    let post = allPosts[i];

    if(post.link) {
      await page.goto(post.link);
    } else {
      break;
    }
    const additionalInfo = await page.evaluate(() => {
      const baseSelector = "[id^='pid'] > tbody > tr:nth-child(1) > td.plc > div.pct > div > div.table-container >";

      const companyName = document.querySelector(`${baseSelector} table.table-margin > tbody > tr:nth-child(1) > td.td-content`).innerHTML;
      const location = document.querySelector(`${baseSelector} table.table-margin > tbody > tr:nth-child(2) > td.td-content`).innerHTML;
      const position = document.querySelector(`${baseSelector} table.table-margin > tbody > tr:nth-child(3) > td.td-content`).innerHTML;
      const salary = document.querySelector(`${baseSelector} table.table-margin > tbody > tr:nth-child(4) > td.td-content`).innerHTML;
      const type = document.querySelector(`${baseSelector} table.table-margin > tbody > tr:nth-child(5) > td.td-content`).innerHTML;
      const tel = document.querySelector(`${baseSelector} table:nth-child(2) > tbody > tr:nth-child(1) > td.td-content`).innerHTML;
      const wechat = document.querySelector(`${baseSelector} table:nth-child(2) > tbody > tr:nth-child(2) > td.td-content`).innerHTML;
      const email = document.querySelector(`${baseSelector} table:nth-child(2) > tbody > tr:nth-child(3) > td.td-content`).innerHTML;

      const description = document.querySelector("[id^='postmessage']").innerHTML;

      return {companyName, location, position, salary, type, tel, wechat, email, description}
    });
    Object.assign(post, additionalInfo);
    await axios.post('https://wd3796420644tzvndi.wilddogio.com/jobs.json', post);
  }

  await browser.close();
})();