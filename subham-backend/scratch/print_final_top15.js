const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

async function run() {
  await mongoose.connect(MONGO_URI);

  const top15 = await Product.find({ isActive: true })
    .sort({ views: -1, soldCount: -1, _id: -1 })
    .limit(15)
    .lean();

  console.log(`=== FINAL TOP 15 PRODUCTS FULL SEO REPORT (${top15.length}) ===\n`);

  top15.forEach((p, idx) => {
    console.log(`[Item #${idx + 1}]`);
    console.log(`Title: ${p.title}`);
    console.log(`ID: ${p._id}`);
    console.log(`New Canonical Slug: ${p.slug}`);
    console.log(`New Canonical URL: https://shubhamxerox.in/product/${p.slug}`);
    console.log(`Old Slugs (Redirect Targets): ${JSON.stringify(p.oldSlugs || [])}`);
    console.log(`Meta Title: ${p.seo?.metaTitle}`);
    console.log(`Tags: ${JSON.stringify(p.tags || [])}`);
    console.log('--------------------------------------------------');
  });

  await mongoose.disconnect();
}

run().catch(console.error);
