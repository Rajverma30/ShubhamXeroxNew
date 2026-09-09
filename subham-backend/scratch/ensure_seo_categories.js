const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB to seed target SEO categories...');
  const Category = require('../src/models/Category');

  const seoCategories = [
    {
      name: 'MPPSC Books & Study Material',
      slug: 'mppsc-books',
      shortDescription: 'Buy MPPSC Mains, Prelims, Solved Papers, and Notes online at best price in Hindi and English medium.',
      description: 'Find the complete selection of MPPSC preparation books, notes, and study material at Shubham Xerox Indore.',
      order: 1,
      isActive: true,
      seo: {
        metaTitle: 'MPPSC Books & Study Material Online | Shubham Xerox',
        metaDescription: 'Buy MPPSC Mains books, Prelims guides, solved papers, and Hindi/English notes online from Shubham Xerox Indore.',
        metaKeywords: ['MPPSC books', 'MPPSC Mains notes', 'MPPSC study material', 'MPPSC prelims books'],
      },
    },
    {
      name: 'MPPSC Mains Books & Notes',
      slug: 'mppsc-mains-books',
      shortDescription: 'Comprehensive MPPSC Mains Paper 1 to Paper 6 preparation books, unit-wise notes, and answer writing guides.',
      description: 'Paper 1 to Paper 6 summary notes, previous year solved papers, and syllabus guides for MPPSC Mains examination.',
      order: 2,
      isActive: true,
      seo: {
        metaTitle: 'MPPSC Mains Books & Study Material | Shubham Xerox',
        metaDescription: 'Best MPPSC Mains books, summary notes, paper-wise guides in Hindi & English medium.',
        metaKeywords: ['MPPSC Mains books', 'mppsc mains notes', 'mppsc mains solved papers'],
      },
    },
    {
      name: 'MPESB & Vyapam Exam Books',
      slug: 'mpesb-books',
      shortDescription: 'Books and solved papers for MPESB, Vyapam, MP Patwari, MP Police Constable, MP SI, and Samvidha Shikshak.',
      description: 'Preparation books for MPESB and MP Vyapam competitive examinations available online with fast shipping.',
      order: 3,
      isActive: true,
      seo: {
        metaTitle: 'MPESB & Vyapam Books Online | Shubham Xerox',
        metaDescription: 'Buy MPESB preparation books, Patwari guides, MP Police solved papers online from Shubham Xerox.',
        metaKeywords: ['MPESB books', 'Vyapam books', 'MP Patwari books', 'MP Police books'],
      },
    },
    {
      name: 'Current Affairs & Speedy Books',
      slug: 'current-affairs-books',
      shortDescription: 'Monthly and yearly MP Current Affairs, Speedy Current Affairs in Hindi, Ghatna Chakra Current Affairs.',
      description: 'Stay updated with monthly and yearly Current Affairs books for MPPSC, MPESB, SSC, and Railway exams.',
      order: 4,
      isActive: true,
      seo: {
        metaTitle: 'Speedy Current Affairs & MP Current Books | Shubham Xerox',
        metaDescription: 'Buy Speedy Current Affairs, MP Current Affairs, yearly guides online at Shubham Xerox.',
        metaKeywords: ['Speedy current affairs', 'MP current affairs book', 'yearly current affairs'],
      },
    },
    {
      name: 'Ghatna Chakra Series',
      slug: 'ghatna-chakra-books',
      shortDescription: 'Complete Ghatna Chakra Purvavlokan series for History, Polity, Geography, Science, and Environment.',
      description: 'Original Ghatna Chakra Purvavlokan question banks and previous year solved paper series in Hindi.',
      order: 5,
      isActive: true,
      seo: {
        metaTitle: 'Ghatna Chakra Books & Purvavlokan Series | Shubham Xerox',
        metaDescription: 'Buy Ghatna Chakra Purvavlokan books online at best price from Shubham Xerox.',
        metaKeywords: ['Ghatna Chakra book', 'Ghatna Chakra Purvavlokan', 'Ghatna Chakra Hindi'],
      },
    },
  ];

  for (const catData of seoCategories) {
    const existing = await Category.findOne({ slug: catData.slug });
    if (!existing) {
      await Category.create(catData);
      console.log(`✅ Created category document: ${catData.slug}`);
    } else {
      existing.name = catData.name;
      existing.shortDescription = catData.shortDescription;
      existing.seo = catData.seo;
      existing.isActive = true;
      await existing.save();
      console.log(`✅ Updated existing category document: ${catData.slug}`);
    }
  }

  console.log('✅ Target SEO categories seeded successfully.');
  process.exit(0);
}).catch((err) => {
  console.error('Error seeding SEO categories:', err);
  process.exit(1);
});
