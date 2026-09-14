const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function verifyMedia() {
  await mongoose.connect(process.env.MONGO_URI);
  const Media = require('../src/models/Media');
  const mediaCount = await Media.countDocuments({});
  console.log(`Total Media documents in DB: ${mediaCount}`);

  const sample = await Media.find({}).limit(5).lean();
  console.log('Sample Media items in DB:');
  console.log(JSON.stringify(sample, null, 2));

  await mongoose.disconnect();
}

verifyMedia().catch(console.error);
