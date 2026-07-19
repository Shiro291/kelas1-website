const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', err => console.error('PAGE_ERROR:', err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE_ERROR:', msg.text());
  });
  await page.goto('http://localhost:5173');
  await page.click('button[role="combobox"]');
  await page.waitForTimeout(2000);
  await browser.close();
})();
