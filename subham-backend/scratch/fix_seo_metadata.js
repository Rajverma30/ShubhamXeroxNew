const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB for SEO Metadata optimization...');
  const Product = require('../src/models/Product');

  const products = await Product.find({ isActive: true });
  console.log(`Found ${products.length} products to audit and optimize.`);

  let updatedCount = 0;

  for (const p of products) {
    let changed = false;

    // Ensure stock meets schema minimum floor of 3
    if (p.type !== 'ebook' && (p.stock === undefined || p.stock === null || p.stock < 3)) {
      p.stock = 3;
      changed = true;
    }

    // 1. Generate shortDescription if missing or empty
    if (!p.shortDescription || p.shortDescription.trim().length < 10) {
      const priceText = `₹${p.finalPrice || p.price}`;
      const authorText = p.author ? ` by ${p.author}` : (p.publisher ? ` by ${p.publisher}` : '');
      const catText = p.categoryName || 'Competitive Exam Books';

      let text = '';
      if (p.type === 'stationery') {
        text = `Buy ${p.title} online at ${priceText} from Shubham Xerox Indore. High quality stationery for school and office.`;
      } else {
        text = `Buy ${p.title}${authorText} online at ${priceText} from Shubham Xerox Indore. Study guide for ${catText}. Fast delivery.`;
      }
      p.shortDescription = text.slice(0, 315);
      changed = true;
    } else if (p.shortDescription.length > 320) {
      p.shortDescription = p.shortDescription.slice(0, 315);
      changed = true;
    }

    // 2. Ensure SEO object exists and has metaTitle / metaDescription
    if (!p.seo) p.seo = {};

    if (!p.seo.metaTitle || p.seo.metaTitle.trim().length < 5) {
      const priceText = `₹${p.finalPrice || p.price}`;
      p.seo.metaTitle = `${p.title.slice(0, 100)} (${priceText}) | Shubham Xerox`.slice(0, 160);
      changed = true;
    }

    if (!p.seo.metaDescription || p.seo.metaDescription.trim().length < 10) {
      p.seo.metaDescription = p.shortDescription.slice(0, 315);
      changed = true;
    }

    // 3. Generate relevant keywords array
    const kwSet = new Set(['Shubham Xerox', 'Subham Xerox', 'Shubham Xerox Indore']);
    if (p.author) kwSet.add(p.author);
    if (p.publisher) kwSet.add(p.publisher);
    if (p.categoryName) kwSet.add(p.categoryName);
    if (/mppsc/i.test(p.title)) {
      kwSet.add('MPPSC books');
      kwSet.add('MPPSC Mains books');
      kwSet.add('MPPSC study material');
    }
    if (/mpesb|vyapam|patwari|police/i.test(p.title)) {
      kwSet.add('MPESB books');
      kwSet.add('Vyapam books');
      kwSet.add('MP Patwari books');
    }
    if (/speedy|current affairs/i.test(p.title)) {
      kwSet.add('Speedy current affairs');
      kwSet.add('Current affairs book Hindi');
    }
    if (/ghatna chakra/i.test(p.title)) {
      kwSet.add('Ghatna Chakra book');
      kwSet.add('Ghatna Chakra Purvavlokan');
    }

    p.seo.metaKeywords = Array.from(kwSet);

    if (changed) {
      await p.save();
      updatedCount++;
    }
  }

  console.log(`✅ Successfully updated SEO metadata for ${updatedCount} products.`);
  process.exit(0);
}).catch((err) => {
  console.error('Error optimizing metadata:', err);
  process.exit(1);
});
