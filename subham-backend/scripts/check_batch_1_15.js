const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const done15 = [
  'parikshadham-samanya-prabandhan-book-hindi',
  'punekar-mpesb-mpsi-solved-papers-book',
  'exampedia-mpesb-samanya-prabandhan-book',
  'punekar-mpesb-group-2-sub-group-4-notes',
  'indian-geography-spiral-notes-shubham-gupta-english',
  'general-science-2000-objective-book-dev-yadav',
  'modern-indian-history-shubham-gupta-hindi',
  'punekar-mpesb-patwari-solved-papers-book',
  'madhya-pradesh-parikshadham-mpgk-5th-edition-book',
  'exampedia-mppsc-pyqs-gs-paper-1-solved-book',
  'ancient-indian-history-shubham-gupta-hindi',
  'indian-geography-spiral-notes-shubham-gupta-hindi',
  'computer-parikshadham-praveen-sahu-book',
  'modern-indian-history-shubham-gupta-english',
  'indian-polity-laxmikanth-8th-edition-hindi'
];

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  console.log('=== AUDIT BATCH 1-15 ===');
  for (let i = 0; i < done15.length; i++) {
    const slug = done15[i];
    const p = await Product.findOne({ slug }).lean();
    if (p) {
      console.log(`${i+1}. [${p.slug}]`);
      console.log(`   oldSlugs:`, p.oldSlugs);
      console.log(`   metaTitle:`, p.seo?.metaTitle?.slice(0, 50));
    } else {
      console.log(`${i+1}. NOT FOUND: ${slug}`);
    }
  }
  await mongoose.disconnect();
}
check();
