#!/usr/bin/env node
/**
 * Form Interaction Example
 * 
 * Demonstrates filling out a form and submitting it.
 * This example uses the HTML5 form at httpbin.org for testing.
 */

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to form...');
  await page.goto('https://httpbin.org/forms/post');
  
  // Fill out form fields
  console.log('Filling form...');
  await page.fill('input[name="custname"]', 'John Doe');
  await page.fill('input[name="custtel"]', '555-1234');
  await page.fill('input[name="custemail"]', 'john@example.com');
  
  // Select a radio button
  await page.click('input[value="large"]');
  
  // Check a checkbox
  await page.check('input[name="delivery"][value="cheese"]');
  
  // Add comments
  await page.fill('textarea[name="comments"]', 'Test order from Playwright');
  
  // Take screenshot before submit
  await page.screenshot({ path: '/code/form-filled.png' });
  console.log('✓ Form filled, screenshot saved to /code/form-filled.png');
  
  // Submit form
  await page.click('input[type="submit"]');
  
  // Wait for response
  await page.waitForLoadState('networkidle');
  
  // Take screenshot of result
  await page.screenshot({ path: '/code/form-submitted.png' });
  console.log('✓ Form submitted, screenshot saved to /code/form-submitted.png');
  
  await browser.close();
})();
