const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function findConfirmed91() {
  await mongoose.connect(process.env.MONGO_URI);
  const Order = require('../src/models/Order');

  const orders = await Order.find({ 'customer.phone': /^91/, status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } }).lean();
  console.log(`Found ${orders.length} confirmed orders with 91 phone:`);
  orders.forEach(o => {
    console.log(`Order #${o.orderNumber} | Name: ${o.customer?.name} | Phone: ${o.customer?.phone} | Email: ${o.customer?.email} | Total: ₹${o.total}`);
  });

  mongoose.disconnect();
}

findConfirmed91();
