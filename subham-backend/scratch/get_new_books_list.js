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

async function getNewestBooksWithoutImages() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();
  
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  const localFiles = fs.existsSync(uploadsDir) 
    ? fs.readdirSync(uploadsDir).filter(f => f.endsWith('.webp') && !f.endsWith('-card.webp') && !f.endsWith('-thumb.webp'))
    : [];

  const unmappedNewBooks = [];

  for (const p of products) {
    const pKeys = new Set(getKeyWords(p.title + ' ' + p.slug));
    let hit = 0;

    if (pKeys.size > 0) {
      for (const f of localFiles) {
        const fKeys = getKeyWords(f);
        if (fKeys.length === 0) continue;
        fKeys.forEach(k => { if (pKeys.has(k)) hit++; });
      }
    }

    // If no keyword match in local uploads directory
    if (hit === 0) {
      unmappedNewBooks.push({
        id: p._id,
        title: p.title,
        createdAt: p.createdAt ? p.createdAt.toISOString().slice(0, 10) : 'N/A',
        currentImage: p.images && p.images[0] ? p.images[0].url : 'NONE'
      });
    }
  }

  console.log(`FOUND ${unmappedNewBooks.length} NEW/UNMAPPED BOOKS WITHOUT REAL LOCAL IMAGES:\n`);
  unmappedNewBooks.slice(0, 20).forEach((b, idx) => {
    console.log(`${idx + 1}. [${b.id}] "${b.title}" (Date: ${b.createdAt})`);
  });

  await mongoose.disconnect();
}

getNewestBooksWithoutImages().catch(console.error);
