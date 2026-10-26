const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const updates = [
  {
    num: 16,
    name: 'CTET Paper 2 Social Science Best Notes by Sachin Choudhary',
    oldSlug: 'ctet-paper-2-social-science-best-notes-updated-edition-by-sachin-choudhary-bilingual',
    newSlug: 'ctet-paper-2-social-science-sachin-choudhary',
    metaTitle: 'CTET Paper 2 Social Science Best Notes by Sachin Choudhary | Bilingual Edition',
    metaDescription: 'Buy CTET Paper 2 Social Science best notes by Sachin Choudhary (Bilingual) online at Shubham Xerox. Complete History, Geography, Civics & Pedagogy study material with fast delivery.',
    metaKeywords: [
      'CTET Paper 2 social science notes',
      'Sachin Choudhary CTET book bilingual',
      'CTET SST pedagogy notes',
      'CTET paper 2 book online Indore',
      'Sachin Academy CTET Social Science',
      'Shubham Xerox CTET notes'
    ],
    imageAlt: 'CTET Paper 2 Social Science Notes by Sachin Choudhary Bilingual Hindi English'
  },
  {
    num: 17,
    name: 'Drishti IAS MPPSC Prelims Practice Series Book 5 (Science & Tech)',
    oldSlug: 'drishti-mppsc-prelims-practice-series-book-5-3rd-edition-or-includes-1450-2020-2025-pyqs-hindi-medium',
    newSlug: 'drishti-ias-mppsc-prelims-science-technology-environment-health-hindi',
    metaTitle: 'Drishti IAS MPPSC Prelims Practice Series Book 5 | Science & Tech (Hindi Medium)',
    metaDescription: 'Order Drishti IAS MPPSC Prelims Practice Series Book 5 (Science & Technology, Environment & Health) online from Shubham Xerox Indore. Features 1450+ MCQs with detailed explanations.',
    metaKeywords: [
      'Drishti IAS MPPSC prelims practice series book 5',
      'MPPSC unit 7 science environment book',
      'Drishti MPPSC science and technology Hindi',
      'MPPSC prelims science mcqs book',
      'Shubham Xerox Indore MPPSC books'
    ],
    imageAlt: 'Drishti IAS MPPSC Prelims Practice Series Science Technology Environment Health Hindi'
  },
  {
    num: 18,
    name: 'Drishti IAS MPPSC Prelims Practice Series Book 2 (Geography)',
    oldSlug: 'drishti-mppsc-prelims-practice-series-book-2-3rd-edition-or-includes-3300-2020-2025-pyqs-hindi-medium',
    newSlug: 'drishti-ias-mppsc-prelims-geography-india-madhya-pradesh-hindi',
    metaTitle: 'Drishti IAS MPPSC Prelims Practice Series Book 2 | Geography of India & MP',
    metaDescription: 'Buy Drishti IAS MPPSC Prelims Practice Series Book 2 (Geography of India & MP) at Shubham Xerox. 1300+ chapter-wise MCQs & PYQ solutions in Hindi Medium.',
    metaKeywords: [
      'Drishti IAS MPPSC geography book',
      'Drishti prelims practice series book 2',
      'Bharat evam MP ka bhugol Drishti IAS',
      'MPPSC geography MCQs',
      'MPPSC prelims unit 4 geography notes'
    ],
    imageAlt: 'Drishti IAS MPPSC Prelims Practice Series Geography of India and Madhya Pradesh Hindi'
  },
  {
    num: 19,
    name: 'Drishti IAS MPPSC Prelims Practice Series Book 1 (History & Culture)',
    oldSlug: 'drishti-mppsc-prelims-practice-series-book-1-3rd-edition-or-includes-3300-2020-2025-pyqs-hindi-medium',
    newSlug: 'drishti-ias-mppsc-prelims-itihas-sanskriti-sahitya-hindi',
    metaTitle: 'Drishti IAS MPPSC Prelims Practice Series Book 1 | History & Culture 3300+ MCQs',
    metaDescription: 'Drishti IAS MPPSC Prelims Practice Series Book 1 (Bharat evam Madhya Pradesh ka Itihas, Sanskriti evam Sahitya) at best price. Contains 3300+ topic-wise MCQs.',
    metaKeywords: [
      'Drishti IAS MPPSC history book',
      'Drishti prelims practice series book 1',
      'MP itihas sanskriti sahitya 3300 MCQs',
      'MPPSC history study material',
      'MPPSC prelims unit 1 and 2 notes'
    ],
    imageAlt: 'Drishti IAS MPPSC Prelims Practice Series Bharat evam Madhya Pradesh ka Itihas Sanskriti evam Sahitya'
  },
  {
    num: 20,
    name: 'Edu Teria Current Affairs MCQs Power Book',
    oldSlug: 'edu-teria-current-affairs-mcqs-power-book-june-2025-to-october-2026-hindi-medium-for-all-competitive-exams',
    newSlug: 'edu-teria-current-affairs-mcqs-power-book-hindi',
    metaTitle: 'Edu Teria Current Affairs MCQs Power Book | For All Competitive Exams',
    metaDescription: 'Buy Edu Teria Current Affairs MCQs Power Book online at Shubham Xerox Bhawarkua Indore. Complete monthly & topic-wise current affairs MCQs for MPPSC, SSC, Railway & State exams.',
    metaKeywords: [
      'Edu Teria power book current affairs',
      'Eduteria current affairs MCQs Hindi',
      'Edu Teria annual current affairs book',
      'Pravin sir current affairs Indore',
      'MPPSC current affairs Edu Teria'
    ],
    imageAlt: 'Edu Teria Current Affairs MCQs Power Book Hindi Medium for Competitive Exams'
  },
  {
    num: 21,
    name: 'PW NEET 39 Years Physics Solved Papers for NEET 2027',
    oldSlug: 'pw-neet-39-years-physics-chapter-wise-and-topic-wise-solved-papers-2026-1988',
    newSlug: 'pw-neet-pyq-39-years-physics-2027-english',
    metaTitle: 'PW NEET 39 Years Physics Chapterwise Solved Papers (2026-1988) | Physics Wallah',
    metaDescription: 'Order PW NEET 39 Years Physics chapter-wise and topic-wise solved papers (2026-1988) at Shubham Xerox. Complete PYQ book for NEET 2027 preparation in English.',
    metaKeywords: [
      'PW NEET 39 years physics',
      'Physics Wallah NEET PYQ book',
      'PW NEET physics solved papers 2027',
      'NEET chapterwise physics PYQ book',
      'PW medical books Indore'
    ],
    imageAlt: 'PW NEET 39 Years Physics Chapterwise Topicwise Solved Papers for NEET 2027 English'
  },
  {
    num: 22,
    name: 'ExamPedia Madhya Pradesh Current Affairs Yearbook (Hindi Medium)',
    oldSlug: 'exampedia-madhya-pradesh-current-affairs-yearbook-2026-hindi-medium-2026-mppsc-pre-mains-mpesb-mpsi-adpo-assistant-profe',
    newSlug: 'exampedia-mp-current-affairs-yearly-book-2026-hindi',
    metaTitle: 'ExamPedia MP Current Affairs Yearbook | MPPSC Pre & Mains, MPESB, MPSI',
    metaDescription: 'Buy ExamPedia Madhya Pradesh Current Affairs Yearbook (वार्षिकांक) in Hindi Medium at Shubham Xerox. Covers latest MP Budget, Economic Survey, Schemes & Objective Questions.',
    metaKeywords: [
      'ExamPedia MP current affairs yearbook',
      'MP varshikank current affairs',
      'MPPSC current affairs book Hindi',
      'ExamPedia MP budget economic survey',
      'MP current affairs annual 2026'
    ],
    imageAlt: 'ExamPedia MP Current Affairs Yearbook Hindi Medium for MPPSC Prelims Mains MPESB'
  },
  {
    num: 23,
    name: 'Selection Tak MPGS General Studies (English Edition)',
    oldSlug: 'pre-selection-tak-mpgs-2027-general-studies-for-mppsc-and-mpesb-exams-madhya-pradesh-gs-book-latest-edition-by-selection-tak-publication',
    newSlug: 'selection-tak-mpgs-2027-english-edition-book',
    metaTitle: 'Selection Tak MPGS English Edition | Madhya Pradesh General Studies for MPPSC',
    metaDescription: 'Get Selection Tak MPGS (Madhya Pradesh General Studies) English Edition book at Shubham Xerox. Ideal comprehensive study material for MPPSC and MPESB English medium aspirants.',
    metaKeywords: [
      'Selection Tak MPGS English edition',
      'Madhya Pradesh General Studies English book',
      'MPPSC English medium MP GK',
      'Selection Tak Indore',
      'MPGS 2027 book'
    ],
    imageAlt: 'Selection Tak Madhya Pradesh General Studies MPGS English Edition Book'
  },
  {
    num: 24,
    name: 'Geography Marathon Topicwise Solved PYQs by Dr. Suraj Solanki',
    oldSlug: 'geography-marathon-topicwise-solved-pyqs-or-or-for-assistant-professor-net-set-1st-grade-pgt-tgt-gic-gdc-and-lt-grade-exams-or-by-dr-suraj-solanki-or-hindi-medium',
    newSlug: 'geography-marathon-topicwise-solved-pyqs-suraj-solanki-hindi',
    metaTitle: 'Geography Marathon Solved PYQs by Dr. Suraj Solanki | Apni University',
    metaDescription: 'Buy Apni University Geography Marathon Topicwise Solved PYQs (भूगोल मैराथन) by Dr. Suraj Solanki at Shubham Xerox. Must-have book for Assistant Professor, NET-SET & PGT.',
    metaKeywords: [
      'Geography Marathon Dr Suraj Solanki',
      'Apni University Bhugol Marathon',
      'Geography solved PYQs Hindi medium',
      'Assistant Professor geography book',
      'NET SET Geography Solanki sir'
    ],
    imageAlt: 'Apni University Geography Marathon Topicwise Solved PYQs by Dr Suraj Solanki Hindi Medium'
  },
  {
    num: 25,
    name: 'Madhya Pradesh General Knowledge 2nd Edition by Disha Publication',
    oldSlug: 'madhya-pradesh-general-knowledge-2nd-edition-by-disha-publication-complete-mp-gk-book-for-mppsc',
    newSlug: 'disha-madhya-pradesh-general-knowledge-2nd-edition',
    metaTitle: 'Disha Madhya Pradesh General Knowledge 2nd Edition | Complete MP GK Book for MPPSC',
    metaDescription: 'Buy Disha Publication MP General Knowledge 2nd Edition book online at Shubham Xerox Indore. Features 25 chapters, 550+ MCQs, pull-out color map & PYQs for MPPSC & Vyapam.',
    metaKeywords: [
      'Disha MP GK 2nd edition',
      'Disha Madhya Pradesh GK English',
      'MPPSC Prelims MP GK guide',
      'Disha publication MP books Indore',
      'Madhya Pradesh GK Disha 2nd edition'
    ],
    imageAlt: 'Disha Publication Madhya Pradesh General Knowledge 2nd Edition with Pull Out Chart'
  },
  {
    num: 26,
    name: 'Selection Tak MPGK 4th Edition (Hindi Medium)',
    oldSlug: 'selection-tak-mpgk-4th-edition-madhya-pradesh-selection-tak-2026-mp-gk-2026-all-mppsc-exams-and-other-all-mp-exams-2026',
    newSlug: 'selection-tak-mpgk-4th-edition-2026-hindi',
    metaTitle: 'Selection Tak MPGK 4th Edition | Madhya Pradesh Samanya Gyan Book (Hindi)',
    metaDescription: 'Buy Selection Tak MPGK 4th Edition (मध्य प्रदेश सामान्य ज्ञान) by Selection Tak Publication at Shubham Xerox Indore. Top rated comprehensive guide for all MP state exams.',
    metaKeywords: [
      'Selection Tak MPGK 4th edition',
      'Selection Tak MP GK book Hindi',
      'Madhya Pradesh Selection Tak Indore',
      'MPPSC Vyapam MPGK guide',
      'Selection Tak 2026 book'
    ],
    imageAlt: 'Selection Tak MPGK 4th Edition Madhya Pradesh Selection Tak Book Hindi Medium'
  },
  {
    num: 27,
    name: 'Pratiyogita Ghatna Chakra Madhya Pradesh Current Affairs',
    oldSlug: 'pratiyogita-ghatna-chakra-madhya-pradesh-current-affairs-2025-26-mp-gk-annual-book-budget-economic-survey-hindi-medium',
    newSlug: 'pratiyogita-ghatna-chakra-mp-current-affairs-2026-hindi',
    metaTitle: 'Ghatna Chakra MP Current Affairs | Budget, Economic Survey & Schemes (Hindi)',
    metaDescription: 'Order Pratiyogita Ghatna Chakra Madhya Pradesh Current Affairs book at Shubham Xerox Indore. Complete annual coverage of MP Budget, Economic Survey & government schemes.',
    metaKeywords: [
      'Ghatna Chakra MP current affairs',
      'MP Ghatna Chakra varshikank',
      'Madhya Pradesh samayiki Ghatna Chakra',
      'MPPSC Ghatna Chakra Indore',
      'Ghatna Chakra annual MP GK'
    ],
    imageAlt: 'Pratiyogita Ghatna Chakra Madhya Pradesh Current Affairs Hindi Medium Book Cover'
  },
  {
    num: 28,
    name: 'Nirman IAS MPPSC Prelims Unit 7 (Science & Health)',
    oldSlug: 'nirman-ias-mppsc-prelims-unit-7-science-environment-and-health-1400-objective-questions-english-xerox',
    newSlug: 'nirman-ias-mppsc-prelims-unit-7-science-environment-english',
    metaTitle: 'Nirman IAS MPPSC Prelims Unit 7 | Science, Environment & Health (English)',
    metaDescription: 'Buy Nirman IAS MPPSC Prelims Unit 7 (Science, Environment & Health) English Medium Xerox notes with 1400+ objective questions at Shubham Xerox Bhawarkua Indore.',
    metaKeywords: [
      'Nirman IAS unit 7 science environment English',
      'MPPSC prelims unit 7 English Xerox',
      'Nirman IAS MPPSC study material Indore',
      'MPPSC unit 7 1400 mcqs',
      'Shubham Xerox Nirman IAS'
    ],
    imageAlt: 'Nirman IAS MPPSC Prelims Unit 7 Science Environment and Health English Medium'
  },
  {
    num: 29,
    name: 'Mrunal’s Economy for UPSC Prelims (PCB15 Set of 5 Booklets)',
    oldSlug: 'mrunal-s-economy-for-upsc-prelims-2026-27-pcb15-powerhouse-for-prelims-set-of-5-booklets-in-spiral-bound-black-and-white',
    newSlug: 'mrunals-economy-upsc-prelims-pcb15-set-of-5',
    metaTitle: 'Mrunal’s Economy UPSC Prelims PCB15 Handouts | Spiral Bound Set of 5 Booklets',
    metaDescription: 'Buy Mrunal’s Economy PCB15 (Powerhouse for Prelims) complete set of 5 booklets in clear spiral bound print from Shubham Xerox. Top study material for UPSC & State PCS.',
    metaKeywords: [
      'Mrunal economy PCB15',
      'Mrunal Patel economy handouts spiral',
      'UPSC economy notes Indore',
      'Mrunal PCB15 set of 5 booklets',
      'Mrunal economics handouts buy online'
    ],
    imageAlt: 'Mrunals Economy UPSC Prelims PCB15 Set of 5 Spiral Booklets Black and White Print'
  },
  {
    num: 30,
    name: 'Drishti IAS MPPSC Prelims Practice Series Book 3 (Polity)',
    oldSlug: 'drishti-ias-mppsc-prelims-practice-series-book-3-bharat-evam-madhya-pradesh-ki-sanvaidhanik-vyavastha-polity-and-constitution-or-hindi-medium-or-3rd-edition',
    newSlug: 'drishti-ias-mppsc-prelims-polity-constitution-hindi',
    metaTitle: 'Drishti IAS MPPSC Prelims Practice Series Book 3 | Polity & Constitution (Hindi)',
    metaDescription: 'Order Drishti IAS MPPSC Prelims Practice Series Book 3 (Bharat evam MP ki Sanvaidhanik Vyavastha) online at Shubham Xerox. Includes 1100+ topic-wise MCQs & PYQs.',
    metaKeywords: [
      'Drishti IAS MPPSC polity book',
      'Drishti prelims practice series book 3',
      'Bharat evam MP rajvyavastha 1100 MCQs',
      'MPPSC polity study material',
      'MPPSC unit 5 polity book Hindi'
    ],
    imageAlt: 'Drishti IAS MPPSC Prelims Practice Series Bharat evam MP ki Sanvaidhanik Vyavastha Hindi'
  }
];

