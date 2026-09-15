const mongoose = require('mongoose');

const uri = "mongodb+srv://hypersagetech:7oDb5EZK9YnnBSkl@salon.ovdjb.mongodb.net/admin?retryWrites=true&w=majority&appName=subhamxerox";

async function inspectDatabases() {
  try {
    const conn = await mongoose.createConnection(uri).asPromise();
    const adminDb = conn.db.admin();
    const dbs = await adminDb.listDatabases();
    console.log('Databases on salon.ovdjb.mongodb.net cluster:');
    dbs.databases.forEach(d => console.log(` - ${d.name} (${d.sizeOnDisk} bytes)`));
    await conn.close();
  } catch (err) {
    console.error('Error listing databases:', err.message);
  }
}

inspectDatabases();
