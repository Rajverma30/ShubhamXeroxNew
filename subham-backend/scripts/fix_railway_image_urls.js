const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function fixRailwayUrls() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  const docs = await Product.find({ 'images.url': { $regex: 'railway.app' } });
  console.log('Total products with railway.app in image URLs:', docs.length);

  let updatedCount = 0;
  for (const doc of docs) {
    let changed = false;
    const updatedImages = (doc.images || []).map(img => {
      let url = img.url || '';
      let cardUrl = img.cardUrl || '';
      let thumbUrl = img.thumbUrl || '';

      const fix = (s) => {
        if (!s || !s.includes('railway.app')) return s;
        changed = true;
        return s.replace(/https?:\/\/[a-zA-Z0-9.-]*railway\.app\/img\/products\//g, 'https://subhamapi.hypernxt.space/uploads/products/')
                .replace(/https?:\/\/[a-zA-Z0-9.-]*railway\.app\/img\//g, 'https://subhamapi.hypernxt.space/uploads/')
                .replace(/https?:\/\/[a-zA-Z0-9.-]*railway\.app\/uploads\//g, 'https://subhamapi.hypernxt.space/uploads/');
      };

      return {
        ...img.toObject ? img.toObject() : img,
        url: fix(url),
        cardUrl: cardUrl ? fix(cardUrl) : fix(url),
        thumbUrl: thumbUrl ? fix(thumbUrl) : fix(url)
      };
    });

    if (changed) {
      await Product.updateOne({ _id: doc._id }, { $set: { images: updatedImages } });
      console.log(`✅ Fixed image URLs for: [${doc.slug}] "${doc.title.slice(0, 45)}..."`);
      updatedCount++;
    }
  }

  console.log(`\nSuccessfully updated image URLs for ${updatedCount} products.`);
  await mongoose.disconnect();
}

fixRailwayUrls().catch(console.error);
