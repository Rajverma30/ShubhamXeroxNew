const axios = require('axios');

async function testBingHtml() {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent('SANJIV VERMA Bharatiya Arthvyavastha book cover')}&form=HDRSC2`;
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = res.data;
  console.log('HTML length:', html.length);
  
  // Find murl in html
  const idx = html.indexOf('murl&quot;:&quot;');
  console.log('murl index:', idx);
  if (idx !== -1) {
    console.log(html.slice(idx, idx + 200));
  } else {
    // Look for image links directly
    const imgRegex = /src="(https:\/\/m\.media-amazon\.com\/images\/[^"]+)"|src="(https:\/\/[^"]+\.(?:jpg|png|jpeg|webp))"/gi;
    let m;
    let count = 0;
    while ((m = imgRegex.exec(html)) !== null && count < 5) {
      console.log('Match:', m[1] || m[2]);
      count++;
    }
  }
}

testBingHtml();
