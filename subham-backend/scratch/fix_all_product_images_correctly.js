const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');

const AD_BANNER = '1786800649115-811816-ChatGPT-Image-Aug-15--2026--06_54_05-PM-full.webp';

function getCleanTokens(str) {
  const stops = new Set([
    'and', 'for', 'the', 'book', 'with', 'part', 'paper', 'unit', 'hindi', 'english',
    'medium', 'edition', 'complete', 'notes', 'full', 'page', 'demo', 'set', 'by',
    'shubham', 'xerox', 'sir', '2025', '2026', '2027', 'latest', 'updated', 'print',
    'out', 'bw', 'black', 'white', 'copy', 'paperback', 'or', 'mppsc', 'upsc', 'ssc',
    'exam', 'exams', 'mpesb', 'vyapam', 'guide', 'solutions'
  ]);

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

async function fixAllProductImagesCorrectly() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({});

  const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
  const allFiles = fs.readdirSync(uploadsDir);

  // Filter full webp files (exclude card/thumb duplicates for matching)
  const fullFiles = allFiles.filter(f => f.endsWith('.webp') && !f.endsWith('-card.webp') && !f.endsWith('-thumb.webp') && f !== AD_BANNER);

  const fileMap = fullFiles.map(f => ({
    filename: f,
    tokens: getCleanTokens(f),
    raw: f.toLowerCase()
  }));

  console.log(`Processing ${products.length} products...`);
  console.log(`Available uploads files for matching: ${fullFiles.length}`);

  const bulkOps = [];
  let updatedCount = 0;
  let adBannerRemovedCount = 0;

  for (const p of products) {
    const currentUrl = p.images?.[0]?.url || '';
    const isAdBanner = currentUrl.includes(AD_BANNER);

    const titleTokens = getCleanTokens(`${p.title} ${p.slug || ''} ${p.author || ''} ${p.publisher || ''}`);

    let bestFile = null;
    let maxHits = 0;

    for (const fm of fileMap) {
      if (fm.tokens.length === 0) continue;
      let hits = 0;
      fm.tokens.forEach(t => {
        if (titleTokens.includes(t)) hits++;
      });

      // Require at least 2 token matches
      if (hits > maxHits && hits >= 2) {
        maxHits = hits;
        bestFile = fm.filename;
      }
    }

    if (bestFile) {
      const fullUrl = `https://subhamapi.hypernxt.space/uploads/products/${bestFile}`;
      
      // Determine card and thumb filenames if they exist on disk
      const baseName = bestFile.replace(/\.webp$/i, '');
      const cardFile = `${baseName}-card.webp`;
      const thumbFile = `${baseName}-thumb.webp`;

      const cardUrl = allFiles.includes(cardFile)
        ? `https://subhamapi.hypernxt.space/uploads/products/${cardFile}`
        : fullUrl;

      const thumbUrl = allFiles.includes(thumbFile)
        ? `https://subhamapi.hypernxt.space/uploads/products/${thumbFile}`
        : fullUrl;

      const newImages = [{
        url: fullUrl,
        cardUrl: cardUrl,
        thumbUrl: thumbUrl,
        alt: p.title,
        source: 'upload'
      }];

      bulkOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { images: newImages } }
        }
      });
      updatedCount++;
    } else if (isAdBanner) {
      // Remove generic ad banner if no real product image matched
      bulkOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { images: [] } }
        }
      });
      adBannerRemovedCount++;
    }
  }

  if (bulkOps.length > 0) {
    console.log(`Executing bulkWrite for ${bulkOps.length} products...`);
    const res = await Product.bulkWrite(bulkOps);
    console.log('bulkWrite complete:', res);
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Products Updated with Exact Image Matches: ${updatedCount}`);
  console.log(`Ad Banners Removed: ${adBannerRemovedCount}`);

  process.exit(0);
}

fixAllProductImagesCorrectly().catch(console.error);
