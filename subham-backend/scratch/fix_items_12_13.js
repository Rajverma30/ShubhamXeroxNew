const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

async function run() {
  await mongoose.connect(MONGO_URI);

  // Fix Item #12: Indian Geography Hindi
  await Product.findByIdAndUpdate('6a7f10e9bb698131eb051c7b', {
    $set: {
      tags: ["indian geography", "shubham gupta sir", "bharat ka bhugol", "भारत का भूगोल", "mppsc geography", "upsc geography", "hindi medium", "spiral notes"],
      "seo.metaTitle": "Indian Geography (भारत का भूगोल) Spiral Notes by Shubham Gupta Sir | Hindi Medium — Shubham Xerox",
      "seo.metaKeywords": ["Indian Geography Shubham Gupta Hindi", "भारत का भूगोल हिंदी माध्यम नोट्स", "MPPSC Geography Notes Hindi", "Shubham Gupta Sir", "Shubham Xerox"],
      "seo.metaDescription": "Buy Indian Geography (भारत का भूगोल) Spiral Book Notes by Shubham Gupta Sir in Hindi Medium for MPPSC & UPSC exams with updated PYQs coverage at Shubham Xerox."
    }
  });

  // Fix Item #13: Computer Parikshadham
  await Product.findByIdAndUpdate('6a7f10dfbb698131eb051acf', {
    $set: {
      tags: ["computer parikshadham", "parikshadham computer", "कंप्यूटर परीक्षाधाम", "praveen sahu", "mpesb computer", "mp patwari computer", "hindi medium", "parikshadham publication"],
      "seo.metaTitle": "Computer Parikshadham (3rd Edition) Book by Praveen Sahu Sir | Hindi — Shubham Xerox",
      "seo.metaKeywords": ["Computer Parikshadham Book", "कंप्यूटर परीक्षाधाम प्रवीण साहू", "Parikshadham Computer Book", "Praveen Sahu", "Parikshadham Publication", "Shubham Xerox"],
      "seo.metaDescription": "Buy Computer Parikshadham (3rd Edition) Book in Hindi Medium by Praveen Sahu Sir for MPPSC, MP Patwari, MPESB & MP competitive exams at best price from Shubham Xerox."
    }
  });

  console.log('✅ Items #12 and #13 metadata perfectly fixed!');
  await mongoose.disconnect();
}

run().catch(console.error);
