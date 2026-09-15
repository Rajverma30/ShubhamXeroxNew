const mongoose = require('mongoose');

const host = 'salon.ovdjb.mongodb.net';
const p = encodeURIComponent('Shubhamxerox25');

const userVariants = [
  'shubhamxerox25_db_user',
  'shubhamxerox25',
  'shubhamxerox25_user',
  'subhamxerox25',
  'subhamxerox25_db_user',
  'shubhamxerox_user',
  'shubhamxerox',
  'subhamxerox',
  'shubham',
  'Raj Verma',
  'rajverma'
];

async function run() {
  for (const u of userVariants) {
    const uri = `mongodb+srv://${encodeURIComponent(u)}:${p}@${host}/subhamxerox?retryWrites=true&w=majority`;
    try {
      const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 3000 }).asPromise();
      console.log(`🎉 SUCCESS! Connected with Username: "${u}" and Password: "Shubhamxerox25"`);
      const count = await conn.db.collection('products').countDocuments();
      console.log(`Total Products: ${count}`);
      await conn.close();
      return u;
    } catch (err) {
      if (!err.message.includes('ENOTFOUND')) {
        console.log(`User "${u}" failed: ${err.message}`);
      }
    }
  }
  console.log('❌ All tested user variants failed.');
  return null;
}

run();
