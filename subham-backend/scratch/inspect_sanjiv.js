const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function inspectSanjiv() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');

  const p = await Product.findOne({ title: /sanjiv verma/i }).lean();

  if (p) {
    console.log('Title:', p.title);
    console.log('Slug:', p.slug);
    console.log('Images:', JSON.stringify(p.images, null, 2));
  } else {
    console.log('Not found by title /sanjiv verma/i');
  }

  await mongoose.disconnect();
}

inspectSanjiv().catch(console.error);
