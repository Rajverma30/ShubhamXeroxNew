const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'uploads', 'products');
if (fs.existsSync(dir)) {
  const files = fs.readdirSync(dir);
  console.log(`Found ${files.length} files in uploads/products:`);
  console.log(files.slice(0, 20));
} else {
  console.log('uploads/products does not exist');
}
