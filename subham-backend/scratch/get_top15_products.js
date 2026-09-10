const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // 1. Parikshadham Samanya Prabandhan canonical URL
  const p = await Product.findById('6a8172b4a34317063af19db1').lean();
  const canonicalUrl = `https://shubhamxerox.in/product/${p.slug}`;

  console.log('=== PARIKSHADHAM SAMANYA PRABANDHAN CANONICAL URL ===');
  console.log(canonicalUrl);

  // 2. Top 15 Most Viewed Products
  const top15 = await Product.find({ isActive: true })
    .sort({ views: -1, soldCount: -1, _id: -1 })
    .limit(15)
    .select('title slug views soldCount price finalPrice categoryName author publisher')
    .lean();

  console.log('\n=== TOP 15 MOST VIEWED PRODUCTS ===');
  top15.forEach((item, idx) => {
    console.log(`${idx + 1}. Title: ${item.title}`);
    console.log(`   Slug: ${item.slug}`);
    console.log(`   URL: https://shubhamxerox.in/product/${item.slug}`);
    console.log(`   Views: ${item.views || 0} | Sold: ${item.soldCount || 0} | Price: ₹${item.finalPrice || item.price}`);
    console.log('---');
  });

  await mongoose.disconnect();
}

run().catch(console.error);
