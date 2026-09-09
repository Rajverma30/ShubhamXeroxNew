const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('--- VERIFICATION SUITE ---');
  const seoCtrl = require('../src/controllers/seo.controller');
  const Product = require('../src/models/Product');

  const sampleProduct = await Product.findOne({ isActive: true }).lean();

  const createMockRes = () => {
    const res = {
      statusCode: 200,
      headers: {},
      body: null,
      redirectCode: null,
      redirectUrl: null,
      status(s) { res.statusCode = s; return res; },
      type(t) { res.headers['content-type'] = t; return res; },
      setHeader(k, v) { res.headers[k.toLowerCase()] = v; return res; },
      send(b) { res.body = b; return res; },
      redirect(code, url) { res.redirectCode = code; res.redirectUrl = url; return res; },
    };
    return res;
  };

  // 1. Test productOg for valid product
  const req1 = { params: { slug: sampleProduct.slug }, headers: { 'user-agent': 'Googlebot/2.1' } };
  const res1 = createMockRes();
  await seoCtrl.productOg(req1, res1, () => {});
  console.log('\n1. Valid Product OG status:', res1.statusCode);
  console.log('Contains H1 Title:', res1.body?.includes(`<h1`) && res1.body?.includes(sampleProduct.title));
  console.log('Contains JSON-LD Schema:', res1.body?.includes(`application/ld+json`));
  console.log('Contains Canonical URL:', res1.body?.includes(`canonical`));

  // 2. Test productOg for legacy URL (e.g. "100")
  const req2 = { params: { slug: '100' }, headers: { 'user-agent': 'Googlebot/2.1' }, originalUrl: '/product/100' };
  const res2 = createMockRes();
  await seoCtrl.productOg(req2, res2, () => {});
  console.log('\n2. Legacy URL (100) status:', res2.redirectCode, 'Redirect URL:', res2.redirectUrl);

  // 3. Test productOg for completely non-existent fake URL
  const req3 = { params: { slug: 'qwertyuiop-non-existent-fake-product-slug' }, headers: { 'user-agent': 'Googlebot/2.1' } };
  const res3 = createMockRes();
  await seoCtrl.productOg(req3, res3, () => {});
  console.log('\n3. Non-existent Product status:', res3.statusCode, 'Contains noindex:', res3.body?.includes('noindex'));

  // 4. Test Sitemap
  const req4 = {};
  const res4 = createMockRes();
  await seoCtrl.sitemap(req4, res4, () => {});
  console.log('\n4. Sitemap status:', res4.statusCode, 'URLs count:', (res4.body?.match(/<loc>/g) || []).length);
  console.log('Sitemap contains target MPPSC category:', res4.body?.includes('/category/mppsc-books'));

  process.exit(0);
}).catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
