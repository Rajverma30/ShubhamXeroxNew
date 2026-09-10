const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

async function run() {
  await mongoose.connect(MONGO_URI);

  const top15 = await Product.find({ isActive: true })
    .sort({ views: -1, soldCount: -1, _id: -1 })
    .limit(15)
    .lean();

  const exactMap = [
    { title: "Parikshadham Samanya Prabandhan", slug: "parikshadham-samanya-prabandhan-book-hindi" },
    { title: "Punekar MPESB MPSI Solved Papers", slug: "punekar-mpesb-mpsi-solved-papers-book" },
    { title: "ExamPedia MPESB Samanya Prabandhan", slug: "exampedia-mpesb-samanya-prabandhan-book" },
    { title: "Punekar MPESB Group 2 Sub Group 4 Notes", slug: "punekar-mpesb-group-2-sub-group-4-notes" },
    { title: "Indian Geography (English Medium)", slug: "indian-geography-spiral-notes-shubham-gupta-english" },
    { title: "General Science Dev Yadav", slug: "general-science-2000-objective-book-dev-yadav" },
    { title: "Modern Indian History (Hindi)", slug: "modern-indian-history-shubham-gupta-hindi" },
    { title: "Punekar MPESB Patwari Solved Papers", slug: "punekar-mpesb-patwari-solved-papers-book" },
    { title: "Madhya Pradesh Pariksha Dham (5th Edition)", slug: "madhya-pradesh-parikshadham-mpgk-5th-edition-book" },
    { title: "ExamPedia MPPSC PYQs GS Paper-1", slug: "exampedia-mppsc-pyqs-gs-paper-1-solved-book" },
    { title: "Ancient Indian History (Hindi)", slug: "ancient-indian-history-shubham-gupta-hindi" },
    { title: "Indian Geography (Hindi Medium)", slug: "indian-geography-spiral-notes-shubham-gupta-hindi" },
    { title: "Computer Parikshadham (3rd Edition)", slug: "computer-parikshadham-praveen-sahu-book" },
    { title: "Modern Indian History (English)", slug: "modern-indian-history-shubham-gupta-english" },
    { title: "Indian Polity by M Laxmikanth", slug: "indian-polity-laxmikanth-8th-edition-hindi" }
  ];

  for (let i = 0; i < top15.length; i++) {
    const p = top15[i];
    const targetSlug = exactMap[i].slug;

    const oldSlugs = p.oldSlugs || [];
    if (p.slug !== targetSlug && !oldSlugs.includes(p.slug)) {
      oldSlugs.push(p.slug);
    }

    await Product.findByIdAndUpdate(p._id, { $set: { slug: targetSlug, oldSlugs: oldSlugs } });
    console.log(`[#${i + 1}] Cleaned Slug: ${targetSlug} | Title: ${p.title.slice(0, 40)}...`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
