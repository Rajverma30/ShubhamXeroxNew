const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function checkOtpLogs() {
  await mongoose.connect(process.env.MONGO_URI);
  const Otp = require('../src/models/Otp');
  const GuestCheckoutSession = require('../src/models/GuestCheckoutSession');

  console.log('--- OTPs for 940705 ---');
  const otps = await Otp.find({ phone: /940705/ }).lean();
  console.log('OTPs found:', JSON.stringify(otps, null, 2));

  console.log('--- Sessions for Sajal ---');
  const sessions = await GuestCheckoutSession.find({ 'customer.email': /sajal/i }).lean();
  console.log('Sessions found:', JSON.stringify(sessions, null, 2));

  mongoose.disconnect();
}

checkOtpLogs();
