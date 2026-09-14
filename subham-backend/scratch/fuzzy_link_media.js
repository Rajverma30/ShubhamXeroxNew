require('dotenv').config();
const mongoose = require('mongoose');

function stopWords() {
  return new Set(['and', 'for', 'the', 'book', 'with', 'part', 'paper', 'unit', 'hindi', 'english', 'medium', 'mppsc', 'upsc', 'ssc', 'exam', 'exams', 'edition', 'complete', 'notes']);
}

function getKeyWords(str) {
  const stops = stopWords();
  return String(str || '')
    .toLowerCase()
    .replace(/^\d{10,}-\d+-/, '') // strip timestamp prefixes
    .replace(/-(card|thumb|full)\.webp$/i, '')
    .replace(/\.webp$/i, '')
    .replace(/[-_\s\W]+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length > 2 && !stops.has(w));
}

async function exactMatch() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const Media = require('../src/models/Media');

  const products = await Product.find({});
  const mediaList = await Media.find({}).lean();

  console.log(`Strict matching ${mediaList.length} Media items against ${products.length} Products...`);

  let matchedCount = 0;

  for (const p of products) {
    const pKeys = new Set(getKeyWords(p.title + ' ' + p.slug));
    if (pKeys.size === 0) continue;

    const matchedMedia = mediaList.filter(m => {
      const mKeys = getKeyWords(m.filename + ' ' + (m.originalName || ''));
      if (mKeys.length === 0) return false;
      let matches = 0;
      mKeys.forEach(k => { if (pKeys.has(k)) matches++; });
      return matches >= Math.min(2, mKeys.length);
    });

    if (matchedMedia.length > 0 && matchedMedia.length <= 10) {
      const images = matchedMedia.slice(0, 5).map(m => {
        const baseUrl = m.url || `https://subhamapi.hypernxt.space/uploads/products/${m.filename}`;
        const cardUrl = m.cardUrl || baseUrl.replace(/\.webp$/, '-card.webp');
        const thumbUrl = m.thumbUrl || baseUrl.replace(/\.webp$/, '-thumb.webp');
        return {
          url: baseUrl,
          cardUrl: cardUrl,
          thumbUrl: thumbUrl,
          alt: p.title,
          source: 'upload',
        };
      });

      await Product.updateOne({ _id: p._id }, { $set: { images } });
      matchedCount++;
      console.log(`[${matchedCount}] Matched "${p.title}" -> ${images.length} image(s)`);
    }
  }

  console.log(`\n🎉 Matched and restored original images for ${matchedCount} products!`);
  await mongoose.disconnect();
}

exactMatch().catch(console.error);
