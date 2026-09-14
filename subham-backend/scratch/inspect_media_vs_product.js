require('dotenv').config();
const mongoose = require('mongoose');

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const Media = require('../src/models/Media');

  const media = await Media.find({}).limit(10).lean();
  const products = await Product.find({}).limit(10).lean();

  console.log('Sample Media items:');
  media.forEach(m => console.log(`Filename: [${m.filename}] | OrigName: [${m.originalName}]`));

  console.log('\nSample Product items:');
  products.forEach(p => console.log(`Slug: [${p.slug}] | Title: [${p.title}]`));

  mongoose.disconnect();
}

inspect().catch(console.error);
