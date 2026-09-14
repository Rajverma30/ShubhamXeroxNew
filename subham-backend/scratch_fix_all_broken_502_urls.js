require('dotenv').config();
const mongoose = require('mongoose');

// Register schemas
const Category = require('./src/models/Category');
const SubCategory = require('./src/models/SubCategory');
const Product = require('./src/models/Product');
const Banner = require('./src/models/Banner');
const Media = require('./src/models/Media');

const RELIABLE_BOOK_COVERS = [
  {
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&auto=format&fit=crop&q=80',
  },
  {
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80',
  },
  {
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&auto=format&fit=crop&q=80',
  },
  {
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&auto=format&fit=crop&q=80',
  },
  {
    url: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=1200&auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=200&auto=format&fit=crop&q=80',
  },
  {
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&auto=format&fit=crop&q=80',
  },
  {
    url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format&fit=crop&q=80',
    cardUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=200&auto=format&fit=crop&q=80',
  }
];

async function fixAllBroken502Urls() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected!');

  const products = await Product.find({}).lean();
  let fixedProductsCount = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    let needsFix = false;

    if (!p.images || p.images.length === 0) {
      needsFix = true;
    } else {
      const hasBrokenDomain = p.images.some(img => 
        (img.url && img.url.includes('subhamapi.hypernxt.space')) ||
        (img.cardUrl && img.cardUrl.includes('subhamapi.hypernxt.space')) ||
        (img.thumbUrl && img.thumbUrl.includes('subhamapi.hypernxt.space'))
      );
      if (hasBrokenDomain) needsFix = true;
    }

    if (needsFix) {
      const cover = RELIABLE_BOOK_COVERS[i % RELIABLE_BOOK_COVERS.length];
      const newImages = [
        {
          url: cover.url,
          cardUrl: cover.cardUrl,
          thumbUrl: cover.thumbUrl,
          alt: p.title,
          source: 'upload',
        }
      ];
      await Product.updateOne({ _id: p._id }, { $set: { images: newImages } });
      fixedProductsCount++;
      console.log(`[${fixedProductsCount}] Fixed image for product: ${p.title}`);
    }
  }

  console.log(`\n🎉 Successfully fixed broken image URLs for ${fixedProductsCount} out of ${products.length} products!`);
  await mongoose.disconnect();
}

fixAllBroken502Urls().catch(err => {
  console.error('Error fixing broken 502 URLs:', err);
  process.exit(1);
});
