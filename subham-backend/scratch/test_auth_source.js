const mongoose = require('mongoose');

const u = encodeURIComponent('shubhamxerox25_db_user');
const p = encodeURIComponent('qAEAS6MTppUzQqUG');

const uris = [
  `mongodb+srv://${u}:${p}@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&authSource=admin`,
  `mongodb+srv://${u}:${p}@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&authSource=subhamxerox`,
  `mongodb+srv://${u}:${p}@salon.ovdjb.mongodb.net/admin?retryWrites=true&w=majority`,
  `mongodb+srv://${u}:${p}@salon.ovdjb.mongodb.net/?retryWrites=true&w=majority`
];

async function run() {
  for (const uri of uris) {
    console.log('Testing URI:', uri);
    try {
      const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 3000 }).asPromise();
      console.log('🎉 SUCCESS! Connected to URI:', uri);
      const count = await conn.db.collection('products').countDocuments();
      console.log(`Total Products: ${count}`);
      await conn.close();
      return true;
    } catch (err) {
      console.log('Failed:', err.message);
    }
  }
  return false;
}

run();
