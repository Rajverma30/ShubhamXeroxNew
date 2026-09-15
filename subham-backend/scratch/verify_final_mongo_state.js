const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function checkMongoStatus() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({}).lean();
  
  console.log(`Total Products in DB: ${products.length}`);
  
  let withImages = 0;
  let withoutImages = 0;
  let googleImagesCount = 0;

  products.forEach(p => {
    if (p.images && p.images.length > 0) {
      withImages++;
      p.images.forEach(img => {
        if (img.source === 'google' || (img.url && !img.url.includes('subhamapi.hypernxt.space'))) {
          googleImagesCount++;
        }
      });
    } else {
      withoutImages++;
    }
  });

  console.log(`- Products with genuine subhamapi image: ${withImages}`);
  console.log(`- Products with no image ([]): ${withoutImages}`);
  console.log(`- External/Google links in DB: ${googleImagesCount}`);

  await mongoose.disconnect();
}

checkMongoStatus().catch(console.error);
