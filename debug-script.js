const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const response = await page.goto('https://localhost:3005', { waitUntil: 'networkidle' });
  console.log('STATUS:', response.status());
  await browser.close();
})();
