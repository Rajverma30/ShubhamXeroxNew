const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function restoreSubhamApiUrls() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({});

  console.log(`Restoring subhamapi.hypernxt.space URLs for ${products.length} products...`);

  let count = 0;
  for (const p of products) {
    if (!p.images || p.images.length === 0) continue;

    const restoredImages = p.images.map(img => {
      let rawUrl = img.url || img.cardUrl || img.thumbUrl || '';
      // Extract clean filename
      const filename = rawUrl.split('/uploads/').pop().replace(/^products\//, '').replace(/-(card|thumb)\.webp$/i, '.webp');
      
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

    await Product.updateOne({ _id: p._id }, { $set: { images: restoredImages } });
    count++;
  }

  console.log(`🎉 Restored original https://subhamapi.hypernxt.space/uploads/ URLs for ${count} products in MongoDB!`);
  await mongoose.disconnect();
}

restoreSubhamApiUrls().catch(console.error);
