const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Product = require('../src/models/Product');
  const Category = require('../src/models/Category');
  const SubCategory = require('../src/models/SubCategory');

  console.log('--- PRODUCTS WITHOUT SEO TITLE ---');
  const noSeoTitle = await Product.countDocuments({ 'seo.metaTitle': { $exists: false } });
  console.log('Products without explicit seo.metaTitle (fall back to title):', noSeoTitle);

  console.log('--- PRODUCTS WITH MISSING/EMPTY SHORT DESCRIPTION ---');
  const noDesc = await Product.countDocuments({ $or: [{ shortDescription: '' }, { shortDescription: null }] });
  console.log('Products missing shortDescription:', noDesc);

  console.log('--- SUBCATEGORIES ---');
  const subs = await SubCategory.find().select('name slug category').populate('category', 'name slug').lean();
  console.log('Subcategories total:', subs.length);
  console.log('Subcategories sample:', JSON.stringify(subs.slice(0, 10), null, 2));

  console.log('--- KEYWORD / TOPICAL DISTRIBUTION ---');
  const mppscCount = await Product.countDocuments({ title: /mppsc/i });
  const mpesbCount = await Product.countDocuments({ $or: [{ title: /mpesb/i }, { title: /vyapam/i }, { title: /patwari/i }, { title: /police/i }] });
  const currentAffairsCount = await Product.countDocuments({ $or: [{ title: /current affairs/i }, { title: /speedy/i }] });
  const ghatnaChakraCount = await Product.countDocuments({ title: /ghatna chakra/i });

  console.log('MPPSC books:', mppscCount);
  console.log('MPESB/Vyapam books:', mpesbCount);
  console.log('Current Affairs / Speedy books:', currentAffairsCount);
  console.log('Ghatna Chakra books:', ghatnaChakraCount);

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
