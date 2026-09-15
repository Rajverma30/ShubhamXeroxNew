const mongoose = require('mongoose');

const host = 'salon.ovdjb.mongodb.net';

const users = [
  'shubhamxerox25_db_user',
  'shubhamxerox25',
  'shubhamxerox25_user',
  'shubhamxerox_user',
  'shubhamxerox',
  'subhamxerox',
  'subhamxerox25'
];

const passes = [
  'mHO6Ry9arlm5o9nF',
  'mHO6Ry9arlm5o9nF',
  '7oDb5EZK9YnnBSkl'
];

const dbs = ['subhamxerox', 'shubhamxerox', 'admin'];

async function testAll() {
  for (const u of users) {
    for (const p of passes) {
      for (const d of dbs) {
        const uri = `mongodb+srv://${encodeURIComponent(u)}:${encodeURIComponent(p)}@${host}/${d}?retryWrites=true&w=majority`;
        try {
          const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 3000 }).asPromise();
          console.log(`✅ SUCCESS! User: "${u}", Pass: "${p}", DB: "${d}"`);
          const collections = await conn.db.listCollections().toArray();
          console.log('Collections:', collections.map(c => c.name));
          await conn.close();
          return;
        } catch (err) {
          // ignore auth failure
        }
      }
    }
  }
  console.log('❌ All tested combinations failed auth.');
}

testAll();
