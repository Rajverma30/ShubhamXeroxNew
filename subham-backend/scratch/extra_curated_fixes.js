require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const LIVE = 'https://shubhamxeroxnew-production.up.railway.app/uploads';

const FIXES = [
  { title: /champion publication reasoning|rojgar.*reasoning|complete reasoning practice/i, file: 'complete-reasoning-practice-and-short-tricks-book-full.webp' },
  { title: /the complete english vocabulary|english vocabulary book vol/i, file: 'the-complete-english-vocabulary-book-vol-1-full.webp' },
  { title: /gyan.*general science textbook|gyan samanya vigyan ncert/i, file: 'gyan-general-science-textbook-for-competitive-exams-full.webp' },
  { title: /ncert itihas|revised history ncert/i, file: 'ncert-itihas-class-6-to-12-summary-and-one-liner-book-full.webp' },
  { title: /parmar.*current affair/i, file: 'parmar-ssc-current-affairs-shot-book-2026-full.webp' },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  let n = 0;
  for (const f of FIXES) {
    const list = await Product.find({ title: f.title });
    for (const p of list) {
      const url = `${LIVE}/${f.file}`;
      const cur = p.images?.[0]?.url || '';
      if (cur === url) continue;
      await Product.updateOne(
        { _id: p._id },
        { $set: { images: [{ url, cardUrl: url, thumbUrl: url, alt: p.title, source: 'upload' }] } }
      );
      console.log('OK', p.title.slice(0, 55), '->', f.file);
      n++;
    }
  }
  console.log('extra fixes', n);

  const all = await Product.find({}).lean();
  const bad = all.filter((p) => /(ball-pen|montex|inxon|chatgpt-image|whatsapp-image|doms-)/i.test(p.images?.[0]?.url || ''));
  const media = all.filter((p) => /\/uploads\/media\//i.test(p.images?.[0]?.url || ''));
  console.log({ total: all.length, stillPenOrChatGPT: bad.length, stillMediaMockup: media.length });
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
