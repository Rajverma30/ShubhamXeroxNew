const mongoose = require('mongoose');
const uri = 'mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/subhamxerox?retryWrites=true&w=majority&appName=subhamxerox';

async function run() {
  await mongoose.connect(uri);
  const Setting = mongoose.model('Setting', new mongoose.Schema({}, { strict: false }));
  const res = await Setting.updateOne({ singleton: 'global' }, { $set: { 'checkout.mode': 'razorpay' } }, { upsert: true });
  console.log('Updated checkout.mode to razorpay:', res);
  const updated = await Setting.findOne();
  console.log('Active checkout settings:', updated.checkout);
  await mongoose.disconnect();
}

run().catch(console.error);
