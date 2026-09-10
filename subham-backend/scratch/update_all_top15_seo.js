const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

const productsUpdateList = [
  {
    id: "6a8172b4a34317063af19db1",
    newSlug: "parikshadham-samanya-prabandhan-book-hindi",
    oldSlug: "parikshadham-samanya-prabandhan-or-or-general-management-or-new-syllabus-book-in-hindi-for-mp-patwari-group-2-subgroup-4-and-all-mppeb-exams-2026-27",
    author: "Praveen Sahu",
    publisher: "Parikshadham Publication",
    tags: [
      "parikshadham",
      "samanya prabandhan",
      "सामान्य प्रबंधन",
      "general management",
      "mp patwari",
      "mpesb",
      "praveen sahu",
      "vyapam",
      "group 2 subgroup 4",
      "mppsc paper 4",
      "hindi medium",
      "parikshadham publication"
    ],
    seo: {
      metaTitle: "Parikshadham Samanya Prabandhan (सामान्य प्रबंधन) Book | MPESB Patwari — Shubham Xerox",
      metaKeywords: [
        "Parikshadham Samanya Prabandhan",
        "परीक्षाधाम सामान्य प्रबंधन",
        "Parikshadham General Management Book",
        "Praveen Sahu Management Book",
        "MP Patwari Samanya Prabandhan",
        "MPESB General Management Book",
        "Parikshadham Publication Indore",
        "Shubham Xerox"
      ],
      metaDescription: "Buy Parikshadham Samanya Prabandhan (सामान्य प्रबंधन) General Management Book in Hindi Medium by Praveen Sahu for MPESB Patwari, Group-2 Subgroup-4 & MP exams at best price from Shubham Xerox Indore."
    }
  },
  {
    id: "6a85f838a34317063af2cd24",
    newSlug: "punekar-mpesb-mpsi-solved-papers-book",
    oldSlug: "mpesb-mpsi-solved-papers-book-2025-26-or-madhya-pradesh-police-sub-inspector-si-pre-and-mains-or-12-prelims-2-mains-solved-papers-or-hindi-medium-or-detailed-explanatory-solutions",
    author: "Punekar Publication",
    publisher: "Punekar Publications",
    tags: [
      "punekar",
      "mpesb mpsi",
      "mp police si",
      "mpsi solved papers",
      "म.प्र. पुलिस सब इंस्पेक्टर",
      "hindi medium",
      "punekar publications",
      "vyapam"
    ],
    seo: {
      metaTitle: "Punekar MPESB MPSI Solved Papers Book (म.प्र. पुलिस SI) | Hindi Medium — Shubham Xerox",
      metaKeywords: [
        "Punekar MPESB MPSI Solved Papers",
        "पुणेकर MP SI सॉल्व्ड पेपर्स",
        "MP Police SI Solved Papers Book",
        "MPESB SI Exam Book Hindi",
        "Punekar Publications",
        "Shubham Xerox"
      ],
      metaDescription: "Buy Punekar MPESB MPSI (म.प्र. पुलिस सब इंस्पेक्टर) Solved Papers Book in Hindi Medium. Contains 12 Prelims + 2 Mains Solved Papers with detailed solutions at best price from Shubham Xerox."
    }
  },
  {
    id: "6a804eb4bb698131eb058d83",
    newSlug: "exampedia-mpesb-samanya-prabandhan-book",
    oldSlug: "exampedia-mpesb-samanya-prabandhan-fundamentals-and-principles-or-2nd-edition-2026-27-or-theory-chapterwise-mcqs-pyqs-or-ncert-ignou-and-nios-based-or-hindi-medium",
    author: "ExamPedia",
    publisher: "ExamPedia Publication",
    tags: [
      "exampedia",
      "samanya prabandhan",
      "सामान्य प्रबंधन",
      "general management",
      "mpesb",
      "mp patwari",
      "hindi medium",
      "exampedia publication"
    ],
    seo: {
      metaTitle: "ExamPedia MPESB Samanya Prabandhan (सामान्य प्रबंधन) | Hindi Medium — Shubham Xerox",
      metaKeywords: [
        "ExamPedia Samanya Prabandhan",
        "सामान्य प्रबंधन एग्जामपीडिया",
        "MPESB Management Book",
        "MP Patwari Samanya Prabandhan",
        "ExamPedia Publication",
        "Shubham Xerox"
      ],
      metaDescription: "Buy ExamPedia MPESB Samanya Prabandhan (सामान्य प्रबंधन) 2nd Edition Book in Hindi. Covers theory, chapterwise MCQs & PYQs for MPESB Patwari & state exams from Shubham Xerox."
    }
  },
  {
    id: "6a81577fa34317063af198db",
    newSlug: "punekar-mpesb-group-2-sub-group-4-notes",
    oldSlug: "mpesb-group-2-sub-group-4-notes-2026-or-patwari-mandi-inspector-amin-assistant-auditor-gramodyog-extension-officer-or-hindi-medium-or-latest-study-notes",
    author: "Punekar Publication",
    publisher: "Punekar Publications",
    tags: [
      "punekar",
      "group 2 sub group 4",
      "mpesb notes",
      "mp patwari notes",
      "mandi inspector",
      "hindi medium",
      "punekar publications"
    ],
    seo: {
      metaTitle: "Punekar MPESB Group 2 Sub Group 4 Notes (पटवारी / मंडी निरीक्षक) | Hindi — Shubham Xerox",
      metaKeywords: [
        "Punekar MPESB Group 2 Sub Group 4 Notes",
        "पुणेकर ग्रुप 2 सब ग्रुप 4 नोट्स",
        "MP Patwari Notes Punekar",
        "Mandi Inspector Notes",
        "Punekar Publications",
        "Shubham Xerox"
      ],
      metaDescription: "Buy Punekar MPESB Group-2 Sub-Group-4 Notes in Hindi Medium for MP Patwari, Mandi Inspector, Assistant Auditor & MP exams at best price from Shubham Xerox Indore."
    }
  },
  {
    id: "6a7f10e8bb698131eb051c5b",
    newSlug: "indian-geography-spiral-notes-shubham-gupta-english",
    oldSlug: "indian-geography-spiral-book-by-shubham-gupta-or-complete-syllabus-for-mppscupsc-or-english-medium-or-updated-notes-and-pyq-coverage-bandw",
    author: "SHUBHAM GUPTA SIR",
    publisher: "SHUBHAM GUPTA SIR",
    tags: [
      "indian geography",
      "shubham gupta sir",
      "bharat ka bhugol",
      "mppsc geography",
      "upsc geography",
      "english medium",
      "spiral notes"
    ],
    seo: {
      metaTitle: "Indian Geography (भारत का भूगोल) Spiral Notes by Shubham Gupta Sir | English Medium — Shubham Xerox",
      metaKeywords: [
        "Indian Geography Shubham Gupta",
        "भारत का भूगोल अंग्रेजी माध्यम",
        "MPPSC Geography Notes English",
        "UPSC Geography Notes",
        "Shubham Gupta Sir Notes",
        "Shubham Xerox"
      ],
      metaDescription: "Buy Indian Geography (भारत का भूगोल) Spiral Book Notes by Shubham Gupta Sir in English Medium for MPPSC & UPSC exams with updated PYQs coverage at Shubham Xerox."
    }
  },
  {
    id: "6a87c12616ffd6c95361fe15",
    newSlug: "general-science-2000-objective-book-dev-yadav",
    oldSlug: "general-science-book-2000-objective-questions-or-questions-asked-in-2025-exams-or-aptech-pattern-or-mpesb-mppsc-and-madhya-pradesh-competitive-exams-or-by-dev-yadav-sir",
    author: "Dev Yadav Sir",
    publisher: "Winners Publications",
    tags: [
      "general science",
      "dev yadav sir",
      "samanya vigyan",
      "2000 objective science",
      "mpesb science",
      "mppsc science",
      "hindi medium"
    ],
    seo: {
      metaTitle: "General Science 2000+ Objective MCQs Book by Dev Yadav Sir | MPESB & MPPSC — Shubham Xerox",
      metaKeywords: [
        "General Science Dev Yadav Sir",
        "सामान्य विज्ञान 2000 ऑब्जेक्टिव",
        "MPESB Science Book Dev Yadav",
        "MPPSC General Science",
        "Winners Publications",
        "Shubham Xerox"
      ],
      metaDescription: "Buy General Science Book with 2000+ Objective MCQs by Dev Yadav Sir in Hindi for MPESB, MPPSC & MP competitive exams at best price from Shubham Xerox Indore."
    }
  },
  {
    id: "6a7f10e7bb698131eb051c20",
    newSlug: "modern-indian-history-shubham-gupta-hindi",
    oldSlug: "latest-edition-2026-upsc-mppsc-other-state-psc-by-shubham-gupta-hindi-medium-print-out",
    author: "SHUBHAM GUPTA SIR",
    publisher: "SHUBHAM GUPTA SIR",
    tags: [
      "modern indian history",
      "आधुनिक भारतीय इतिहास",
      "shubham gupta sir",
      "mppsc history",
      "upsc history",
      "hindi medium",
      "notes"
    ],
    seo: {
      metaTitle: "आधुनिक भारतीय इतिहास (Modern Indian History) Notes by Shubham Gupta Sir | Hindi Medium — Shubham Xerox",
      metaKeywords: [
        "आधुनिक भारतीय इतिहास शुभम गुप्ता",
        "Modern Indian History Shubham Gupta Hindi",
        "MPPSC History Notes Hindi",
        "UPSC Modern History Hindi",
        "Shubham Gupta Sir",
        "Shubham Xerox"
      ],
      metaDescription: "Buy Modern Indian History (आधुनिक भारतीय इतिहास) Notes by Shubham Gupta Sir in Hindi Medium for MPPSC, UPSC & State PSC exams at Shubham Xerox Indore."
    }
  },
  {
    id: "6a815c66a34317063af19958",
    newSlug: "punekar-mpesb-patwari-solved-papers-book",
    oldSlug: "mpesb-group-2-sub-group-4-patwari-solved-papers-book-2027-or-selected-question-papers-2022-2017-or-hindi-medium-or-madhya-pradesh-employee-selection-board-mpesb-exam-preparation",
    author: "Punekar Publication",
    publisher: "Punekar Publications",
    tags: [
      "punekar",
      "mp patwari solved papers",
      "mpesb group 2 subgroup 4",
      "पटवारी सॉल्व्ड पेपर्स",
      "hindi medium",
      "punekar publications"
    ],
    seo: {
      metaTitle: "Punekar MPESB Patwari Solved Papers Book (ग्रुप-2 सब-ग्रुप-4) | Hindi — Shubham Xerox",
      metaKeywords: [
        "Punekar MPESB Patwari Solved Papers",
        "पुणेकर म.प्र. पटवारी सॉल्व्ड पेपर्स",
        "MP Patwari Previous Year Papers",
        "Punekar Publications",
        "Shubham Xerox"
      ],
      metaDescription: "Buy Punekar MPESB Group-2 Sub-Group-4 Patwari Solved Papers Book in Hindi Medium. Contains 2017-2022 solved question papers for MP Patwari exam at Shubham Xerox."
    }
  },
  {
    id: "6a7f10e7bb698131eb051c27",
    newSlug: "madhya-pradesh-parikshadham-mpgk-5th-edition-book",
    oldSlug: "madhya-pradesh-pariksha-dham-2026-5th-edition-mp-general-studies-mpgk-for-mppsc-state-exams",
    author: "Praveen Sahu",
    publisher: "Parikshadham Publication",
    tags: [
      "parikshadham",
      "madhya pradesh parikshadham",
      "mp gk book",
      "परीक्षाधाम मध्यप्रदेश gk",
      "praveen sahu",
      "mppsc",
      "parikshadham publication"
    ],
    seo: {
      metaTitle: "Madhya Pradesh Parikshadham (5th Edition) MP GK Book | MPPSC & MP Exams — Shubham Xerox",
      metaKeywords: [
        "Madhya Pradesh Parikshadham 5th Edition",
        "मध्यप्रदेश परीक्षाधाम MP GK",
        "Parikshadham MP GK Book",
        "Praveen Sahu MP GK",
        "Parikshadham Publication",
        "Shubham Xerox"
      ],
      metaDescription: "Buy Madhya Pradesh Parikshadham (5th Edition) MP GK & General Studies Book by Praveen Sahu for MPPSC, MP SI & Patwari exams at best price from Shubham Xerox."
    }
  },
  {
    id: "6a8553dfa34317063af2a906",
    newSlug: "exampedia-mppsc-pyqs-gs-paper-1-solved-book",
    oldSlug: "pre-order-exampedia-mppsc-pyqs-general-studies-paper-1-part-a-or-36-years-solved-previous-year-questions-1990-2026-or-80-gs-papers-or-3550-questions-or-10000-facts-or-hindi-medium-or-first-edition",
    author: "ExamPedia",
    publisher: "ExamPedia Publication",
    tags: [
      "exampedia",
      "mppsc pyqs",
      "mppsc 36 years solved",
      "mppsc gs paper 1",
      "english medium",
      "exampedia publication"
    ],
    seo: {
      metaTitle: "ExamPedia MPPSC PYQs (36 Years Solved) GS Paper-1 Book | English — Shubham Xerox",
      metaKeywords: [
        "ExamPedia MPPSC PYQs Paper 1",
        "MPPSC 36 Years Solved Papers",
        "ExamPedia GS Paper 1 Book",
        "MPPSC English Medium Solved Papers",
        "Shubham Xerox"
      ],
      metaDescription: "Buy ExamPedia MPPSC PYQs General Studies Paper-1 (36 Years Solved 1990-2026) Book in English Medium with 3550+ MCQs & 10000+ Facts at Shubham Xerox."
    }
  },
  {
    id: "6a7f10f3bb698131eb051e39",
    newSlug: "ancient-indian-history-shubham-gupta-hindi",
    oldSlug: "state-psc-ssc-other-competitive-exams-by-shuham-gupta-sir-2",
    author: "SHUBHAM GUPTA SIR",
    publisher: "SHUBHAM GUPTA SIR",
    tags: [
      "ancient indian history",
      "प्राचीन भारतीय इतिहास",
      "shubham gupta sir",
      "mppsc history",
      "upsc history",
      "hindi medium",
      "notes"
    ],
    seo: {
      metaTitle: "प्राचीन भारतीय इतिहास (Ancient Indian History) Notes by Shubham Gupta Sir — Shubham Xerox",
      metaKeywords: [
        "प्राचीन भारतीय इतिहास शुभम गुप्ता",
        "Ancient Indian History Shubham Gupta",
        "MPPSC Ancient History Hindi",
        "Shubham Gupta Sir Notes",
        "Shubham Xerox"
      ],
      metaDescription: "Buy Ancient Indian History (प्राचीन भारतीय इतिहास) Notes by Shubham Gupta Sir in Hindi Medium for MPPSC, UPSC, SSC & State PSC exams at Shubham Xerox."
    }
  },
  {
    id: "6a7f10e9bb698131eb051c7b",
    newSlug: "indian-geography-spiral-notes-shubham-gupta-hindi",
    oldSlug: "indian-geography-spiral-book-by-shubham-gupta-complete-syllabus-for-mppsc-upsc-hindi-medium-updated-notes-pyq-coverage-b",
    author: "SHUBHAM GUPTA SIR",
    publisher: "SHUBHAM GUPTA SIR",
    tags: [
      "indian geography",
      "shubham gupta sir",
      "bharat ka bhugol",
      "भारत का भूगोल",
      "mppsc geography",
      "upsc geography",
      "hindi medium",
      "spiral notes"
    ],
    seo: {
      metaTitle: "Indian Geography (भारत का भूगोल) Spiral Notes by Shubham Gupta Sir | Hindi Medium — Shubham Xerox",
      metaKeywords: [
        "Indian Geography Shubham Gupta Hindi",
        "भारत का भूगोल हिंदी माध्यम नोट्स",
        "MPPSC Geography Notes Hindi",
        "Shubham Gupta Sir",
        "Shubham Xerox"
      ],
      metaDescription: "Buy Indian Geography (भारत का भूगोल) Spiral Book Notes by Shubham Gupta Sir in Hindi Medium for MPPSC & UPSC exams with updated PYQs coverage at Shubham Xerox."
    }
  },
  {
    id: "6a7f10dfbb698131eb051acf",
    newSlug: "computer-parikshadham-praveen-sahu-book",
    oldSlug: "pariksha-dham-computer-parikshadham-2025-by-praveen-sahu-3rd-edition-hindi-medium",
    author: "Praveen Sahu",
    publisher: "Parikshadham Publication",
    tags: [
      "computer parikshadham",
      "parikshadham computer",
      "कंप्यूटर परीक्षाधाम",
      "praveen sahu",
      "mpesb computer",
      "mp patwari computer",
      "hindi medium",
      "parikshadham publication"
    ],
    seo: {
      metaTitle: "Computer Parikshadham (3rd Edition) Book by Praveen Sahu Sir | Hindi — Shubham Xerox",
      metaKeywords: [
        "Computer Parikshadham Book",
        "कंप्यूटर परीक्षाधाम प्रवीण साहू",
        "Parikshadham Computer Book",
        "MP Patwari Computer Book",
        "Praveen Sahu",
        "Parikshadham Publication",
        "Shubham Xerox"
      ],
      metaDescription: "Buy Computer Parikshadham (3rd Edition) Book in Hindi Medium by Praveen Sahu Sir for MPPSC, MP Patwari, MPESB & MP competitive exams at best price from Shubham Xerox."
    }
  },
  {
    id: "6a7f10e6bb698131eb051bff",
    newSlug: "modern-indian-history-shubham-gupta-english",
    oldSlug: "modern-indian-history-latest-edition-2026-upsc-mppsc-other-state-psc-by-shubham-gupta-english-medium-print-out",
    author: "SHUBHAM GUPTA SIR",
    publisher: "SHUBHAM GUPTA SIR",
    tags: [
      "modern indian history",
      "shubham gupta sir",
      "mppsc history english",
      "upsc history english",
      "english medium",
      "notes"
    ],
    seo: {
      metaTitle: "Modern Indian History Notes by Shubham Gupta Sir | English Medium — Shubham Xerox",
      metaKeywords: [
        "Modern Indian History Shubham Gupta English",
        "MPPSC History Notes English",
        "UPSC Modern History English",
        "Shubham Gupta Sir",
        "Shubham Xerox"
      ],
      metaDescription: "Buy Modern Indian History Notes by Shubham Gupta Sir in English Medium for UPSC, MPPSC & State PSC exams at best price from Shubham Xerox Indore."
    }
  },
  {
    id: "6a7f10ffbb698131eb052046",
    newSlug: "indian-polity-laxmikanth-8th-edition-hindi",
    oldSlug: "indian-polity-by-m-laxmikanth-8th-edition-2025-hindi-mcgraw-hill-civil-services-exam-book",
    author: "M Laxmikanth Sir",
    publisher: "McGraw Hill",
    tags: [
      "indian polity",
      "m laxmikanth",
      "bharat ki rajvyavastha",
      "भारत की राजव्यवस्था",
      "laxmikanth 8th edition",
      "upsc polity",
      "mppsc polity",
      "hindi medium",
      "mcgraw hill"
    ],
    seo: {
      metaTitle: "Indian Polity (भारत की राजव्यवस्था) by M Laxmikanth (8th Edition) Hindi — Shubham Xerox",
      metaKeywords: [
        "Indian Polity M Laxmikanth 8th Edition",
        "भारत की राजव्यवस्था एम लक्ष्मीकांत 8th संस्करण",
        "Laxmikanth Polity Book Hindi",
        "UPSC Polity Book Hindi",
        "McGraw Hill",
        "Shubham Xerox"
      ],
      metaDescription: "Buy Indian Polity (भारत की राजव्यवस्था) 8th Edition 2025 by M Laxmikanth Sir in Hindi Medium by McGraw Hill for UPSC, MPPSC & Civil Services exams at Shubham Xerox."
    }
  }
];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  for (let i = 0; i < productsUpdateList.length; i++) {
    const item = productsUpdateList[i];
    const existing = await Product.findById(item.id).lean();
    if (!existing) {
      console.log(`❌ Product ID ${item.id} not found.`);
      continue;
    }

    const oldSlugsList = existing.oldSlugs || [];
    if (!oldSlugsList.includes(item.oldSlug) && item.oldSlug !== item.newSlug) {
      oldSlugsList.push(item.oldSlug);
    }
    if (existing.slug !== item.newSlug && !oldSlugsList.includes(existing.slug)) {
      oldSlugsList.push(existing.slug);
    }

    const updatePayload = {
      slug: item.newSlug,
      oldSlugs: oldSlugsList,
      author: item.author || existing.author,
      publisher: item.publisher || existing.publisher,
      tags: item.tags,
      seo: item.seo
    };

    const updated = await Product.findByIdAndUpdate(item.id, { $set: updatePayload }, { new: true }).lean();
    console.log(`✅ Updated [${i + 1}/15]: ${updated.title.slice(0, 45)}...`);
    console.log(`   New Slug: ${updated.slug}`);
    console.log(`   Old Slugs: ${JSON.stringify(updated.oldSlugs)}`);
    console.log(`   Meta Title: ${updated.seo?.metaTitle}`);
    console.log('---');
  }

  console.log('🎉 ALL 15 TOP PRODUCTS UPDATED SUCCESSFULLY IN DATABASE!');
  await mongoose.disconnect();
}

run().catch(console.error);
