const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function updateSubCategoryImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const SubCategory = require('../src/models/SubCategory');
    const Product = require('../src/models/Product');

    const subs = await SubCategory.find();
    console.log(`Updating ${subs.length} subcategories...`);

    let updatedCount = 0;
    for (const sub of subs) {
      // Find top product for this subcategory or publisher name match
      const p = await Product.findOne({
        isActive: true,
        $or: [
          { subCategorySlug: sub.slug },
          { publisher: new RegExp(sub.name, 'i') },
          { tags: new RegExp(sub.name, 'i') }
        ],
        'images.0.url': { $exists: true, $ne: '' }
      }).sort({ soldCount: -1, views: -1 });

      if (p && p.images && p.images[0] && p.images[0].url) {
        const prodImgUrl = p.images[0].thumbUrl || p.images[0].url;
        // Only update if current image is missing or unsplash stock image
        if (!sub.image?.url || sub.image.url.includes('unsplash.com')) {
          sub.image = {
            url: prodImgUrl,
            alt: sub.name,
            source: 'upload'
          };
          await sub.save();
          updatedCount++;
          console.log(`Updated "${sub.name}" -> ${prodImgUrl}`);
        }
      }
    }

    console.log(`Successfully updated ${updatedCount} subcategory images!`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateSubCategoryImages();
