const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');

const AD_BANNER = '1786800649115-811816-ChatGPT-Image-Aug-15--2026--06_54_05-PM-full.webp';
const GENERIC_MPGK = 'mp-gk-complete-book-madhya-pradesh-general-knowledge-2026-full.webp';
const ELEC_ENG = 'MP_Sub_Electrical_Engineering_17_Sets_Solved_Pap-full.webp';

// Explicit exact slug/title -> image file mappings for top books
const EXACT_MAPPINGS = {
  'parikshadham-samanya-prabandhan-book-hindi': 'PARIKSHADHAM-MANAGEMENT-BOOK-DEMO-page-00002-full.webp',
  'hindi-geography-complete-study-guide-and-practice-book': 'hindi-geography-complete-study-guide-and-practice-book-full.webp',
  'complete-reasoning-practice-and-short-tricks-book': 'complete-reasoning-practice-and-short-tricks-book-full.webp',
  'gyan-general-science-textbook-for-competitive-exams': 'gyan-general-science-textbook-for-competitive-exams-full.webp',
  'bhartiya-itihas-complete-study-guide': 'bhartiya-itihas-complete-study-guide-full.webp',
  'indian-constitution-and-polity-governance-guide': 'indian-constitution-and-polity-governance-guide-full.webp',
  'mp-gk-complete-book-madhya-pradesh-general-knowledge-2026': 'mp-gk-complete-book-madhya-pradesh-general-knowledge-2026-full.webp',
  'ncert-itihas-class-6-to-12-summary-and-one-liner-book': 'ncert-itihas-class-6-to-12-summary-and-one-liner-book-full.webp',
  'parmar-ssc-current-affairs-shot-book-2026': 'parmar-ssc-current-affairs-shot-book-2026-full.webp',
  'the-complete-english-vocabulary-book-vol-1': 'the-complete-english-vocabulary-book-vol-1-full.webp',
  'the-complete-english-vocabulary-book-vol-2': 'the-complete-english-vocabulary-book-vol-2-full.webp',
  'modern-indian-history-shubham-gupta-hindi': 'modern-history--3-_page-0001-full.webp',
  'modern-indian-history-shubham-gupta-english': 'modern-history--3-_page-0001-full.webp',
  'ancient-indian-history-shubham-gupta-hindi': 'modern-history--3-_page-0001-full.webp',
  'complete-medieval-history-english-medium': 'Complete-Medieval-History-English_page-0001-full.webp'
};

async function fixImagesStrictNoMismatches() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({});

  const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
  const allFiles = fs.readdirSync(uploadsDir);

  console.log(`Analyzing ${products.length} products with strict matching...`);

  const bulkOps = [];
  let updatedExactCount = 0;
  let clearedMismatchCount = 0;

  for (const p of products) {
    const slug = (p.slug || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    const currentImg = p.images?.[0]?.url || '';

    let matchedFile = null;

    // Check exact mappings first
    if (EXACT_MAPPINGS[slug]) {
      matchedFile = EXACT_MAPPINGS[slug];
    } else {
      // Check if current image is a known mismatched generic file
      const isAdBanner = currentImg.includes(AD_BANNER);
      const isGenericMpgkOnNonMpgk = currentImg.includes(GENERIC_MPGK) && !title.includes('madhya pradesh general knowledge') && !title.includes('mp gk');
      const isElecEngOnNonElec = currentImg.includes(ELEC_ENG) && !title.includes('electrical engineering');

      if (isAdBanner || isGenericMpgkOnNonMpgk || isElecEngOnNonElec) {
        // Clear mismatched image so it won't show wrong book covers
        bulkOps.push({
          updateOne: {
            filter: { _id: p._id },
            update: { $set: { images: [] } }
          }
        });
        clearedMismatchCount++;
        continue;
      }
    }

    if (matchedFile) {
      const fullUrl = `https://subhamapi.hypernxt.space/uploads/products/${matchedFile}`;
      const baseName = matchedFile.replace(/\.webp$/i, '');
      const cardFile = `${baseName}-card.webp`;
      const thumbFile = `${baseName}-thumb.webp`;

      const cardUrl = allFiles.includes(cardFile)
        ? `https://subhamapi.hypernxt.space/uploads/products/${cardFile}`
        : fullUrl;

      const thumbUrl = allFiles.includes(thumbFile)
        ? `https://subhamapi.hypernxt.space/uploads/products/${thumbFile}`
        : fullUrl;

      bulkOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: {
            $set: {
              images: [{
                url: fullUrl,
                cardUrl: cardUrl,
                thumbUrl: thumbUrl,
                alt: p.title,
                source: 'upload'
              }]
            }
          }
        }
      });
      updatedExactCount++;
    }
  }

  if (bulkOps.length > 0) {
    console.log(`Executing bulkWrite for ${bulkOps.length} products...`);
    const res = await Product.bulkWrite(bulkOps);
    console.log('bulkWrite complete:', res);
  }

  console.log(`\n=== STRICT RESULTS ===`);
  console.log(`Exact High-Confidence Images Set: ${updatedExactCount}`);
  console.log(`Mismatched/Generic Wrong Covers Cleared: ${clearedMismatchCount}`);

  process.exit(0);
}

fixImagesStrictNoMismatches().catch(console.error);
