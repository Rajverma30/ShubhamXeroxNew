const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const oldSlug = 'parikshadham-samanya-prabandhan-or-or-general-management-or-new-syllabus-book-in-hindi-for-mp-patwari-group-2-subgroup-4-and-all-mppeb-exams-2026-27';
  const words = oldSlug.replace(/-/g, ' ');

  console.log('Searching words:', words);

  const results = await Product.find(
    { $text: { $search: words } },
    { score: { $meta: 'textScore' } }
  )
  .select('title slug score')
  .sort({ score: { $meta: 'textScore' } })
  .limit(5)
  .lean();

  console.log('Top 5 Text Search Matches:');
  results.forEach((r, idx) => {
    console.log(`#${idx + 1}: Score=${r.score} | Title=${(r.title || '').slice(0, 60)}... | Slug=${r.slug}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
