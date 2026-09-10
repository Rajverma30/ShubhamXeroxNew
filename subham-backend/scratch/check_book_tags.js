const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const products = await Product.find({
    $or: [
      { title: { $regex: /prabandhan|parikshadham|प्रबंधन/i } },
      { name: { $regex: /prabandhan|parikshadham|प्रबंधन/i } },
      { tags: { $regex: /prabandhan|parikshadham|प्रबंधन/i } }
    ]
  }).lean();

  console.log(`Found ${products.length} matching products:`);
  products.forEach((p, idx) => {
    console.log(`\n--- Product #${idx + 1} ---`);
    console.log('ID:', p._id);
    console.log('Title/Name:', p.title || p.name);
    console.log('Slug:', p.slug);
    console.log('SKU:', p.sku);
    console.log('Tags:', p.tags);
    console.log('SEO:', p.seo);
    console.log('Search Keywords / Meta:', p.searchKeywords || p.backendSearchTerms);
    console.log('Description:', (p.description || p.desc || '').slice(0, 300));
  });

  await mongoose.disconnect();
}

run().catch(console.error);
