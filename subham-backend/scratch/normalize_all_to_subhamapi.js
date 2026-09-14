const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function normalizeAllSubhamApi() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({});

  console.log(`Normalizing all ${products.length} products to https://subhamapi.hypernxt.space/uploads/...`);

  let updatedCount = 0;
  for (const p of products) {
    if (!p.images || p.images.length === 0) continue;

    const normalizedImages = p.images.map(img => {
      let rawUrl = img.url || img.cardUrl || img.thumbUrl || '';
      // Extract clean filename without path prefixes or suffixes
      const filename = rawUrl
        .split('/uploads/')
        .pop()
        .replace(/^products\//, '')
        .replace(/^media\//, '')
        .replace(/-(card|thumb)\.webp$/i, '.webp');

      if (!filename) return img;

      const subhamApiUrl = `https://subhamapi.hypernxt.space/uploads/${filename}`;
      return {
        url: subhamApiUrl,
        cardUrl: subhamApiUrl,
        thumbUrl: subhamApiUrl,
        alt: p.title,
        source: 'upload',
      };
    });

    await Product.updateOne({ _id: p._id }, { $set: { images: normalizedImages } });
    updatedCount++;
  }

  console.log(`🎉 Normalized all ${updatedCount} products in MongoDB Atlas to https://subhamapi.hypernxt.space/uploads/filename.webp!`);
  await mongoose.disconnect();
}

normalizeAllSubhamApi().catch(console.error);
