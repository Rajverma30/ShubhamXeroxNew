/**
 * Full catalogue image recovery:
 * 1) Rematch products → local uploads/products (+ Media library) when confident
 * 2) Rewrite every product image URL to https://subhamxerox-nxt.web.app/uploads/...
 *
 * Usage:
 *   node scratch/full_webapp_image_recovery.js          # dry-run
 *   node scratch/full_webapp_image_recovery.js --apply
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');

const APPLY = process.argv.includes('--apply');
const WEBAPP = 'https://subhamxerox-nxt.web.app/uploads';

const BAD_RE = /(chatgpt-image|whatsapp-image|ball-pen|montex|inxon|doms-|rubberize)/i;

const CURATED = [
  { re: /complete english vocabulary|vocabulary book.*vol\.?\s*1/i, file: 'the-complete-english-vocabulary-book-vol-1-full.webp' },
  { re: /vocabulary book.*vol\.?\s*2/i, file: 'the-complete-english-vocabulary-book-vol-2-full.webp' },
  { re: /parmar.*current affair/i, file: 'parmar-ssc-current-affairs-shot-book-2026-full.webp' },
  { re: /ncert.*itihas|revised history ncert/i, file: 'ncert-itihas-class-6-to-12-summary-and-one-liner-book-full.webp' },
  { re: /\bmp.?gk\b|madhya pradesh general knowledge|selection tak mpgk|winners madhya pradesh general knowledge|pariksha dham 2026|tathyabaan 2026 madhya pradesh samanya|sharma classes madhya pradesh samanya/i, file: 'mp-gk-complete-book-madhya-pradesh-general-knowledge-2026-full.webp' },
  { re: /indian constitution|indian polity constitution|polity.*governance guide/i, file: 'indian-constitution-and-polity-governance-guide-full.webp' },
  { re: /gyan.*general science textbook|gyan samanya vigyan ncert|gyan-general-science/i, file: 'gyan-general-science-textbook-for-competitive-exams-full.webp' },
  { re: /reasoning.*practice|champion publication reasoning|rojgar.*reasoning/i, file: 'complete-reasoning-practice-and-short-tricks-book-full.webp' },
  { re: /hindi.*geography.*complete|majid husain.*bhugol/i, file: 'hindi-geography-complete-study-guide-and-practice-book-full.webp' },
  { re: /medieval indian history|complete medieval history/i, file: '1786871921001-149435-Complete-Medieval-History-English_page-0001-full.webp' },
  { re: /modern indian history/i, file: '1786810891439-410321-modern-history--3-_page-0001-full.webp' },
  { re: /english vocab king/i, file: '1787046714933-519259-english-vocab-king-bilingual-book-75-days-vocab--full.webp' },
  { re: /hauser auto-click/i, file: '1786896026684-488348-auto-click-ball-hauser-germany-original-imahhxhz-full.webp' },
  { re: /doms inxon.*blue/i, file: '1786891905824-14319-Doms-Inxon-Ball-Pens-10-Pcs-Blue-full.webp' },
  { re: /montex mega top.*red|mega top ball pen.*red/i, file: '1786895850280-793657-mega-top-ball-pen-pack-of-10-red-montex-original-full.webp' },
  { re: /montex mega top.*black|mega-top-black/i, file: '1786895711600-144567-mega-top-black-ball-penpremium-montex-original-i-full.webp' },
  { re: /mp sub-engineer|mp_sub_electrical/i, file: '1787668068844-386628-MP_Sub_Electrical_Engineering_17_Sets_Solved_Pap-full.webp' },
  { re: /bhartiya itihas complete study/i, file: 'bhartiya-itihas-complete-study-guide-full.webp' },
];

const STOP = new Set([
  'and', 'for', 'the', 'book', 'with', 'part', 'paper', 'unit', 'hindi', 'english',
  'medium', 'edition', 'complete', 'notes', 'full', 'page', 'demo', 'set', 'by',
  'shubham', 'xerox', 'sir', '2025', '2026', '2027', 'latest', 'updated', 'print',
  'out', 'bw', 'black', 'white', 'copy', 'paperback', 'or', 'mppsc', 'upsc', 'ssc',
  'exam', 'exams', 'mpesb', 'vyapam', 'series', 'test', 'pack', 'volume', 'vol',
  'original', 'imah', 'ql80', 'fmwebp', 'sl3840', 'pcs', 'class', 'classes',
]);

function tok(str) {
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

function clean(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function webUrl(relPath) {
  const rel = String(relPath || '').replace(/^\/+/, '').replace(/^uploads\//, '');
  return `${WEBAPP}/${rel}`;
}

function imageDoc(url, title) {
  return [{ url, cardUrl: url, thumbUrl: url, alt: title, source: 'upload' }];
}

function scoreMatch(productTokens, fileTokens) {
  if (!productTokens.length || !fileTokens.length) return 0;
  const pset = new Set(productTokens);
  let hits = 0;
  let weight = 0;
  for (const t of fileTokens) {
    if (pset.has(t)) {
      hits += 1;
      weight += t.length >= 6 ? 2 : 1;
    }
  }
  if (hits === 0) return 0;
  // Prefer cover pages over interior demo pages when equal brand match
  return weight * 10 + hits;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const Media = require('../src/models/Media');

  const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
  const files = fs
    .readdirSync(uploadsDir)
    .filter((f) => f.endsWith('.webp') && !f.endsWith('-card.webp') && !f.endsWith('-thumb.webp'));
  const fileSet = new Set(files);
  const fileIndex = files.map((f) => ({
    f,
    tokens: tok(f),
    isCover: /page-0001|cover|_0001|full\.webp$/i.test(f) && !/page-000[2-9]|page-00[1-9][0-9]/i.test(f),
  }));

  const media = await Media.find({}).lean();
  const mediaByClean = new Map();
  for (const m of media) {
    const keys = [m.originalName, m.filename, m.alt]
      .filter(Boolean)
      .map((x) => clean(String(x).replace(/\.(webp|jpe?g|png)$/i, '')));
    for (const k of keys) {
      if (k.length >= 8) mediaByClean.set(k, m);
    }
  }

  const products = await Product.find({});
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'} | products=${products.length} files=${files.length} media=${media.length}`);

  const usedFiles = new Set();
  const stats = { curated: 0, media: 0, smart: 0, hostOnly: 0, clearedBad: 0 };
  const samples = [];

  // Pass 1: decide best file/url per product (no write yet)
  const plans = [];

  for (const p of products) {
    const title = p.title || '';
    const slug = p.slug || '';
    const pTokens = tok(`${title} ${slug} ${p.author || ''} ${p.publisher || ''}`);
    const current = p.images?.[0]?.url || '';
    let chosenRel = null;
    let reason = '';

    // curated
    for (const rule of CURATED) {
      if ((rule.re.test(title) || rule.re.test(slug)) && fileSet.has(rule.file)) {
        chosenRel = rule.file;
        reason = 'curated';
        break;
      }
    }

    // Media: strict for books; looser for stationery (Media library was built for that)
    if (!chosenRel) {
      const pct = clean(title);
      const pslug = clean(slug);
      const isStationery = p.type === 'stationery';
      let bestM = null;
      let bestLen = 0;
      for (const [k, m] of mediaByClean) {
        const minLen = isStationery ? 12 : 16;
        if (k.length < minLen) continue;
        let ok = false;
        if (isStationery) {
          ok = pct.includes(k) || k.includes(pct) || pslug.includes(k) || k.includes(pslug);
        } else {
          ok = pct === k
            || (pct.includes(k) && k.length / pct.length >= 0.55)
            || (k.includes(pct) && pct.length / k.length >= 0.55)
            || (pslug.includes(k) && k.length / Math.max(pslug.length, 1) >= 0.55);
        }
        if (ok && k.length > bestLen) {
          bestLen = k.length;
          bestM = m;
        }
      }
      if (bestM) {
        const folder = bestM.folder || 'products';
        const fn = bestM.filename;
        if (fileSet.has(fn)) chosenRel = fn;
        else if (fileSet.has(fn.replace(/\.webp$/i, '-full.webp'))) chosenRel = fn.replace(/\.webp$/i, '-full.webp');
        else chosenRel = `${folder}/${fn}`;
        reason = 'media';
      }
    }

    // smart token match against local files
    if (!chosenRel) {
      const currentBad = BAD_RE.test(current) && !/pen|pencil|marker|stationery|hauser|montex|doms|inxon/i.test(title);
      let best = null;
      let bestScore = 0;
      for (const fi of fileIndex) {
        if (usedFiles.has(fi.f)) continue;
        let sc = scoreMatch(pTokens, fi.tokens);
        if (fi.isCover) sc += 3;
        if (BAD_RE.test(fi.f) && !/pen|pencil|marker|stationery|hauser|montex|doms|inxon/i.test(title)) {
          sc -= 50;
        }
        if (sc > bestScore) {
          bestScore = sc;
          best = fi;
        }
      }
      const need = currentBad ? 25 : 35;
      if (best && bestScore >= need) {
        chosenRel = best.f;
        reason = `smart:${bestScore}`;
      }
    }

    // if still nothing but current filename exists on disk, keep it (host rewrite only)
    if (!chosenRel && current) {
      const after = current.split('/uploads/').pop();
      if (after) {
        const base = after.split('/').pop();
        if (fileSet.has(base)) chosenRel = base;
        else if (fileSet.has(after) || after.includes('/')) chosenRel = after;
        else chosenRel = after; // still rewrite host; may 404 if missing
        reason = reason || 'host';
      }
    }

    if (chosenRel && reason !== 'host' && !chosenRel.includes('/')) {
      usedFiles.add(chosenRel);
    }

    const newUrl = chosenRel ? webUrl(chosenRel) : '';
    plans.push({ p, newUrl, reason, chosenRel, current });
  }

  // Pass 2: apply
  for (const plan of plans) {
    const { p, newUrl, reason, current } = plan;
    if (!newUrl) {
      if (current && BAD_RE.test(current)) stats.clearedBad += 1;
      continue;
    }

    if (reason === 'curated') stats.curated += 1;
    else if (reason === 'media') stats.media += 1;
    else if (String(reason).startsWith('smart')) stats.smart += 1;
    else stats.hostOnly += 1;

    if (samples.length < 35) {
      samples.push({
        reason,
        title: (p.title || '').slice(0, 50),
        from: (current || '').split('/uploads/').pop() || '(none)',
        to: newUrl.split('/uploads/').pop(),
      });
    }

    if (APPLY) {
      await Product.updateOne({ _id: p._id }, { $set: { images: imageDoc(newUrl, p.title) } });
    }
  }

  console.log('\n=== SAMPLE ===');
  for (const s of samples) {
    console.log(`[${s.reason}] ${s.title}`);
    console.log(`  ${s.from}`);
    console.log(`→ ${s.to}`);
  }
  console.log('\n=== SUMMARY ===');
  console.log({ ...stats, total: plans.length, withUrl: plans.filter((x) => x.newUrl).length, applied: APPLY });

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
