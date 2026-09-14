const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function inspectBooks() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not found in .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();

  console.log(`Total products in database: ${products.length}`);
  
  const booksInfo = products.map(p => ({
    id: p._id,
    title: p.title,
    createdAt: p.createdAt,
    imageCount: p.images ? p.images.length : 0,
    images: p.images ? p.images.map(i => i.url || i.cardUrl || i) : []
  }));

  console.log('\n--- NEWEST 35 PRODUCTS ---');
  booksInfo.slice(0, 35).forEach((b, idx) => {
    console.log(`${idx + 1}. [${b.id}] "${b.title}" (${b.createdAt ? b.createdAt.toISOString().slice(0,10) : 'N/A'}) -> Images (${b.imageCount}): ${b.images.join(', ')}`);
  });

  const missingImageBooks = booksInfo.filter(b => b.imageCount === 0 || !b.images[0]);
  console.log(`\nTotal products with NO image: ${missingImageBooks.length}`);
  missingImageBooks.forEach((b, idx) => {
    console.log(`${idx + 1}. [ID: ${b.id}] "${b.title}"`);
  });

  await mongoose.disconnect();
}

inspectBooks().catch(console.error);
