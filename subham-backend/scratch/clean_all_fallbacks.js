const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function cleanAllFallbacks() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({});

  console.log(`Analyzing and cleaning ${products.length} products in Mongo...`);

  const bulkOps = [];
  let fallbackRemovedCount = 0;
  let pathFixedCount = 0;

  for (const p of products) {
    if (!p.images || p.images.length === 0) continue;

    let modified = false;
    let newImages = [];

    for (const img of p.images) {
      let rawUrl = img.url || img.cardUrl || img.thumbUrl || '';

      // Check if image is a fallback (Google Books, placeholder, unsplash, etc.)
      const isFallback = rawUrl.includes('googleusercontent.com') ||
                         rawUrl.includes('books.google.com') ||
                         rawUrl.includes('placeholder') ||
                         rawUrl.includes('via.placeholder') ||
                         rawUrl.includes('unsplash');

      if (isFallback) {
        fallbackRemovedCount++;
        modified = true;
        continue; // Drop fallback image
      }

      // Fix missing /products/ in subhamapi URL
      // E.g., https://subhamapi.hypernxt.space/uploads/123.webp -> https://subhamapi.hypernxt.space/uploads/products/123.webp
      let cleanUrl = rawUrl;
      if (cleanUrl.includes('subhamapi.hypernxt.space/uploads/') && !cleanUrl.includes('/uploads/products/')) {
        cleanUrl = cleanUrl.replace('https://subhamapi.hypernxt.space/uploads/', 'https://subhamapi.hypernxt.space/uploads/products/');
        pathFixedCount++;
        modified = true;
      }

      // Also ensure cardUrl and thumbUrl have correct subhamapi path
      let cleanCard = img.cardUrl || cleanUrl;
      let cleanThumb = img.thumbUrl || cleanUrl;

      if (cleanCard.includes('subhamapi.hypernxt.space/uploads/') && !cleanCard.includes('/uploads/products/')) {
        cleanCard = cleanCard.replace('https://subhamapi.hypernxt.space/uploads/', 'https://subhamapi.hypernxt.space/uploads/products/');
      }
      if (cleanThumb.includes('subhamapi.hypernxt.space/uploads/') && !cleanThumb.includes('/uploads/products/')) {
        cleanThumb = cleanThumb.replace('https://subhamapi.hypernxt.space/uploads/', 'https://subhamapi.hypernxt.space/uploads/products/');
      }

      newImages.push({
        url: cleanUrl,
        cardUrl: cleanCard,
        thumbUrl: cleanThumb,
        alt: img.alt || p.title,
        source: img.source || 'upload'
      });
    }

    if (modified) {
      bulkOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { images: newImages } }
        }
      });
    }
  }

  if (bulkOps.length > 0) {
    console.log(`Executing bulkWrite for ${bulkOps.length} updated products...`);
    const res = await Product.bulkWrite(bulkOps);
    console.log(`bulkWrite complete:`, res);
  } else {
    console.log('No updates required.');
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Total Products Updated: ${bulkOps.length}`);
  console.log(`Fallback Images Removed: ${fallbackRemovedCount}`);
  console.log(`Paths Fixed (added /products/): ${pathFixedCount}`);

  process.exit(0);
}

cleanAllFallbacks().catch(console.error);
