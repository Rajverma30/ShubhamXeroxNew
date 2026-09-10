const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

async function run() {
  await mongoose.connect(MONGO_URI);

  const products = await Product.find({
    $or: [
      { title: { $regex: /parikshadham/i } },
      { name: { $regex: /parikshadham/i } }
    ]
  }).lean();

  console.log(`=== ALL PARIKSHADHAM BOOKS IN DATABASE (${products.length} found) ===`);
  products.forEach((p, idx) => {
    console.log(`\nProduct #${idx + 1}:`);
    console.log('Title:', p.title || p.name);
    console.log('ID:', p._id);
    console.log('Slug:', p.slug);
    console.log('Tags:', JSON.stringify(p.tags));
    console.log('SEO metaTitle:', p.seo?.metaTitle);
    console.log('SEO metaKeywords:', JSON.stringify(p.seo?.metaKeywords));
    console.log('SEO metaDescription:', p.seo?.metaDescription);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
