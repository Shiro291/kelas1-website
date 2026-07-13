const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting E2E test...');
  // Launch a new headless browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173');
    
    // Wait for the app to load
    await page.waitForSelector('nav');
    
    // Get initial schedule
    const initialSchedule = await page.$eval('.card:nth-child(1) p', el => el.textContent);
    console.log('Initial Schedule:', initialSchedule);
    
    // Navigate to Admin
    console.log('Navigating to Admin panel...');
    await page.click('a[href="/admin"]');
    
    // Login
    console.log('Logging in...');
    await page.waitForSelector('input[type="password"]');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Change Schedule
    console.log('Changing Schedule...');
    await page.waitForSelector('input[name="schedule"]');
    
    // Clear input
    const scheduleInput = await page.$('input[name="schedule"]');
    await scheduleInput.click({ clickCount: 3 });
    await scheduleInput.press('Backspace');
    
    await page.type('input[name="schedule"]', 'TEST E2E SUCCESSFUL');
    
    // Handle the alert dialog that pops up on save
    page.on('dialog', async dialog => {
      console.log('Dialog appeared:', dialog.message());
      await dialog.accept();
    });
    
    // Click Save
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1000)); // wait a sec for the alert to process and state to update
    
    // Go back to Home
    console.log('Going back to Home...');
    await page.click('a[href="/"]');
    
    // Wait for home to load
    await page.waitForSelector('.card h2');
    
    // Get new schedule
    const newSchedule = await page.$eval('.card:nth-child(1) p', el => el.textContent);
    console.log('New Schedule on Homepage:', newSchedule);
    
    if (newSchedule === 'TEST E2E SUCCESSFUL') {
      console.log('✅ E2E TEST PASSED: State persisted and UI updated successfully.');
    } else {
      console.log('❌ E2E TEST FAILED: Schedule did not update.');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'e2e_proof.png' });
    console.log('Screenshot saved as e2e_proof.png');
    
  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    await browser.close();
  }
})();
