const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function analyzeProductImages() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({});

  console.log(`Total Products in Mongo: ${products.length}`);

  let subhamapiProducts = 0;
  let subhamapiWithoutProductsDir = 0;
  let googleFallbackProducts = 0;
  let placeholderFallbackProducts = 0;
  let emptyImageProducts = 0;
  let otherImageProducts = 0;

  const fallbackTypes = {
    google: [],
    placeholder: [],
    noProductsDirSubhamApi: [],
    empty: [],
    validSubhamApi: [],
    other: []
  };

  for (const p of products) {
    if (!p.images || p.images.length === 0) {
      emptyImageProducts++;
      fallbackTypes.empty.push(p);
      continue;
    }

    const firstImg = p.images[0].url || '';

    if (firstImg.includes('subhamapi.hypernxt.space/uploads/products/')) {
      subhamapiProducts++;
      fallbackTypes.validSubhamApi.push(p);
    } else if (firstImg.includes('subhamapi.hypernxt.space/uploads/')) {
      subhamapiWithoutProductsDir++;
      fallbackTypes.noProductsDirSubhamApi.push(p);
    } else if (firstImg.includes('googleusercontent.com') || firstImg.includes('books.google.com')) {
      googleFallbackProducts++;
      fallbackTypes.google.push(p);
    } else if (firstImg.includes('via.placeholder') || firstImg.includes('placeholder') || firstImg.includes('unsplash')) {
      placeholderFallbackProducts++;
      fallbackTypes.placeholder.push(p);
    } else {
      otherImageProducts++;
      fallbackTypes.other.push(p);
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Valid subhamapi (/uploads/products/): ${subhamapiProducts}`);
  console.log(`Old subhamapi (/uploads/ without products/): ${subhamapiWithoutProductsDir}`);
  console.log(`Google fallbacks: ${googleFallbackProducts}`);
  console.log(`Placeholder fallbacks: ${placeholderFallbackProducts}`);
  console.log(`Empty images: ${emptyImageProducts}`);
  console.log(`Other sources: ${otherImageProducts}`);

  if (fallbackTypes.google.length > 0) {
    console.log('\nSample Google Fallback Product:', fallbackTypes.google[0].title, '=>', fallbackTypes.google[0].images[0].url);
  }
  if (fallbackTypes.noProductsDirSubhamApi.length > 0) {
    console.log('\nSample Old SubhamApi Product:', fallbackTypes.noProductsDirSubhamApi[0].title, '=>', fallbackTypes.noProductsDirSubhamApi[0].images[0].url);
  }
  if (fallbackTypes.placeholder.length > 0) {
    console.log('\nSample Placeholder Product:', fallbackTypes.placeholder[0].title, '=>', fallbackTypes.placeholder[0].images[0].url);
  }

  process.exit(0);
}

analyzeProductImages().catch(console.error);
