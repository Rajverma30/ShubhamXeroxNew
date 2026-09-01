/**
 * SEO endpoints: sitemap.xml, robots.txt and JSON-LD schema.
 * The storefront proxies /sitemap.xml and /robots.txt to these routes so the
 * generated content always reflects the live catalogue.
 */
const { Product, Category, SubCategory, Setting } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');

const FRONTEND = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const urlNode = ({ loc, lastmod, changefreq = 'weekly', priority = 0.6 }) =>
  `  <url><loc>${esc(loc)}</loc>${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}` +
  `<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;

/** GET /sitemap.xml */
exports.sitemap = asyncHandler(async (_req, res) => {
  const base = FRONTEND();
  const [products, categories, subCategories] = await Promise.all([
    Product.find({ isActive: true, isHidden: false }).select('slug updatedAt').limit(20000).lean(),
    Category.find({ isActive: true }).select('slug updatedAt').lean(),
    SubCategory.find({ isActive: true }).select('slug updatedAt').lean(),
  ]);

  const staticPages = ['', '/shop', '/categories', '/ebooks', '/stationery', '/offers', '/about', '/contact', '/track', '/wishlist', '/cart'];

  const nodes = [
    ...staticPages.map((p) => urlNode({ loc: `${base}${p}`, changefreq: p === '' ? 'daily' : 'weekly', priority: p === '' ? 1.0 : 0.7 })),
    ...categories.map((c) => urlNode({ loc: `${base}/category/${c.slug}`, lastmod: c.updatedAt, priority: 0.8 })),
    ...subCategories.map((s) => urlNode({ loc: `${base}/collection/${s.slug}`, lastmod: s.updatedAt, priority: 0.7 })),
    ...products.map((p) => urlNode({ loc: `${base}/product/${p.slug}`, lastmod: p.updatedAt, changefreq: 'weekly', priority: 0.6 })),
  ];

  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${nodes.join('\n')}\n</urlset>`,
  );
});

/** GET /robots.txt */
exports.robots = asyncHandler(async (_req, res) => {
  const settings = await Setting.getSingleton();
  const base = FRONTEND();
  const body = settings.maintenanceMode
    ? `User-agent: *\nDisallow: /\n`
    : [
        'User-agent: *',
        'Allow: /',
        'Disallow: /cart',
        'Disallow: /checkout',
        'Disallow: /order-success',
        'Disallow: /admin',
        '',
        `Sitemap: ${base}/sitemap.xml`,
        '',
      ].join('\n');
  res.type('text/plain').send(body);
});

/** GET /api/seo/product/:slug — JSON-LD for the product page. */
exports.productSchema = asyncHandler(async (req, res) => {
  const p = await Product.findOne({ slug: req.params.slug, isActive: true }).lean();
  if (!p) return ok(res, null);
  const base = FRONTEND();

  return ok(res, {
    '@context': 'https://schema.org',
    '@type': p.type === 'stationery' ? 'Product' : 'Book',
    name: p.title,
    image: (p.images || []).map((i) => i.url),
    description: p.shortDescription || String(p.description || '').replace(/<[^>]+>/g, '').slice(0, 300),
    sku: p.sku,
    ...(p.isbn ? { isbn: p.isbn } : {}),
    ...(p.author ? { author: { '@type': 'Person', name: p.author } } : {}),
    ...(p.publisher ? { publisher: { '@type': 'Organization', name: p.publisher } } : {}),
    ...(p.pages ? { numberOfPages: p.pages } : {}),
    inLanguage: p.language,
    brand: { '@type': 'Brand', name: p.brand || 'Subham Xerox' },
    offers: {
      '@type': 'Offer',
      url: `${base}/product/${p.slug}`,
      priceCurrency: p.currency || 'INR',
      price: p.finalPrice || p.price,
      availability: p.stock > 0 || p.type === 'ebook' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Subham Xerox' },
    },
    ...(p.rating?.count
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating.average, reviewCount: p.rating.count } }
      : {}),
  });
});
