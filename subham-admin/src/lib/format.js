/** Shared formatting helpers for the panel. */
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const money = (n) => inr.format(Math.round(Number(n) || 0));

export const compactMoney = (n) => {
  const v = Number(n) || 0;
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)}Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2)}L`;
  if (v >= 1e3) return `₹${(v / 1e3).toFixed(1)}K`;
  return money(v);
};

export const number = (n) => new Intl.NumberFormat('en-IN').format(Number(n) || 0);

export const dateShort = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—');

export const dateLong = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const dateTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—';

export const relativeTime = (d) => {
  if (!d) return '—';
  const mins = Math.round((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  if (mins < 43200) return `${Math.round(mins / 1440)}d ago`;
  return dateLong(d);
};

export const bytes = (b) => {
  const n = Number(b) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 ** 2).toFixed(1)} MB`;
};

export const stripHtml = (html = '') => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export const truncate = (s = '', n = 60) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export const PRODUCT_TYPES = [
  { value: 'book', label: 'Book (physical only)' },
  { value: 'book+ebook', label: 'Book + free ebook' },
  { value: 'ebook', label: 'Ebook (digital only)' },
  { value: 'stationery', label: 'Stationery' },
];

export const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'ready-to-ship', 'shipped', 'in-transit',
  'out-for-delivery', 'delivered', 'cancelled', 'returned', 'rto', 'failed',
];

export const STATUS_TONE = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-brand-100 text-brand-800',
  processing: 'bg-brand-100 text-brand-800',
  'ready-to-ship': 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-sky-100 text-sky-800',
  'in-transit': 'bg-sky-100 text-sky-800',
  'out-for-delivery': 'bg-teal-100 text-teal-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
  returned: 'bg-rose-100 text-rose-800',
  rto: 'bg-rose-100 text-rose-800',
  failed: 'bg-rose-100 text-rose-800',
};

export const BANNER_PLACEMENTS = [
  'hero', 'desktop', 'tablet', 'mobile', 'popup', 'category', 'subcategory', 'offer', 'strip',
];

export const HOME_SECTION_TYPES = [
  'hero-slider', 'featured-categories', 'popular-subcategories', 'latest-books', 'trending-books',
  'featured-books', 'exam-books', 'school-books', 'stationery', 'best-sellers', 'recently-added',
  'offers', 'new-arrivals', 'recommended', 'banner-strip', 'testimonials', 'newsletter',
];

export const placeholderImage = (text = 'No image') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="260"><rect width="200" height="260" fill="#eceef2"/><text x="100" y="130" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#8591ab">${text}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const API_ORIGIN = (() => {
  try {
    return new URL(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').origin;
  } catch {
    return '';
  }
})();

// Optional asset host for legacy/production uploads while developing against
// a local API. Leave empty when every upload exists on the local backend.
const UPLOADS_ORIGIN = (() => {
  try {
    return new URL(import.meta.env.VITE_UPLOADS_ORIGIN || '').origin;
  } catch {
    return '';
  }
})();

/**
 * Point an uploaded-asset URL at the backend we're configured to talk to.
 * Stored image URLs are absolute, which bakes in whatever BACKEND_URL was set
 * when the row was written — rewriting the origin here keeps images working
 * if the API moves to another port or domain.
 */
export function resolveAssetUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (!API_ORIGIN) return url;
  try {
    const u = new URL(url, API_ORIGIN);
    if (u.origin !== API_ORIGIN && u.pathname.includes('/uploads/')) {
      return `${UPLOADS_ORIGIN || API_ORIGIN}${u.pathname}${u.search}`;
    }
    return u.toString();
  } catch {
    return url;
  }
}

export const imgUrl = (image, size = 'thumb') => {
  if (!image) return placeholderImage();
  if (typeof image === 'string') return resolveAssetUrl(image);
  if (size === 'thumb') return resolveAssetUrl(image.thumbUrl || image.cardUrl || image.url);
  if (size === 'full') return resolveAssetUrl(image.url || image.cardUrl);
  return resolveAssetUrl(image.cardUrl || image.url || image.thumbUrl);
};
