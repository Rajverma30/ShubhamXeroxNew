const fs = require('fs');
const path = require('path');

const audit = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'batch_31_45_audit.json'), 'utf8'));

const rootVercelPath = path.resolve(__dirname, '../../vercel.json');
const userVercelPath = path.resolve(__dirname, '../../subham-user/vercel.json');

const rootVercel = JSON.parse(fs.readFileSync(rootVercelPath, 'utf8'));
const userVercel = JSON.parse(fs.readFileSync(userVercelPath, 'utf8'));

let added = 0;
for (const item of audit) {
  const src = `/product/${item.before.slug}`;
  const dest = `/product/${item.after.slug}`;

  // Check if already in root
  const exists = rootVercel.redirects.some(r => r.source === src);
  if (!exists && src !== dest) {
    const rule = {
      source: src,
      destination: dest,
      permanent: true
    };
    rootVercel.redirects.push(rule);
    userVercel.redirects.push(rule);
    added++;
  }
}

fs.writeFileSync(rootVercelPath, JSON.stringify(rootVercel, null, 2), 'utf8');
fs.writeFileSync(userVercelPath, JSON.stringify(userVercel, null, 2), 'utf8');

console.log(`Added ${added} new 301 redirects to vercel.json. Total redirects now: ${rootVercel.redirects.length}`);
