const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function inspectMediaAndProducts() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const Media = require('../src/models/Media');

  const products = await Product.find({}).lean();
  const allMedia = await Media.find({}).lean();

  console.log(`Products: ${products.length}, Media: ${allMedia.length}`);

  console.log('\n--- Sample 10 Media items ---');
  allMedia.slice(0, 10).forEach(m => {
    console.log(`ID: ${m._id} | filename: ${m.filename} | originalName: ${m.originalName} | url: ${m.url}`);
  });

  console.log('\n--- Sample Products shown in user screenshot ---');
  const titlesToFind = [
    'Topper Temple General English',
    'Class Notes Grammar by Aman Sir',
    'Spoken English Book by Neetu Singh',
    'Kattar Advanced EAJEE'
  ];

  for (const t of titlesToFind) {
    const p = products.find(prod => prod.title && prod.title.toLowerCase().includes(t.toLowerCase()));
    if (p) {
      console.log(`\nProduct: "${p.title}"`);
      console.log(`Current Images:`, JSON.stringify(p.images, null, 2));
    } else {
      console.log(`\nProduct not found for "${t}"`);
    }
  }

  process.exit(0);
}

inspectMediaAndProducts().catch(console.error);
