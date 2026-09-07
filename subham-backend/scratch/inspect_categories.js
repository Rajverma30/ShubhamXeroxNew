const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function checkTaxonomy() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Category = require('../src/models/Category');
    const SubCategory = require('../src/models/SubCategory');
    const Product = require('../src/models/Product');

    const cats = await Category.find().lean();
    const subs = await SubCategory.find().lean();

    console.log(`=== CATEGORIES (${cats.length}) ===`);
    cats.forEach(c => {
      console.log(`Cat: "${c.name}" | Slug: "${c.slug}" | Image: ${JSON.stringify(c.image)}`);
    });

    console.log(`\n=== SUBCATEGORIES (${subs.length}) ===`);
    subs.slice(0, 30).forEach(s => {
      console.log(`Sub: "${s.name}" | Slug: "${s.slug}" | Image: ${JSON.stringify(s.image)}`);
    });

    // Aggregate publishers from Products
    const pubAgg = await Product.aggregate([
      { $match: { publisher: { $exists: true, $ne: '' } } },
      { $group: { _id: '$publisher', count: { $sum: 1 }, sampleImg: { $first: '$images' } } },
      { $sort: { count: -1 } },
      { $limit: 30 }
    ]);

    console.log(`\n=== PUBLISHERS FROM PRODUCTS (${pubAgg.length}) ===`);
    pubAgg.forEach(p => {
      const sample = p.sampleImg?.[0]?.url || p.sampleImg?.[0]?.thumbUrl || '';
      console.log(`Publisher: "${p._id}" | Count: ${p.count} | Sample Product Img: ${sample}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkTaxonomy();
