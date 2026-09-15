const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const DB1_URI = "mongodb+srv://shubhamxerox25_db_user:qAEAS6MTppUzQqUG@cluster0.08smhkb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=Cluster0";
const DB2_URI = "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";

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

async function cleanDatabase(uri, name) {
  console.log(`\n==================================================`);
  console.log(`CLEANING ${name} (${uri.split('@')[1].split('/')[0]})...`);
  console.log(`==================================================`);

  const conn = await mongoose.createConnection(uri).asPromise();
  const Product = conn.model('Product', new mongoose.Schema({}, { strict: false }));
  const products = await Product.find({}).lean();

  const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
  const allFiles = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];

  console.log(`Total Products in ${name}: ${products.length}`);

  const bulkOps = [];
  let exactMatched = 0;
  let clearedMismatched = 0;

  for (const p of products) {
    const slug = (p.slug || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    const currentImg = p.images?.[0]?.url || '';

    let matchedFile = null;

    if (EXACT_MAPPINGS[slug]) {
      matchedFile = EXACT_MAPPINGS[slug];
    }

    const isAdBanner = currentImg.includes(AD_BANNER);
    const isGenericMpgkOnNonMpgk = currentImg.includes(GENERIC_MPGK) && !title.includes('madhya pradesh general knowledge') && !title.includes('mp gk');
    const isElecEngOnNonElec = currentImg.includes(ELEC_ENG) && !title.includes('electrical engineering');
    const isDevScienceOnNonScience = currentImg.includes('e-book-science-by-dev-sir') && !title.includes('science') && !title.includes('vigyan');
    const isKarmaTestOnNonKarma = (currentImg.includes('karma-ias') || currentImg.includes('mains-test')) && !title.includes('karma') && !title.includes('test series');

    if (isAdBanner || isGenericMpgkOnNonMpgk || isElecEngOnNonElec || isDevScienceOnNonScience || isKarmaTestOnNonKarma) {
      if (!matchedFile) {
        bulkOps.push({
          updateOne: {
            filter: { _id: p._id },
            update: { $set: { images: [] } }
          }
        });
        clearedMismatched++;
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
      exactMatched++;
    }
  }

  if (bulkOps.length > 0) {
    console.log(`Executing bulkWrite for ${bulkOps.length} products on ${name}...`);
    const res = await Product.bulkWrite(bulkOps);
    console.log(`bulkWrite result for ${name}:`, res);
  }

  console.log(`Exact Images Set: ${exactMatched}`);
  console.log(`Mismatched/Generic Images Cleared: ${clearedMismatched}`);

  await conn.close();
}

async function run() {
  await cleanDatabase(DB1_URI, 'DB 1 (cluster0.08smhkb.mongodb.net)');
  await cleanDatabase(DB2_URI, 'DB 2 (salon.ovdjb.mongodb.net - LIVE SERVER DB)');

  // Also update MONGO_URI in subham-backend/.env so local env uses DB 2 (live DB)
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(
      /MONGO_URI=".*?"/,
      `MONGO_URI="${DB2_URI}"`
    );
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('\nUpdated subham-backend/.env MONGO_URI to live database (salon.ovdjb.mongodb.net)');
  }

  process.exit(0);
}

run().catch(console.error);
