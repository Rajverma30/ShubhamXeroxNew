const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function testSlug() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Product = require('../src/models/Product');

    const exactSlug = 'civil-engineering-through-objective-type-questions-or-revised-and-enlarged-third-edition-or-objective-questions-for-civil-engineering-exams-or-sp-gupta-and-ss-gupta';
    const p1 = await Product.findOne({ slug: exactSlug }).lean();
    console.log('1. Exact Slug Match:', p1 ? p1.title : 'NOT FOUND');

    if (!p1) {
      // Find by title regex
      const p2 = await Product.findOne({ title: new RegExp('Civil Engineering Through Objective', 'i') }).lean();
      console.log('2. Match by title regex:', p2 ? `FOUND! Actual slug is "${p2.slug}"` : 'NOT FOUND');
      console.log('Sample images:', JSON.stringify(p2?.images));
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testSlug();
