const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function checkMediaMapping() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const Media = require('../src/models/Media');

  const products = await Product.find({}).lean();
  const mediaItems = await Media.find({}).lean();

  console.log(`Products: ${products.length}, Media items: ${mediaItems.length}`);

  let exactMatchCount = 0;
  let partialMatchCount = 0;
  let noMatchCount = 0;

  for (const p of products) {
    const slug = (p.slug || '').toLowerCase();
    const title = (p.title || '').toLowerCase();

    // Look for exact slug or title match in media originalName or filename
    let matchedMedia = mediaItems.filter(m => {
      const orig = (m.originalName || '').toLowerCase();
      const fn = (m.filename || '').toLowerCase().replace(/-(card|thumb|full)\.webp$/, '').replace(/\.webp$/, '');

      return (orig && (orig === title || orig === slug || slug.includes(orig) || title.includes(orig))) ||
             (fn && (fn === slug || fn === title || slug === fn));
    });

    if (matchedMedia.length > 0) {
      exactMatchCount++;
    } else {
      noMatchCount++;
    }
  }

  console.log(`Exact/High Confidence Matches: ${exactMatchCount}`);
  console.log(`No direct Media matches: ${noMatchCount}`);

  process.exit(0);
}

checkMediaMapping().catch(console.error);
