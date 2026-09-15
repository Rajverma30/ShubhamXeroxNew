/** Presentation helpers — money, dates, text, image URLs. */

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const money = (n) => inr.format(Math.round(Number(n) || 0));

export const priceOf = (p) => {
  if (!p) return 0;
  if (p.finalPrice) return p.finalPrice;
  if (p.salePrice) return p.salePrice;
  return Math.round(Number(p.price) * (1 - (Number(p.discountPercent) || 0) / 100));
};

export const discountOf = (p) => {
  if (!p) return 0;
  if (p.discountPercent) return Math.round(p.discountPercent);
  const final = priceOf(p);
  return p.price > final ? Math.round(((p.price - final) / p.price) * 100) : 0;
};

export const dateLong = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export const dateTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';

export const stripHtml = (html = '') => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
export const truncate = (str = '', n = 90) => (str.length > n ? `${str.slice(0, n - 1).trimEnd()}…` : str);

/** Branded inline placeholder so a missing image never shows a broken icon. */
export function placeholderImage(text = 'Subham Xerox') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#eceef2"/><stop offset="100%" stop-color="#d5d9e2"/>
    </linearGradient></defs>
    <rect width="600" height="800" fill="url(#g)"/>
    <text x="300" y="400" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#8591ab">${text}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Origin of the API we're configured to talk to. */
const API_ORIGIN = (() => {
  try { return new URL(import.meta.env.VITE_API_URL || 'http://localhost:5005/api').origin; }
  catch { return ''; }
})();

/**
 * Canonical public host for catalogue uploads (Firebase hosting).
 * Files live under /uploads on this origin; subhamapi often 404s the same paths.
 */
const UPLOADS_HOST = (
  import.meta.env.VITE_UPLOADS_ORIGIN || 'https://subhamxerox-nxt.web.app'
).replace(/\/$/, '');

/**
 * Point an uploaded-asset URL at the uploads host that actually serves files.
 *
 * Image URLs are stored absolute in the database (the storefront runs on a
 * different origin), which bakes in whatever BACKEND_URL was set when the row
 * was written. Rewriting the origin here — the one place all image URLs pass
 * through — keeps the catalogue working wherever the backend lives.
 */
export function resolveAssetUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  // Any /uploads/... path → Firebase uploads host (web.app)
  if (url.includes('/uploads/')) {
    const filename = url.split('/uploads/')[1];
    if (filename) return `${UPLOADS_HOST}/uploads/${filename}`;
  }

  if (url.startsWith('/uploads/')) {
    return `${UPLOADS_HOST}${url}`;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (!API_ORIGIN) return url;
  try {
    const u = new URL(url, API_ORIGIN);
    return u.toString();
  } catch { return url; }
}

export const imgUrl = (image, size = 'card') => {
  if (!image) return '';
  if (typeof image === 'string') return resolveAssetUrl(image);
  if (size === 'thumb') return resolveAssetUrl(image.thumbUrl || image.cardUrl || image.url);
  if (size === 'full') return resolveAssetUrl(image.url || image.cardUrl);
  return resolveAssetUrl(image.cardUrl || image.url || image.thumbUrl);
};

/** Image load error handler: hide image immediately with zero fallbacks */
export function handleImgError(e) {
  const img = e.currentTarget || e.target;
  if (!img) return;
  img.style.display = 'none';
  if (img.parentElement && img.parentElement.classList.contains('relative')) {
    const skeleton = img.parentElement.querySelector('.skeleton');
    if (skeleton) skeleton.style.display = 'none';
  }
}

/** First N gallery images — powers the hover rotation on product cards. */
export const galleryUrls = (product, count = 5, size = 'card') =>
  (product?.images || []).slice(0, count).map((i) => imgUrl(i, size));

export const TYPE_LABEL = {
  book: 'Book',
  ebook: 'Ebook',
  stationery: 'Stationery',
  'book+ebook': 'Book + Free Ebook',
};

export const ORDER_STATUS_LABEL = {
  pending: 'Order placed', confirmed: 'Confirmed', processing: 'Being packed',
  'ready-to-ship': 'Ready to ship', shipped: 'Picked up', 'in-transit': 'In transit',
  'out-for-delivery': 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled',
  returned: 'Returned', rto: 'Returned to origin', failed: 'Delivery failed',
};
