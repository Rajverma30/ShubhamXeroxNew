const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', '..', 'uploads');
const destDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const files = fs.readdirSync(srcDir);
console.log(`Copying all ${files.length} upload files from workspace root to subham-backend/uploads...`);

let copied = 0;
for (const f of files) {
  const srcPath = path.join(srcDir, f);
  const destPath = path.join(destDir, f);
  if (fs.statSync(srcPath).isFile()) {
    fs.copyFileSync(srcPath, destPath);
    copied++;
  }
}

console.log(`Successfully copied ${copied} files to subham-backend/uploads!`);
