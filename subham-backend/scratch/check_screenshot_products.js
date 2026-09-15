const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function checkScreenshotProducts() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');

  const titlesToFind = [
    'Topper Temple General English',
    'Class Notes Grammar by Aman Sir',
    'Spoken English Book by Neetu Singh',
    'Kattar Advanced EAJEE Notes',
    'Indian Constitution and Polity',
    'Topper Temple General Knowledge',
    'Topper Temple General Computer',
    'Topper Temple Samanya Hindi'
  ];

  for (const t of titlesToFind) {
    const p = await Product.findOne({ title: new RegExp(t, 'i') }).lean();
    if (p) {
      console.log('\n----------------------------------------');
      console.log('Title:', p.title);
      console.log('Images:', p.images?.map(i => i.url));
    }
  }

  process.exit(0);
}

checkScreenshotProducts().catch(console.error);
