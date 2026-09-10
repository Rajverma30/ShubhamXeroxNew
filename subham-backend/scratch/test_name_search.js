const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function testNameSearch() {
  await mongoose.connect(process.env.MONGO_URI);
  const Order = require('../src/models/Order');

  const searchTerms = ['Ranu', 'Rajput', 'Sajal', 'Chouksey', '7697418191', 'Jabalpur'];

  for (const term of searchTerms) {
    const rawQ = term.trim();
    const digits = rawQ.replace(/\D/g, '');
    const searchRegex = new RegExp(rawQ, 'i');

    const orConditions = [
      { orderNumber: searchRegex },
      { 'customer.name': searchRegex },
      { 'customer.email': searchRegex },
      { 'shippingAddress.name': searchRegex },
      { 'shippingAddress.address': searchRegex },
      { 'shippingAddress.city': searchRegex },
      { 'shippingAddress.state': searchRegex },
      { 'shippingAddress.pincode': searchRegex },
    ];

    if (digits.length >= 3) {
      orConditions.push({ 'customer.phone': new RegExp(digits, 'i') });
    }

    const matches = await Order.find({ $or: orConditions }).lean();
    console.log(`Query "${term}" -> Found ${matches.length} matching order(s):`);
    matches.forEach(m => console.log(`  - #${m.orderNumber} | Name: ${m.customer?.name} | Phone: ${m.customer?.phone} | City: ${m.shippingAddress?.city}`));
  }

  mongoose.disconnect();
}

testNameSearch();
