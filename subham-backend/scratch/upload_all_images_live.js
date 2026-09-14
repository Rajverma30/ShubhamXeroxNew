const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../src/models/Product');

const SOURCE_FOLDER = 'S:\\Machine learning\\Startup\\books image';

const imageFileToSlug = {
  'Glossy Hindi Geography Book Mockup.png': 'hindi-geography-complete-study-guide-and-practice-book',
  'Glossy Reasoning Practice Book Mockup.png': 'complete-reasoning-practice-and-short-tricks-book',
  'Gyan General Science Textbook Mockup.png': 'gyan-general-science-textbook-for-competitive-exams',
  'Hindi History Study Guide on Wooden Table.png': 'bhartiya-itihas-complete-study-guide',
  'Indian Constitution and Governance Guide.png': 'indian-constitution-and-polity-governance-guide',
  'Madhya Pradesh General Knowledge Book Mockup.png': 'mp-gk-complete-book-madhya-pradesh-general-knowledge-2026',
  'NCERT इतिहास Paperback Mockup.png': 'ncert-itihas-class-6-to-12-summary-and-one-liner-book',
  'Parmar SSC Current Affair Shot Book Mockup.png': 'parmar-ssc-current-affairs-shot-book-2026',
  'The Complete Vocabulary Book Mockup.png': 'the-complete-english-vocabulary-book-vol-1',
  'The Complete Vocabulary Book Mockup(1).png': 'the-complete-english-vocabulary-book-vol-2',
};

async function uploadLiveImages() {
  console.log('Logging in to live admin API...');
  const loginRes = await axios.post('https://subhamapi.hypernxt.space/api/admin/auth/login', {
    username: 'admin',
    password: 'PUT_A_REAL_PASSWORD_HERE',
  });

  const token = loginRes.data.data.token;
  console.log('Login successful! Token acquired.');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected.');

  for (const [imageFileName, slug] of Object.entries(imageFileToSlug)) {
    const filePath = path.join(SOURCE_FOLDER, imageFileName);
    console.log(`\nUploading ${imageFileName} to live media server...`);

    const form = new FormData();
    form.append('files', fs.createReadStream(filePath));
    form.append('folder', 'products');

    const uploadRes = await axios.post('https://subhamapi.hypernxt.space/api/admin/media', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
    });

    const mediaObj = uploadRes.data.data[0];
    console.log(`Uploaded! URL: ${mediaObj.cardUrl}`);

    const imagePayload = {
      url: mediaObj.url,
      cardUrl: mediaObj.cardUrl,
      thumbUrl: mediaObj.thumbUrl,
      publicId: null,
      alt: slug,
      width: mediaObj.width || 800,
      height: mediaObj.height || 1000,
      source: 'upload',
    };

    const updateRes = await Product.findOneAndUpdate(
      { slug },
      { $set: { images: [imagePayload] } },
      { new: true }
    );

    if (updateRes) {
      console.log(`✓ Product image updated in DB for "${slug}"`);
    } else {
      console.log(`❌ Product with slug "${slug}" not found in DB`);
    }
  }

  console.log('\n======================================================');
  console.log('🎉 ALL 10 PRODUCT IMAGES UPLOADED & UPDATED IN LIVE DB!');
  console.log('======================================================');
  process.exit(0);
}

uploadLiveImages().catch((err) => {
  console.error('Error uploading live images:', err.response?.data || err.message);
  process.exit(1);
});
