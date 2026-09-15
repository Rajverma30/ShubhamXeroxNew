const mongoose = require('mongoose');

const DB1_URI = "mongodb+srv://shubhamxerox25_db_user:qAEAS6MTppUzQqUG@cluster0.08smhkb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=Cluster0";
const DB2_URI = "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";

async function compareDBs() {
  console.log('=== CHECKING DB 1 (cluster0.08smhkb.mongodb.net - FROM .env) ===');
  try {
    const conn1 = await mongoose.createConnection(DB1_URI).asPromise();
    const Product1 = conn1.model('Product', new mongoose.Schema({}, { strict: false }));
    const count1 = await Product1.countDocuments();
    const sample1 = await Product1.findOne({ title: /topper temple/i }).lean();
    console.log(`DB 1 Product Count: ${count1}`);
    console.log(`DB 1 Sample Product Title: "${sample1?.title}"`);
    console.log(`DB 1 Sample Product Images:`, sample1?.images?.map(i => i.url));
    await conn1.close();
  } catch (err) {
    console.error('DB 1 Error:', err.message);
  }

  console.log('\n=== CHECKING DB 2 (salon.ovdjb.mongodb.net - OTHER CLUSTER) ===');
  try {
    const conn2 = await mongoose.createConnection(DB2_URI).asPromise();
    const Product2 = conn2.model('Product', new mongoose.Schema({}, { strict: false }));
    const count2 = await Product2.countDocuments();
    const sample2 = await Product2.findOne({ title: /topper temple/i }).lean();
    console.log(`DB 2 Product Count: ${count2}`);
    console.log(`DB 2 Sample Product Title: "${sample2?.title}"`);
    console.log(`DB 2 Sample Product Images:`, sample2?.images?.map(i => i.url));
    await conn2.close();
  } catch (err) {
    console.error('DB 2 Error:', err.message);
  }

  process.exit(0);
}

compareDBs().catch(console.error);
