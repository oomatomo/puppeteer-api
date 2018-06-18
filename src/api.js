const express = require('express');
const app = express();
const devices = require('puppeteer/DeviceDescriptors');
const url = require('url');
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

// コンテンツの中のリンク取得API
app.get('/content', function (req, res) {
  // url=スクレイピング先
  // device=iPhone, Android
  const paramUrl = new URL(req.query.url);
  const device = req.query.device;
  console.log(paramUrl)
  console.log(device)
  const puppeteer = require('puppeteer');
  (async () => {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', request => {
      const reqUrl = request.url();
      // host以外のリクエストの場合はリクエストを飛ばさない
      if (reqUrl.includes(paramUrl.host)) {
        request.continue();
      } else {
        request.respond({ status: 200, body: 'not match domain'});
      }
    });
    await page.emulate(devices[device]);
    await page.goto(paramUrl.href);
    const contentLinks = await page.evaluate(() => {
      const links = [];
      const nodes = document.querySelectorAll('a[href]');
      nodes.forEach(node => {
        links.push(node.getAttribute('href'));
      })
      return links;
    });
    await browser.close();
    res.json({ origin: paramUrl.origin, links: contentLinks });
  })();
});

app.get('/link/', function (req, res) {
  // url=スクレイピング先
  // device=iPhone 6..etc https://github.com/GoogleChrome/puppeteer/blob/master/DeviceDescriptors.js
  const paramUrl = new URL(req.query.url);
  const device = req.query.device;
  const puppeteer = require('puppeteer');
  (async () => {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.emulate(devices[device]);
    // requestの許可や拒否の設定ができる
    // https://github.com/GoogleChrome/puppeteer/blob/v1.4.0/docs/api.md#pagesetrequestinterceptionvalue
    await page.setRequestInterception(true);

    page.on('request', request => {
      const reqUrl = request.url();
      if (reqUrl.startsWith('http')) {
        request.continue();
      } else {
        request.respond({ status: 500, body: 'error'});
      }
    });
    let links = []
    page.on('requestfinished', request => {
      const response = request.response();
      links.push(request.url());
    });
    await page.goto(paramUrl.href).catch(err => {
      console.error(err);
      return res.json({ message: err.toString() });
    });
    await sleep(3000);
    await browser.close();
    res.json({ links: links });
  })();
});

app.listen(9000, function () {});
