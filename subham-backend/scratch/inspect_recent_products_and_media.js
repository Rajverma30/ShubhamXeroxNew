const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function inspectRecent() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const Media = require('../src/models/Media');

  console.log('=== 15 MOST RECENTLY CREATED PRODUCTS ===');
  const recentProducts = await Product.find({}).sort({ createdAt: -1 }).limit(15).lean();
  for (const p of recentProducts) {
    console.log(`\nTitle: "${p.title}"`);
    console.log(`Slug: ${p.slug}`);
    console.log(`CreatedAt: ${p.createdAt}`);
    console.log(`Images:`, JSON.stringify(p.images, null, 2));
  }

  console.log('\n=== 20 MOST RECENTLY CREATED MEDIA ITEMS ===');
  const recentMedia = await Media.find({}).sort({ createdAt: -1 }).limit(20).lean();
  for (const m of recentMedia) {
    console.log(`\nMedia ID: ${m._id}`);
    console.log(`Filename: ${m.filename}`);
    console.log(`URL: ${m.url}`);
    console.log(`OriginalName: ${m.originalName}`);
    console.log(`CreatedAt: ${m.createdAt}`);
  }

  await mongoose.disconnect();
}

inspectRecent().catch(console.error);
