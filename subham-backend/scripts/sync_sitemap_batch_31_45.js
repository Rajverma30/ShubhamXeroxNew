const fs = require('fs');
const path = require('path');

const audit = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'batch_31_45_audit.json'), 'utf8'));
const sitemapPath = path.resolve(__dirname, '../../subham-user/public/sitemap.xml');
let xml = fs.readFileSync(sitemapPath, 'utf8');

let replaced = 0;
let added = 0;
const nowIso = new Date().toISOString();

for (const item of audit) {
  const oldUrl = `https://shubhamxerox.in/product/${item.before.slug}`;
  const newUrl = `https://shubhamxerox.in/product/${item.after.slug}`;

  if (xml.includes(oldUrl)) {
    xml = xml.replace(oldUrl, newUrl);
    replaced++;
  } else if (!xml.includes(newUrl)) {
    const node = `  <url><loc>${newUrl}</loc><lastmod>${nowIso}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    xml = xml.replace('</urlset>', `${node}</urlset>`);
    added++;
  }
}

fs.writeFileSync(sitemapPath, xml, 'utf8');
console.log(`Sitemap synced for Phase 3: ${replaced} replaced, ${added} added.`);
