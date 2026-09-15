const mongoose = require('mongoose');

const u = encodeURIComponent('shubhamxerox25_db_user');
const p = encodeURIComponent('qAEAS6MTppUzQqUG');
const host = 'cluster0.08smhkb.mongodb.net';
const targetUri = `mongodb+srv://${u}:${p}@${host}/subhamxerox?retryWrites=true&w=majority&appName=Cluster0`;

async function testConn() {
  console.log('Testing connection to NEW MongoDB Cluster: cluster0.08smhkb.mongodb.net ...');
  try {
    const conn = await mongoose.createConnection(targetUri).asPromise();
    console.log('🎉 SUCCESS! Connected to NEW MongoDB Atlas Cluster!');
    const collections = await conn.db.listCollections().toArray();
    console.log('Collections in target DB:', collections.map(c => c.name));
    
    const count = await conn.db.collection('products').countDocuments();
    console.log(`Total Products in target DB: ${count}`);

    await conn.close();
    return true;
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
    return false;
  }
}

testConn();
