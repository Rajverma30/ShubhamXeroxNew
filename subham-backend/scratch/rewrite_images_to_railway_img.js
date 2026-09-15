/**
 * Point every product image at Railway /img/... so the live storefront
 * does NOT rewrite them to subhamapi (it only rewrites paths containing "/uploads/").
 *
 *   node scratch/rewrite_images_to_railway_img.js          # dry-run
 *   node scratch/rewrite_images_to_railway_img.js --apply
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const APPLY = process.argv.includes('--apply');
const RAILWAY = 'https://shubhamxeroxnew-production.up.railway.app';

function toRailwayImg(url) {
  if (!url || typeof url !== 'string') return url;
  // Keep data/blob
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  let rel = '';
  if (url.includes('/uploads/')) rel = url.split('/uploads/')[1];
  else if (url.includes('/img/')) rel = url.split('/img/')[1];
  else if (url.startsWith('/uploads/')) rel = url.slice('/uploads/'.length);
  else if (url.startsWith('/img/')) rel = url.slice('/img/'.length);
  else return url;

  rel = String(rel || '').replace(/^\/+/, '');
  if (!rel) return url;
  return `${RAILWAY}/img/${rel}`;
}

function mapImages(images, title) {
  if (!Array.isArray(images) || images.length === 0) return images;
  return images.map((img) => {
    if (!img || typeof img === 'string') {
      const u = toRailwayImg(img);
      return typeof img === 'string' ? u : img;
    }
    const url = toRailwayImg(img.url || img.cardUrl || img.thumbUrl || '');
    return {
      ...img,
      url,
      cardUrl: toRailwayImg(img.cardUrl || img.url || '') || url,
      thumbUrl: toRailwayImg(img.thumbUrl || img.cardUrl || img.url || '') || url,
      alt: img.alt || title,
      source: img.source || 'upload',
    };
  });
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({});
  let changed = 0;
  const samples = [];

  for (const p of products) {
    const next = mapImages(p.images, p.title);
    const before = JSON.stringify(p.images || []);
    const after = JSON.stringify(next || []);
    if (before === after) continue;
    changed += 1;
    if (samples.length < 8) {
      samples.push({
        title: (p.title || '').slice(0, 45),
        from: (p.images?.[0]?.url || '').slice(0, 90),
        to: (next?.[0]?.url || '').slice(0, 90),
      });
    }
    if (APPLY) {
      await Product.updateOne({ _id: p._id }, { $set: { images: next } });
    }
  }

  console.log(APPLY ? 'APPLIED' : 'DRY-RUN');
  console.log({ total: products.length, changed });
  for (const s of samples) {
    console.log('-', s.title);
    console.log('  ', s.from);
    console.log(' →', s.to);
  }
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
