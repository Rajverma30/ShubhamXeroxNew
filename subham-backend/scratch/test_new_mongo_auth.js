const mongoose = require('mongoose');

const u = 'shubhamxerox25_db_user';
const p = 'mHO6Ry9arlm5o9nF';
const host = 'salon.ovdjb.mongodb.net';

const testOptions = [
  `mongodb+srv://${u}:${p}@${host}/subhamxerox?retryWrites=true&w=majority`,
  `mongodb+srv://${u}:${p}@${host}/subhamxerox?retryWrites=true&w=majority&authSource=subhamxerox`,
  `mongodb+srv://${u}:${p}@${host}/subhamxerox?retryWrites=true&w=majority&authSource=admin`,
  `mongodb+srv://${u}:${p}@${host}/admin?retryWrites=true&w=majority`,
  `mongodb+srv://${u}:${p}@${host}/shubhamxerox?retryWrites=true&w=majority`,
  `mongodb+srv://${u}:${p}@${host}/shubhamxerox25?retryWrites=true&w=majority`
];

async function run() {
  for (const uri of testOptions) {
    console.log('Testing URI:', uri);
    try {
      const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 3000 }).asPromise();
      console.log('✅ CONNECTED SUCCESS! URI:', uri);
      const collections = await conn.db.listCollections().toArray();
      console.log('Collections:', collections.map(c => c.name));
      await conn.close();
      return true;
    } catch (err) {
      console.log('Failed:', err.message);
    }
  }
  return false;
}

run();
