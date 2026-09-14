require('dotenv').config();
const mongoose = require('mongoose');

async function checkDetails() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const Category = require('../src/models/Category');

  const products = await Product.find({}).populate('category').lean();
  const empty = products.filter(p => !p.images || p.images.length === 0);

  console.log(`Total empty products: ${empty.length}`);

  const byCat = {};
  empty.forEach(p => {
    const catName = p.category?.name || 'No Category';
    byCat[catName] = (byCat[catName] || 0) + 1;
  });

  console.log('Empty Products by Category:', byCat);

  console.log('\nSample 20 Empty Products:');
  empty.slice(0, 20).forEach((p, i) => {
    console.log(`${i+1}. [${p.title}] | Cat: ${p.category?.name} | Created: ${p.createdAt}`);
  });

  mongoose.disconnect();
}

checkDetails().catch(console.error);
