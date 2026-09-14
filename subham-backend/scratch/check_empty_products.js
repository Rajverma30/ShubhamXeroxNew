require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const Media = require('../src/models/Media');
  const Product = require('../src/models/Product');

  const products = await Product.find({}).lean();
  const allMedia = await Media.find({}).lean();

  const emptyProducts = products.filter(p => !p.images || p.images.length === 0);
  console.log(`Total Products: ${products.length}`);
  console.log(`Empty Products: ${emptyProducts.length}`);
  console.log(`Total Media Items: ${allMedia.length}`);

  let autoMatched = 0;
  for (const p of emptyProducts) {
    const slug = (p.slug || '').toLowerCase();
    const title = (p.title || '').toLowerCase();

    // Check if any media matches slug or title
    const match = allMedia.find(m => {
      const fn = (m.filename || '').toLowerCase().replace(/-(card|thumb|full)\.webp$/, '').replace(/\.webp$/, '');
      const orig = (m.originalName || '').toLowerCase();
      if (!fn && !orig) return false;
      return (fn.length > 3 && (slug.includes(fn) || fn.includes(slug))) ||
             (orig.length > 3 && (title.includes(orig) || orig.includes(title)));
    });

    if (match) {
      autoMatched++;
      console.log(`Matched [${p.title}] -> [${match.url}]`);
    }
  }

  console.log(`\nAuto-matched ${autoMatched} out of ${emptyProducts.length} empty products from Media library.`);
  await mongoose.disconnect();
}

main().catch(console.error);
