/**
 * Single axios instance for the storefront.
 * Adds an anonymous guest id (there is no login) and unwraps the backend's
 * `{ success, data }` envelope so callers get plain data.
 */
import axios from 'axios';

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5005/api').replace(/\/$/, '');

/** Stable per-browser id used for analytics and reviews. */
export function getGuestId() {
  const KEY = 'sx_guest_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `g_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}

const client = axios.create({ baseURL: BASE, timeout: 25000 });

client.interceptors.request.use((config) => {
  config.headers['x-guest-id'] = getGuestId();
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED' ? 'The request timed out. Check your connection.' : null) ||
      (!error.response ? 'Cannot reach the server. Is the API running?' : 'Something went wrong');
    return Promise.reject(Object.assign(new Error(message), {
      status: error.response?.status,
      details: error.response?.data?.details,
    }));
  },
);

const unwrap = (res) => (res.data?.data !== undefined ? res.data.data : res.data);
const withMeta = (res) => ({ items: res.data?.data ?? [], pagination: res.data?.pagination ?? null });

export const api = {
  raw: client,

  getSettings: () => client.get('/settings').then(unwrap),
  getHome: () => client.get('/home').then(unwrap),
  getBanners: (params) => client.get('/banners', { params }).then(unwrap),
  trackBannerClick: (id) => client.post(`/banners/${id}/click`).catch(() => {}),
  trackPageView: (path) =>
    client.post('/track', { guestId: getGuestId(), path, referrer: document.referrer }).catch(() => {}),

  getCategories: () => client.get('/categories').then(unwrap),
  getCategory: (slug) => client.get(`/categories/${slug}`).then(unwrap),
  getSubCategory: (slug) => client.get(`/subcategories/${slug}`).then(unwrap),

  getProducts: (params) => client.get('/products', { params }).then(withMeta),
  getFacets: (params) => client.get('/products/facets', { params }).then(unwrap),
  getProduct: (slug) => client.get(`/products/${slug}`).then(unwrap),
  getPreview: (slug) => client.get(`/products/${slug}/preview`).then(unwrap),
  ebookUrl: (slug) => `${BASE}/products/${slug}/ebook`,
  postReview: (slug, payload) =>
    client.post(`/products/${slug}/reviews`, { ...payload, guestId: getGuestId() }).then(unwrap),

  suggest: (q, signal) => client.get('/search/suggest', { params: { q }, signal }).then(unwrap),
  popularSearches: () => client.get('/search/popular').then(unwrap),

  getCoupons: () => client.get('/coupons').then(unwrap),
  serviceability: (params) => client.get('/shipping/serviceability', { params }).then(unwrap),
  trackOrder: (params) => client.get('/track', { params }).then(unwrap),

  subscribe: (email, source = 'footer') => client.post('/newsletter', { email, source }).then(unwrap),
  contact: (payload) => client.post('/contact', payload).then(unwrap),
};

export default api;
