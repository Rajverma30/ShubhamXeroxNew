const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const productId = '6a8172b4a34317063af19db1';
  const oldSlug = 'parikshadham-samanya-prabandhan-or-or-general-management-or-new-syllabus-book-in-hindi-for-mp-patwari-group-2-subgroup-4-and-all-mppeb-exams-2026-27';
  const newSlug = 'parikshadham-samanya-prabandhan-book-hindi';

  const updateData = {
    slug: newSlug,
    oldSlugs: [oldSlug],
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
    author: "Praveen Sahu",
    publisher: "Parikshadham Publication",
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
  };

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $set: updateData },
    { new: true }
  ).lean();

  console.log('✅ Product updated successfully!');
  console.log('ID:', updatedProduct._id);
  console.log('New Slug:', updatedProduct.slug);
  console.log('Old Slugs:', updatedProduct.oldSlugs);
  console.log('Author:', updatedProduct.author);
  console.log('Publisher:', updatedProduct.publisher);
  console.log('Tags:', updatedProduct.tags);
  console.log('SEO:', updatedProduct.seo);

  await mongoose.disconnect();
}

run().catch(console.error);
