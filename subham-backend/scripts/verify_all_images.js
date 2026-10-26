const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
dotenv.config();

const all45Slugs = [
  // Phase 1 (1-15)
  'parikshadham-samanya-prabandhan-book-hindi',
  'punekar-mpesb-mpsi-solved-papers-book',
  'exampedia-mpesb-samanya-prabandhan-book',
  'punekar-mpesb-group-2-sub-group-4-notes',
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
  'drishti-ias-mppsc-prelims-polity-constitution-hindi',

  // Phase 3 (31-45)
  'parikshadham-mpgk-2027-first-edition-parikshadham',
  'aakar-ias-mppsc-prelims',
  'tathya-ban-madhya-pradesh-current-affairs',
  'parikshadham-static-gk-book-2nd-edition-samanya',
  'parmar-ssc-fatman-hindi-gk-gs-theory-book-2nd',
  'sharma-classes-madhya-pradesh-samanya-gyan-book',
  'madhya-pradesh-current-affairs-year-book-2026',
  'punekar-mp-police-constable-exam-notes-hindi',
  'mppsc-pyqs-paper-1-part-a-samanya-adhyayan-36',
  'exampedia-madhya-pradesh-current-affairs-yearbook',
  'champion-square-sociology-mppsc-mains-paper-2',
  'utkarsh-classes-current-affairs-quarterly-book-01',
  'samanya-prabandhan-general-management',
  'selection-tak-mpgk-4rd-edition-madhya-pradesh',
  'karma-ias-assistant-professor-test-series-2025'
];

// Helper to check HTTP status of an image URL
function checkHttpUrl(url) {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return resolve({ ok: false, status: 0, reason: 'Invalid or non-http url' });
    }
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
    });
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Timeout' }); });
    req.end();
  });
}

async function verifyImages() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  console.log(`=== AUDITING IMAGES FOR ALL 45 OPTIMIZED BOOKS ===\n`);

  const report = [];

  for (let i = 0; i < all45Slugs.length; i++) {
    const slug = all45Slugs[i];
    const num = i + 1;
    const doc = await Product.findOne({ slug }).lean();

    if (!doc) {
      console.error(`❌ [BOOK ${num}] NOT FOUND by slug: ${slug}`);
      report.push({ num, slug, status: 'PRODUCT_NOT_FOUND' });
      continue;
    }

    const imgs = doc.images || [];
    const count = imgs.length;

    if (count === 0) {
      console.log(`⚠️  [BOOK ${num}] No images attached (images: []) | Title: "${doc.title.slice(0, 50)}..."`);
      report.push({
        num,
        slug,
        title: doc.title,
        status: 'EMPTY_IMAGES',
        count: 0
      });
      continue;
    }

    const firstImg = imgs[0];
    const imgUrl = firstImg.url || firstImg.cardUrl || firstImg.thumbUrl || '';

    // Check local disk if it's stored in uploads/
    let localExists = null;
    if (imgUrl.includes('/uploads/')) {
      const relPath = imgUrl.split('/uploads/')[1];
      const localFile = path.resolve(__dirname, '../uploads', relPath);
      localExists = fs.existsSync(localFile);
    }

    // Check remote HTTP
    const httpRes = await checkHttpUrl(imgUrl);

    console.log(`✅ [BOOK ${num}] "${doc.title.slice(0, 40)}..."`);
    console.log(`   Image Count: ${count}`);
    console.log(`   URL: ${imgUrl}`);
    console.log(`   Alt Tag: "${firstImg.alt}"`);
    console.log(`   HTTP Status: ${httpRes.status} (ok: ${httpRes.ok}) | Local Disk: ${localExists !== null ? localExists : 'N/A'}`);
    console.log('');

    report.push({
      num,
      slug,
      title: doc.title,
      status: 'OK',
      count,
      url: imgUrl,
      alt: firstImg.alt,
      httpOk: httpRes.ok,
      httpStatus: httpRes.status,
      localExists
    });
  }

  const okCount = report.filter(r => r.status === 'OK' && r.httpOk).length;
  const emptyCount = report.filter(r => r.status === 'EMPTY_IMAGES').length;
  const brokenCount = report.filter(r => r.status === 'OK' && !r.httpOk).length;

  console.log('=== SUMMARY AUDIT RESULTS ===');
  console.log(`Total Books Checked: ${report.length}`);
  console.log(`✅ Images 100% OK & Loading (HTTP 200): ${okCount}`);
  console.log(`⚠️  Missing Cover Images (Catalog Had No Image): ${emptyCount}`);
  console.log(`❌ Broken Image URLs: ${brokenCount}`);

  fs.writeFileSync(path.resolve(__dirname, 'images_audit_result.json'), JSON.stringify(report, null, 2), 'utf8');

  await mongoose.disconnect();
}

verifyImages().catch(console.error);
