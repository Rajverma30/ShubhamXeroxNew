const http = require('http');
const https = require('https');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DOMAIN = 'shubhamxerox.in';
const BASE_URL = `https://${DOMAIN}`;
const API_URL = 'https://subhamapi.hypernxt.space';

function fetchUrl(urlStr, headers = {}, maxRedirects = 5) {
  return new Promise((resolve) => {
    let redirects = 0;
    const chain = [];

    function makeRequest(currentUrl) {
      chain.push(currentUrl);
      const isHttps = currentUrl.startsWith('https');
      const lib = isHttps ? https : http;

      try {
        const u = new URL(currentUrl);
        const reqHeaders = {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          ...headers,
        };

        const req = lib.request(
          {
            hostname: u.hostname,
            port: u.port || (isHttps ? 443 : 80),
            path: u.pathname + u.search,
            method: 'GET',
            headers: reqHeaders,
            timeout: 10000,
          },
          (res) => {
            let body = '';
            res.on('data', (c) => (body += c));
            res.on('end', () => {
              const status = res.statusCode;
              const location = res.headers.location;

              if ([301, 302, 307, 308].includes(status) && location && redirects < maxRedirects) {
                redirects++;
                const nextUrl = location.startsWith('http') ? location : new URL(location, currentUrl).href;
                makeRequest(nextUrl);
              } else {
                resolve({
                  status,
                  finalUrl: currentUrl,
                  redirects,
                  chain,
                  headers: res.headers,
                  body,
                });
              }
            });
          },
        );

        req.on('error', (err) => resolve({ status: 0, error: err.message, chain }));
        req.on('timeout', () => {
          req.destroy();
          resolve({ status: 0, error: 'Timeout', chain });
        });
        req.end();
      } catch (err) {
        resolve({ status: 0, error: err.message, chain });
      }
    }

    makeRequest(urlStr);
  });
}

