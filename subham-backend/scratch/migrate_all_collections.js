const mongoose = require('mongoose');

const sourceUri = "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";
const targetUri = "mongodb+srv://shubhamxerox25_db_user:qAEAS6MTppUzQqUG@cluster0.08smhkb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=Cluster0";

async function migrateAllCollections() {
  console.log('====================================================');
  console.log('   FULL DATABASE MIGRATION: ALL COLLECTIONS & DATA');
  console.log('====================================================\n');

  console.log('1. Connecting to SOURCE database (salon.ovdjb.mongodb.net)...');
  const sourceConn = await mongoose.createConnection(sourceUri).asPromise();

  console.log('2. Connecting to TARGET database (cluster0.08smhkb.mongodb.net)...');
  const targetConn = await mongoose.createConnection(targetUri).asPromise();

  const collections = await sourceConn.db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name).filter(name => !name.startsWith('system.'));

  console.log(`\nFound ${collectionNames.length} collections to migrate:`);
  console.log(collectionNames.join(', '));
  console.log('\n----------------------------------------------------');

  const summary = [];

  for (const colName of collectionNames) {
    try {
      const docs = await sourceConn.db.collection(colName).find({}).toArray();
      
      // Clear target collection
      await targetConn.db.collection(colName).deleteMany({});

      if (docs.length > 0) {
        await targetConn.db.collection(colName).insertMany(docs);
      }

      const targetCount = await targetConn.db.collection(colName).countDocuments();
      summary.push({ collection: colName, sourceCount: docs.length, targetCount });
      console.log(`✅ Collection "${colName}": ${docs.length} docs copied (Target count: ${targetCount})`);
    } catch (err) {
      console.error(`❌ Error migrating collection "${colName}":`, err.message);
    }
  }

  console.log('\n====================================================');
  console.log('            MIGRATION COMPLETE SUMMARY              ');
  console.log('====================================================');
  summary.forEach(s => {
    console.log(`- ${s.collection.padEnd(25)} : ${s.targetCount} documents`);
  });

  await sourceConn.close();
  await targetConn.close();
}

migrateAllCollections().catch(console.error);
