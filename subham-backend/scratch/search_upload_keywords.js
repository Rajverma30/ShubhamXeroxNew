const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
const files = fs.readdirSync(uploadsDir);

const keywords = ['aman', 'grammar', 'english', 'neetu', 'spoken', 'topper', 'temple', 'dev', 'kattar', 'chemistry', 'inorganic', 'eajee', 'samanya', 'prabandhan', 'parikshadham', 'punekar', 'exampedia'];

console.log(`Total files in uploads/products: ${files.length}\n`);

keywords.forEach(kw => {
  const matches = files.filter(f => f.toLowerCase().includes(kw));
  console.log(`Keyword "${kw}": ${matches.length} files found`);
  if (matches.length > 0 && matches.length < 15) {
    matches.forEach(m => console.log(`   -> ${m}`));
  } else if (matches.length >= 15) {
    console.log(`   Sample: ${matches.slice(0, 5).join(', ')}...`);
  }
});
