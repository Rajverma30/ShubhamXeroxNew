require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

async function updateStockFloor() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is missing');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    const result = await Product.updateMany(
      { type: { $ne: 'ebook' }, $or: [{ stock: { $lt: 3 } }, { stock: { $exists: false } }, { stock: null }] },
      { $set: { stock: 10 } }
    );

    console.log(`✅ Successfully updated ${result.modifiedCount} products to minimum 10 stock floor!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error updating stock floor:', err);
    process.exit(1);
  }
}

updateStockFloor();
