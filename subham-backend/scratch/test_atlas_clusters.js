const mongoose = require('mongoose');

const u = encodeURIComponent('shubhamxerox25_db_user');
const p = encodeURIComponent('mHO6Ry9arlm5o9nF');

const clusters = [
  'salon.ovdjb.mongodb.net',
  'shubhamxerox.ovdjb.mongodb.net',
  'shubhamxerox25.ovdjb.mongodb.net',
  'subhamxerox.ovdjb.mongodb.net',
  'cluster0.ovdjb.mongodb.net',
  'shubhamxerox.mongodb.net',
  'shubhamxerox25.mongodb.net'
];

async function testAll() {
  for (const host of clusters) {
    const uris = [
      `mongodb+srv://${u}:${p}@${host}/subhamxerox?retryWrites=true&w=majority&authSource=admin`,
      `mongodb+srv://${u}:${p}@${host}/subhamxerox?retryWrites=true&w=majority`,
      `mongodb+srv://${u}:${p}@${host}/admin?retryWrites=true&w=majority`
    ];

    for (const uri of uris) {
      try {
        console.log(`Trying host: ${host} ...`);
        const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 3000 }).asPromise();
        console.log(`🎉 SUCCESS! Connected to host: ${host}`);
        const collections = await conn.db.listCollections().toArray();
        console.log('Collections in target DB:', collections.map(c => c.name));
        await conn.close();
        return { host, uri };
      } catch (err) {
        if (!err.message.includes('ENOTFOUND')) {
          console.log(`Host ${host} responded: ${err.message}`);
        }
      }
    }
  }
  console.log('❌ Could not connect to any cluster with shubhamxerox25_db_user');
  return null;
}

testAll().catch(console.error);
