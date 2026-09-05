require('dotenv').config();
const mongoose = require('mongoose');
const Banner = require('./src/models/Banner');
const Category = require('./src/models/Category');
const SubCategory = require('./src/models/SubCategory');

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected!');

  const backendOrigin = (process.env.BACKEND_URL || 'http://localhost:5005').replace(/\/$/, '');

  // 1. Update Hero Banners
  console.log('Updating Banners...');
  const banners = await Banner.find({ placement: 'hero' });
  for (const b of banners) {
    if (b.title.includes('exam guide') || b.eyebrow.includes('session')) {
      b.image = { url: `${backendOrigin}/uploads/banners/banner_exam_books.jpg` };
      b.tabletImage = { url: `${backendOrigin}/uploads/banners/banner_exam_books.jpg` };
      b.mobileImage = { url: `${backendOrigin}/uploads/banners/banner_exam_books.jpg` };
      b.opacity = 0.5;
    } else if (b.title.includes('Class 1 to 12') || b.eyebrow.includes('school')) {
      b.image = { url: `${backendOrigin}/uploads/banners/banner_school_books.jpg` };
      b.tabletImage = { url: `${backendOrigin}/uploads/banners/banner_school_books.jpg` };
      b.mobileImage = { url: `${backendOrigin}/uploads/banners/banner_school_books.jpg` };
      b.opacity = 0.5;
    } else if (b.title.includes('Stationery') || b.eyebrow.includes('Desk')) {
      b.image = { url: `${backendOrigin}/uploads/banners/banner_stationery.jpg` };
      b.tabletImage = { url: `${backendOrigin}/uploads/banners/banner_stationery.jpg` };
      b.mobileImage = { url: `${backendOrigin}/uploads/banners/banner_stationery.jpg` };
      b.opacity = 0.5;
    }
    await b.save();
    console.log(`Updated banner: "${b.title}"`);
  }

  // 2. Update Categories
  console.log('Updating Categories...');
  const categories = await Category.find({});
  const catImages = {
    'exam-books': `${backendOrigin}/uploads/media/cat_exam_books.jpg`,
    'competitive-exam-books': `${backendOrigin}/uploads/media/cat_exam_books.jpg`,
    'engineering': `${backendOrigin}/uploads/media/cat_engineering.jpg`,
    'xerox-spiral-copies': `${backendOrigin}/uploads/media/cat_xerox_spiral.jpg`,
    'school-books': `${backendOrigin}/uploads/banners/banner_school_books.jpg`,
    'stationery': `${backendOrigin}/uploads/banners/banner_stationery.jpg`,
    'coaching-notes': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
    'test-series': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
  };

  for (const cat of categories) {
    const slug = cat.slug;
    let url = catImages[slug];
    if (!url) {
      if (cat.name.toLowerCase().includes('exam')) url = catImages['exam-books'];
      else if (cat.name.toLowerCase().includes('stationery')) url = catImages['stationery'];
      else if (cat.name.toLowerCase().includes('school')) url = catImages['school-books'];
      else url = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80';
    }

    cat.image = { url };
    await cat.save();
    console.log(`Updated category: "${cat.name}" -> ${url}`);
  }

  // 3. Update SubCategories
  console.log('Updating SubCategories...');
  const subCats = await SubCategory.find({});
  for (const sub of subCats) {
    if (!sub.image?.url) {
      const name = sub.name.toLowerCase();
      let url = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80';
      if (name.includes('upsc') || name.includes('ssc') || name.includes('bank') || name.includes('railway')) {
        url = `${backendOrigin}/uploads/media/cat_exam_books.jpg`;
      } else if (name.includes('pen') || name.includes('notebook') || name.includes('paper')) {
        url = `${backendOrigin}/uploads/banners/banner_stationery.jpg`;
      } else if (name.includes('class') || name.includes('school') || name.includes('ncert')) {
        url = `${backendOrigin}/uploads/banners/banner_school_books.jpg`;
      } else if (name.includes('engineering') || name.includes('iit') || name.includes('jee')) {
        url = `${backendOrigin}/uploads/media/cat_engineering.jpg`;
      }
      sub.image = { url };
      await sub.save();
    }
  }

  console.log('All banners and categories updated successfully!');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Error updating images:', err);
  process.exit(1);
});
