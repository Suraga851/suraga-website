import fs from 'fs';

async function fetchUrls() {
  const urls = [
    'https://suraga-website--suragaelzibaer.replit.app/suraga-promo/',
    'https://suraga-website--suragaelzibaer.replit.app/suraga-pitch-deck/',
    'https://suraga-website--suragaelzibaer.replit.app/'
  ];

  for (const url of urls) {
    try {
      console.log(`Fetching: ${url}`);
      const response = await fetch(url);
      const text = await response.text();
      console.log(`HTML for ${url} (first 500 chars):`);
      console.log(text.substring(0, 500));
      console.log('---');
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
    }
  }
}

fetchUrls();
