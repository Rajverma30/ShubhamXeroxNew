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

  console.log(`Fetched ${top15.length} top products.\n`);
  top15.forEach((p, idx) => {
    console.log(`--- Product #${idx + 1} ---`);
    console.log('ID:', p._id);
    console.log('Title:', p.title);
    console.log('Slug:', p.slug);
    console.log('Author:', p.author || 'N/A');
    console.log('Publisher:', p.publisher || 'N/A');
    console.log('Tags:', p.tags || []);
    console.log('SEO:', p.seo || {});
    console.log('');
  });

  await mongoose.disconnect();
}

run().catch(console.error);
