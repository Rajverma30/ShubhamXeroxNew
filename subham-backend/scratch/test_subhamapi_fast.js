const https = require('https');

function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { timeout: 5000 }, (res) => {
      resolve({ url, statusCode: res.statusCode, contentType: res.headers['content-type'], contentLength: res.headers['content-length'] });
    }).on('error', (err) => resolve({ url, error: err.message }));
  });
}

async function run() {
  console.log('=== SUBHAMAPI SERVER STATUS CHECK ===\n');

  console.log('1. Health/API Endpoints:');
  console.log('   /api/v1/products:', await testUrl('https://subhamapi.hypernxt.space/api/v1/products?limit=1'));
  console.log('   /api/products:', await testUrl('https://subhamapi.hypernxt.space/api/products?limit=1'));
  console.log('   /api/health:', await testUrl('https://subhamapi.hypernxt.space/api/health'));

  console.log('\n2. Image / Uploads Endpoints:');
  const sampleImages = [
    'https://subhamapi.hypernxt.space/uploads/parikshadham-mptet-varg-3.webp',
    'https://subhamapi.hypernxt.space/uploads/products/sample.webp',
    'https://subhamapi.hypernxt.space/uploads/test.jpg'
  ];

  for (const imgUrl of sampleImages) {
    const res = await testUrl(imgUrl);
    console.log(`   ${res.url} => Status: ${res.statusCode}, Type: ${res.contentType}, Size: ${res.contentLength || 'unknown'}`);
  }
}

run().catch(console.error);
