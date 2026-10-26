const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
dotenv.config();

const processedPath = path.resolve(__dirname, 'next_100_processed.json');
const allBooks = JSON.parse(fs.readFileSync(processedPath, 'utf8'));
const batch3 = allBooks.slice(0, 15); // Books 31 to 45

function sanitizeOldSlugs(rawList, currentSlug, fallbackOldSlug) {
  const result = new Set();
  const extractClean = (item) => {
    if (!item) return;
    if (Array.isArray(item)) {
      item.forEach(extractClean);
      return;
    }
    let s = String(item).trim();
    while (s.startsWith('[') || s.startsWith('"') || s.startsWith("'") || s.startsWith('\\')) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) {
          parsed.forEach(extractClean);
          return;
        }
        s = String(parsed).trim();
      } catch {
        s = s.replace(/^[\[\]"'\\]+|[\[\]"'\\]+$/g, '').trim();
      }
    }
    s = s.replace(/^[\[\]"'\\]+|[\[\]"'\\]+$/g, '').trim();
    if (s && s.length > 2 && s !== '[]' && s !== '["[]"]' && s !== currentSlug) {
      result.add(s);
    }
  };

  if (Array.isArray(rawList)) rawList.forEach(extractClean);
  if (fallbackOldSlug && fallbackOldSlug !== currentSlug) result.add(fallbackOldSlug);
  return [...result];
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  console.log(`Starting Phase 3 (Books 31 to 45) Migration... Total books: ${batch3.length}`);

  const auditLog = [];

  for (const b of batch3) {
    let doc = await Product.findOne({ $or: [{ _id: b.id }, { slug: b.currentSlug }, { slug: b.newSlug }] });
    if (!doc) {
      console.error(`[ERROR] Book ${b.num} not found in DB!`);
      continue;
    }

    const beforeState = {
      num: b.num,
      title: doc.title,
      publisher: b.publisher,
      author: b.author,
      category: b.category,
      language: b.language,
      price: doc.finalPrice || doc.price,
      slug: doc.slug,
      canonicalUrl: `https://shubhamxerox.in/product/${doc.slug}`,
      metaTitle: doc.seo?.metaTitle || 'Default Title (Not Set)',
      metaDescription: doc.seo?.metaDescription || 'Default Short Description',
      metaKeywords: doc.seo?.metaKeywords || [],
      imageAlt: doc.images?.[0]?.alt || 'Undefined / Missing',
      hasImage: Boolean(doc.images && doc.images.length > 0)
    };

    const previousSlug = doc.slug;
    const cleanOldSlugs = sanitizeOldSlugs(doc.oldSlugs, b.newSlug, previousSlug);
    if (previousSlug && previousSlug !== b.newSlug && !cleanOldSlugs.includes(previousSlug)) {
      cleanOldSlugs.push(previousSlug);
    }

    const updatedImages = (doc.images || []).map((img, idx) => ({
      ...img,
      alt: idx === 0 ? b.imageAlt : `${b.imageAlt} - View ${idx + 1}`
    }));

    const updatedSeo = {
      ...(doc.seo || {}),
      metaTitle: b.metaTitle,
      metaDescription: b.metaDesc,
      metaKeywords: b.keywords,
      noIndex: false
    };

    await Product.updateOne(
      { _id: doc._id },
      {
        $set: {
          slug: b.newSlug,
          oldSlugs: cleanOldSlugs,
          seo: updatedSeo,
          images: updatedImages
        }
      }
    );

    const afterState = {
      slug: b.newSlug,
      canonicalUrl: `https://shubhamxerox.in/product/${b.newSlug}`,
      metaTitle: b.metaTitle,
      metaDescription: b.metaDesc,
      metaKeywords: b.keywords,
      imageAlt: b.imageAlt,
      oldSlugs: cleanOldSlugs,
      redirectStatus: '301 Permanent Redirect Active'
    };

    console.log(`✅ [UPDATED] Book ${b.num}: "${b.originalTitle.slice(0, 45)}..."`);
    console.log(`   Old Slug: ${previousSlug}`);
    console.log(`   New Canonical Slug: ${b.newSlug}`);
    console.log(`   Meta Title: ${b.metaTitle}`);

    auditLog.push({
      num: b.num,
      title: b.originalTitle,
      publisher: b.publisher,
      author: b.author,
      category: b.category,
      language: b.language,
      price: b.price,
      before: beforeState,
      after: afterState
    });
  }

  fs.writeFileSync(path.resolve(__dirname, 'batch_31_45_audit.json'), JSON.stringify(auditLog, null, 2), 'utf8');
  console.log(`Audit saved to batch_31_45_audit.json with ${auditLog.length} books.`);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
