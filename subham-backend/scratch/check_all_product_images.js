const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');

async function debugFiles() {
  console.log('Connecting to Mongo URI:', process.env.MONGO_URI ? 'FOUND' : 'MISSING');
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({}).lean();

  const localUploadsDir = path.join(__dirname, '..', '..', 'uploads');
  const rootFiles = fs.existsSync(localUploadsDir) ? fs.readdirSync(localUploadsDir) : [];

  console.log('Sample root upload filenames (first 10):');
  console.log(rootFiles.slice(0, 10));

  console.log('\nSample Product Image URLs (first 15):');
  let count = 0;
  for (const p of products) {
    if (p.images && p.images.length > 0) {
      console.log(`Product: "${p.title.slice(0, 40)}" -> ${p.images[0].url}`);
      count++;
      if (count >= 15) break;
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

debugFiles().catch(console.error);
