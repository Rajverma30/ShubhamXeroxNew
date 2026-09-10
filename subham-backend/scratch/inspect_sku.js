const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";
const { Product } = require('../src/models');

async function run() {
  await mongoose.connect(MONGO_URI);

  const product = await Product.findById('6a8172b4a34317063af19db1').lean();
  console.log('Product Details:');
  console.log('ID:', product._id);
  console.log('Title:', product.title);
  console.log('Slug:', product.slug);
  console.log('SKU:', product.sku);
  console.log('OldSlugs:', product.oldSlugs);

  // Check product with SKU LEG-n27
  const p27 = await Product.findOne({ sku: 'LEG-n27' }).lean();
  console.log('Product LEG-n27 Title:', p27?.title);
  console.log('Product LEG-n27 SKU:', p27?.sku);

  await mongoose.disconnect();
}

run().catch(console.error);
