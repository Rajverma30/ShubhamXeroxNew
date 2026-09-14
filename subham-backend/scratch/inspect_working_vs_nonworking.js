const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function inspectComparison() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');

  // 1. Inspect the working Sanjiv Verma product
  const workingProduct = await Product.findOne({ slug: 'sanjiv-verma-bharatiya-arthvyavastha-indian-economy-hindi-medium-or-upsc-and-state-pcs-civil-services-prelims-and-mains-or-updated-edition-or-competitive-exam-preparation-book' }).lean();

  console.log('=== WORKING PRODUCT ===');
  if (workingProduct) {
    console.log('Title:', workingProduct.title);
    console.log('Images:', JSON.stringify(workingProduct.images, null, 2));
  } else {
    console.log('Working product not found by exact slug, searching by keyword...');
    const searchWork = await Product.findOne({ title: /sanjiv verma/i }).lean();
    if (searchWork) {
      console.log('Found title:', searchWork.title);
      console.log('Images:', JSON.stringify(searchWork.images, null, 2));
    }
  }

  // 2. Inspect 10 other products that are failing
  console.log('\n=== OTHER SAMPLE PRODUCTS ===');
  const others = await Product.find({}).limit(10).lean();
  for (const p of others) {
    console.log(`Slug: ${p.slug}`);
    console.log(`Images:`, JSON.stringify(p.images));
  }

  await mongoose.disconnect();
}

inspectComparison().catch(console.error);