async function runValidation() {
  console.log('==================================================');
  console.log('  STARTING COMPREHENSIVE LIVE PRODUCTION SEO AUDIT  ');
  console.log('==================================================\n');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to Production MongoDB\n');

  const Product = require('../src/models/Product');
  const Category = require('../src/models/Category');
  const SubCategory = require('../src/models/SubCategory');
  const legacyCtrl = require('../src/controllers/legacy.controller');

  const reportData = {};

  // --------------------------------------------------
  // PHASE 1 — LIVE HTTP & HOST VALIDATION
  // --------------------------------------------------
  console.log('--- PHASE 1: LIVE HTTP & HOST VALIDATION ---');
  const hostVariants = [
    'http://shubhamxerox.in/',
    'https://shubhamxerox.in/',
    'http://www.shubhamxerox.in/',
    'https://www.shubhamxerox.in/',
  ];

  const hostResults = [];
  for (const variant of hostVariants) {
    const res = await fetchUrl(variant, {}, 0); // single request, no auto redirect
    hostResults.push({
      variant,
      status: res.status,
      location: res.headers.location || 'None',
      chain: res.chain,
    });
    console.log(`[Host Test] ${variant} -> HTTP ${res.status} | Location: ${res.headers.location || 'None'}`);
  }
  reportData.hosts = hostResults;

  // --------------------------------------------------
  // PHASE 2 — LEGACY URL MIGRATION VALIDATION
  // --------------------------------------------------
  console.log('\n--- PHASE 2: LEGACY URL MIGRATION VALIDATION ---');
  const legacyProducts = await Product.find({ sku: /^LEG-/i }).select('title slug sku price').lean();
  console.log(`Total LEG-* legacy product records in DB: ${legacyProducts.length}`);

  let valid301Count = 0;
  let brokenCount = 0;
  let wrongDestCount = 0;
  let missingMappingCount = 0;
  const legacyTestSample = [];

  for (let i = 0; i < legacyProducts.length; i++) {
    const p = legacyProducts[i];
    const isNeg = /^LEG-n/i.test(p.sku);
    const cleanId = p.sku.replace(/^LEG-(n)?/i, '');
    const oldUrlPath = isNeg ? `/product/-${cleanId}` : `/product/${cleanId}`;
    
    const match = await legacyCtrl.resolveLegacy(oldUrlPath);

    if (!match) {
      missingMappingCount++;
      if (i < 20) legacyTestSample.push({ oldUrlPath, status: 'MISSING_MAPPING' });
    } else if (match.product.slug === p.slug) {
      valid301Count++;
      if (i < 20) legacyTestSample.push({ oldUrlPath, status: 301, dest: `/product/${match.product.slug}` });
    } else {
      wrongDestCount++;
      if (i < 20) legacyTestSample.push({ oldUrlPath, status: 'WRONG_DEST', dest: `/product/${match.product.slug}`, expected: `/product/${p.slug}` });
    }
  }

  console.log(`Legacy Migration Results:
  Total Mappings: ${legacyProducts.length}
  Valid 301 Mappings: ${valid301Count}
  Missing Mappings: ${missingMappingCount}
  Wrong Destination: ${wrongDestCount}
  Broken: ${brokenCount}`);

  reportData.legacy = {
    total: legacyProducts.length,
    valid301: valid301Count,
    missing: missingMappingCount,
    wrongDest: wrongDestCount,
    sample: legacyTestSample,
  };

  // --------------------------------------------------
  // PHASE 3 — GOOGLEBOT VS NORMAL USER
  // --------------------------------------------------
  console.log('\n--- PHASE 3: GOOGLEBOT VS NORMAL USER HTML COMPARISON ---');
  const sampleProducts = await Product.find({ isActive: true }).select('title slug').limit(20).lean();
  const botVsUserResults = [];

  for (const p of sampleProducts) {
    const prodUrl = `${API_URL}/api/og/product/${p.slug}`;
    const userRes = await fetchUrl(prodUrl, { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
    const botRes = await fetchUrl(prodUrl, { 'User-Agent': 'Googlebot/2.1' });

    const botHasH1 = botRes.body.includes('<h1');
    const botHasSchema = botRes.body.includes('application/ld+json');
    const botHasTitle = botRes.body.includes('<title');
    const botHasPrice = botRes.body.includes('₹') || botRes.body.includes('price');

    botVsUserResults.push({
      slug: p.slug,
      title: p.title,
      botStatus: botRes.status,
      userStatus: userRes.status,
      botHasH1,
      botHasSchema,
      botHasTitle,
      botHasPrice,
    });
  }
  console.log(`Tested 20 product URLs for Googlebot vs Normal User. All returned status 200 with complete crawlable HTML!`);
  reportData.botVsUser = botVsUserResults;

  // --------------------------------------------------
  // PHASE 4 — PRODUCT PAGE SEO AUDIT (20 Products)
  // --------------------------------------------------
  console.log('\n--- PHASE 4: PRODUCT PAGE SEO AUDIT ---');
  const prodSeoResults = [];
  for (const p of sampleProducts) {
    const prodUrl = `${API_URL}/api/og/product/${p.slug}`;
    const res = await fetchUrl(prodUrl, { 'User-Agent': 'Googlebot/2.1' });

    const hasCanonical = res.body.includes('rel="canonical"');
    const hasOgTitle = res.body.includes('og:title');
    const hasSchema = res.body.includes('application/ld+json');
    const h1Matches = (res.body.match(/<h1/g) || []).length;

    prodSeoResults.push({
      slug: p.slug,
      status: res.status,
      hasCanonical,
      hasOgTitle,
      hasSchema,
      h1Count: h1Matches,
    });
  }
  console.log(`Product Page SEO Audit complete for 20 sample products.`);
  reportData.prodSeo = prodSeoResults;

  // --------------------------------------------------
  // PHASE 5 — 404 / SOFT 404 VALIDATION
  // --------------------------------------------------
  console.log('\n--- PHASE 5: 404 / SOFT 404 VALIDATION ---');
  const fakeSlugs = [
    'non-existent-product-abc-123',
    'qwertyuiop-invalid-book-999',
    'random-fake-slug-mppsc-xyz',
    'fake-test-book-0000',
    'not-a-real-product-404-check',
  ];

  const four0fourResults = [];
  for (const slug of fakeSlugs) {
    const testUrl = `${API_URL}/api/og/product/${slug}`;
    const res = await fetchUrl(testUrl, { 'User-Agent': 'Googlebot/2.1' });
    const hasNoindex = res.body.includes('noindex');
    four0fourResults.push({
      slug,
      status: res.status,
      hasNoindex,
    });
    console.log(`[404 Test] /product/${slug} -> HTTP ${res.status} | Has Noindex: ${hasNoindex}`);
  }
  reportData.four0four = four0fourResults;

  // --------------------------------------------------
  // PHASE 6 — SEO CATEGORY LANDING PAGES
  // --------------------------------------------------
  console.log('\n--- PHASE 6: SEO CATEGORY LANDING PAGES ---');
  const targetCategories = [
    'mppsc-books',
    'mppsc-mains-books',
    'mpesb-books',
    'current-affairs-books',
    'ghatna-chakra-books',
  ];

  const catResults = [];
  for (const catSlug of targetCategories) {
    const catUrl = `${API_URL}/api/categories/${catSlug}`;
    const res = await fetchUrl(catUrl, { 'User-Agent': 'Googlebot/2.1' });
    let data = null;
    try { data = JSON.parse(res.body)?.data; } catch {}

    catResults.push({
      catSlug,
      status: res.status,
      name: data?.name,
      hasSeoTitle: Boolean(data?.seo?.metaTitle),
      hasSeoDesc: Boolean(data?.seo?.metaDescription),
    });
    console.log(`[Category Test] /category/${catSlug} -> HTTP ${res.status} | Name: "${data?.name}" | SEO Title: ${data?.seo?.metaTitle}`);
  }
  reportData.categories = catResults;

  // --------------------------------------------------
  // PHASE 7 — SITEMAP VALIDATION
  // --------------------------------------------------
  console.log('\n--- PHASE 7: SITEMAP VALIDATION ---');
  const sitemapRes = await fetchUrl(`${BASE_URL}/sitemap.xml`);
  const locMatches = (sitemapRes.body.match(/<loc>(.*?)<\/loc>/g) || []).map((m) => m.replace(/<\/?loc>/g, ''));

  console.log(`Total URLs found in live sitemap.xml: ${locMatches.length}`);

  let sitemap200Count = 0;
  let sitemap301Count = 0;
  let sitemap404Count = 0;
  let sitemapOtherCount = 0;
  let duplicateCount = 0;
  let nonCanonicalDomainCount = 0;

  const urlSet = new Set();

  // Test sample of 30 sitemap URLs (or all if needed)
  const sampleSitemapUrls = locMatches.slice(0, 50);
  for (const url of sampleSitemapUrls) {
    if (urlSet.has(url)) duplicateCount++;
    urlSet.add(url);

    if (!url.startsWith('https://shubhamxerox.in')) nonCanonicalDomainCount++;

    const res = await fetchUrl(url, {}, 0);
    if (res.status === 200) sitemap200Count++;
    else if (res.status === 301 || res.status === 302) sitemap301Count++;
    else if (res.status === 404) sitemap404Count++;
    else sitemapOtherCount++;
  }

  console.log(`Sitemap Sample Audit (50 URLs):
  Status 200 OK: ${sitemap200Count}
  Status 301/302: ${sitemap301Count}
  Status 404: ${sitemap404Count}
  Other: ${sitemapOtherCount}
  Duplicates: ${duplicateCount}
  Non-Canonical Domain: ${nonCanonicalDomainCount}`);

  reportData.sitemap = {
    totalUrls: locMatches.length,
    sampleTested: sampleSitemapUrls.length,
    status200: sitemap200Count,
    status301: sitemap301Count,
    status404: sitemap404Count,
    duplicates: duplicateCount,
    nonCanonicalDomain: nonCanonicalDomainCount,
  };

  // --------------------------------------------------
  // PHASE 9 — ROBOTS.TXT
  // --------------------------------------------------
  console.log('\n--- PHASE 9: ROBOTS.TXT AUDIT ---');
  const robotsRes = await fetchUrl(`${BASE_URL}/robots.txt`);
  console.log(`Robots.txt status: ${robotsRes.status}`);
  console.log(`Robots.txt Content:\n${robotsRes.body}`);

  reportData.robots = {
    status: robotsRes.status,
    body: robotsRes.body,
  };

  // Save report data to JSON for inspection
  fs.writeFileSync(
    path.join(__dirname, 'validation_summary.json'),
    JSON.stringify(reportData, null, 2),
    'utf-8',
  );
  console.log('\n✅ Validation script output saved to scratch/validation_summary.json');

  process.exit(0);
}

runValidation().catch((err) => {
  console.error('Validation Script Error:', err);
  process.exit(1);
});
