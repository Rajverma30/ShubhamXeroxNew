const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function fixRanuPhone() {
  await mongoose.connect(process.env.MONGO_URI);
  const Order = require('../src/models/Order');

  // Fix Your Name's confirmed order #SX-260909-SD5CG
  const res1 = await Order.updateOne(
    { orderNumber: 'SX-260909-SD5CG' },
    { $set: { 'customer.phone': '7697418191', 'shippingAddress.phone': '7697418191' } }
  );
  console.log('Your Name phone update result:', res1);

  // Fix Atul Shukla's confirmed order #SX-260904-FFCJV
  const res2 = await Order.updateOne(
    { orderNumber: 'SX-260904-FFCJV' },
    { $set: { 'customer.phone': '8871227703', 'shippingAddress.phone': '8871227703' } }
  );
  console.log('Atul Shukla phone update result:', res2);

  mongoose.disconnect();
}

fixRanuPhone();
