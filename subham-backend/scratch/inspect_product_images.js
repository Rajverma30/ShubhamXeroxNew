require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({}).select('title images slug').lean();
  console.log('Total Products:', products.length);
  
  for (let i = 0; i < 15; i++) {
    const p = products[i];
    console.log(`\nProduct #${i + 1}: ${p.title}`);
    console.log('Images:', JSON.stringify(p.images));
  }

  mongoose.disconnect();
}

check().catch(console.error);
