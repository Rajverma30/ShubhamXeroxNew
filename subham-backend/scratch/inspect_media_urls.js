require('dotenv').config();
const mongoose = require('mongoose');

async function checkMediaUrls() {
  await mongoose.connect(process.env.MONGO_URI);
  const Media = require('../src/models/Media');
  const Product = require('../src/models/Product');

  const mediaItems = await Media.find({}).lean();
  console.log('Total Media Items:', mediaItems.length);

  const sampleMedia = mediaItems.slice(0, 15).map(m => ({
    filename: m.filename,
    originalName: m.originalName,
    url: m.url,
    cardUrl: m.cardUrl,
  }));

  console.log('Sample Media Items:', sampleMedia);

  mongoose.disconnect();
}

checkMediaUrls().catch(console.error);
