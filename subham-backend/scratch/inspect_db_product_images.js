const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({}).lean();

  console.log(`Total Products: ${products.length}`);
  
  const sample = products.slice(0, 30);
  for (const p of sample) {
    const imgUrl = (p.images && p.images[0]) ? p.images[0].url : 'NO_IMAGE';
    console.log(`[${p.slug}] "${p.title.slice(0, 30)}" -> ${imgUrl}`);
  }

  await mongoose.disconnect();
}

inspect().catch(console.error);
