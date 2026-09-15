const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');

function stopWords() {
  return new Set([
    'and', 'for', 'the', 'book', 'with', 'part', 'paper', 'unit', 'hindi', 'english',
    'medium', 'edition', 'complete', 'notes', 'full', 'page', 'demo', 'set', 'by',
    'shubham', 'xerox', 'sir', '2025', '2026', '2027', 'latest', 'updated', 'print',
    'out', 'bw', 'black', 'white', 'copy', 'paperback', 'or', 'mppsc', 'upsc', 'ssc',
    'exam', 'exams', 'mpesb', 'vyapam'
  ]);
}

function tokenize(str) {
  const stops = stopWords();
  return String(str || '')
    .toLowerCase()
    .replace(/^\d{10,}-\d+-/, '') // strip timestamp
    .replace(/-(card|thumb|full)\.webp$/i, '')
    .replace(/\.webp$/i, '')
    .replace(/[-_\s\W]+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length >= 3 && !stops.has(w));
}

async function matchRealImagesSmart() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({}).lean();

  const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
  const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.webp') && !f.endsWith('-card.webp') && !f.endsWith('-thumb.webp'));

  console.log(`Total Products: ${products.length}`);
  console.log(`Total full webp files in uploads/products: ${files.length}`);

  // Create tokenized list for all upload files
  const fileTokens = files.map(f => ({
    filename: f,
    tokens: tokenize(f),
    raw: f.toLowerCase()
  })).filter(f => f.tokens.length > 0);

  let exactMatches = 0;
  let smartMatches = 0;
  let adBannerRemoved = 0;

  const AD_BANNER = '1786800649115-811816-ChatGPT-Image-Aug-15--2026--06_54_05-PM-full.webp';

  for (const p of products) {
    const titleTokens = tokenize(p.title + ' ' + (p.slug || '') + ' ' + (p.author || '') + ' ' + (p.publisher || ''));
    if (titleTokens.length === 0) continue;

    let currentImg = p.images?.[0]?.url || '';
    let isAdBanner = currentImg.includes(AD_BANNER);

    if (isAdBanner) {
      adBannerRemoved++;
    }

    // Score files against title tokens
    let bestFile = null;
    let maxHits = 0;

    for (const ft of fileTokens) {
      let hits = 0;
      ft.tokens.forEach(t => {
        if (titleTokens.includes(t)) hits++;
      });

      // Require at least 2 matching key tokens or 1 unique long token
      if (hits > maxHits && hits >= 2) {
        maxHits = hits;
        bestFile = ft.filename;
      }
    }

    if (bestFile) {
      if (maxHits >= 3) exactMatches++;
      else smartMatches++;

      const imgUrl = `https://subhamapi.hypernxt.space/uploads/products/${bestFile}`;
      console.log(`\nPRODUCT: "${p.title.slice(0, 60)}..."`);
      console.log(`  OLD IMG: ${currentImg.split('/uploads/').pop()}`);
      console.log(`  NEW MATCH (hits ${maxHits}): ${bestFile}`);
    } else if (isAdBanner) {
      console.log(`\nPRODUCT (Ad banner removed, no better file): "${p.title.slice(0, 60)}..."`);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Ad Banners Removed: ${adBannerRemoved}`);
  console.log(`High-confidence Matches (3+ hits): ${exactMatches}`);
  console.log(`Medium-confidence Matches (2 hits): ${smartMatches}`);

  process.exit(0);
}

matchRealImagesSmart().catch(console.error);
