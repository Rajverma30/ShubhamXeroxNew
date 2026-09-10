const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";
const { resolveLegacy } = require('../src/controllers/legacy.controller');

async function run() {
  await mongoose.connect(MONGO_URI);

  const test1 = await resolveLegacy('parikshadham-samanya-prabandhan-or-or-general-management-or-new-syllabus-book-in-hindi-for-mp-patwari-group-2-subgroup-4-and-all-mppeb-exams-2026-27');
  console.log('Result for Old Slug:', test1);

  const test2 = await resolveLegacy('/product/parikshadham-samanya-prabandhan-or-or-general-management-or-new-syllabus-book-in-hindi-for-mp-patwari-group-2-subgroup-4-and-all-mppeb-exams-2026-27');
  console.log('Result for /product/Old Slug:', test2);

  await mongoose.disconnect();
}

run().catch(console.error);
