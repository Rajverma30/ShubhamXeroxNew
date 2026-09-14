const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const axios = require('axios');

async function testFetchImage(query) {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' book cover image')}`;
    const res = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });
    const html = res.data;
    // Extract image links or retailer links (flipkart, amazon, shopaccino, b3books, vikasbookdepo)
    const imgRegex = /(https?:\/\/[^"'<>\s]+\.(?:jpg|jpeg|png|webp))/gi;
    const matches = [];
    let m;
    while ((m = imgRegex.exec(html)) !== null) {
      if (!m[1].includes('duckduckgo') && !m[1].includes('favicon') && !m[1].includes('.svg')) {
        matches.push(m[1]);
      }
    }
    console.log(`Query: "${query}" -> Found ${matches.length} direct image links`);
    if (matches.length > 0) {
      console.log('Sample:', matches.slice(0, 3));
    }
  } catch (err) {
    console.error(`Error querying "${query}":`, err.message);
  }
}

async function run() {
  await testFetchImage('SANJIV VERMA Bharatiya Arthvyavastha');
  await testFetchImage('Parikshadham Madhya Pradesh 2026 5th Edition');
}

run();
