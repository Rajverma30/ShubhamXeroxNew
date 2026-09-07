const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function runDiagnosis() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('--- MONGO CONNECTED ---');

    const Order = require('../src/models/Order');
    const Otp = require('../src/models/Otp');
    const GuestCheckoutSession = require('../src/models/GuestCheckoutSession');
    const Setting = require('../src/models/Setting');
    const Product = require('../src/models/Product');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Orders breakdown
    const ordersToday = await Order.find({ createdAt: { $gte: todayStart } }).sort({ createdAt: -1 }).lean();
    const ordersYesterday = await Order.find({ createdAt: { $gte: yesterdayStart, $lt: todayStart } }).sort({ createdAt: -1 }).lean();
    const totalOrders = await Order.countDocuments();
    const ordersWeek = await Order.countDocuments({ createdAt: { $gte: weekAgo } });

    console.log('\n================ ORDERS REPORT ================');
    console.log(`Total Orders All Time: ${totalOrders}`);
    console.log(`Orders Last 7 Days: ${ordersWeek}`);
    console.log(`Orders Today (${todayStart.toISOString().slice(0, 10)}): ${ordersToday.length}`);
    console.log(`Orders Yesterday: ${ordersYesterday.length}`);

    if (ordersToday.length > 0) {
      console.log('\n--- TODAY ORDERS DETAILS ---');
      ordersToday.forEach(o => {
        console.log(`Order #${o.orderNumber} | Status: ${o.status} | Pay: ${o.payment?.status} | Total: ₹${o.total} | Phone: ${o.customer?.phone} | Time: ${o.createdAt.toLocaleTimeString()}`);
      });
    }

    // 2. Recent Checkout Sessions (Attempted checkouts)
    const sessionsToday = await GuestCheckoutSession.countDocuments({ createdAt: { $gte: todayStart } });
    const sessionsYesterday = await GuestCheckoutSession.countDocuments({ createdAt: { $gte: yesterdayStart, $lt: todayStart } });
    console.log('\n================ CHECKOUT SESSIONS (ATTEMPTS) ================');
    console.log(`Sessions Created Today: ${sessionsToday}`);
    console.log(`Sessions Created Yesterday: ${sessionsYesterday}`);

    // 3. OTP Requests Breakdown
    const otpsToday = await Otp.find({ createdAt: { $gte: todayStart } }).sort({ createdAt: -1 }).lean();
    const otpsYesterday = await Otp.countDocuments({ createdAt: { $gte: yesterdayStart, $lt: todayStart } });
    console.log('\n================ OTP REQUESTS REPORT ================');
    console.log(`OTPs Requested Today: ${otpsToday.length}`);
    console.log(`OTPs Requested Yesterday: ${otpsYesterday}`);

    if (otpsToday.length > 0) {
      const consumedCount = otpsToday.filter(o => o.consumedAt).length;
      console.log(`OTPs Consumed (Verified) Today: ${consumedCount} out of ${otpsToday.length}`);
      console.log('Sample OTP attempts today:');
      otpsToday.slice(0, 10).forEach(o => {
        console.log(`Phone: ${o.phone.slice(0, 3)}****${o.phone.slice(-2)} | Verified: ${Boolean(o.consumedAt)} | Attempts: ${o.attempts} | Time: ${o.createdAt.toLocaleTimeString()}`);
      });
    }

    // 4. SMS & Gateway Configuration Check
    console.log('\n================ ENVIRONMENT & INTEGRATIONS CHECK ================');
    console.log(`Fast2SMS API Key Present: ${Boolean(process.env.FAST2SMS_API_KEY)}`);
    console.log(`Fast2SMS Route: ${process.env.FAST2SMS_ROUTE || 'otp (default)'}`);
    console.log(`OTP Dev Fallback: ${process.env.OTP_DEV_FALLBACK}`);
    console.log(`Razorpay Key ID Present: ${Boolean(process.env.RAZORPAY_KEY_ID)} (${process.env.RAZORPAY_KEY_ID?.slice(0, 8)}...)`);
    console.log(`Razorpay Secret Present: ${Boolean(process.env.RAZORPAY_KEY_SECRET)}`);
    console.log(`Shiprocket Checkout Route Prefix: ${process.env.SHIPROCKET_CHECKOUT_ROUTE_PREFIX || '/shiprocket-checkout'}`);

    const settings = await Setting.getSingleton();
    console.log(`Store Maintenance Mode: ${settings.maintenanceMode}`);

    const activeProducts = await Product.countDocuments({ isActive: true, isHidden: false });
    const inStockProducts = await Product.countDocuments({ isActive: true, isHidden: false, stock: { $gt: 0 } });
    console.log(`Active Products: ${activeProducts} | In-Stock Products: ${inStockProducts}`);

    process.exit(0);
  } catch (err) {
    console.error('Diagnosis Script Error:', err);
    process.exit(1);
  }
}

runDiagnosis();
