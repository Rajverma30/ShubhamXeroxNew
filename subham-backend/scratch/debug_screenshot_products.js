const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function debugScreenshot() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');

  const titles = [
    'Shivaan Educations Rapid Fire Volume 1',
    'MPPSC Mukhya Pariksha - (1,2,3,4 Paper Complete)',
    'Sankalpana evam Vichar',
    'MPPSC Prelims Unit-5 | Constitutional System',
    'Shivaan Educations MPPSC Prelims Rapid Fire Volume II',
    'Shivaan Education MPPSC Prelims Unit 2'
  ];

  for (const t of titles) {
    const p = await Product.findOne({ title: new RegExp(t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i') }).lean();
    if (p) {
      console.log(`\nProduct: "${p.title}"`);
      console.log(`Slug: ${p.slug}`);
      console.log(`Images:`, JSON.stringify(p.images, null, 2));
    } else {
      console.log(`\nNot found by title regex: "${t}"`);
    }
  }

  await mongoose.disconnect();
}

debugScreenshot().catch(console.error);
