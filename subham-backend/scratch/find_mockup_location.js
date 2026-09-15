const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');

function searchFile(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      searchFile(full);
    } else if (e.name.includes('1789239975856')) {
      console.log('FOUND FILE AT:', full);
      console.log('RELATIVE TO uploads:', path.relative(uploadsDir, full));
    }
  }
}

searchFile(uploadsDir);
