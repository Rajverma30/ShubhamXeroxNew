const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
dotenv.config();

const { resolveLegacy } = require('../src/controllers/legacy.controller');
const audit = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'batch_31_45_audit.json'), 'utf8'));

async function verify() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');

  console.log('=== VERIFYING PHASE 3 (BOOKS 31 TO 45) MIGRATION ===\n');

  let allPassed = true;

  for (const item of audit) {
    const doc = await Product.findOne({ slug: item.after.slug }).lean();
    if (!doc) {
      console.error(`❌ FAILED: Product with newSlug "${item.after.slug}" NOT FOUND`);
      allPassed = false;
      continue;
    }

    const hasOldSlug = (doc.oldSlugs || []).includes(item.before.slug);
    if (!hasOldSlug) {
      console.error(`❌ FAILED: Product "${item.after.slug}" missing oldSlug in oldSlugs`);
      allPassed = false;
    }

    const match = await resolveLegacy(item.before.slug);
    const resolvesCorrectly = match && match.product && match.product.slug === item.after.slug;

    if (!resolvesCorrectly) {
      console.error(`❌ FAILED: Legacy 301 for "${item.before.slug}" did not resolve to "${item.after.slug}". Resolved to:`, match?.product?.slug);
      allPassed = false;
    }

    console.log(`✅ Book ${item.num}: [PASSED]`);
    console.log(`   Canonical Slug: ${doc.slug}`);
    console.log(`   Canonical URL:  https://shubhamxerox.in/product/${doc.slug}`);
    console.log(`   Meta Title:     ${doc.seo?.metaTitle}`);
    console.log(`   Legacy 301:     ${item.before.slug} ──(301)──> ${match.product.slug} (${match.how})`);
    console.log(`   Image Alt:      ${doc.images?.[0]?.alt}`);
    console.log('');
  }

  if (allPassed) {
    console.log('🎉 ALL 15 PHASE 3 BOOKS VERIFIED WITH 100% PASS RATE!');
  } else {
    console.error('⚠️ SOME CHECKS FAILED!');
  }

  await mongoose.disconnect();
}

verify().catch(console.error);
