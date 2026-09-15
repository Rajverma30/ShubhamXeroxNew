const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');

function stopWords() {
  return new Set(['and', 'for', 'the', 'book', 'with', 'part', 'paper', 'unit', 'hindi', 'english', 'medium', 'mppsc', 'upsc', 'ssc', 'exam', 'exams', 'edition', 'complete', 'notes', 'full', 'page', 'demo', 'set', 'by', '2025', '2026']);
}

function getKeyWords(str) {
  const stops = stopWords();
  return String(str || '')
    .toLowerCase()
    .replace(/^\d{10,}-\d+-/, '')
    .replace(/-(card|thumb|full)\.webp$/i, '')
    .replace(/\.webp$/i, '')
    .replace(/[-_\s\W]+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length > 2 && !stops.has(w));
}

async function restoreRemaining() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const Media = require('../src/models/Media');

  const mediaList = await Media.find({}).lean();
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const localFiles = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).filter(f => f.endsWith('.webp') && !f.endsWith('-card.webp') && !f.endsWith('-thumb.webp')) : [];

  const products = await Product.find({}).lean();

  let matchedMediaCount = 0;

  for (const p of products) {
    const currentUrl = (p.images && p.images[0]) ? p.images[0].url : '';
    // If product already has an exact subhamapi URL restored from legacy, keep it!
    if (currentUrl.includes('subhamapi.hypernxt.space') && !currentUrl.includes('placeholder')) {
      continue;
    }

    const pKeys = new Set(getKeyWords(p.title + ' ' + p.slug));
    if (pKeys.size === 0) continue;

    let bestFile = null;
    let maxHits = 0;

    for (const m of mediaList) {
      if (!m.filename) continue;
      const cleanName = m.filename.replace(/-(card|thumb)\.webp$/i, '.webp');
      const mKeys = getKeyWords(m.filename + ' ' + (m.originalName || ''));
      let hits = 0;
      mKeys.forEach(k => { if (pKeys.has(k)) hits++; });
      if (hits > maxHits && hits >= Math.min(2, mKeys.length)) {
        maxHits = hits;
        bestFile = cleanName;
      }
    }

    if (!bestFile) {
      for (const f of localFiles) {
        const fKeys = getKeyWords(f);
        let hits = 0;
        fKeys.forEach(k => { if (pKeys.has(k)) hits++; });
        if (hits > maxHits && hits >= Math.min(3, fKeys.length)) {
          maxHits = hits;
          bestFile = f;
        }
      }
    }

    if (bestFile) {
      const subhamApiUrl = `https://subhamapi.hypernxt.space/uploads/${bestFile}`;
      const images = [{
        url: subhamApiUrl,
        cardUrl: subhamApiUrl,
        thumbUrl: subhamApiUrl,
        alt: p.title,
        source: 'upload',
      }];
      await Product.updateOne({ _id: p._id }, { $set: { images } });
      matchedMediaCount++;
    }
  }

  console.log(`\n🎉 STRICT REMAINING MATCHES DONE:`);
  console.log(`- Matched to Media / Local files: ${matchedMediaCount}`);

  await mongoose.disconnect();
}

restoreRemaining().catch(console.error);
