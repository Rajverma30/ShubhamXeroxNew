const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');

function stopWords() {
  return new Set(['and', 'for', 'the', 'book', 'with', 'part', 'paper', 'unit', 'hindi', 'english', 'medium', 'mppsc', 'upsc', 'ssc', 'exam', 'exams', 'edition', 'complete', 'notes', 'full', 'page', 'demo', 'set', 'by']);
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

async function revertToStrictSubhamapi() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI missing');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({});

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const localFiles = fs.existsSync(uploadsDir) 
    ? fs.readdirSync(uploadsDir).filter(f => f.endsWith('.webp') && !f.endsWith('-card.webp') && !f.endsWith('-thumb.webp'))
    : [];

  console.log(`Processing ${products.length} products...`);
  console.log(`Local WebP files: ${localFiles.length}`);

  const bulkOps = [];
  let subhamapiCount = 0;
  let clearedCount = 0;

  for (const p of products) {
    const pKeys = new Set(getKeyWords(p.title + ' ' + p.slug));
    let bestMatchFile = null;
    let maxHits = 0;

    if (pKeys.size > 0) {
      for (const f of localFiles) {
        const fKeys = getKeyWords(f);
        if (fKeys.length === 0) continue;
        let hit = 0;
        fKeys.forEach(k => { if (pKeys.has(k)) hit++; });
        if (hit > maxHits) {
          maxHits = hit;
          bestMatchFile = f;
        }
      }
    }

    if (bestMatchFile && maxHits >= 1) {
      const primaryUrl = `https://subhamapi.hypernxt.space/uploads/${bestMatchFile}`;
      const images = [{
        url: primaryUrl,
        cardUrl: primaryUrl,
        thumbUrl: primaryUrl,
        alt: p.title,
        source: 'upload'
      }];
      bulkOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { images } }
        }
      });
      subhamapiCount++;
    } else {
      bulkOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { images: [] } }
        }
      });
      clearedCount++;
    }
  }

  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps);
  }

  console.log('\n--- STRICT SUBHAMAPI NORMALIZATION COMPLETE ---');
  console.log(`- Products with genuine images on https://subhamapi.hypernxt.space/uploads/: ${subhamapiCount}`);
  console.log(`- Products without uploads (images array cleared []): ${clearedCount}`);

  await mongoose.disconnect();
}

revertToStrictSubhamapi().catch(console.error);
