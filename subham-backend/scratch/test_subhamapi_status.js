const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const https = require('https');

function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { timeout: 8000 }, (res) => {
      resolve({ url, statusCode: res.statusCode, contentType: res.headers['content-type'], contentLength: res.headers['content-length'] });
    }).on('error', (err) => resolve({ url, error: err.message }));
  });
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({ 'images.0': { $exists: true } }).limit(5);

  console.log('Found products:', products.length);

  for (const p of products) {
    console.log('\nProduct Title:', p.title);
    if (p.images && p.images.length > 0) {
      const img = p.images[0];
      const urlToTest = img.url;
      console.log('Testing Image URL:', urlToTest);
      const res = await testUrl(urlToTest);
      console.log('Result:', JSON.stringify(res, null, 2));
    }
  }

  console.log('\n--- API Route Tests ---');
  console.log('Testing /api/v1/products:', await testUrl('https://subhamapi.hypernxt.space/api/v1/products?limit=1'));
  console.log('Testing /api/products:', await testUrl('https://subhamapi.hypernxt.space/api/products?limit=1'));

  process.exit(0);
}

run().catch(console.error);
