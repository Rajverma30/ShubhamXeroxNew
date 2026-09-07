const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function testOg() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Product = require('../src/models/Product');

    const slug = 'mppsc-prelims-unit-5-constitutional-system-of-india-madhya-pradesh-3rd-edition-3e-hindi-medium-2026';
    const p = await Product.findOne({ slug }).lean();

    if (!p) {
      console.log('Product not found for slug:', slug);
      // find any product with images
      const anyP = await Product.findOne({ 'images.0.url': { $exists: true } }).lean();
      console.log('Sample product found:', anyP?.slug);
      process.exit(0);
    }

    console.log('Product Title:', p.title);
    console.log('Product Images:', JSON.stringify(p.images));

    let rawImg = p.images?.[0]?.url || p.images?.[0]?.thumbUrl || '';
    console.log('rawImg before check:', rawImg);
    if (rawImg && !rawImg.startsWith('http')) {
      const backendUrl = (process.env.BACKEND_URL || 'https://subhamapi.hypernxt.space').replace(/\/$/, '');
      rawImg = `${backendUrl}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
    }
    console.log('Final Image URL:', rawImg);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testOg();
