require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const WEB = 'https://subhamxerox-nxt.web.app/uploads';

// Fix a few obvious remaining wrong covers after smart/host pass
const FIXES = [
  { title: /black book.*unit-6|“black book”/i, file: null }, // leave for now unless we find file
  { title: /upsc blank practice answer sheet/i, file: null, clear: true },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const fs = require('fs');
  const path = require('path');
  const files = fs.readdirSync(path.join(__dirname, '..', 'uploads', 'products'));

  const black = files.filter((f) => /black.?book|economy.*madhya|unit-6|special.?facts/i.test(f));
  console.log('black-book-ish files:', black.slice(0, 10));

  const blank = files.filter((f) => /answer.?sheet|blank.?practice|upsc.?blank/i.test(f));
  console.log('answer-sheet files:', blank.slice(0, 10));

  // If black book file exists, assign it
  if (black[0]) {
    const url = `${WEB}/${black[0]}`;
    const r = await Product.updateMany(
      { title: /black book.*unit-6|“black book”|\"black book\"/i },
      { $set: { images: [{ url, cardUrl: url, thumbUrl: url, alt: 'BLACK BOOK', source: 'upload' }] } }
    );
    console.log('black book updates', r.modifiedCount, '->', black[0]);
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
