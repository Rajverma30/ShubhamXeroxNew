require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

async function inspectImages() {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({}).lean();

  let withImages = 0;
  let emptyImages = 0;
  const sampleUrls = [];

  products.forEach(p => {
    if (p.images && p.images.length > 0) {
      withImages++;
      p.images.forEach(img => {
        const u = img.url || img.cardUrl || img.thumbUrl || '';
        if (u && sampleUrls.length < 20) sampleUrls.push(u);
      });
    } else {
      emptyImages++;
    }
  });

  console.log('Total Products:', products.length);
  console.log('Products WITH images:', withImages);
  console.log('Products WITHOUT images:', emptyImages);
  console.log('\nSample Image URLs in DB:', sampleUrls);

  mongoose.disconnect();
}

inspectImages().catch(console.error);
