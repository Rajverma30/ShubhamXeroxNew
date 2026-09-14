const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function testApi() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({ isActive: true }).limit(20).lean();

  console.log(`Found ${products.length} active products:`);
  for (const p of products) {
    console.log(`\nTitle: "${p.title.slice(0, 40)}"`);
    console.log(`Images:`, JSON.stringify(p.images));
  }

  await mongoose.disconnect();
}

testApi().catch(console.error);