function sanitizeOldSlugs(rawList, currentSlug, fallbackOldSlug) {
  const result = new Set();
  
  const extractClean = (item) => {
    if (!item) return;
    if (Array.isArray(item)) {
      item.forEach(extractClean);
      return;
    }
    let s = String(item).trim();
    while (s.startsWith('[') || s.startsWith('"') || s.startsWith("'") || s.startsWith('\\')) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) {
          parsed.forEach(extractClean);
          return;
        }
        s = String(parsed).trim();
      } catch {
        s = s.replace(/^[\[\]"'\\]+|[\[\]"'\\]+$/g, '').trim();
      }
    }
    s = s.replace(/^[\[\]"'\\]+|[\[\]"'\\]+$/g, '').trim();
    if (s && s.length > 2 && s !== '[]' && s !== '["[]"]' && s !== currentSlug) {
      result.add(s);
    }
  };

  if (Array.isArray(rawList)) {
    rawList.forEach(extractClean);
  }
  if (fallbackOldSlug && fallbackOldSlug !== currentSlug) {
    result.add(fallbackOldSlug);
  }
  return [...result];
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  console.log('--- STARTING DATABASE MIGRATION FOR BOOKS 16-30 ---');
  let successCount = 0;

  for (const item of updates) {
    // Find either by oldSlug or newSlug
    let doc = await Product.findOne({ $or: [{ slug: item.oldSlug }, { slug: item.newSlug }] });
    if (!doc) {
      console.error(`[ERROR] Book ${item.num} NOT FOUND with slug ${item.oldSlug} or ${item.newSlug}`);
      continue;
    }

    const previousSlug = doc.slug;
    const cleanOldSlugs = sanitizeOldSlugs(doc.oldSlugs, item.newSlug, item.oldSlug);
    if (previousSlug && previousSlug !== item.newSlug && !cleanOldSlugs.includes(previousSlug)) {
      cleanOldSlugs.push(previousSlug);
    }

    // Update images alt
    const updatedImages = (doc.images || []).map((img, idx) => {
      return {
        ...img,
        alt: idx === 0 ? item.imageAlt : `${item.imageAlt} - View ${idx + 1}`
      };
    });

    const updatedSeo = {
      ...(doc.seo || {}),
      metaTitle: item.metaTitle,
      metaDescription: item.metaDescription,
      metaKeywords: item.metaKeywords,
      noIndex: false
    };

    doc.slug = item.newSlug;
    doc.oldSlugs = cleanOldSlugs;
    doc.seo = updatedSeo;
    doc.images = updatedImages;

    await Product.updateOne(
      { _id: doc._id },
      {
        $set: {
          slug: item.newSlug,
          oldSlugs: cleanOldSlugs,
          seo: updatedSeo,
          images: updatedImages
        }
      }
    );

    console.log(`[SUCCESS] Book ${item.num}: "${item.name}"`);
    console.log(`   Slug: ${previousSlug} -> ${item.newSlug}`);
    console.log(`   Canonical URL: https://shubhamxerox.in/product/${item.newSlug}`);
    console.log(`   oldSlugs: ${JSON.stringify(cleanOldSlugs)}`);
    console.log(`   metaTitle: ${item.metaTitle}`);
    console.log(`   imageAlt: ${item.imageAlt}`);
    successCount++;
  }

  console.log(`\nMigration completed: ${successCount} / ${updates.length} books successfully updated!`);

  // Also clean up any corrupted oldSlugs in Batch 1 (Books 1-15)
  console.log('\n--- CLEANING CORRUPTED oldSlugs IN ALL OTHER PRODUCTS ---');
  const allProds = await Product.find({ oldSlugs: { $exists: true, $ne: [] } }).select('slug oldSlugs').lean();
  let cleanedCount = 0;
  for (const p of allProds) {
    const cleaned = sanitizeOldSlugs(p.oldSlugs, p.slug, null);
    if (JSON.stringify(cleaned) !== JSON.stringify(p.oldSlugs)) {
      await Product.updateOne({ _id: p._id }, { $set: { oldSlugs: cleaned } });
      cleanedCount++;
    }
  }
  console.log(`Cleaned corrupted oldSlugs in ${cleanedCount} products across the catalog.`);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
