const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const batch = [
  { num: 16, title: 'CTET Paper 2 Social Science Notes', oldSlug: 'ctet-paper-2-social-science-best-notes-updated-edition-by-sachin-choudhary-bilingual', newSlug: 'ctet-paper-2-social-science-sachin-choudhary' },
  { num: 17, title: 'Drishti MPPSC Book 5 (Science & Tech)', oldSlug: 'drishti-mppsc-prelims-practice-series-book-5-3rd-edition-or-includes-1450-2020-2025-pyqs-hindi-medium', newSlug: 'drishti-ias-mppsc-prelims-science-technology-environment-health-hindi' },
  { num: 18, title: 'Drishti MPPSC Book 2 (Geography)', oldSlug: 'drishti-mppsc-prelims-practice-series-book-2-3rd-edition-or-includes-3300-2020-2025-pyqs-hindi-medium', newSlug: 'drishti-ias-mppsc-prelims-geography-india-madhya-pradesh-hindi' },
  { num: 19, title: 'Drishti MPPSC Book 1 (History & Culture)', oldSlug: 'drishti-mppsc-prelims-practice-series-book-1-3rd-edition-or-includes-3300-2020-2025-pyqs-hindi-medium', newSlug: 'drishti-ias-mppsc-prelims-itihas-sanskriti-sahitya-hindi' },
  { num: 20, title: 'Edu Teria Current Affairs Power Book', oldSlug: 'edu-teria-current-affairs-mcqs-power-book-june-2025-to-october-2026-hindi-medium-for-all-competitive-exams', newSlug: 'edu-teria-current-affairs-mcqs-power-book-hindi' },
  { num: 21, title: 'PW NEET 39 Years Physics Solved Papers', oldSlug: 'pw-neet-39-years-physics-chapter-wise-and-topic-wise-solved-papers-2026-1988', newSlug: 'pw-neet-pyq-39-years-physics-2027-english' },
  { num: 22, title: 'ExamPedia MP Current Affairs Yearbook', oldSlug: 'exampedia-madhya-pradesh-current-affairs-yearbook-2026-hindi-medium-2026-mppsc-pre-mains-mpesb-mpsi-adpo-assistant-profe', newSlug: 'exampedia-mp-current-affairs-yearly-book-2026-hindi' },
  { num: 23, title: 'Selection Tak MPGS (English Edition)', oldSlug: 'pre-selection-tak-mpgs-2027-general-studies-for-mppsc-and-mpesb-exams-madhya-pradesh-gs-book-latest-edition-by-selection-tak-publication', newSlug: 'selection-tak-mpgs-2027-english-edition-book' },
  { num: 24, title: 'Geography Marathon PYQs (Suraj Solanki)', oldSlug: 'geography-marathon-topicwise-solved-pyqs-or-or-for-assistant-professor-net-set-1st-grade-pgt-tgt-gic-gdc-and-lt-grade-exams-or-by-dr-suraj-solanki-or-hindi-medium', newSlug: 'geography-marathon-topicwise-solved-pyqs-suraj-solanki-hindi' },
  { num: 25, title: 'Disha MP General Knowledge (2nd Edition)', oldSlug: 'madhya-pradesh-general-knowledge-2nd-edition-by-disha-publication-complete-mp-gk-book-for-mppsc', newSlug: 'disha-madhya-pradesh-general-knowledge-2nd-edition' },
  { num: 26, title: 'Selection Tak MPGK 4th Edition (Hindi)', oldSlug: 'selection-tak-mpgk-4th-edition-madhya-pradesh-selection-tak-2026-mp-gk-2026-all-mppsc-exams-and-other-all-mp-exams-2026', newSlug: 'selection-tak-mpgk-4th-edition-2026-hindi' },
  { num: 27, title: 'Pratiyogita Ghatna Chakra MP Current Affairs', oldSlug: 'pratiyogita-ghatna-chakra-madhya-pradesh-current-affairs-2025-26-mp-gk-annual-book-budget-economic-survey-hindi-medium', newSlug: 'pratiyogita-ghatna-chakra-mp-current-affairs-2026-hindi' },
  { num: 28, title: 'Nirman IAS MPPSC Prelims Unit 7 (Science)', oldSlug: 'nirman-ias-mppsc-prelims-unit-7-science-environment-and-health-1400-objective-questions-english-xerox', newSlug: 'nirman-ias-mppsc-prelims-unit-7-science-environment-english' },
  { num: 29, title: 'Mrunal’s Economy PCB15 (Set of 5)', oldSlug: 'mrunal-s-economy-for-upsc-prelims-2026-27-pcb15-powerhouse-for-prelims-set-of-5-booklets-in-spiral-bound-black-and-white', newSlug: 'mrunals-economy-upsc-prelims-pcb15-set-of-5' },
  { num: 30, title: 'Drishti MPPSC Book 3 (Polity & Constitution)', oldSlug: 'drishti-ias-mppsc-prelims-practice-series-book-3-bharat-evam-madhya-pradesh-ki-sanvaidhanik-vyavastha-polity-and-constitution-or-hindi-medium-or-3rd-edition', newSlug: 'drishti-ias-mppsc-prelims-polity-constitution-hindi' },
];

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  console.log('=== EXACT BATCH 16-30 AUDIT ===');
  for (const b of batch) {
    const pNew = await Product.findOne({ slug: b.newSlug }).lean();
    const pOld = await Product.findOne({ slug: b.oldSlug }).lean();
    console.log(`\nBook ${b.num}: ${b.title}`);
    if (pNew) {
      console.log(`  CURRENT STATE: HAS NEW SLUG -> ${pNew.slug}`);
      console.log(`  oldSlugs:`, pNew.oldSlugs);
      console.log(`  metaTitle:`, pNew.seo?.metaTitle);
    } else if (pOld) {
      console.log(`  CURRENT STATE: STILL HAS OLD SLUG -> ${pOld.slug}`);
      console.log(`  oldSlugs:`, pOld.oldSlugs);
      console.log(`  metaTitle:`, pOld.seo?.metaTitle);
      console.log(`  image alt:`, pOld.images?.[0]?.alt);
    } else {
      console.log(`  CURRENT STATE: NOT FOUND!`);
    }
  }
  await mongoose.disconnect();
}
check();
