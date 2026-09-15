const mongoose = require('mongoose');
const path = require('path');

const DB1_URI = "mongodb+srv://shubhamxerox25_db_user:qAEAS6MTppUzQqUG@cluster0.08smhkb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=Cluster0";
const DB2_URI = "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";

async function restoreDatabaseImages(uri, name) {
  console.log(`\n==================================================`);
  console.log(`RESTORING ORIGINAL SUBHAMAPI IMAGES ON ${name}...`);
  console.log(`==================================================`);

  const conn = await mongoose.createConnection(uri).asPromise();
  const Product = conn.model('Product', new mongoose.Schema({}, { strict: false }));
  const products = await Product.find({}).lean();

  console.log(`Processing ${products.length} products on ${name}...`);

  const bulkOps = [];
  let restoredCount = 0;

  for (const p of products) {
    let imagesToSet = [];

    // If p has existing images or oldSlugs/history
    if (p.images && p.images.length > 0) {
      imagesToSet = p.images.map(img => {
        let rawUrl = img.url || img.cardUrl || img.thumbUrl || '';
        if (!rawUrl) return img;

        // Clean filename extraction
        let filename = rawUrl.split('/uploads/').pop();
        if (filename.startsWith('products/')) {
          filename = filename.replace(/^products\//, '');
        }

        // Standardize subhamapi URL to include /uploads/products/
        const cleanUrl = `https://subhamapi.hypernxt.space/uploads/products/${filename}`;
        return {
          url: cleanUrl,
          cardUrl: cleanUrl,
          thumbUrl: cleanUrl,
          alt: img.alt || p.title,
          source: img.source || 'upload'
        };
      });
    }

    if (imagesToSet.length > 0) {
      bulkOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { images: imagesToSet } }
        }
      });
      restoredCount++;
    }
  }

  if (bulkOps.length > 0) {
    console.log(`Executing bulkWrite to restore ${bulkOps.length} products on ${name}...`);
    const res = await Product.bulkWrite(bulkOps);
    console.log(`bulkWrite complete for ${name}:`, res);
  }

  console.log(`Restored original subhamapi images for ${restoredCount} products on ${name}.`);
  await conn.close();
}

async function run() {
  await restoreDatabaseImages(DB1_URI, 'DB 1 (cluster0.08smhkb.mongodb.net)');
  await restoreDatabaseImages(DB2_URI, 'DB 2 (salon.ovdjb.mongodb.net - LIVE SERVER DB)');

  process.exit(0);
}

run().catch(console.error);
