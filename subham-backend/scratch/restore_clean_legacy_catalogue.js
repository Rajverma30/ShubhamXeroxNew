const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');

async function restoreCatalogue() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const legacyPath = path.join(__dirname, '..', 'src', 'seed', 'legacyProducts.json');
  
  if (!fs.existsSync(legacyPath)) {
    console.error('legacyProducts.json not found');
    return;
  }

  const legacyItems = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
  console.log(`Restoring exact original catalogue for ${legacyItems.length} products...`);

  let restoredCount = 0;

  for (const item of legacyItems) {
    if (!item.name || !item.img) continue;

    const baseName = path.basename(item.img);
    const originalUrl = `https://subhamapi.hypernxt.space/uploads/${baseName}`;
    const productUrl = `https://subhamapi.hypernxt.space/uploads/products/${baseName}`;

    const images = [{
      url: originalUrl,
      cardUrl: originalUrl,
      thumbUrl: originalUrl,
      alt: item.name,
      source: 'upload',
    }];

    // Match product in MongoDB by title or legacy SKU (LEG-<id>)
    const filter = {
      $or: [
        { sku: `LEG-${item.id}` },
        { title: item.name.trim() }
      ]
    };

    const updateRes = await Product.updateOne(filter, { $set: { images } });
    if (updateRes.matchedCount > 0) {
      restoredCount++;
    }
  }

  console.log(`🎉 Successfully restored exact original image URLs for ${restoredCount} / ${legacyItems.length} products!`);
  await mongoose.disconnect();
}

restoreCatalogue().catch(console.error);
