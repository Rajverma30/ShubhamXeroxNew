require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const SubCategory = require('./src/models/SubCategory');
const Product = require('./src/models/Product');

// Curated high-resolution book cover artwork pools
const COVERS = {
  coachingNotes: [
    {
      url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&auto=format&fit=crop&q=80',
      cardUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&auto=format&fit=crop&q=80',
    },
    {
      url: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=1200&auto=format&fit=crop&q=80',
      cardUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=200&auto=format&fit=crop&q=80',
    }
  ],
  examBooks: [
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
      url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&auto=format&fit=crop&q=80',
      cardUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&auto=format&fit=crop&q=80',
    }
  ],
  testSeries: [
    {
      url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80',
      cardUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&auto=format&fit=crop&q=80',
    }
  ],
  general: [
    {
      url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format&fit=crop&q=80',
      cardUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=200&auto=format&fit=crop&q=80',
    }
  ]
};

async function fixMissingImages() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected!');

  const products = await Product.find({}).populate('category');
  let updatedCount = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p.images || p.images.length === 0) {
      const catName = (p.category?.name || '').toLowerCase();
      const title = (p.title || '').toLowerCase();

      let pool = COVERS.examBooks;
      if (catName.includes('coaching') || catName.includes('spiral') || title.includes('notes') || title.includes('spiral')) {
        pool = COVERS.coachingNotes;
      } else if (catName.includes('test series') || title.includes('test series') || title.includes('paper')) {
        pool = COVERS.testSeries;
      } else if (catName.includes('general')) {
        pool = COVERS.general;
      }

      const cover = pool[updatedCount % pool.length];

      p.images = [
        {
          url: cover.url,
          cardUrl: cover.cardUrl,
          thumbUrl: cover.thumbUrl,
          alt: p.title,
          source: 'upload',
        }
      ];

      await p.save();
      updatedCount++;
      console.log(`[${updatedCount}] Assigned image to: ${p.title}`);
    }
  }

  console.log(`\n🎉 Successfully fixed and restored images for ${updatedCount} products!`);
  await mongoose.disconnect();
}

fixMissingImages().catch(err => {
  console.error('Error fixing images:', err);
  process.exit(1);
});
