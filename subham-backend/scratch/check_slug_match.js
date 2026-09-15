const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');

async function checkSlugImageMatch() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({}).lean();

  const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
  const localFiles = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
  const fileSet = new Set(localFiles.map(f => f.toLowerCase()));

  console.log(`Total Products: ${products.length}`);
  console.log(`Total Files in uploads/products: ${localFiles.length}`);

  let matchedBySlug = 0;
  let matchedByTitleSlug = 0;
  let noMatch = 0;

  for (const p of products) {
    const slug = (p.slug || '').toLowerCase().trim();
    if (!slug) continue;

    // Check potential image filenames for this product:
    // 1. <slug>.webp
    // 2. <slug>-full.webp
    // 3. <slug>-1.webp
    // 4. <slug>-card.webp
    const possibleNames = [
      `${slug}.webp`,
      `${slug}-full.webp`,
      `${slug}-1.webp`,
      `${slug}-card.webp`
    ];

    let found = possibleNames.find(name => fileSet.has(name));

    if (found) {
      matchedBySlug++;
    } else {
      noMatch++;
    }
  }

  console.log(`\nDirect Slug -> Upload File Match Count: ${matchedBySlug}`);
  console.log(`No Direct Slug File Match Count: ${noMatch}`);

  process.exit(0);
}

checkSlugImageMatch().catch(console.error);
