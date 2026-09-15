const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function inspectScrambledProducts() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({ oldSlugs: { $exists: true, $not: { $size: 0 } } }).lean();

  console.log(`Found ${products.length} products with oldSlugs history:\n`);

  for (const p of products) {
    console.log(`ID: ${p._id}`);
    console.log(`Current Title: "${p.title}"`);
    console.log(`Current Slug: "${p.slug}"`);
    console.log(`Old Slugs:`, p.oldSlugs);
    console.log(`Current Images:`, p.images?.map(i => i.url));
    console.log('--------------------------------------------------');
  }

  process.exit(0);
}

inspectScrambledProducts().catch(console.error);
