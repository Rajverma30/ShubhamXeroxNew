const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const axios = require('axios');

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

async function searchBingCoverImage(title) {
  try {
    const query = title.slice(0, 80).replace(/[-_\s\W]+/g, ' ').trim();
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query + ' book cover')}&form=HDRSC2`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 7000
    });
    const html = res.data;
    const murlRegex = /murl&quot;:&quot;(https?:[^&]+?)&quot;/gi;
    let m;
    while ((m = murlRegex.exec(html)) !== null) {
      const u = m[1];
      if (u.match(/\.(jpg|jpeg|png|webp)/i) && !u.includes('logo') && !u.includes('avatar') && !u.includes('favicon') && !u.includes('svg')) {
        return u;
      }
    }
  } catch (err) {
    // Return null on search error
  }
  return null;
}

async function runPopulation() {
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

  console.log(`Processing ${products.length} products with parallel worker pool...`);
  console.log(`Local WebP files: ${localFiles.length}`);

  const bulkOps = [];
  let googleAddedCount = 0;
  const CONCURRENCY = 10;

  for (let i = 0; i < products.length; i += CONCURRENCY) {
    const chunk = products.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async (p) => {
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

      const filename = bestMatchFile || `${p.slug || p._id}.webp`;
      const primaryUrl = `https://subhamapi.hypernxt.space/uploads/${filename}`;

      const images = [{
        url: primaryUrl,
        cardUrl: primaryUrl,
        thumbUrl: primaryUrl,
        alt: p.title,
        source: 'upload'
      }];

      const googleUrl = await searchBingCoverImage(p.title);
      if (googleUrl) {
        images.push({
          url: googleUrl,
          cardUrl: googleUrl,
          thumbUrl: googleUrl,
          alt: p.title,
          source: 'google'
        });
        googleAddedCount++;
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { images } }
        }
      });
    }));

    console.log(`Processed ${Math.min(i + CONCURRENCY, products.length)}/${products.length} products (Added ${googleAddedCount} Google fallbacks)...`);
  }

  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps);
  }

  console.log('\n--- POPULATION COMPLETE ---');
  console.log(`Total Products Updated: ${products.length}`);
  console.log(`Products with Direct Google Cover Link in images[1]: ${googleAddedCount}`);

  await mongoose.disconnect();
}

runPopulation().catch(console.error);
