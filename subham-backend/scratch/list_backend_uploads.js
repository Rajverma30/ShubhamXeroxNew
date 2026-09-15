const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.webp') && !f.endsWith('-card.webp') && !f.endsWith('-thumb.webp'));

console.log(`Total valid WebP files in subham-backend/uploads: ${files.length}`);
console.log('First 20 filenames:');
console.log(files.slice(0, 20));
