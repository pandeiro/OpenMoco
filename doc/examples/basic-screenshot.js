#!/usr/bin/env node
/**
 * Basic Screenshot Capture Example
 * 
 * Captures a screenshot of a webpage and saves it to the /code directory.
 * This example demonstrates the most basic Playwright workflow.
 */

const { chromium } = require('playwright');

(async () => {
  // Launch browser in headless mode
  const browser = await chromium.launch({ headless: true });
  
  // Create a new page
  const page = await browser.newPage();
  
  // Navigate to a website
  console.log('Navigating to example.com...');
  await page.goto('https://example.com');
  
  // Take a full-page screenshot
  console.log('Capturing screenshot...');
  await page.screenshot({ 
    path: '/code/screenshot-example.png',
    fullPage: true 
  });
  
  console.log('✓ Screenshot saved to /code/screenshot-example.png');
  
  // Close browser
  await browser.close();
})();
