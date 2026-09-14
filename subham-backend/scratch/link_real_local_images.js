const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');

function stopWords() {
  return new Set(['and', 'for', 'the', 'book', 'with', 'part', 'paper', 'unit', 'hindi', 'english', 'medium', 'mppsc', 'upsc', 'ssc', 'exam', 'exams', 'edition', 'complete', 'notes', 'full', 'page', 'demo']);
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

async function linkImages() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const Media = require('../src/models/Media');

  const products = await Product.find({});
  const mediaList = await Media.find({}).lean();
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  const localFiles = fs.readdirSync(uploadsDir);

  console.log(`DB Products: ${products.length}`);
  console.log(`DB Media items: ${mediaList.length}`);
  console.log(`Local upload files: ${localFiles.length}`);

  // Build a map of filename -> local file existence
  const fileSet = new Set(localFiles);

  let updatedCount = 0;

  for (const p of products) {
    const pKeys = new Set(getKeyWords(p.title + ' ' + p.slug));
    if (pKeys.size === 0) continue;

    // Search Media collection or local files for best keyword matches
    const matches = [];

    for (const f of localFiles) {
      const fKeys = getKeyWords(f);
      if (fKeys.length === 0) continue;
      let hit = 0;
      fKeys.forEach(k => { if (pKeys.has(k)) hit++; });
      if (hit >= 1) {
        matches.push({ filename: f, hits: hit, total: fKeys.length });
      }
    }

    // Also check Media collection
    for (const m of mediaList) {
      if (!m.filename) continue;
      const mKeys = getKeyWords(m.filename + ' ' + (m.originalName || ''));
      if (mKeys.length === 0) continue;
      let hit = 0;
      mKeys.forEach(k => { if (pKeys.has(k)) hit++; });
      if (hit >= 1) {
        matches.push({ filename: m.filename, hits: hit, total: mKeys.length });
      }
    }

    if (matches.length > 0) {
      // Sort by highest hit count
      matches.sort((a, b) => b.hits - a.hits);
      // Deduplicate filenames
      const uniqueFiles = [...new Set(matches.map(m => m.filename))].slice(0, 5);

      const images = uniqueFiles.map(fn => {
        // Use https://subhamapi.hypernxt.space/uploads/ or local path
        const url = `https://subhamapi.hypernxt.space/uploads/${fn}`;
        return {
          url,
          cardUrl: url,
          thumbUrl: url,
          alt: p.title,
          source: 'upload',
        };
      });

      await Product.updateOne({ _id: p._id }, { $set: { images } });
      updatedCount++;
      if (updatedCount <= 15) {
        console.log(`[${updatedCount}] "${p.title.slice(0, 35)}" -> ${images[0].url}`);
      }
    }
  }

  console.log(`\nUpdated ${updatedCount} products with real image filenames from local uploads / Media!`);
  await mongoose.disconnect();
}

linkImages().catch(console.error);
