const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', '..', 'uploads');
const destBackendUploads = path.join(__dirname, '..', 'uploads');
const destBackendProducts = path.join(__dirname, '..', 'uploads', 'products');

if (!fs.existsSync(destBackendUploads)) fs.mkdirSync(destBackendUploads, { recursive: true });
if (!fs.existsSync(destBackendProducts)) fs.mkdirSync(destBackendProducts, { recursive: true });

const files = fs.readdirSync(srcDir);
console.log(`Syncing ${files.length} upload files...`);

let copiedCount = 0;
for (const file of files) {
  const srcFile = path.join(srcDir, file);
  if (fs.statSync(srcFile).isFile()) {
    const dest1 = path.join(destBackendUploads, file);
    const dest2 = path.join(destBackendProducts, file);
    if (!fs.existsSync(dest1)) fs.copyFileSync(srcFile, dest1);
    if (!fs.existsSync(dest2)) fs.copyFileSync(srcFile, dest2);
    copiedCount++;
  }
}

console.log(`Successfully synced ${copiedCount} files to backend uploads and uploads/products folders.`);
