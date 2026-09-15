const https = require('https');

https.get('https://subhamapi.hypernxt.space/api/products?limit=10', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const json = JSON.parse(body);
    const products = json.data || [];
    console.log(`Fetched products count: ${products.length}\n`);
    products.forEach((p, i) => {
      console.log(`#${i + 1} Title: ${p.title}`);
      console.log(`   Image URLs: ${p.images?.length ? p.images.map(img => img.url).join(', ') : '[]'}\n`);
    });
  });
});
