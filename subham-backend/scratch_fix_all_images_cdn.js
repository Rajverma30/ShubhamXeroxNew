require('dotenv').config();
const mongoose = require('mongoose');
const Banner = require('./src/models/Banner');
const Category = require('./src/models/Category');
const SubCategory = require('./src/models/SubCategory');

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected!');

  // 1. Reliable High-Res CDN images for Hero Banners
  console.log('Updating Banners with reliable CDN artwork...');
  const banners = await Banner.find({ placement: 'hero' });
  for (const b of banners) {
    if (b.title.includes('exam guide') || b.eyebrow.includes('session')) {
      b.image = { url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&auto=format&fit=crop&q=80' };
      b.tabletImage = b.image;
      b.mobileImage = b.image;
    } else if (b.title.includes('Class 1 to 12') || b.eyebrow.includes('school')) {
      b.image = { url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&auto=format&fit=crop&q=80' };
      b.tabletImage = b.image;
      b.mobileImage = b.image;
    } else if (b.title.includes('Stationery') || b.eyebrow.includes('Desk')) {
      b.image = { url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1600&auto=format&fit=crop&q=80' };
      b.tabletImage = b.image;
      b.mobileImage = b.image;
    }
    await b.save();
    console.log(`Updated banner: "${b.title}"`);
  }

  // 2. Reliable High-Res CDN images for Categories
  console.log('Updating Categories with reliable CDN artwork...');
  const catImageMap = {
    'test-series': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    'engineering': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    'xerox-spiral-copies': 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
    'coaching-notes': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
    'competitive-exam-books': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
    'exam-books': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80',
    'school-books': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80',
    'stationery': 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80',
  };

  const categories = await Category.find({});
  for (const cat of categories) {
    const slug = cat.slug;
    let url = catImageMap[slug];
    if (!url) {
      const name = cat.name.toLowerCase();
      if (name.includes('exam')) url = catImageMap['exam-books'];
      else if (name.includes('stationery')) url = catImageMap['stationery'];
      else if (name.includes('school')) url = catImageMap['school-books'];
      else if (name.includes('engineering')) url = catImageMap['engineering'];
      else if (name.includes('xerox') || name.includes('spiral')) url = catImageMap['xerox-spiral-copies'];
      else url = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80';
    }
    cat.image = { url };
    await cat.save();
    console.log(`Updated category "${cat.name}" -> ${url}`);
  }

  // 3. Subcategories
  const subCats = await SubCategory.find({});
  for (const sub of subCats) {
    const name = sub.name.toLowerCase();
    let url = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80';
    if (name.includes('engineering') || name.includes('jee') || name.includes('iit')) {
      url = catImageMap['engineering'];
    } else if (name.includes('upsc') || name.includes('ssc') || name.includes('bank')) {
      url = catImageMap['competitive-exam-books'];
    } else if (name.includes('class') || name.includes('school') || name.includes('ncert')) {
      url = catImageMap['school-books'];
    } else if (name.includes('pen') || name.includes('notebook')) {
      url = catImageMap['stationery'];
    }
    sub.image = { url };
    await sub.save();
  }

  console.log('Finished updating all images to high-speed CDN URLs!');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
