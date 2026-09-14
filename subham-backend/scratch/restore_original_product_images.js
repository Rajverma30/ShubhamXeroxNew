require('dotenv').config();
const mongoose = require('mongoose');

async function restoreOriginalImages() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const Media = require('../src/models/Media');

  const products = await Product.find({}).lean();
  const allMedia = await Media.find({}).lean();

  console.log(`Total Products: ${products.length}`);
  console.log(`Total Media Library Items: ${allMedia.length}`);

  let restoredCount = 0;

  for (const p of products) {
    const slug = (p.slug || '').toLowerCase();
    const title = (p.title || '').toLowerCase();

    // Find media items that match product slug or title
    const matchingMedia = allMedia.filter(m => {
      const fn = (m.filename || '').toLowerCase().replace(/-(card|thumb|full)\.webp$/, '').replace(/\.webp$/, '');
      const orig = (m.originalName || '').toLowerCase();
      if (!fn && !orig) return false;
      return (fn.length > 3 && (slug.includes(fn) || fn.includes(slug))) ||
             (orig.length > 3 && (title.includes(orig) || orig.includes(title)));
    });

    if (matchingMedia.length > 0) {
      const restoredImages = matchingMedia.map(m => ({
        url: m.url || `https://subhamapi.hypernxt.space/uploads/products/${m.filename}`,
        cardUrl: m.cardUrl || `https://subhamapi.hypernxt.space/uploads/products/${m.filename.replace(/\.webp$/, '-card.webp')}`,
        thumbUrl: m.thumbUrl || `https://subhamapi.hypernxt.space/uploads/products/${m.filename.replace(/\.webp$/, '-thumb.webp')}`,
        alt: p.title,
        width: m.width || 800,
        height: m.height || 1000,
        source: 'upload',
      }));

      await Product.updateOne({ _id: p._id }, { $set: { images: restoredImages } });
      restoredCount++;
      console.log(`Restored [${p.title}] -> ${restoredImages.length} image(s) from subhamapi uploads.`);
    }
  }

  console.log(`\n🎉 Successfully restored original subhamapi upload image links for ${restoredCount} products!`);
  await mongoose.disconnect();
}

restoreOriginalImages().catch(console.error);
