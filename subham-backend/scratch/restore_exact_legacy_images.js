const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');

function cleanString(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[-_\s\W]+/g, '')
    .trim();
}

async function restoreExactLegacyImages() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const Media = require('../src/models/Media');

  const legacyPath = path.join(__dirname, '..', 'src', 'seed', 'legacyProducts.json');
  if (!fs.existsSync(legacyPath)) {
    console.error(`legacyProducts.json not found at ${legacyPath}`);
    return;
  }

  const legacyData = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
  console.log(`Loaded ${legacyData.length} original legacy products from legacyProducts.json`);

  const mediaList = await Media.find({}).lean();
  console.log(`Loaded ${mediaList.length} Media items from MongoDB`);

  const products = await Product.find({});
  console.log(`Loaded ${products.length} Products from MongoDB`);

  // Build maps by clean title & sku
  const legacyByTitle = new Map();
  const legacyById = new Map();

  for (const item of legacyData) {
    if (item.name && item.img) {
      const key = cleanString(item.name);
      legacyByTitle.set(key, item);
    }
    if (item.id && item.img) {
      legacyById.set(`LEG-${item.id}`, item);
      legacyById.set(String(item.id), item);
    }
  }

  // Build Media map by filename / clean name
  const mediaByCleanName = new Map();
  for (const m of mediaList) {
    if (m.filename) {
      mediaByCleanName.set(cleanString(m.filename), m);
      if (m.originalName) mediaByCleanName.set(cleanString(m.originalName), m);
    }
  }

  let restoredFromLegacy = 0;
  let restoredFromMedia = 0;
  let fallbackCount = 0;

  for (const p of products) {
    let targetFilename = null;

    // 1. Try matching legacy products by SKU or clean title
    const legacyItem = (p.sku && legacyById.get(p.sku)) || legacyByTitle.get(cleanString(p.title));

    if (legacyItem && legacyItem.img) {
      const baseName = path.basename(legacyItem.img);
      targetFilename = baseName;
      restoredFromLegacy++;
    } else {
      // 2. Try matching from Media collection
      const mediaItem = mediaByCleanName.get(cleanString(p.title)) || mediaByCleanName.get(cleanString(p.slug));
      if (mediaItem && mediaItem.filename) {
        targetFilename = mediaItem.filename;
        restoredFromMedia++;
      }
    }

    if (targetFilename) {
      // Clean targetFilename of any synthetic -card or -thumb suffixes
      targetFilename = targetFilename.replace(/-(card|thumb)\.webp$/i, '.webp');
      const subhamApiUrl = `https://subhamapi.hypernxt.space/uploads/${targetFilename}`;

      const images = [{
        url: subhamApiUrl,
        cardUrl: subhamApiUrl,
        thumbUrl: subhamApiUrl,
        alt: p.title,
        source: 'upload',
      }];

      await Product.updateOne({ _id: p._id }, { $set: { images } });
    } else {
      fallbackCount++;
    }
  }

  console.log(`\n🎉 RESTORATION COMPLETE:`);
  console.log(`- Exact restored from legacyProducts.json: ${restoredFromLegacy}`);
  console.log(`- Restored from Media collection: ${restoredFromMedia}`);
  console.log(`- Unmatched: ${fallbackCount}`);

  await mongoose.disconnect();
}

restoreExactLegacyImages().catch(console.error);
