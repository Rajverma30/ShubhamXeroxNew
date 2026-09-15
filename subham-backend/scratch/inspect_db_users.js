const mongoose = require('mongoose');

const uri = "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/admin?retryWrites=true&w=majority&appName=subhamxerox";

async function inspectUsers() {
  try {
    const conn = await mongoose.createConnection(uri).asPromise();
    const adminDb = conn.db.admin();
    const usersInfo = await adminDb.command({ usersInfo: 1 });
    console.log('Users in admin db:', usersInfo.users.map(u => u.user));
    await conn.close();
  } catch (err) {
    console.error('Error getting usersInfo:', err.message);
  }
}

inspectUsers();
