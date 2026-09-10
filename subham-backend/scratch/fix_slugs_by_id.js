const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

async function run() {
  await mongoose.connect(MONGO_URI);

  const updates = [
    { id: '6a8172b4a34317063af19db1', slug: 'parikshadham-samanya-prabandhan-book-hindi' },
    { id: '6a85f838a34317063af2cd24', slug: 'punekar-mpesb-mpsi-solved-papers-book' },
    { id: '6a804eb4bb698131eb058d83', slug: 'exampedia-mpesb-samanya-prabandhan-book' },
    { id: '6a81577fa34317063af198db', slug: 'punekar-mpesb-group-2-sub-group-4-notes' },
    { id: '6a7f10e8bb698131eb051c5b', slug: 'indian-geography-spiral-notes-shubham-gupta-english' },
    { id: '6a87c12616ffd6c95361fe15', slug: 'general-science-2000-objective-book-dev-yadav' },
    { id: '6a7f10e7bb698131eb051c20', slug: 'modern-indian-history-shubham-gupta-hindi' },
    { id: '6a815c66a34317063af19958', slug: 'punekar-mpesb-patwari-solved-papers-book' },
    { id: '6a7f10e7bb698131eb051c27', slug: 'madhya-pradesh-parikshadham-mpgk-5th-edition-book' },
    { id: '6a8553dfa34317063af2a906', slug: 'exampedia-mppsc-pyqs-gs-paper-1-solved-book' },
    { id: '6a7f10f3bb698131eb051e39', slug: 'ancient-indian-history-shubham-gupta-hindi' },
    { id: '6a7f10e9bb698131eb051c7b', slug: 'indian-geography-spiral-notes-shubham-gupta-hindi' },
    { id: '6a7f10dfbb698131eb051acf', slug: 'computer-parikshadham-praveen-sahu-book' },
    { id: '6a7f10e6bb698131eb051bff', slug: 'modern-indian-history-shubham-gupta-english' },
    { id: '6a7f10ffbb698131eb052046', slug: 'indian-polity-laxmikanth-8th-edition-hindi' }
  ];

  for (let i = 0; i < updates.length; i++) {
    const item = updates[i];
    const p = await Product.findById(item.id).lean();
    if (!p) {
      console.log(`[#${i + 1}] ID ${item.id} not found.`);
      continue;
    }

    const oldSlugs = p.oldSlugs || [];
    if (p.slug !== item.slug && !oldSlugs.includes(p.slug)) {
      oldSlugs.push(p.slug);
    }

    await Product.findByIdAndUpdate(item.id, { $set: { slug: item.slug, oldSlugs: oldSlugs } });
    console.log(`✅ [#${i + 1}/15] Slug: ${item.slug}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
