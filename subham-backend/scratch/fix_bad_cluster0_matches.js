/**
 * Undo clearly-wrong cluster0 rematches from the first apply pass.
 * Prefer previous book-mockup / better local file over wrong textbook page.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const LIVE_BASE = 'https://shubhamxeroxnew-production.up.railway.app/uploads';
const MEDIA_BASE = 'https://subhamapi.hypernxt.space/uploads/media';

const FIXES = [
  {
    title: /cosmos.*world geography|cosmos.*gist of ncert/i,
    url: `${MEDIA_BASE}/1789239961343-849324-Glossy-Hindi-Geography-Book-Mockup-full.webp`,
    why: 'was wrongly set to NCERT Itihas',
  },
  {
    title: /lucent.?s objective general knowledge/i,
    url: `${MEDIA_BASE}/1789239969573-664674-Madhya-Pradesh-General-Knowledge-Book-Mockup-full.webp`,
    why: 'was wrongly set to Gyan Science',
  },
  {
    title: /rojgar.*static gk/i,
    url: `${MEDIA_BASE}/1789239969573-664674-Madhya-Pradesh-General-Knowledge-Book-Mockup-full.webp`,
    why: 'was wrongly set to Gyan Science',
  },
  {
    title: /parmar ssc gk batch/i,
    url: `${LIVE_BASE}/parmar-ssc-current-affairs-shot-book-2026-full.webp`,
    why: 'was wrongly set to Bhartiya Itihas; use Parmar cover as closer brand match',
  },
  {
    title: /lucent.?s general knowledge \(gk\) 2027|lucent.?s सामान्य ज्ञान 2027/i,
    // keep book-looking cover rather than science textbook
    url: `${MEDIA_BASE}/1789239969573-664674-Madhya-Pradesh-General-Knowledge-Book-Mockup-full.webp`,
    why: 'Lucent GK wrongly got Gyan Science cover',
  },
  {
    title: /parmar ssc fatman/i,
    url: `${LIVE_BASE}/parmar-ssc-current-affairs-shot-book-2026-full.webp`,
    why: 'Fatman wrongly got Gyan Science; Parmar brand cover closer',
  },
  {
    title: /tathyabaan current affairs 2026/i,
    url: `${MEDIA_BASE}/1789239972684-70024-Parmar-SSC-Current-Affair-Shot-Book-Mockup-full.webp`,
    why: 'current-affairs mockup better than wrong Parmar product file',
  },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  let n = 0;
  for (const fix of FIXES) {
    const products = await Product.find({ title: fix.title });
    for (const p of products) {
      const images = [{
        url: fix.url,
        cardUrl: fix.url,
        thumbUrl: fix.url,
        alt: p.title,
        source: 'upload',
      }];
      await Product.updateOne({ _id: p._id }, { $set: { images } });
      console.log(`Fixed: ${p.title.slice(0, 60)} (${fix.why})`);
      n++;
    }
  }

  // Re-apply curated-only pass for remaining safe wins
  console.log(`\nCorrective fixes applied: ${n}`);
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
