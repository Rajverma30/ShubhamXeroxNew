const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function dumpMedia() {
  await mongoose.connect(process.env.MONGO_URI);
  const Media = require('../src/models/Media');
  const items = await Media.find({}).lean();
  console.log(`Total Media Items: ${items.length}\n`);
  items.forEach((m, i) => {
    console.log(`${i + 1}. filename: "${m.filename}" | orig: "${m.originalName}" | url: "${m.url}"`);
  });
  process.exit(0);
}

dumpMedia().catch(console.error);
