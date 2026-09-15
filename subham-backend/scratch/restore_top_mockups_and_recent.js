const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const MOCKUP_MAPPINGS = [
  {
    productMatch: /vocabulary/i,
    filename: '1789239975856-109321-The-Complete-Vocabulary-Book-Mockup-1--full.webp'
  },
  {
    productMatch: /parmar.*current/i,
    filename: '1789239972684-70024-Parmar-SSC-Current-Affair-Shot-Book-Mockup-full.webp'
  },
  {
    productMatch: /ncert.*itihas|ncert.*history/i,
    filename: '1789239971240-266510-NCERT--------------------Paperback-Mockup-full.webp'
  },
  {
    productMatch: /mp.*gk|madhya pradesh.*general knowledge/i,
    filename: '1789239969573-664674-Madhya-Pradesh-General-Knowledge-Book-Mockup-full.webp'
  },
  {
    productMatch: /constitution|polity.*governance/i,
    filename: '1789239967977-598875-Indian-Constitution-and-Governance-Guide-full.webp'
  },
  {
    productMatch: /bhartiya.*itihas|indian.*history/i,
    filename: '1789239966445-72806-Hindi-History-Study-Guide-on-Wooden-Table-full.webp'
  },
  {
    productMatch: /gyan.*general science|science.*textbook/i,
    filename: '1789239964761-535552-Gyan-General-Science-Textbook-Mockup-full.webp'
  },
  {
    productMatch: /reasoning.*practice/i,
    filename: '1789239963338-10286-Glossy-Reasoning-Practice-Book-Mockup-full.webp'
  },
  {
    productMatch: /geography/i,
    filename: '1789239961343-849324-Glossy-Hindi-Geography-Book-Mockup-full.webp'
  }
];

async function restoreMockups() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');

  console.log('Restoring top book mockups...');

  let count = 0;
  for (const m of MOCKUP_MAPPINGS) {
    const products = await Product.find({ title: m.productMatch });
    for (const p of products) {
      const liveUrl = `https://shubhamxeroxnew-production.up.railway.app/uploads/${m.filename}`;
      const images = [{
        url: liveUrl,
        cardUrl: liveUrl,
        thumbUrl: liveUrl,
        alt: p.title,
        source: 'upload',
      }];
      await Product.updateOne({ _id: p._id }, { $set: { images } });
      console.log(`Matched "${p.title.slice(0, 45)}" -> ${m.filename}`);
      count++;
    }
  }

  console.log(`\n🎉 Restored exact mockup images for ${count} top products!`);
  await mongoose.disconnect();
}

restoreMockups().catch(console.error);
