const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');

async function checkOriginals() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const Media = require('../src/models/Media');

  const legacyPath = path.join(__dirname, '..', 'src', 'seed', 'legacyProducts.json');
  let legacyData = [];
  if (fs.existsSync(legacyPath)) {
    legacyData = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
  }
  console.log(`Loaded ${legacyData.length} products from legacyProducts.json`);

  const mediaList = await Media.find({}).lean();
  console.log(`Loaded ${mediaList.length} Media items from MongoDB`);

  const products = await Product.find({}).lean();
  console.log(`Loaded ${products.length} Products from MongoDB`);

  // Build maps by slug, SKU, title, and ID
  const legacyMapBySlug = new Map();
  const legacyMapByTitle = new Map();
  for (const item of legacyData) {
    if (item.slug && item.images && item.images.length > 0) {
      legacyMapBySlug.set(item.slug, item.images);
    }
    if (item.title && item.images && item.images.length > 0) {
      legacyMapByTitle.set(item.title.trim().toLowerCase(), item.images);
    }
  }

  // Print sample comparison for first 10 products
  let matchedFromLegacy = 0;
  for (const p of products) {
    const orig = legacyMapBySlug.get(p.slug) || legacyMapByTitle.get(p.title.trim().toLowerCase());
    if (orig && orig.length > 0) {
      matchedFromLegacy++;
    }
  }

  console.log(`\nExact slug/title matches in legacyProducts.json: ${matchedFromLegacy} / ${products.length}`);

  await mongoose.disconnect();
}

checkOriginals().catch(console.error);
