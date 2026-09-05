require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const backendOrigin = (process.env.BACKEND_URL || 'http://localhost:5005').replace(/\/$/, '');

  const xeroxCat = await Category.findOne({ name: /xerox/i });
  if (xeroxCat) {
    xeroxCat.image = { url: `${backendOrigin}/uploads/media/cat_xerox_spiral.jpg` };
    await xeroxCat.save();
    console.log(`Updated Xerox category image to ${xeroxCat.image.url}`);
  }

  await mongoose.disconnect();
}
run();
