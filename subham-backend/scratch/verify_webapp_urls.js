/**
 * Probe www.shubhamxerox.in resolveAssetUrl behavior vs our DB URLs.
 * Also count how many current DB image URLs return 200 on web.app.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const https = require('https');

function head(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 8000 }, (res) => {
      resolve(res.statusCode);
    });
    req.on('error', () => resolve(0));
    req.on('timeout', () => { req.destroy(); resolve(0); });
    req.end();
  });
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({}).select('title images').lean();
  let ok = 0;
  let bad = 0;
  const badSamples = [];
  // sample 80 for speed
  const sample = products.filter((_, i) => i % 8 === 0).slice(0, 80);
  for (const p of sample) {
    const u = p.images?.[0]?.url;
    if (!u) { bad++; continue; }
    const code = await head(u);
    if (code === 200) ok++;
    else {
      bad++;
      if (badSamples.length < 8) badSamples.push({ title: (p.title || '').slice(0, 40), u, code });
    }
  }
  console.log({ sampled: sample.length, ok, bad, totalProducts: products.length });
  console.log('bad samples', badSamples);

  const domains = {};
  for (const p of products) {
    try {
      const h = new URL(p.images[0].url).hostname;
      domains[h] = (domains[h] || 0) + 1;
    } catch {}
  }
  console.log('domains', domains);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
