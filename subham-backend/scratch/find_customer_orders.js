const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function searchOrders() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('--- DB CONNECTED ---');

    const Order = require('../src/models/Order');
    const GuestCheckoutSession = require('../src/models/GuestCheckoutSession');

    console.log('\n1. Searching Orders by Name / Address (Your Name, Sajal Chouksey)...');
    const nameQuery = {
      $or: [
        { 'customer.name': /ranu|rajput|sajal|chouksey/i },
        { 'shippingAddress.name': /ranu|rajput|sajal|chouksey/i },
        { 'shippingAddress.address': /ranu|rajput|sajal|chouksey/i },
        { 'shippingAddress.landmark': /ranu|rajput|sajal|chouksey/i },
      ],
    };

    const ordersByName = await Order.find(nameQuery).sort({ createdAt: -1 }).lean();
    console.log(`Found ${ordersByName.length} orders by name/address search.`);
    ordersByName.forEach(o => {
      console.log(`\n[ORDER] #${o.orderNumber} | Date: ${o.createdAt?.toISOString()}`);
      console.log(`Customer Name: ${o.customer?.name} | Phone: ${o.customer?.phone} | Email: ${o.customer?.email}`);
      console.log(`Total: ₹${o.total} | Status: ${o.status} | Payment Status: ${o.payment?.status}`);
      console.log(`Address: ${JSON.stringify(o.shippingAddress)}`);
      console.log(`Items: ${o.items?.map(i => `${i.title} x${i.quantity} (₹${i.price})`).join(', ')}`);
    });

    console.log('\n2. Searching Orders around ~₹4000 (₹2500 - ₹6000)...');
    const amountOrders = await Order.find({ total: { $gte: 2500, $lte: 6000 } }).sort({ createdAt: -1 }).lean();
    console.log(`Found ${amountOrders.length} orders in price range ₹2500-₹6000.`);
    amountOrders.forEach(o => {
      console.log(`\n[ORDER ₹${o.total}] #${o.orderNumber} | Name: ${o.customer?.name} | Phone: ${o.customer?.phone} | Date: ${o.createdAt?.toISOString()}`);
      console.log(`Address: ${o.shippingAddress?.name}, ${o.shippingAddress?.address}, ${o.shippingAddress?.city}, ${o.shippingAddress?.pincode}`);
      console.log(`Items: ${o.items?.map(i => i.title).join(', ')}`);
    });

    console.log('\n3. Searching Orders with Phone starting with 91 or suspicious phone numbers...');
    const phoneOrders = await Order.find({ 'customer.phone': /^91/ }).sort({ createdAt: -1 }).lean();
    console.log(`Found ${phoneOrders.length} orders with phone starting with 91.`);
    phoneOrders.forEach(o => {
      console.log(`\n[ORDER 91-PHONE] #${o.orderNumber} | Phone: ${o.customer?.phone} | Name: ${o.customer?.name} | Total: ₹${o.total}`);
      console.log(`Address: ${JSON.stringify(o.shippingAddress)}`);
    });

    console.log('\n4. Searching Guest Checkout Sessions by Name / Address / Phone starting with 91...');
    const sessions = await GuestCheckoutSession.find({
      $or: [
        { 'customer.name': /ranu|rajput|sajal|chouksey/i },
        { 'shippingAddress.name': /ranu|rajput|sajal|chouksey/i },
        { phone: /^91/ },
      ],
    }).sort({ createdAt: -1 }).lean();

    console.log(`Found ${sessions.length} sessions matching query.`);
    sessions.forEach(s => {
      console.log(`\n[SESSION] ID: ${s._id} | Phone: ${s.phone} | Created: ${s.createdAt?.toISOString()}`);
      console.log(`Customer: ${JSON.stringify(s.customer)}`);
      console.log(`Address: ${JSON.stringify(s.shippingAddress)}`);
    });

    console.log('\n5. Listing recent 25 Orders (All)...');
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(25).lean();
    console.log(`Showing ${recentOrders.length} recent orders:`);
    recentOrders.forEach(o => {
      console.log(`Order #${o.orderNumber} | ₹${o.total} | Name: ${o.customer?.name} | Phone: ${o.customer?.phone} | Status: ${o.status} | Date: ${o.createdAt?.toISOString()}`);
    });

    mongoose.disconnect();
  } catch (err) {
    console.error('Search error:', err);
    process.exit(1);
  }
}

searchOrders();
