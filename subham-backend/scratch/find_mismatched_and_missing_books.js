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

async function analyzeBooks() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();
  
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  const localFiles = fs.existsSync(uploadsDir) 
    ? fs.readdirSync(uploadsDir).filter(f => f.endsWith('.webp') && !f.endsWith('-card.webp') && !f.endsWith('-thumb.webp'))
    : [];

  const missingOrMismatched = [];
  const wellMatched = [];

  for (const p of products) {
    const pKeys = new Set(getKeyWords(p.title + ' ' + p.slug));
    let matchedFile = null;
    let maxHits = 0;

    if (pKeys.size > 0) {
      for (const f of localFiles) {
        const fKeys = getKeyWords(f);
        if (fKeys.length === 0) continue;
        let hit = 0;
        fKeys.forEach(k => { if (pKeys.has(k)) hit++; });
        if (hit > maxHits) {
          maxHits = hit;
          matchedFile = f;
        }
      }
    }

    // A match is considered real if we had at least 1 strong keyword match (or >0 hits)
    if (matchedFile && maxHits >= 1) {
      wellMatched.push({
        id: p._id,
        title: p.title,
        matchedFile,
        hits: maxHits
      });
    } else {
      const currentImages = (p.images || []).map(i => i.url || i);
      missingOrMismatched.push({
        id: p._id,
        title: p.title,
        currentImages
      });
    }
  }

  console.log(`Total Products: ${products.length}`);
  console.log(`Well-matched to local uploaded files: ${wellMatched.length}`);
  console.log(`Missing/Mismatched (Need proper image): ${missingOrMismatched.length}`);

  console.log('\n--- BOOKS NEEDING REAL COVER IMAGES ---');
  missingOrMismatched.forEach((b, idx) => {
    console.log(`${idx + 1}. [${b.id}] "${b.title}"`);
  });

  await mongoose.disconnect();
}

analyzeBooks().catch(console.error);
