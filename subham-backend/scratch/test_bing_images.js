const axios = require('axios');

async function searchBingImage(query) {
  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query + ' book cover')}&form=HDRSC2`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });
    const html = res.data;
    const murlRegex = /murl&quot;:&quot;(https?:[^&]+?)&quot;/gi;
    const matches = [];
    let m;
    while ((m = murlRegex.exec(html)) !== null) {
      const u = m[1];
      if (u.match(/\.(jpg|jpeg|png|webp)/i) && !u.includes('logo') && !u.includes('avatar') && !u.includes('favicon')) {
        matches.push(u);
      }
    }
    return matches;
  } catch (err) {
    console.error('Error fetching from Bing:', err.message);
    return [];
  }
}

async function test() {
  const books = [
    'SANJIV VERMA Bharatiya Arthvyavastha Indian Economy',
    'SSC Maths King Maker 2026 Gagan Pratap Sir',
    'ERROR PRO English Grammar Practice Book by Aman Sir',
    'Parikshadham Madhya Pradesh 2026 5th Edition'
  ];

  for (const b of books) {
    const imgs = await searchBingImage(b);
    console.log(`\nBook: "${b}"`);
    console.log(`Found ${imgs.length} candidate direct cover images:`);
    imgs.slice(0, 3).forEach((u, i) => console.log(`  ${i+1}. ${u}`));
  }
}

test();
