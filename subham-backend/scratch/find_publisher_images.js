const fs = require('fs');
const path = require('path');

function findImages(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
          findImages(filePath, fileList);
        }
      } else if (/\.(png|jpg|jpeg|webp|svg)$/i.test(file)) {
        fileList.push({ name: file, path: filePath, size: stat.size });
      }
    } catch (e) {}
  });
  return fileList;
}

const root = path.join(__dirname, '..', '..');
const results = findImages(root);
console.log(`Found ${results.length} image files in workspace:`);
results.forEach(f => {
  if (f.name.toLowerCase().includes('pub') || f.name.toLowerCase().includes('drishti') || f.name.toLowerCase().includes('arihant') || f.path.includes('categories') || f.path.includes('banners') || f.path.includes('media') || f.path.includes('public')) {
    console.log(`[IMG] ${f.name} -> ${f.path}`);
  }
});
