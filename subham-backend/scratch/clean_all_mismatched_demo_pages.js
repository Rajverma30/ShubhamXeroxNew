const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function cleanAllMismatchedDemoPages() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({});

  console.log(`Checking ${products.length} products for mismatched demo/test images...`);

  const bulkOps = [];
  let clearedCount = 0;

  for (const p of products) {
    const title = (p.title || '').toLowerCase();
    const currentImg = p.images?.[0]?.url || '';
    if (!currentImg) continue;

    const imgFileName = currentImg.split('/uploads/').pop().toLowerCase();

    // Specific mismatch rules:
    // 1. Dev Sir Science E-book demo page on non-science books
    const isDevScienceOnNonScience = imgFileName.includes('e-book-science-by-dev-sir') && !title.includes('science') && !title.includes('vigyan');

    // 2. Karma IAS Mains Test series image on non-Karma IAS books
    const isKarmaTestOnNonKarma = (imgFileName.includes('karma-ias') || imgFileName.includes('mains-test')) && !title.includes('karma') && !title.includes('test series');

    // 3. Electrical Engineering solved papers on non-electrical engineering books
    const isElecEngOnNonElec = imgFileName.includes('electrical_engineering') && !title.includes('electrical');

    // 4. WhatsApp / photo screenshot demo pages
    const isGenericWhatsappScreen = (imgFileName.includes('whatsapp-image-2025') || imgFileName.includes('photo_2026')) && !title.includes('shubham gupta') && !title.includes('polity');

    if (isDevScienceOnNonScience || isKarmaTestOnNonKarma || isElecEngOnNonElec || isGenericWhatsappScreen) {
      bulkOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { images: [] } }
        }
      });
      clearedCount++;
      console.log(`Cleared mismatch for "${p.title.slice(0, 50)}..." -> ${imgFileName}`);
    }
  }

  if (bulkOps.length > 0) {
    console.log(`Executing bulkWrite to clear ${bulkOps.length} mismatched product images...`);
    const res = await Product.bulkWrite(bulkOps);
    console.log('bulkWrite complete:', res);
  } else {
    console.log('No additional mismatched images found.');
  }

  console.log(`\n=== CLEANUP RESULT ===`);
  console.log(`Mismatched Demo/Test Images Cleared: ${clearedCount}`);

  process.exit(0);
}

cleanAllMismatchedDemoPages().catch(console.error);
