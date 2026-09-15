const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

function hostOf(uri) {
  return (uri.match(/@([^/]+)/) || [])[1] || 'unknown';
}

async function summarize(uri, label) {
  const host = hostOf(uri);
  console.log(`\n=== ${label} (${host}) ===`);
  try {
    const c = await mongoose.createConnection(uri).asPromise();
    const P = c.model('Product', new mongoose.Schema({}, { strict: false }));
    const M = c.model('Media', new mongoose.Schema({}, { strict: false }));
    const n = await P.countDocuments();
    const mn = await M.countDocuments();
    const all = await P.find({}).select('title images updatedAt').lean();
    const domains = {};
    let newest = null;
    let obviousMismatch = 0;
    for (const p of all) {
      const u = (p.images && p.images[0] && p.images[0].url) || '';
      let h = 'none';
      try { h = new URL(u).host; } catch { h = 'invalid'; }
      domains[h] = (domains[h] || 0) + 1;
      if (p.updatedAt && (!newest || p.updatedAt > newest)) newest = p.updatedAt;
      const title = (p.title || '').toLowerCase();
      const fn = (u.split('/').pop() || '').toLowerCase();
      if (/sanjiv|arthvyavastha|economy/.test(title) && /pen|doms|ball/.test(fn)) obviousMismatch++;
      if (/patwari/.test(title) && /electrical/.test(fn)) obviousMismatch++;
    }
    console.log(JSON.stringify({ products: n, media: mn, newestUpdate: newest, domains, obviousMismatch }, null, 2));
    const sample = all.slice(0, 3);
    for (const p of sample) {
      console.log('-', (p.title || '').slice(0, 40), '->', (p.images && p.images[0] && p.images[0].url || '').slice(0, 110));
    }
    await c.close();
  } catch (e) {
    console.log('ERROR', e.message);
  }
}

async function main() {
  const envUri = process.env.MONGO_URI;
  console.log('ENV_HOST', hostOf(envUri));
  console.log('USE_CLOUDINARY', process.env.USE_CLOUDINARY);
  console.log('BACKEND_URL', process.env.BACKEND_URL);
  console.log('VITE_UPLOADS_ORIGIN', process.env.VITE_UPLOADS_ORIGIN);

  await summarize(envUri, 'ENV MONGO_URI');

  // Pull second URIs from compare_databases.js without printing credentials
  const cmp = fs.readFileSync(path.join(__dirname, 'compare_databases.js'), 'utf8');
  const uris = [...cmp.matchAll(/mongodb\+srv:\/\/[^"']+/g)].map((m) => m[0]);
  for (let i = 0; i < uris.length; i++) {
    if (hostOf(uris[i]) === hostOf(envUri)) continue;
    await summarize(uris[i], `OTHER from compare_databases #${i + 1}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
