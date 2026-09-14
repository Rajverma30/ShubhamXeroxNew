const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function updateToRelativeUploads() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({});

  console.log(`Updating ${products.length} products to use robust /uploads/ URLs...`);

  let count = 0;
  for (const p of products) {
    if (!p.images || p.images.length === 0) continue;

    const newImages = p.images.map(img => {
      let rawUrl = img.url || img.cardUrl || img.thumbUrl || '';
      // Extract filename from subhamapi or any full URL
      const filename = rawUrl.split('/uploads/').pop().replace(/^products\//, '').replace(/-(card|thumb)\.webp$/i, '.webp');
      
      if (!filename) return img;

      const cleanUrl = `/uploads/${filename}`;
      return {
        url: cleanUrl,
        cardUrl: cleanUrl,
        thumbUrl: cleanUrl,
        alt: p.title,
        source: 'upload',
      };
    });

    await Product.updateOne({ _id: p._id }, { $set: { images: newImages } });
    count++;
  }

  console.log(`Successfully updated ${count} products to relative /uploads/ URLs!`);
  await mongoose.disconnect();
}

updateToRelativeUploads().catch(console.error);
