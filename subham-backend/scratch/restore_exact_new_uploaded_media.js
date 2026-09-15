const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const RECENT_NEW_UPLOADS = [
  {
    titleMatch: /vocabulary/i,
    url: 'https://subhamapi.hypernxt.space/uploads/media/1789239975856-109321-The-Complete-Vocabulary-Book-Mockup-1--full.webp'
  },
  {
    titleMatch: /parmar.*current/i,
    url: 'https://subhamapi.hypernxt.space/uploads/media/1789239972684-70024-Parmar-SSC-Current-Affair-Shot-Book-Mockup-full.webp'
  },
  {
    titleMatch: /ncert.*itihas|ncert.*history/i,
    url: 'https://subhamapi.hypernxt.space/uploads/media/1789239971240-266510-NCERT--------------------Paperback-Mockup-full.webp'
  },
  {
    titleMatch: /mp.*gk|madhya pradesh.*general knowledge/i,
    url: 'https://subhamapi.hypernxt.space/uploads/media/1789239969573-664674-Madhya-Pradesh-General-Knowledge-Book-Mockup-full.webp'
  },
  {
    titleMatch: /constitution|polity.*governance/i,
    url: 'https://subhamapi.hypernxt.space/uploads/media/1789239967977-598875-Indian-Constitution-and-Governance-Guide-full.webp'
  },
  {
    titleMatch: /bhartiya.*itihas|hindi.*history|indian.*history/i,
    url: 'https://subhamapi.hypernxt.space/uploads/media/1789239966445-72806-Hindi-History-Study-Guide-on-Wooden-Table-full.webp'
  },
  {
    titleMatch: /gyan.*general science|science.*textbook/i,
    url: 'https://subhamapi.hypernxt.space/uploads/media/1789239964761-535552-Gyan-General-Science-Textbook-Mockup-full.webp'
  },
  {
    titleMatch: /reasoning.*practice/i,
    url: 'https://subhamapi.hypernxt.space/uploads/media/1789239963338-10286-Glossy-Reasoning-Practice-Book-Mockup-full.webp'
  },
  {
    titleMatch: /geography/i,
    url: 'https://subhamapi.hypernxt.space/uploads/media/1789239961343-849324-Glossy-Hindi-Geography-Book-Mockup-full.webp'
  }
];

async function restoreNewUploads() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');

  console.log('Restoring 100% exact recently uploaded cover images...');

  let count = 0;
  for (const item of RECENT_NEW_UPLOADS) {
    const products = await Product.find({ title: item.titleMatch });
    for (const p of products) {
      const images = [{
        url: item.url,
        cardUrl: item.url,
        thumbUrl: item.url,
        alt: p.title,
        source: 'upload',
      }];
      await Product.updateOne({ _id: p._id }, { $set: { images } });
      console.log(`Updated recent upload for "${p.title.slice(0, 45)}" -> ${item.url}`);
      count++;
    }
  }

  console.log(`\n🎉 Successfully restored exact recent new image uploads for ${count} top books!`);
  await mongoose.disconnect();
}

restoreNewUploads().catch(console.error);
