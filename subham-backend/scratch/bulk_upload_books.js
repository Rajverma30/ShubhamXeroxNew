const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const SubCategory = require('../src/models/SubCategory');

const SOURCE_FOLDER = 'S:\\Machine learning\\Startup\\books image';
const DEST_FOLDER = path.join(__dirname, '..', 'uploads', 'products');

if (!fs.existsSync(DEST_FOLDER)) {
  fs.mkdirSync(DEST_FOLDER, { recursive: true });
}

const backendOrigin = () =>
  (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');

const publicUrl = (filename) => `${backendOrigin()}/uploads/products/${filename}`;

const SIZES = { thumb: 160, card: 600, full: 1400 };

async function convertImageToWebp(sourceFileName, baseSlug) {
  const sourcePath = path.join(SOURCE_FOLDER, sourceFileName);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source file missing: ${sourcePath}`);
  }

  const meta = await sharp(sourcePath).metadata();

  const baseName = baseSlug;

  const fullFilename = `${baseName}-full.webp`;
  const cardFilename = `${baseName}-card.webp`;
  const thumbFilename = `${baseName}-thumb.webp`;

  await Promise.all([
    sharp(sourcePath)
      .rotate()
      .resize({ width: SIZES.full, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(DEST_FOLDER, fullFilename)),
    sharp(sourcePath)
      .rotate()
      .resize({ width: SIZES.card, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(DEST_FOLDER, cardFilename)),
    sharp(sourcePath)
      .rotate()
      .resize({ width: SIZES.thumb, withoutEnlargement: true })
      .webp({ quality: 68 })
      .toFile(path.join(DEST_FOLDER, thumbFilename)),
  ]);

  return {
    url: publicUrl(fullFilename),
    cardUrl: publicUrl(cardFilename),
    thumbUrl: publicUrl(thumbFilename),
    width: meta.width || 800,
    height: meta.height || 1000,
    publicId: null,
    alt: baseName,
    source: 'upload',
  };
}

const booksToInsert = [
  {
    imageFile: 'Glossy Hindi Geography Book Mockup.png',
    slug: 'hindi-geography-complete-study-guide-and-practice-book',
    sku: 'SKU-GEO-HIN-01',
    title: 'Hindi Geography Complete Study Guide & Practice Book (भूगोल अध्ययन एवं अभ्यास पुस्तिका)',
    category: '6a805a7f2b369bd9c404c32f',
    categorySlug: 'publications',
    categoryName: 'Competitive Exam Books',
    subCategory: '6a805a8a2b369bd9c404c3fa',
    subCategorySlug: 'lucent',
    subCategoryName: 'Lucent Publications',
    type: 'book',
    author: 'Editorial Team',
    publisher: 'Lucent Publications',
    language: ['Hindi'],
    edition: '2026 Edition',
    pages: 340,
    binding: 'Paperback',
    price: 320,
    salePrice: 220,
    discountPercent: 31,
    stock: 25,
    shortDescription: 'Complete Hindi Geography Study Guide with physical & Indian geography theory, maps, diagrams, and chapter-wise objective questions.',
    description: `
      <h3>Book Description</h3>
      <p>This <strong>Hindi Geography Complete Study Guide</strong> is designed specifically for students preparing for competitive exams like MPPSC, SSC, Railway, UPSC Prelims, and State PSCs.</p>
      <h4>Key Highlights:</h4>
      <ul>
        <li>Comprehensive coverage of World, Physical, and Indian Geography.</li>
        <li>Clear, easy-to-understand Hindi explanation with labelled maps and diagrams.</li>
        <li>Chapter-wise objective practice MCQs with detailed answer keys.</li>
        <li>Includes latest geographical data, census details, and environmental topics.</li>
      </ul>
    `,
    highlights: [
      'Complete Coverage of Physical, World & Indian Geography in Hindi',
      'Topic-wise MCQ Practice Questions with Explanations',
      'High-Quality Labelled Maps & Visual Diagrams',
      'Ideal for MPPSC, SSC CGL, Railway & State Level Exams',
    ],
    specifications: [
      { label: 'Language', value: 'Hindi' },
      { label: 'Binding', value: 'Paperback' },
      { label: 'Publisher', value: 'Lucent Publications' },
      { label: 'Edition', value: '2026 Latest Edition' },
      { label: 'Pages', value: '340' },
    ],
    tags: ['geography', 'bhugol', 'hindi book', 'mppsc', 'ssc', 'competitive exam books'],
    seo: {
      metaTitle: 'Hindi Geography Study Guide & Practice Book | Buy Online',
      metaDescription: 'Buy Hindi Geography Complete Study Guide online. Covers Indian & Physical geography with maps, notes and practice MCQs for MPPSC & SSC exams.',
      metaKeywords: ['geography book hindi', 'bhugol book', 'mppsc geography book', 'ssc geography guide'],
    },
  },
  {
    imageFile: 'Glossy Reasoning Practice Book Mockup.png',
    slug: 'complete-reasoning-practice-and-short-tricks-book',
    sku: 'SKU-REA-PNA-02',
    title: 'Complete Reasoning Practice & Short Tricks Book for SSC, Railway & Bank (तर्कशक्ति अभ्यास पुस्तक)',
    category: '6a805a7f2b369bd9c404c32f',
    categorySlug: 'publications',
    categoryName: 'Competitive Exam Books',
    subCategory: '6a82d80aa34317063af20040',
    subCategorySlug: 'competitive-exam-books-pinnacle',
    subCategoryName: 'Pinnacle Publication',
    type: 'book',
    author: 'Reasoning Experts',
    publisher: 'Pinnacle Publication',
    language: ['Hindi', 'English'],
    edition: '2026 Edition',
    pages: 420,
    binding: 'Paperback',
    price: 399,
    salePrice: 260,
    discountPercent: 35,
    stock: 30,
    shortDescription: 'Master Reasoning for SSC, Railway, and Bank exams with short trick formulas, verbal & non-verbal solved practice sets.',
    description: `
      <h3>Book Description</h3>
      <p>The <strong>Complete Reasoning Practice & Short Tricks Book</strong> is your ultimate companion to score maximum marks in General Intelligence & Reasoning.</p>
      <h4>Key Highlights:</h4>
      <ul>
        <li>Verbal, Non-Verbal, and Analytical Reasoning covered comprehensively.</li>
        <li>Time-saving shortcut tricks and step-by-step problem-solving methods.</li>
        <li>Previous year questions from SSC CGL, CHSL, Railway NTPC & Bank PO.</li>
        <li>5000+ practice questions with detailed solutions.</li>
      </ul>
    `,
    highlights: [
      '5000+ Practice Questions with Step-by-Step Solutions',
      'Short Tricks & Fast Calculation Techniques for Exam Speed',
      'Verbal, Non-Verbal & Analytical Reasoning Coverage',
      'Latest Previous Year Exam Pattern Solved Papers',
    ],
    specifications: [
      { label: 'Language', value: 'Bilingual (Hindi & English)' },
      { label: 'Binding', value: 'Paperback' },
      { label: 'Publisher', value: 'Pinnacle Publication' },
      { label: 'Edition', value: '2026 Edition' },
      { label: 'Pages', value: '420' },
    ],
    tags: ['reasoning book', 'tarkshakti', 'ssc reasoning', 'pinnacle reasoning', 'bank reasoning'],
    seo: {
      metaTitle: 'Complete Reasoning Practice Book for SSC, Railway & Bank',
      metaDescription: 'Buy Complete Reasoning Practice Book with short tricks & 5000+ solved questions for SSC CGL, Railway & Banking exams online.',
      metaKeywords: ['reasoning book', 'ssc reasoning book', 'pinnacle reasoning', 'reasoning short tricks'],
    },
  },
  {
    imageFile: 'Gyan General Science Textbook Mockup.png',
    slug: 'gyan-general-science-textbook-for-competitive-exams',
    sku: 'SKU-SCI-ARH-03',
    title: 'Gyan General Science Textbook for MPPSC, SSC & Competitive Exams (सामान्य विज्ञान ज्ञान पुस्तक)',
    category: '6a805a7f2b369bd9c404c32f',
    categorySlug: 'publications',
    categoryName: 'Competitive Exam Books',
    subCategory: '6a8c698316ffd6c953632868',
    subCategorySlug: 'competitive-exam-books-arihant-publication',
    subCategoryName: 'arihant publication',
    type: 'book',
    author: 'Science Subject Matter Team',
    publisher: 'Arihant Publication',
    language: ['Hindi', 'English'],
    edition: '2026 Edition',
    pages: 380,
    binding: 'Paperback',
    price: 299,
    salePrice: 199,
    discountPercent: 33,
    stock: 20,
    shortDescription: 'Comprehensive General Science textbook covering Physics, Chemistry, Biology & Environment for competitive exam preparation.',
    description: `
      <h3>Book Description</h3>
      <p>The <strong>Gyan General Science Textbook</strong> provides a clear and structured foundation in General Science for competitive exam aspirants.</p>
      <h4>Key Highlights:</h4>
      <ul>
        <li>Complete concepts of Physics, Chemistry, Biology, Computer Science, and Ecology.</li>
        <li>NCERT summary notes integrated into every chapter.</li>
        <li>High-yield diagrams, tables, and important scientific formulas.</li>
        <li>Topic-wise practice MCQs for fast revision.</li>
      </ul>
    `,
    highlights: [
      'Physics, Chemistry, Biology & Ecology in One Comprehensive Book',
      'NCERT Class 6-10 Summary Concepts Included',
      '3000+ Practice MCQs for Self-Assessment',
      'Bilingual content suitable for Hindi and English medium students',
    ],
    specifications: [
      { label: 'Language', value: 'Bilingual (Hindi & English)' },
      { label: 'Binding', value: 'Paperback' },
      { label: 'Publisher', value: 'Arihant Publication' },
      { label: 'Edition', value: '2026 Edition' },
      { label: 'Pages', value: '380' },
    ],
    tags: ['general science', 'samanya vigyan', 'science book', 'mppsc science', 'ssc science'],
    seo: {
      metaTitle: 'Gyan General Science Textbook | MPPSC & SSC Science Book',
      metaDescription: 'Buy Gyan General Science Textbook online. Complete Physics, Chemistry & Biology theory with NCERT summaries and MCQs for competitive exams.',
      metaKeywords: ['general science book', 'samanya vigyan', 'mppsc science book', 'arihant general science'],
    },
  },
  {
    imageFile: 'Hindi History Study Guide on Wooden Table.png',
    slug: 'bhartiya-itihas-complete-study-guide',
    sku: 'SKU-HIS-DRS-04',
    title: 'Bhartiya Itihas Complete Study Guide - Ancient, Medieval & Modern History (भारतीय इतिहास अध्ययन मार्गदर्शिका)',
    category: '6a805a7f2b369bd9c404c332',
    categorySlug: 'exam-books',
    categoryName: 'Exam Books',
    subCategory: '6a805a852b369bd9c404c39f',
    subCategorySlug: 'drishti-ias-notes',
    subCategoryName: 'Drishti Publication',
    type: 'book',
    author: 'Drishti Editorial Board',
    publisher: 'Drishti Publication',
    language: ['Hindi'],
    edition: '2026 Edition',
    pages: 450,
    binding: 'Paperback',
    price: 350,
    salePrice: 240,
    discountPercent: 31,
    stock: 20,
    shortDescription: 'Detailed Indian History guide in Hindi covering Prachin, Madhyakalin & Adhunik Itihas with timeline charts and PYQs for Civil Services.',
    description: `
      <h3>Book Description</h3>
      <p>The <strong>Bhartiya Itihas Complete Study Guide</strong> offers exhaustive coverage of Indian History tailored for Civil Services & State PSC exams.</p>
      <h4>Key Highlights:</h4>
      <ul>
        <li>Ancient (प्राचीन), Medieval (मध्यकालीन), and Modern (आधुनिक) Indian History.</li>
        <li>Freedom Struggle Movement & Post-Independence Era in structured Hindi notes.</li>
        <li>Historical maps, timelines, and battle quick-reference charts.</li>
        <li>Previous Year Solved Questions from UPSC, MPPSC, and UPPSC.</li>
      </ul>
    `,
    highlights: [
      'Comprehensive Ancient, Medieval & Modern Indian History in Hindi',
      'Timelines, Historical Maps & Important Dynasty Flowcharts',
      'UPSC & MPPSC Prelims + Mains Solved Questions',
      'Written by Experienced Civil Services Subject Experts',
    ],
    specifications: [
      { label: 'Language', value: 'Hindi' },
      { label: 'Binding', value: 'Paperback' },
      { label: 'Publisher', value: 'Drishti Publication' },
      { label: 'Edition', value: '2026 Latest Edition' },
      { label: 'Pages', value: '450' },
    ],
    tags: ['history book', 'bhartiya itihas', 'drishti history', 'mppsc history', 'upsc history hindi'],
    seo: {
      metaTitle: 'Bhartiya Itihas Study Guide in Hindi | Ancient, Medieval & Modern',
      metaDescription: 'Buy Bhartiya Itihas Complete Study Guide in Hindi. Detailed notes on Ancient, Medieval & Modern History for MPPSC & UPSC civil services.',
      metaKeywords: ['bhartiya itihas book', 'history book hindi', 'drishti history notes', 'mppsc history guide'],
    },
  },
  {
    imageFile: 'Indian Constitution and Governance Guide.png',
    slug: 'indian-constitution-and-polity-governance-guide',
    sku: 'SKU-POL-DRS-05',
    title: 'Indian Constitution & Polity Governance Guide for UPSC & MPPSC (भारतीय संविधान एवं राजव्यवस्था)',
    category: '6aa129bc2c339166d23e179c',
    categorySlug: 'mppsc-books',
    categoryName: 'MPPSC Books & Study Material',
    subCategory: '6a805a852b369bd9c404c39f',
    subCategorySlug: 'drishti-ias-notes',
    subCategoryName: 'Drishti Publication',
    type: 'book',
    author: 'Polity Faculty Group',
    publisher: 'Drishti Publication',
    language: ['Hindi', 'English'],
    edition: '2026 Edition',
    pages: 480,
    binding: 'Paperback',
    price: 420,
    salePrice: 290,
    discountPercent: 31,
    stock: 25,
    shortDescription: 'Comprehensive textbook on Indian Constitution, Polity & Public Governance with constitutional amendments, landmark cases & PYQs.',
    description: `
      <h3>Book Description</h3>
      <p>The <strong>Indian Constitution & Polity Governance Guide</strong> is an indispensable resource for mastering Indian Polity for competitive examinations.</p>
      <h4>Key Highlights:</h4>
      <ul>
        <li>Article-by-Article analysis of the Indian Constitution.</li>
        <li>Latest Constitutional Amendments, Statutory Commissions & Supreme Court Verdicts.</li>
        <li>Governance, Public Policy, Rights Issues, and Panchayat Raj System.</li>
        <li>Prelims MCQs & Mains Model Answer framework included.</li>
      </ul>
    `,
    highlights: [
      'Exhaustive Coverage of Articles, Schedules & Constitutional Amendments',
      'Includes Governance, Public Administration & Panchayati Raj',
      'Landmark Supreme Court Judgments & Case Laws Explained',
      'Must-have for MPPSC Prelims/Mains and UPSC Exam Preparation',
    ],
    specifications: [
      { label: 'Language', value: 'Bilingual (Hindi & English)' },
      { label: 'Binding', value: 'Paperback' },
      { label: 'Publisher', value: 'Drishti Publication' },
      { label: 'Edition', value: '2026 Edition' },
      { label: 'Pages', value: '480' },
    ],
    tags: ['polity book', 'indian constitution', 'samvidhan', 'mppsc polity', 'upsc polity'],
    seo: {
      metaTitle: 'Indian Constitution & Polity Governance Guide | MPPSC & UPSC',
      metaDescription: 'Buy Indian Constitution & Polity Governance Guide online. Articles, Constitutional Amendments, Governance notes & MCQs for MPPSC & UPSC.',
      metaKeywords: ['polity book hindi', 'samvidhan book', 'mppsc polity guide', 'drishti polity book'],
    },
  },
  {
    imageFile: 'Madhya Pradesh General Knowledge Book Mockup.png',
    slug: 'mp-gk-complete-book-madhya-pradesh-general-knowledge-2026',
    sku: 'SKU-MPGK-PRK-06',
    title: 'MP GK Complete Book - Madhya Pradesh General Knowledge & Solved Papers 2026 (मध्यप्रदेश सामान्य ज्ञान)',
    category: '6aa129bc2c339166d23e179c',
    categorySlug: 'mppsc-books',
    categoryName: 'MPPSC Books & Study Material',
    subCategory: '6a805a882b369bd9c404c3d0',
    subCategorySlug: 'parikshamdham-publication',
    subCategoryName: 'PARIKSHAMDHAM PUBLICATION',
    type: 'book',
    author: 'Parikshamdham Editorial Board',
    publisher: 'Parikshamdham Publication',
    language: ['Hindi'],
    edition: '2026 Edition',
    pages: 360,
    binding: 'Paperback',
    price: 380,
    salePrice: 250,
    discountPercent: 34,
    stock: 35,
    shortDescription: 'The #1 Madhya Pradesh GK book covering MP History, Geography, Culture, Polity, Tribal Heritage & Budget 2026 with district-wise info.',
    description: `
      <h3>Book Description</h3>
      <p>The <strong>MP GK Complete Book 2026</strong> by Parikshamdham Publication is the most trusted guide for MP state competitive examinations.</p>
      <h4>Key Highlights:</h4>
      <ul>
        <li>District-wise detailed general knowledge of Madhya Pradesh.</li>
        <li>MP Tribal Culture, Folk Art, Festivals, Geography & Forest Reports.</li>
        <li>Latest MP Budget 2026, Economic Survey, and MP Government Schemes.</li>
        <li>Topic-wise Solved PYQs for MPPSC Prelims, MP Patwari, MP SI & Police.</li>
      </ul>
    `,
    highlights: [
      'Comprehensive Coverage of MP History, Geography, Polity & Culture',
      'District-wise Maps, Charts & Fact Tables for Quick Memory',
      'Updated MP Economic Survey, Budget 2026 & Welfare Schemes',
      'Top Recommended Book for MPPSC Prelims & MPESB Vyapam Exams',
    ],
    specifications: [
      { label: 'Language', value: 'Hindi' },
      { label: 'Binding', value: 'Paperback' },
      { label: 'Publisher', value: 'Parikshamdham Publication' },
      { label: 'Edition', value: '2026 Latest Edition' },
      { label: 'Pages', value: '360' },
    ],
    tags: ['mp gk', 'mp gk book', 'parikshamdham mp gk', 'mppsc gk', 'madhya pradesh general knowledge'],
    seo: {
      metaTitle: 'MP GK Complete Book 2026 | Parikshamdham MP General Knowledge',
      metaDescription: 'Buy MP GK Complete Book 2026 online by Parikshamdham Publication. District-wise MP history, geography, economy & solved papers for MPPSC.',
      metaKeywords: ['mp gk book', 'parikshamdham mp gk', 'mppsc general knowledge', 'mp vyapam gk book'],
    },
  },
  {
    imageFile: 'NCERT इतिहास Paperback Mockup.png',
    slug: 'ncert-itihas-class-6-to-12-summary-and-one-liner-book',
    sku: 'SKU-NCERT-HIS-07',
    title: 'NCERT Itihas Class 6 to 12 Summary & One Liner Book (NCERT भारतीय इतिहास सार संग्रह)',
    category: '6a805a7f2b369bd9c404c332',
    categorySlug: 'exam-books',
    categoryName: 'Exam Books',
    subCategory: '6a805a882b369bd9c404c3d7',
    subCategorySlug: 'cosmos-publication',
    subCategoryName: 'Cosmos Publication',
    type: 'book',
    author: 'Mahesh Kumar Barnwal & Team',
    publisher: 'Cosmos Publication',
    language: ['Hindi'],
    edition: '2026 Edition',
    pages: 290,
    binding: 'Paperback',
    price: 280,
    salePrice: 185,
    discountPercent: 34,
    stock: 20,
    shortDescription: 'Class 6 to 12 NCERT History summary in point-wise one-liner Hindi notes. Essential for fast basic concept building for UPSC & MPPSC.',
    description: `
      <h3>Book Description</h3>
      <p>The <strong>NCERT Itihas Class 6 to 12 Summary Book</strong> encapsulates all essential history concepts from NCERT textbooks into structured Hindi notes.</p>
      <h4>Key Highlights:</h4>
      <ul>
        <li>Class-wise (Class 6, 7, 8, 9, 10, 11, 12) point-wise compilation of Old & New NCERT.</li>
        <li>One-liner factual summary ideal for quick revision before exams.</li>
        <li>Includes NCERT-based objective questions for practice.</li>
        <li>Saves 100+ hours of reading voluminous NCERT textbooks.</li>
      </ul>
    `,
    highlights: [
      'Complete Class 6 to 12 NCERT History Summary in One Volume',
      'Point-wise One Liner Format for Super Fast Revision',
      'Combines Old & New NCERT Textbook Concepts',
      'Best Foundation Book for UPSC, MPPSC & Competitive Aspirants',
    ],
    specifications: [
      { label: 'Language', value: 'Hindi' },
      { label: 'Binding', value: 'Paperback' },
      { label: 'Publisher', value: 'Cosmos Publication' },
      { label: 'Edition', value: '2026 Edition' },
      { label: 'Pages', value: '290' },
    ],
    tags: ['ncert history', 'ncert sar sangrah', 'ncert itihas', 'cosmos ncert', 'mppsc ncert'],
    seo: {
      metaTitle: 'NCERT Itihas Class 6 to 12 Summary & One Liner Book in Hindi',
      metaDescription: 'Buy NCERT History (इतिहास) Class 6 to 12 Summary Book online. Point-wise NCERT sar sangrah for UPSC, MPPSC & Competitive Exams.',
      metaKeywords: ['ncert history book', 'ncert sar sangrah history', 'ncert itihas class 6 to 12', 'cosmos ncert history'],
    },
  },
  {
    imageFile: 'Parmar SSC Current Affair Shot Book Mockup.png',
    slug: 'parmar-ssc-current-affairs-shot-book-2026',
    sku: 'SKU-CA-PAR-08',
    title: 'Parmar SSC Current Affairs Shot Book 2026 - Monthly & Yearly Revision Guide',
    category: '6aa129bc2c339166d23e17a8',
    categorySlug: 'current-affairs-books',
    categoryName: 'Current Affairs & Speedy Books',
    subCategory: '6a805a842b369bd9c404c398',
    subCategorySlug: 'parmar-ssc',
    subCategoryName: 'PARMAR SSC',
    type: 'book',
    author: 'Parmar Sir & SSC Team',
    publisher: 'Parmar SSC Publication',
    language: ['Hindi', 'English'],
    edition: '2026 Annual Edition',
    pages: 180,
    binding: 'Paperback',
    price: 199,
    salePrice: 130,
    discountPercent: 35,
    stock: 40,
    shortDescription: 'High-yield Parmar SSC Current Affairs revision handbook featuring national/international events, sports, awards, schemes & static GK.',
    description: `
      <h3>Book Description</h3>
      <p>The <strong>Parmar SSC Current Affairs Shot Book 2026</strong> is specially engineered for high-speed revision of current affairs and static GK.</p>
      <h4>Key Highlights:</h4>
      <ul>
        <li>Topic-wise breakdown: National/International News, Awards, Sports, Summits & Appointments.</li>
        <li>Static GK mapping corresponding to current affair news items.</li>
        <li>1000+ One-liner Current Affairs questions with revision keys.</li>
        <li>Highly recommended for SSC CGL, CHSL, MTS, CPO & Railway Exams.</li>
      </ul>
    `,
    highlights: [
      'Point-wise One Shot Current Affairs Coverage for 2025-2026',
      'Combined Static GK Integration with Current Events',
      '1000+ High Probability Practice One-Liners',
      'Designed specifically for SSC & Railway Competitive Exams',
    ],
    specifications: [
      { label: 'Language', value: 'Bilingual (Hindi & English)' },
      { label: 'Binding', value: 'Paperback' },
      { label: 'Publisher', value: 'Parmar SSC' },
      { label: 'Edition', value: '2026 Annual Edition' },
      { label: 'Pages', value: '180' },
    ],
    tags: ['parmar ssc', 'current affairs book', 'ssc current affairs', 'parmar sir current affairs', 'speedy current affairs'],
    seo: {
      metaTitle: 'Parmar SSC Current Affairs Shot Book 2026 | Buy Online',
      metaDescription: 'Buy Parmar SSC Current Affairs Shot Book 2026 online. Concise monthly & yearly current affairs notes with static GK for SSC CGL & Railway.',
      metaKeywords: ['parmar ssc current affairs', 'current affairs book 2026', 'ssc cgl current affairs', 'parmar current affairs book'],
    },
  },
  {
    imageFile: 'The Complete Vocabulary Book Mockup.png',
    slug: 'the-complete-english-vocabulary-book-vol-1',
    sku: 'SKU-VOC-PNA-09',
    title: 'The Complete English Vocabulary Book Vol 1 - 5000+ Smart Words with Memory Tricks',
    category: '6a805a7f2b369bd9c404c32f',
    categorySlug: 'publications',
    categoryName: 'Competitive Exam Books',
    subCategory: '6a82d80aa34317063af20040',
    subCategorySlug: 'competitive-exam-books-pinnacle',
    subCategoryName: 'Pinnacle Publication',
    type: 'book',
    author: 'English Vocab Masters',
    publisher: 'Pinnacle Publication',
    language: ['English', 'Hindi'],
    edition: '2026 Edition',
    pages: 360,
    binding: 'Paperback',
    price: 340,
    salePrice: 220,
    discountPercent: 35,
    stock: 25,
    shortDescription: 'Master 5000+ high-frequency English vocabulary words using memory tricks, Hindi meanings, visual mnemonics & exam practice exercises.',
    description: `
      <h3>Book Description</h3>
      <p><strong>The Complete English Vocabulary Book Vol 1</strong> makes building a powerful English vocabulary effortless and fun.</p>
      <h4>Key Highlights:</h4>
      <ul>
        <li>5000+ Frequently Asked Exam Words categorized by frequency and difficulty.</li>
        <li>Memory tricks (mnemonics) and Hindi word meanings for easy recall.</li>
        <li>Synonyms, Antonyms, and contextual usage in exam-like sentences.</li>
        <li>Daily vocabulary test drills for SSC CGL, Bank PO, NDA, and CDS exams.</li>
      </ul>
    `,
    highlights: [
      '5000+ High Frequency Exam Vocabulary Words',
      'Mnemonic Memory Tricks & Hindi Meanings Included',
      'Includes Synonyms, Antonyms & Context Sentences',
      'Ideal for SSC CGL, Banking, CDS & CAT Aspirants',
    ],
    specifications: [
      { label: 'Language', value: 'Bilingual (English with Hindi Meanings)' },
      { label: 'Binding', value: 'Paperback' },
      { label: 'Publisher', value: 'Pinnacle Publication' },
      { label: 'Edition', value: '2026 Edition' },
      { label: 'Pages', value: '360' },
    ],
    tags: ['english vocabulary book', 'vocab book', 'pinnacle english', 'ssc english vocabulary', 'smart vocab'],
    seo: {
      metaTitle: 'The Complete English Vocabulary Book Vol 1 | 5000+ Words',
      metaDescription: 'Buy The Complete English Vocabulary Book Vol 1 online. 5000+ words with memory tricks, Hindi meanings & practice tests for SSC & Bank PO.',
      metaKeywords: ['english vocabulary book', 'vocab book ssc', 'pinnacle vocab book', 'vocabulary with memory tricks'],
    },
  },
  {
    imageFile: 'The Complete Vocabulary Book Mockup(1).png',
    slug: 'the-complete-english-vocabulary-book-vol-2',
    sku: 'SKU-VOC-PNA-10',
    title: 'The Complete English Vocabulary Book Vol 2 - Root Words, Synonyms & Antonyms',
    category: '6a805a7f2b369bd9c404c32f',
    categorySlug: 'publications',
    categoryName: 'Competitive Exam Books',
    subCategory: '6a82d80aa34317063af20040',
    subCategorySlug: 'competitive-exam-books-pinnacle',
    subCategoryName: 'Pinnacle Publication',
    type: 'book',
    author: 'English Vocab Masters',
    publisher: 'Pinnacle Publication',
    language: ['English', 'Hindi'],
    edition: '2026 Edition',
    pages: 380,
    binding: 'Paperback',
    price: 350,
    salePrice: 230,
    discountPercent: 34,
    stock: 25,
    shortDescription: 'Advanced English Vocabulary Vol 2 focusing on Root Words, Idioms & Phrases, One Word Substitutions, and Phrasal Verbs.',
    description: `
      <h3>Book Description</h3>
      <p><strong>The Complete English Vocabulary Book Vol 2</strong> completes your vocabulary mastery with root word analysis and advanced idioms.</p>
      <h4>Key Highlights:</h4>
      <ul>
        <li>Root Word method (Latin & Greek roots) to quickly decode thousands of new words.</li>
        <li>1500+ Important Idioms & Phrases with practical context.</li>
        <li>1200+ One Word Substitutions frequently asked in SSC CGL & CPO.</li>
        <li>Commonly Confused Words, Homonyms & Phrasal Verbs practice sets.</li>
      </ul>
    `,
    highlights: [
      'Root Words Method to Unlock 10,000+ English Words',
      '1500+ Idioms & Phrases + 1200+ One Word Substitutions',
      'Phrasal Verbs & Commonly Confused Words Covered',
      'Previous 10 Years Solved Vocabulary PYQs from SSC & Bank',
    ],
    specifications: [
      { label: 'Language', value: 'Bilingual (English with Hindi Meanings)' },
      { label: 'Binding', value: 'Paperback' },
      { label: 'Publisher', value: 'Pinnacle Publication' },
      { label: 'Edition', value: '2026 Edition' },
      { label: 'Pages', value: '380' },
    ],
    tags: ['root words english', 'idioms and phrases', 'one word substitution', 'vocabulary vol 2', 'ssc english book'],
    seo: {
      metaTitle: 'The Complete English Vocabulary Book Vol 2 | Root Words & Idioms',
      metaDescription: 'Buy The Complete English Vocabulary Book Vol 2 online. Master Root Words, Idioms & Phrases, One Word Substitutions for SSC & Banking exams.',
      metaKeywords: ['root words english book', 'idioms and phrases book', 'one word substitution book', 'vocab book vol 2'],
    },
  },
];

async function runBulkUpload() {
  console.log('Starting bulk WebP processing and database upload...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected successfully.');

  const categoryCounts = {};
  const subCategoryCounts = {};

  for (const bookData of booksToInsert) {
    console.log(`\nProcessing image: ${bookData.imageFile}`);
    const webpImageRecord = await convertImageToWebp(bookData.imageFile, bookData.slug);
    console.log(`Generated WebP images for ${bookData.slug}:`);
    console.log(` Full:  ${webpImageRecord.url}`);
    console.log(` Card:  ${webpImageRecord.cardUrl}`);
    console.log(` Thumb: ${webpImageRecord.thumbUrl}`);

    const productPayload = {
      title: bookData.title,
      slug: bookData.slug,
      sku: bookData.sku,
      type: bookData.type,
      author: bookData.author,
      publisher: bookData.publisher,
      language: bookData.language,
      edition: bookData.edition,
      pages: bookData.pages,
      binding: bookData.binding,
      price: bookData.price,
      salePrice: bookData.salePrice,
      discountPercent: bookData.discountPercent,
      finalPrice: bookData.salePrice,
      stock: bookData.stock,
      allowBackorder: false,
      shortDescription: bookData.shortDescription,
      description: bookData.description,
      highlights: bookData.highlights,
      specifications: bookData.specifications,
      category: new mongoose.Types.ObjectId(bookData.category),
      categorySlug: bookData.categorySlug,
      categoryName: bookData.categoryName,
      subCategory: new mongoose.Types.ObjectId(bookData.subCategory),
      subCategorySlug: bookData.subCategorySlug,
      subCategoryName: bookData.subCategoryName,
      tags: bookData.tags,
      images: [webpImageRecord],
      isActive: true,
      isHidden: false,
      seo: {
        metaTitle: bookData.seo.metaTitle,
        metaDescription: bookData.seo.metaDescription,
        metaKeywords: bookData.seo.metaKeywords,
        ogTitle: bookData.seo.metaTitle,
        ogDescription: bookData.seo.metaDescription,
        ogImage: webpImageRecord.cardUrl || webpImageRecord.url,
      },
    };

    const savedProduct = await Product.findOneAndUpdate(
      { slug: bookData.slug },
      productPayload,
      { upsert: true, new: true, runValidators: true }
    );

    console.log(`✓ Product saved successfully! ID: ${savedProduct._id}`);

    categoryCounts[bookData.category] = (categoryCounts[bookData.category] || 0) + 1;
    if (bookData.subCategory) {
      subCategoryCounts[bookData.subCategory] = (subCategoryCounts[bookData.subCategory] || 0) + 1;
    }
  }

  // Update product counts for categories and subcategories
  console.log('\nUpdating Category & SubCategory product counts...');
  for (const catId of Object.keys(categoryCounts)) {
    const count = await Product.countDocuments({ category: catId, isActive: true });
    await Category.findByIdAndUpdate(catId, { productCount: count });
    console.log(`Updated Category ${catId} productCount -> ${count}`);
  }

  for (const subId of Object.keys(subCategoryCounts)) {
    const count = await Product.countDocuments({ subCategory: subId, isActive: true });
    await SubCategory.findByIdAndUpdate(subId, { productCount: count });
    console.log(`Updated SubCategory ${subId} productCount -> ${count}`);
  }

  console.log('\n=============================================');
  console.log('🎉 ALL 10 BOOKS PROCESSED & UPLOADED SUCCESSFULLY!');
  console.log('=============================================');
  process.exit(0);
}

runBulkUpload().catch((err) => {
  console.error('Error during bulk upload:', err);
  process.exit(1);
});
