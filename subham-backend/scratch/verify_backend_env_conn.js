const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function verifyBackendConn() {
  console.log('Testing subham-backend database connection using process.env.MONGO_URI...');
  console.log('MONGO_URI host:', process.env.MONGO_URI.split('@')[1]);

  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../src/models/Product');
  const count = await Product.countDocuments();
  console.log(`🎉 SUCCESS! Backend connected to new MongoDB cluster! Total Products: ${count}`);

  await mongoose.disconnect();
}

verifyBackendConn().catch(console.error);
