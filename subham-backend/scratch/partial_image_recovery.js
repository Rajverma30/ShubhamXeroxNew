/**
 * Partial / careful product image recovery.
 * - Curated title→filename rules for known good covers
 * - High-confidence token match against uploads/products
 * - Never randomly assigns leftover files
 * - Writes Railway URLs (files actually serve there)
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const https = require('https');

const LIVE_BASE = 'https://shubhamxeroxnew-production.up.railway.app/uploads';
const APPLY = process.argv.includes('--apply');

const BAD_FILE_RE = /(ball-pen|montex|inxon|chatgpt-image|whatsapp-image|doms-|pencil|rubberize)/i;

const CURATED = [
  { re: /complete english vocabulary|vocabulary book.*vol\.?\s*1/i, file: 'the-complete-english-vocabulary-book-vol-1-full.webp' },
  { re: /vocabulary book.*vol\.?\s*2/i, file: 'the-complete-english-vocabulary-book-vol-2-full.webp' },
  { re: /parmar.*current|ssc current affair/i, file: 'parmar-ssc-current-affairs-shot-book-2026-full.webp' },
  { re: /ncert.*itihas|ncert.*history|class 6 to 12.*itihas/i, file: 'ncert-itihas-class-6-to-12-summary-and-one-liner-book-full.webp' },
  { re: /\bmp.?gk\b|madhya pradesh general knowledge|selection tak mpgk|pariksha dham 2026|parikshadham objective madhya|tathyabaan 2026 madhya pradesh samanya/i, file: 'mp-gk-complete-book-madhya-pradesh-general-knowledge-2026-full.webp' },
  { re: /indian constitution|polity.*governance|constitution and polity/i, file: 'indian-constitution-and-polity-governance-guide-full.webp' },
  { re: /gyan.*general science|general science textbook/i, file: 'gyan-general-science-textbook-for-competitive-exams-full.webp' },
  { re: /reasoning.*practice|complete reasoning/i, file: 'complete-reasoning-practice-and-short-tricks-book-full.webp' },
  { re: /hindi.*geography|geography.*complete study/i, file: 'hindi-geography-complete-study-guide-and-practice-book-full.webp' },
  { re: /medieval indian history|complete medieval history/i, file: '1786871921001-149435-Complete-Medieval-History-English_page-0001-full.webp' },
  { re: /modern indian history/i, file: '1786810891439-410321-modern-history--3-_page-0001-full.webp' },
];

const STOP = new Set([
  'and', 'for', 'the', 'book', 'with', 'part', 'paper', 'unit', 'hindi', 'english',
  'medium', 'edition', 'complete', 'notes', 'full', 'page', 'demo', 'set', 'by',
  'shubham', 'xerox', 'sir', '2025', '2026', '2027', 'latest', 'updated', 'print',
  'out', 'bw', 'black', 'white', 'copy', 'paperback', 'or', 'mppsc', 'upsc', 'ssc',
  'exam', 'exams', 'mpesb', 'vyapam', 'series', 'test', 'pack', 'volume', 'vol',
]);

function tokenize(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/^\d{10,}-\d+-/, '')
    .replace(/-(card|thumb|full)\.webp$/i, '')
    .replace(/\.webp$/i, '')
    .replace(/[-_\s\W]+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w.length >= 3 && !STOP.has(w));
}

function headOk(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 8000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

function looksWrong(url) {
  return !url || BAD_FILE_RE.test(url) || /\/uploads\/media\//i.test(url);
}

function makeImages(file, title) {
  const url = `${LIVE_BASE}/${file}`;
  return [{ url, cardUrl: url, thumbUrl: url, alt: title, source: 'upload' }];
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');

  const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
  const files = fs
    .readdirSync(uploadsDir)
    .filter((f) => f.endsWith('.webp') && !f.endsWith('-card.webp') && !f.endsWith('-thumb.webp') && !BAD_FILE_RE.test(f));

  const fileIndex = files.map((filename) => ({
    filename,
    tokens: tokenize(filename),
  })).filter((f) => f.tokens.length > 0);

  const fileSet = new Set(files);
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'} | products files usable: ${files.length}`);

  // Prefer cluster0 filenames when present locally and better than salon
  const DB1 = 'mongodb+srv://shubhamxerox25_db_user:qAEAS6MTppUzQqUG@cluster0.08smhkb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=Cluster0';
  const c0 = await mongoose.createConnection(DB1).asPromise();
  const P0 = c0.model('Product', new mongoose.Schema({}, { strict: false }), 'products');
  const cluster0 = await P0.find({}).lean();
  const c0ById = new Map(cluster0.map((p) => [String(p._id), p]));

  const products = await Product.find({});
  const report = { curated: 0, cluster0: 0, smart: 0, skipped: 0, unchanged: 0 };
  const changes = [];

  for (const p of products) {
    const title = p.title || '';
    const slug = p.slug || '';
    const current = p.images?.[0]?.url || '';
    let chosen = null;
    let reason = '';

    // 1) Curated
    for (const rule of CURATED) {
      if (rule.re.test(title) || rule.re.test(slug)) {
        if (fileSet.has(rule.file)) {
          chosen = rule.file;
          reason = 'curated';
          break;
        }
      }
    }

    // 2) cluster0 disabled — too many wrong filename mappings from prior scramble
    // (kept in dry diagnostics only when --use-cluster0 is passed)
    if (!chosen && looksWrong(current) && process.argv.includes('--use-cluster0')) {
      const other = c0ById.get(String(p._id));
      const u0 = other?.images?.[0]?.url || '';
      if (u0) {
        const fn = u0.split('/').pop();
        if (fn && fileSet.has(fn) && !BAD_FILE_RE.test(fn)) {
          const titleTokens = tokenize(`${title} ${slug}`);
          const fileTokens = tokenize(fn);
          let hits = 0;
          for (const t of fileTokens) {
            if (titleTokens.includes(t)) hits++;
          }
          if (hits >= 3) {
            chosen = fn;
            reason = `cluster0:${hits}`;
          }
        }
      }
    }

    // 3) Smart token match — only if current looks wrong/weak
    if (!chosen && looksWrong(current)) {
      const titleTokens = tokenize(`${title} ${slug} ${p.author || ''} ${p.publisher || ''}`);
      let best = null;
      let maxHits = 0;
      for (const ft of fileIndex) {
        let hits = 0;
        for (const t of ft.tokens) {
          if (titleTokens.includes(t)) hits++;
        }
        if (hits > maxHits && hits >= 3) {
          maxHits = hits;
          best = ft.filename;
        }
      }
      if (best) {
        chosen = best;
        reason = `smart:${maxHits}`;
      }
    }

    if (!chosen) {
      if (looksWrong(current)) report.skipped++;
      else report.unchanged++;
      continue;
    }

    const newUrl = `${LIVE_BASE}/${chosen}`;
    if (current === newUrl) {
      report.unchanged++;
      continue;
    }

    changes.push({
      title: title.slice(0, 55),
      reason,
      from: current.split('/uploads/').pop() || current.slice(0, 60),
      to: chosen,
    });

    if (reason.startsWith('curated')) report.curated++;
    else if (reason.startsWith('cluster0')) report.cluster0++;
    else report.smart++;

    if (APPLY) {
      await Product.updateOne({ _id: p._id }, { $set: { images: makeImages(chosen, title) } });
    }
  }

  // Verify a handful of new URLs
  let verified = 0;
  for (const ch of changes.slice(0, 12)) {
    if (await headOk(`${LIVE_BASE}/${ch.to}`)) verified++;
  }

  console.log('\n=== CHANGES (first 40) ===');
  for (const ch of changes.slice(0, 40)) {
    console.log(`- [${ch.reason}] ${ch.title}`);
    console.log(`    ${ch.from}`);
    console.log(` -> ${ch.to}`);
  }
  if (changes.length > 40) console.log(`... +${changes.length - 40} more`);

  console.log('\n=== SUMMARY ===');
  console.log({ ...report, totalChanges: changes.length, verifiedSampleOk: `${verified}/12`, applied: APPLY });

  await c0.close();
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
