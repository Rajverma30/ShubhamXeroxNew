require('dotenv').config();
const mongoose = require('mongoose');

async function checkDomains() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const products = await Product.find({}).lean();

  const domains = new Map();
  let totalWithImages = 0;
  let totalWithoutImages = 0;

  products.forEach(p => {
    if (!p.images || p.images.length === 0) {
      totalWithoutImages++;
    } else {
      totalWithImages++;
      p.images.forEach(img => {
        const url = img.url || img.cardUrl || img.thumbUrl || '';
        try {
          const u = new URL(url);
          domains.set(u.hostname, (domains.get(u.hostname) || 0) + 1);
        } catch (e) {
          domains.set(url.substring(0, 30), (domains.get(url.substring(0, 30)) || 0) + 1);
        }
      });
    }
  });

  console.log('Total Products:', products.length);
  console.log('With Images:', totalWithImages);
  console.log('Without Images:', totalWithoutImages);
  console.log('Image Domains distribution:', Object.fromEntries(domains));

  mongoose.disconnect();
}

checkDomains().catch(console.error);
