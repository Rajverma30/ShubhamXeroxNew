const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function switchToRailway() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({});

  console.log(`Switching ${products.length} products to Railway live server URL: https://shubhamxeroxnew-production.up.railway.app/uploads/...`);

  let count = 0;
  for (const p of products) {
    if (!p.images || p.images.length === 0) continue;

    const railwayImages = p.images.map(img => {
      let rawUrl = img.url || img.cardUrl || img.thumbUrl || '';
      const filename = rawUrl
        .split('/uploads/')
        .pop()
        .replace(/^products\//, '')
        .replace(/^media\//, '')
        .replace(/-(card|thumb)\.webp$/i, '.webp');

      if (!filename) return img;

      const railwayUrl = `https://shubhamxeroxnew-production.up.railway.app/uploads/${filename}`;
      return {
        url: railwayUrl,
        cardUrl: railwayUrl,
        thumbUrl: railwayUrl,
        alt: p.title,
        source: 'upload',
      };
    });

    await Product.updateOne({ _id: p._id }, { $set: { images: railwayImages } });
    count++;
  }

  console.log(`🎉 Switched all ${count} products in MongoDB Atlas to https://shubhamxeroxnew-production.up.railway.app/uploads/filename.webp!`);
  await mongoose.disconnect();
}

switchToRailway().catch(console.error);
