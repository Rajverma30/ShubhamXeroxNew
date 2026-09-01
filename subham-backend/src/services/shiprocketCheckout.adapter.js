/**
 * ────────────────────────────────────────────────────────────────────────────
 *  THE ONE FILE TO EDIT WHEN THE REAL SPEC ARRIVES
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Maps our Mongo documents onto the JSON shape Shiprocket Checkout expects
 * from a custom platform's catalogue endpoints.
 *
 * IMPORTANT — read this before going live:
 *
 * Shiprocket does not publish the custom-platform catalogue contract; it is
 * sent to merchants during onboarding. Shiprocket Checkout was built
 * Shopify-first and its custom-platform contract mirrors Shopify's Admin API
 * product/collection payloads, so that is what this file emits. It is a
 * well-founded default, **not a verified spec**.
 *
 * When your client sends the integration document:
 *   1. Compare the field names below against it.
 *   2. Change them here. Nothing else in the codebase needs to change —
 *      the controller only calls these three functions.
 *   3. Hit /shiprocket-checkout/ping?debug=1 to eyeball a sample payload.
 *
 * Set SHIPROCKET_CHECKOUT_FLAT_ARRAY=true if the spec wants a bare array
 * rather than a `{ products: [...] }` envelope.
 */
const { sellingPrice } = require('../utils/pricing');

const iso = (d) => (d ? new Date(d).toISOString() : new Date().toISOString());
const publicBaseUrl = () => String(process.env.BACKEND_URL || process.env.FRONTEND_URL || '').replace(/\/$/, '');
const publicUrl = (value) => {
  const url = String(value || '').trim();
  if (!url || /^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
  const base = publicBaseUrl();
  return base ? `${base}/${url.replace(/^\//, '')}` : url;
};

/** Numeric id derived from the Mongo ObjectId — some platforms reject strings. */
const numericId = (objectId) => parseInt(String(objectId).slice(-12), 16);

/**
 * One product → one Shopify-style product object.
 *
 * We emit a single variant per product because this catalogue has no
 * size/colour axes. If you add variants later, expand `variants` and `options`.
 */
function toProduct(p) {
  const price = sellingPrice(p);
  const hasDiscount = Number(p.price) > price;
  const inStock = p.type === 'ebook' || p.allowBackorder || (p.stock ?? 0) > 0;

  const images = (p.images || []).map((img, i) => ({
    id: numericId(p._id) + i + 1,
    product_id: numericId(p._id),
    src: publicUrl(img.url),
    alt: img.alt || p.title,
    position: i + 1,
    width: img.width || null,
    height: img.height || null,
  }));

  return {
    id: numericId(p._id),
    // Keep the real Mongo id too — harmless extra field, invaluable for support.
    external_id: String(p._id),
    title: p.title,
    handle: p.slug,
    body_html: p.description || p.shortDescription || '',
    vendor: p.publisher || p.brand || 'Subham Xerox',
    product_type: p.subCategoryName || p.categoryName || p.type,
    status: p.isActive && !p.isHidden ? 'active' : 'draft',
    published: Boolean(p.isActive && !p.isHidden),
    published_at: p.isActive && !p.isHidden ? iso(p.createdAt) : null,
    published_scope: 'web',
    template_suffix: null,
    admin_graphql_api_id: `gid://shopify/Product/${numericId(p._id)}`,
    tags: (p.tags || []).join(', '),
    created_at: iso(p.createdAt),
    updated_at: iso(p.updatedAt),

    images,
    image: images[0] || null,
    price,
    price_min: price,
    price_max: price,
    price_varies: false,
    compare_at_price: hasDiscount ? Number(p.price) : null,
    compare_at_price_min: hasDiscount ? Number(p.price) : 0,
    compare_at_price_max: hasDiscount ? Number(p.price) : 0,
    compare_at_price_varies: false,
    url: publicBaseUrl() ? `${publicBaseUrl()}/product/${encodeURIComponent(p.slug)}` : `/product/${p.slug}`,

    options: [{ id: numericId(p._id), name: 'Title', position: 1, values: ['Default Title'] }],

    variants: [
      {
        id: numericId(p._id),
        product_id: numericId(p._id),
        title: 'Default Title',
        option1: 'Default Title',
        sku: p.sku || String(p._id),
        barcode: p.isbn || '',
        price: price.toFixed(2),
        compare_at_price: hasDiscount ? Number(p.price).toFixed(2) : null,
        // grams — Shopify's unit. Digital goods weigh nothing.
        weight: p.type === 'ebook' ? 0 : Math.round((Number(p.weight) || 0.3) * 1000),
        weight_unit: 'g',
        requires_shipping: p.type !== 'ebook',
        taxable: Number(p.taxPercent) > 0,
        inventory_management: p.allowBackorder ? null : 'subham',
        inventory_policy: p.allowBackorder ? 'continue' : 'deny',
        inventory_quantity: p.type === 'ebook' ? 9999 : Number(p.stock) || 0,
        available: inStock,
        image_id: images[0]?.id || null,
        created_at: iso(p.createdAt),
        updated_at: iso(p.updatedAt),
      },
    ],
  };
}

/** One Category or SubCategory → one Shopify-style custom collection. */
function toCollection(doc, { isSubCategory = false } = {}) {
  return {
    id: numericId(doc._id),
    external_id: String(doc._id),
    handle: doc.slug,
    title: doc.name,
    body_html: doc.description || doc.shortDescription || '',
    published: Boolean(doc.isActive),
    status: doc.isActive ? 'active' : 'draft',
    published_at: iso(doc.createdAt),
    updated_at: iso(doc.updatedAt),
    sort_order: 'manual',
    products_count: doc.productCount || 0,
    image: doc.image?.url ? { src: publicUrl(doc.image.url), alt: doc.name } : null,
    // Extra context so the client can tell the two levels apart in Shiprocket.
    level: isSubCategory ? 'subcategory' : 'category',
    parent_handle: isSubCategory ? doc.categorySlug || null : null,
  };
}

/** Wraps a page of results in the envelope + pagination block. */
function envelope(key, items, { page, limit, total }) {
  const flat = String(process.env.SHIPROCKET_CHECKOUT_FLAT_ARRAY).toLowerCase() === 'true';
  if (flat) return items;

  const pages = Math.max(1, Math.ceil(total / limit));
  return {
    [key]: items,
    // Several naming conventions are included because different Shiprocket
    // integrations read different keys. Extra keys are ignored by the reader.
    count: total,
    total_count: total,
    page,
    per_page: limit,
    total_pages: pages,
    has_next_page: page < pages,
    pagination: { page, limit, total, total_pages: pages, has_next: page < pages },
  };
}

module.exports = { toProduct, toCollection, envelope, numericId };
