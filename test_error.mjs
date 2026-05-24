import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Listen for all console logs
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`PAGE ERROR: "${msg.text()}"`);
    } else {
      console.log(`PAGE LOG: "${msg.text()}"`);
    }
  });

  // Listen for uncaught exceptions
  page.on('pageerror', exception => {
    console.log(`UNCAUGHT EXCEPTION: "${exception}"`);
  });

  console.log("Navigating...");
  await page.goto('http://localhost:5000/trip/1776043984310', { waitUntil: 'networkidle' }).catch(e => console.log("GOTO ERROR", e));
  
  // Wait a moment for React to crash
  await page.waitForTimeout(2000);
  
  await browser.close();
  console.log("Done");
})();
