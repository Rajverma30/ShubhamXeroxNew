const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function checkCollections() {
  await mongoose.connect(process.env.MONGO_URI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('MongoDB Collections in Database:');
  collections.forEach(c => console.log(' -', c.name));
  
  process.exit(0);
}

checkCollections().catch(console.error);
