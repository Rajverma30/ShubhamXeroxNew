const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function inspectDetails() {
  await mongoose.connect(process.env.MONGO_URI);
  const Order = require('../src/models/Order');

  console.log('=== Your Name ORDERS ===');
  const ranuOrders = await Order.find({ 'customer.name': /ranu/i }).sort({ createdAt: -1 }).lean();
  ranuOrders.forEach(o => {
    console.log(JSON.stringify(o, null, 2));
  });

  console.log('\n=== SAJAL CHOUKSEY ORDERS ===');
  const sajalOrders = await Order.find({ 'customer.name': /sajal/i }).sort({ createdAt: -1 }).lean();
  sajalOrders.forEach(o => {
    console.log(JSON.stringify(o, null, 2));
  });

  mongoose.disconnect();
}

inspectDetails();
