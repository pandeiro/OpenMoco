#!/usr/bin/env node
/**
 * Data Extraction Example
 * 
 * Extracts data from a webpage and saves it as JSON.
 * This example scrapes book information from a test site.
 */

const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to books website...');
  await page.goto('http://books.toscrape.com/');
  
  // Extract book data from the page
  console.log('Extracting book data...');
  const books = await page.evaluate(() => {
    const bookElements = document.querySelectorAll('.product_pod');
    return Array.from(bookElements).slice(0, 5).map(book => {
      return {
        title: book.querySelector('h3 a').getAttribute('title'),
        price: book.querySelector('.price_color').textContent,
        availability: book.querySelector('.availability').textContent.trim(),
        rating: book.querySelector('.star-rating').classList[1]
      };
    });
  });
  
  // Save data to JSON file
  const outputPath = '/code/extracted-data.json';
  fs.writeFileSync(outputPath, JSON.stringify(books, null, 2));
  
  console.log(`✓ Extracted ${books.length} books:`);
  books.forEach(book => {
    console.log(`  - ${book.title} (${book.price})`);
  });
  console.log(`\n✓ Data saved to ${outputPath}`);
  
  // Take screenshot
  await page.screenshot({ path: '/code/data-extraction.png' });
  console.log('✓ Screenshot saved to /code/data-extraction.png');
  
  await browser.close();
})();
