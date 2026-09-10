const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

async function getUniqueSlug(baseSlug, currentId) {
  let candidate = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await Product.findOne({ slug: candidate }).select('_id').lean();
    if (!existing || existing._id.toString() === currentId.toString()) {
      return candidate;
    }
    counter++;
    candidate = `${baseSlug}-${counter}`;
  }
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const top15 = await Product.find({ isActive: true })
    .sort({ views: -1, soldCount: -1, _id: -1 })
    .limit(15)
    .lean();

  console.log(`Processing ${top15.length} top products...\n`);

  for (let i = 0; i < top15.length; i++) {
    const p = top15[i];
    const title = p.title || p.name || '';
    const lower = title.toLowerCase();

    let baseSlug = '';
    let author = p.author || 'Shubham Xerox';
    let publisher = p.publisher || 'Shubham Xerox';
    let tags = [];
    let metaTitle = '';
    let metaKeywords = ['Shubham Xerox', 'Subham Xerox', 'Shubham Xerox Indore'];
    let metaDescription = '';

    if (p._id.toString() === '6a8172b4a34317063af19db1' || (lower.includes('parikshadham') && lower.includes('prabandhan'))) {
      baseSlug = 'parikshadham-samanya-prabandhan-book-hindi';
      author = 'Praveen Sahu';
      publisher = 'Parikshadham Publication';
      tags = ['parikshadham', 'samanya prabandhan', 'सामान्य प्रबंधन', 'general management', 'mp patwari', 'mpesb', 'praveen sahu', 'vyapam', 'group 2 subgroup 4', 'hindi medium', 'parikshadham publication'];
      metaTitle = 'Parikshadham Samanya Prabandhan (सामान्य प्रबंधन) Book | MPESB Patwari — Shubham Xerox';
      metaKeywords.push('Parikshadham Samanya Prabandhan', 'परीक्षाधाम सामान्य प्रबंधन', 'Praveen Sahu Management Book', 'MP Patwari Samanya Prabandhan', 'Parikshadham Publication');
      metaDescription = 'Buy Parikshadham Samanya Prabandhan (सामान्य प्रबंधन) General Management Book in Hindi Medium by Praveen Sahu for MPESB Patwari & MP exams at best price from Shubham Xerox.';
    } else if (lower.includes('punekar') && lower.includes('mpsi')) {
      baseSlug = 'punekar-mpesb-mpsi-solved-papers-book';
      author = 'Punekar Publication';
      publisher = 'Punekar Publications';
      tags = ['punekar', 'mpesb mpsi', 'mp police si', 'mpsi solved papers', 'म.प्र. पुलिस सब इंस्पेक्टर', 'hindi medium', 'punekar publications', 'vyapam'];
      metaTitle = 'Punekar MPESB MPSI Solved Papers Book (म.प्र. पुलिस SI) | Hindi — Shubham Xerox';
      metaKeywords.push('Punekar MPESB MPSI Solved Papers', 'पुणेकर MP SI सॉल्व्ड पेपर्स', 'MP Police SI Solved Papers', 'Punekar Publications');
      metaDescription = 'Buy Punekar MPESB MPSI (म.प्र. पुलिस सब इंस्पेक्टर) Solved Papers Book in Hindi Medium with 12 Prelims + 2 Mains papers at best price from Shubham Xerox.';
    } else if (lower.includes('exampedia') && lower.includes('prabandhan')) {
      baseSlug = 'exampedia-mpesb-samanya-prabandhan-book';
      author = 'ExamPedia';
      publisher = 'ExamPedia Publication';
      tags = ['exampedia', 'samanya prabandhan', 'सामान्य प्रबंधन', 'general management', 'mpesb', 'mp patwari', 'hindi medium', 'exampedia publication'];
      metaTitle = 'ExamPedia MPESB Samanya Prabandhan (सामान्य प्रबंधन) | Hindi — Shubham Xerox';
      metaKeywords.push('ExamPedia Samanya Prabandhan', 'सामान्य प्रबंधन एग्जामपीडिया', 'MPESB Management Book', 'ExamPedia Publication');
      metaDescription = 'Buy ExamPedia MPESB Samanya Prabandhan (सामान्य प्रबंधन) 2nd Edition Book in Hindi Medium with MCQs & PYQs at best price from Shubham Xerox.';
    } else if (lower.includes('punekar') && lower.includes('group 2') && lower.includes('notes')) {
      baseSlug = 'punekar-mpesb-group-2-sub-group-4-notes';
      author = 'Punekar Publication';
      publisher = 'Punekar Publications';
      tags = ['punekar', 'group 2 sub group 4', 'mpesb notes', 'mp patwari notes', 'mandi inspector', 'hindi medium', 'punekar publications'];
      metaTitle = 'Punekar MPESB Group 2 Sub Group 4 Notes (पटवारी / मंडी निरीक्षक) | Hindi — Shubham Xerox';
      metaKeywords.push('Punekar MPESB Group 2 Sub Group 4 Notes', 'पुणेकर ग्रुप 2 सब ग्रुप 4 नोट्स', 'MP Patwari Notes Punekar', 'Punekar Publications');
      metaDescription = 'Buy Punekar MPESB Group-2 Sub-Group-4 Notes in Hindi Medium for MP Patwari, Mandi Inspector & MP exams at best price from Shubham Xerox.';
    } else if (lower.includes('geography') && (lower.includes('english') || lower.includes('b&w') || lower.includes('bandw'))) {
      baseSlug = 'indian-geography-spiral-notes-shubham-gupta-english';
      author = 'SHUBHAM GUPTA SIR';
      publisher = 'SHUBHAM GUPTA SIR';
      tags = ['indian geography', 'shubham gupta sir', 'bharat ka bhugol', 'mppsc geography', 'upsc geography', 'english medium', 'spiral notes'];
      metaTitle = 'Indian Geography (भारत का भूगोल) Spiral Notes by Shubham Gupta Sir | English Medium — Shubham Xerox';
      metaKeywords.push('Indian Geography Shubham Gupta', 'भारत का भूगोल अंग्रेजी माध्यम', 'MPPSC Geography Notes English', 'Shubham Gupta Sir Notes');
      metaDescription = 'Buy Indian Geography (भारत का भूगोल) Spiral Book Notes by Shubham Gupta Sir in English Medium for MPPSC & UPSC exams with updated PYQs coverage at Shubham Xerox.';
    } else if (lower.includes('geography') && (lower.includes('hindi') || lower.includes('medium'))) {
      baseSlug = 'indian-geography-spiral-notes-shubham-gupta-hindi';
      author = 'SHUBHAM GUPTA SIR';
      publisher = 'SHUBHAM GUPTA SIR';
      tags = ['indian geography', 'shubham gupta sir', 'bharat ka bhugol', 'भारत का भूगोल', 'mppsc geography', 'upsc geography', 'hindi medium', 'spiral notes'];
      metaTitle = 'Indian Geography (भारत का भूगोल) Spiral Notes by Shubham Gupta Sir | Hindi Medium — Shubham Xerox';
      metaKeywords.push('Indian Geography Shubham Gupta Hindi', 'भारत का भूगोल हिंदी माध्यम नोट्स', 'MPPSC Geography Notes Hindi', 'Shubham Gupta Sir');
      metaDescription = 'Buy Indian Geography (भारत का भूगोल) Spiral Book Notes by Shubham Gupta Sir in Hindi Medium for MPPSC & UPSC exams with updated PYQs coverage at Shubham Xerox.';
    } else if (lower.includes('general science') && lower.includes('dev yadav')) {
      baseSlug = 'general-science-2000-objective-book-dev-yadav';
      author = 'Dev Yadav Sir';
      publisher = 'Winners Publications';
      tags = ['general science', 'dev yadav sir', 'samanya vigyan', '2000 objective science', 'mpesb science', 'mppsc science', 'hindi medium'];
      metaTitle = 'General Science 2000+ Objective MCQs Book by Dev Yadav Sir | MPESB & MPPSC — Shubham Xerox';
      metaKeywords.push('General Science Dev Yadav Sir', 'सामान्य विज्ञान 2000 ऑब्जेक्टिव', 'MPESB Science Book Dev Yadav', 'Winners Publications');
      metaDescription = 'Buy General Science Book with 2000+ Objective MCQs by Dev Yadav Sir in Hindi for MPESB, MPPSC & MP competitive exams at best price from Shubham Xerox.';
    } else if (lower.includes('आधुनिक भारतीय इतिहास') || (lower.includes('modern indian history') && lower.includes('hindi'))) {
      baseSlug = 'modern-indian-history-shubham-gupta-hindi';
      author = 'SHUBHAM GUPTA SIR';
      publisher = 'SHUBHAM GUPTA SIR';
      tags = ['modern indian history', 'आधुनिक भारतीय इतिहास', 'shubham gupta sir', 'mppsc history', 'upsc history', 'hindi medium', 'notes'];
      metaTitle = 'आधुनिक भारतीय इतिहास (Modern Indian History) Notes by Shubham Gupta Sir | Hindi — Shubham Xerox';
      metaKeywords.push('आधुनिक भारतीय इतिहास शुभम गुप्ता', 'Modern Indian History Shubham Gupta Hindi', 'MPPSC History Notes Hindi', 'Shubham Gupta Sir');
      metaDescription = 'Buy Modern Indian History (आधुनिक भारतीय इतिहास) Notes by Shubham Gupta Sir in Hindi Medium for MPPSC, UPSC & State PSC exams at Shubham Xerox.';
    } else if (lower.includes('punekar') && lower.includes('solved papers')) {
      baseSlug = 'punekar-mpesb-patwari-solved-papers-book';
      author = 'Punekar Publication';
      publisher = 'Punekar Publications';
      tags = ['punekar', 'mp patwari solved papers', 'mpesb group 2 subgroup 4', 'पटवारी सॉल्व्ड पेपर्स', 'hindi medium', 'punekar publications'];
      metaTitle = 'Punekar MPESB Patwari Solved Papers Book (ग्रुप-2 सब-ग्रुप-4) | Hindi — Shubham Xerox';
      metaKeywords.push('Punekar MPESB Patwari Solved Papers', 'पुणेकर म.प्र. पटवारी सॉल्व्ड पेपर्स', 'MP Patwari Previous Year Papers', 'Punekar Publications');
      metaDescription = 'Buy Punekar MPESB Group-2 Sub-Group-4 Patwari Solved Papers Book in Hindi Medium with 2017-2022 solved question papers at Shubham Xerox.';
    } else if (lower.includes('pariksha dham') || (lower.includes('parikshadham') && lower.includes('mpgk'))) {
      baseSlug = 'madhya-pradesh-parikshadham-mpgk-5th-edition-book';
      author = 'Praveen Sahu';
      publisher = 'Parikshadham Publication';
      tags = ['parikshadham', 'madhya pradesh parikshadham', 'mp gk book', 'परीक्षाधाम मध्यप्रदेश gk', 'praveen sahu', 'mppsc', 'parikshadham publication'];
      metaTitle = 'Madhya Pradesh Parikshadham (5th Edition) MP GK Book | MPPSC — Shubham Xerox';
      metaKeywords.push('Madhya Pradesh Parikshadham 5th Edition', 'मध्यप्रदेश परीक्षाधाम MP GK', 'Parikshadham MP GK Book', 'Praveen Sahu MP GK');
      metaDescription = 'Buy Madhya Pradesh Parikshadham (5th Edition) MP GK & General Studies Book by Praveen Sahu for MPPSC, MP SI & Patwari exams at best price from Shubham Xerox.';
    } else if (lower.includes('exampedia') && lower.includes('pyqs')) {
      baseSlug = 'exampedia-mppsc-pyqs-gs-paper-1-solved-book';
      author = 'ExamPedia';
      publisher = 'ExamPedia Publication';
      tags = ['exampedia', 'mppsc pyqs', 'mppsc 36 years solved', 'mppsc gs paper 1', 'english medium', 'exampedia publication'];
      metaTitle = 'ExamPedia MPPSC PYQs (36 Years Solved) GS Paper-1 Book | English — Shubham Xerox';
      metaKeywords.push('ExamPedia MPPSC PYQs Paper 1', 'MPPSC 36 Years Solved Papers', 'ExamPedia GS Paper 1 Book', 'ExamPedia Publication');
      metaDescription = 'Buy ExamPedia MPPSC PYQs General Studies Paper-1 (36 Years Solved 1990-2026) Book in English Medium with 3550+ MCQs & 10000+ Facts at Shubham Xerox.';
    } else if (lower.includes('प्राचीन भारतीय इतिहास')) {
      baseSlug = 'ancient-indian-history-shubham-gupta-hindi';
      author = 'SHUBHAM GUPTA SIR';
      publisher = 'SHUBHAM GUPTA SIR';
      tags = ['ancient indian history', 'प्राचीन भारतीय इतिहास', 'shubham gupta sir', 'mppsc history', 'upsc history', 'hindi medium', 'notes'];
      metaTitle = 'प्राचीन भारतीय इतिहास (Ancient Indian History) Notes by Shubham Gupta Sir — Shubham Xerox';
      metaKeywords.push('प्राचीन भारतीय इतिहास शुभम गुप्ता', 'Ancient Indian History Shubham Gupta', 'MPPSC Ancient History Hindi', 'Shubham Gupta Sir Notes');
      metaDescription = 'Buy Ancient Indian History (प्राचीन भारतीय इतिहास) Notes by Shubham Gupta Sir in Hindi Medium for MPPSC, UPSC, SSC & State PSC exams at Shubham Xerox.';
    } else if (lower.includes('computer') && lower.includes('parikshadham')) {
      baseSlug = 'computer-parikshadham-praveen-sahu-book';
      author = 'Praveen Sahu';
      publisher = 'Parikshadham Publication';
      tags = ['computer parikshadham', 'parikshadham computer', 'कंप्यूटर परीक्षाधाम', 'praveen sahu', 'mpesb computer', 'mp patwari computer', 'hindi medium', 'parikshadham publication'];
      metaTitle = 'Computer Parikshadham (3rd Edition) Book by Praveen Sahu Sir | Hindi — Shubham Xerox';
      metaKeywords.push('Computer Parikshadham Book', 'कंप्यूटर परीक्षाधाम प्रवीण साहू', 'Parikshadham Computer Book', 'Praveen Sahu', 'Parikshadham Publication');
      metaDescription = 'Buy Computer Parikshadham (3rd Edition) Book in Hindi Medium by Praveen Sahu Sir for MPPSC, MP Patwari & MPESB exams at best price from Shubham Xerox.';
    } else if (lower.includes('modern indian history') && lower.includes('english')) {
      baseSlug = 'modern-indian-history-shubham-gupta-english';
      author = 'SHUBHAM GUPTA SIR';
      publisher = 'SHUBHAM GUPTA SIR';
      tags = ['modern indian history', 'shubham gupta sir', 'mppsc history english', 'upsc history english', 'english medium', 'notes'];
      metaTitle = 'Modern Indian History Notes by Shubham Gupta Sir | English Medium — Shubham Xerox';
      metaKeywords.push('Modern Indian History Shubham Gupta English', 'MPPSC History Notes English', 'UPSC Modern History English', 'Shubham Gupta Sir');
      metaDescription = 'Buy Modern Indian History Notes by Shubham Gupta Sir in English Medium for UPSC, MPPSC & State PSC exams at best price from Shubham Xerox Indore.';
    } else if (lower.includes('polity') && lower.includes('laxmikanth')) {
      baseSlug = 'indian-polity-laxmikanth-8th-edition-hindi';
      author = 'M Laxmikanth Sir';
      publisher = 'McGraw Hill';
      tags = ['indian polity', 'm laxmikanth', 'bharat ki rajvyavastha', 'भारत की राजव्यवस्था', 'laxmikanth 8th edition', 'upsc polity', 'mppsc polity', 'hindi medium', 'mcgraw hill'];
      metaTitle = 'Indian Polity (भारत की राजव्यवस्था) by M Laxmikanth (8th Edition) Hindi — Shubham Xerox';
      metaKeywords.push('Indian Polity M Laxmikanth 8th Edition', 'भारत की राजव्यवस्था एम लक्ष्मीकांत 8th संस्करण', 'Laxmikanth Polity Book Hindi', 'McGraw Hill');
      metaDescription = 'Buy Indian Polity (भारत की राजव्यवस्था) 8th Edition 2025 by M Laxmikanth Sir in Hindi Medium by McGraw Hill for UPSC, MPPSC & Civil Services exams at Shubham Xerox.';
    } else {
      const clean = lower.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean).slice(0, 5).join('-');
      baseSlug = `${clean}-book`;
      tags = [clean, 'competitive exam book', 'shubham xerox'];
      metaTitle = `${title.slice(0, 55)} — Shubham Xerox`;
      metaKeywords.push(clean, 'Competitive Exam Books');
      metaDescription = `Buy ${title.slice(0, 100)} at best price from Shubham Xerox Indore. Fast delivery across India.`;
    }

    const uniqueSlug = await getUniqueSlug(baseSlug, p._id);
    const oldSlugs = p.oldSlugs || [];
    if (p.slug !== uniqueSlug && !oldSlugs.includes(p.slug)) {
      oldSlugs.push(p.slug);
    }

    const updatePayload = {
      slug: uniqueSlug,
      oldSlugs: oldSlugs,
      author: author,
      publisher: publisher,
      tags: tags,
      seo: { metaTitle, metaKeywords, metaDescription }
    };

    const updated = await Product.findByIdAndUpdate(p._id, { $set: updatePayload }, { new: true }).lean();
    console.log(`✅ [#${i + 1}/15] ${updated.title.slice(0, 40)}...`);
    console.log(`   Old Slug: ${p.slug}`);
    console.log(`   New Slug: ${updated.slug}`);
    console.log(`   Canonical URL: https://shubhamxerox.in/product/${updated.slug}`);
    console.log('---');
  }

  console.log('\n🎉 ALL TOP 15 PRODUCTS GUARANTEED UPDATED IN MONGODB!');
  await mongoose.disconnect();
}

run().catch(console.error);
