const mongoose = require('mongoose');

const sourceUri = "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox";
const targetUri = "mongodb+srv://shubhamxerox25_db_user:qAEAS6MTppUzQqUG@cluster0.08smhkb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=Cluster0";

async function migrateProducts() {
  console.log('--- STARTING PRODUCT DATA MIGRATION ---');
  console.log('1. Connecting to SOURCE database (salon.ovdjb.mongodb.net)...');
  const sourceConn = await mongoose.createConnection(sourceUri).asPromise();
  const sourceProducts = await sourceConn.db.collection('products').find({}).toArray();
  console.log(`Source DB Products Count: ${sourceProducts.length}`);

  console.log('\n2. Connecting to TARGET database (cluster0.08smhkb.mongodb.net)...');
  const targetConn = await mongoose.createConnection(targetUri).asPromise();
  
  console.log('3. Clearing existing products in TARGET database...');
  await targetConn.db.collection('products').deleteMany({});

  console.log(`4. Inserting all ${sourceProducts.length} clean products into TARGET database...`);
  await targetConn.db.collection('products').insertMany(sourceProducts);

  const targetCount = await targetConn.db.collection('products').countDocuments();
  console.log(`\n🎉 MIGRATION COMPLETE! Total Products in TARGET Database: ${targetCount}`);

  await sourceConn.close();
  await targetConn.close();
}

migrateProducts().catch(console.error);
