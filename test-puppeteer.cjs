const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER_ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE_ERROR:', err.message);
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  try {
    await page.click('button[role="combobox"]');
    await new Promise(r => setTimeout(r, 2000));
  } catch (err) {
    console.log('Failed to click:', err.message);
  }

  await browser.close();
})();
