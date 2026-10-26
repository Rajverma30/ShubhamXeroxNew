const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
dotenv.config();

async function getNext100() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  // Already optimized 30 books slugs:
  const done30 = [
    // Phase 1 (1-15)
    'parikshadham-samanya-prabandhan-book-hindi',
    'punekar-mpesb-mpsi-solved-papers-book',
    'exampedia-mpesb-samanya-prabandhan-book',
    'punekar-mpesb-group-2-sub-group-4-notes',
    'indian-geography-spiral-notes-shubham-gupta-english',
    'indian-geography-spiral-notes-shubham-gupta-english-2',
    'general-science-2000-objective-book-dev-yadav',
    'modern-indian-history-shubham-gupta-hindi',
    'punekar-mpesb-patwari-solved-papers-book',
    'madhya-pradesh-parikshadham-mpgk-5th-edition-book',
    'exampedia-mppsc-pyqs-gs-paper-1-solved-book',
    'ancient-indian-history-shubham-gupta-hindi',
    'indian-geography-spiral-notes-shubham-gupta-hindi',
    'computer-parikshadham-praveen-sahu-book',
    'modern-indian-history-shubham-gupta-english',
    'indian-polity-laxmikanth-8th-edition-hindi',
    // Phase 2 (16-30)
    'ctet-paper-2-social-science-sachin-choudhary',
    'drishti-ias-mppsc-prelims-science-technology-environment-health-hindi',
    'drishti-ias-mppsc-prelims-geography-india-madhya-pradesh-hindi',
    'drishti-ias-mppsc-prelims-itihas-sanskriti-sahitya-hindi',
    'edu-teria-current-affairs-mcqs-power-book-hindi',
    'pw-neet-pyq-39-years-physics-2027-english',
    'exampedia-mp-current-affairs-yearly-book-2026-hindi',
    'selection-tak-mpgs-2027-english-edition-book',
    'geography-marathon-topicwise-solved-pyqs-suraj-solanki-hindi',
    'disha-madhya-pradesh-general-knowledge-2nd-edition',
    'selection-tak-mpgk-4th-edition-2026-hindi',
    'pratiyogita-ghatna-chakra-mp-current-affairs-2026-hindi',
    'nirman-ias-mppsc-prelims-unit-7-science-environment-english',
    'mrunals-economy-upsc-prelims-pcb15-set-of-5',
    'drishti-ias-mppsc-prelims-polity-constitution-hindi'
  ];

  const query = {
    slug: { $nin: done30 },
    isActive: true,
    isHidden: false
  };

  const prods = await Product.find(query)
    .sort({
      isBestSeller: -1,
      isTrending: -1,
      isFeatured: -1,
      ordersCount: -1,
      views: -1,
      createdAt: -1
    })
    .limit(100)
    .select('title slug author publisher categoryName subCategoryName price finalPrice mrp language edition seo images shortDescription description tags')
    .lean();

  console.log('Total fetched:', prods.length);

  fs.writeFileSync(path.resolve(__dirname, 'next_100_raw.json'), JSON.stringify(prods, null, 2), 'utf8');
  console.log('Saved 100 books to next_100_raw.json');

  await mongoose.disconnect();
}

getNext100().catch(console.error);
