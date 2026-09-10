const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";
const { resolveLegacy } = require('../src/controllers/legacy.controller');
const { Product } = require('../src/models');

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const oldSlug = 'parikshadham-samanya-prabandhan-or-or-general-management-or-new-syllabus-book-in-hindi-for-mp-patwari-group-2-subgroup-4-and-all-mppeb-exams-2026-27';
  const newSlug = 'parikshadham-samanya-prabandhan-book-hindi';

  // 1. Fetch by new slug
  const product = await Product.findOne({ slug: newSlug }).lean();
  console.log('✅ Fetch by NEW slug result:', product ? product.title : 'NOT FOUND');
  console.log('Tags:', product?.tags);
  console.log('SEO Title:', product?.seo?.metaTitle);

  // 2. Test legacy URL resolution for old slug
  const legacyMatch = await resolveLegacy(oldSlug);
  console.log('✅ Legacy resolution for OLD slug:', legacyMatch);

  if (legacyMatch && legacyMatch.product && legacyMatch.product.slug === newSlug) {
    console.log('🎉 PERFECT! Old URL correctly resolves and redirects to the NEW slug:', newSlug);
  } else {
    console.log('❌ Legacy resolution failed or mismatch.');
  }

  await mongoose.disconnect();
}

run().catch(console.error);
