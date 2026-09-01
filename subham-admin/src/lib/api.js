/**
 * Admin API client.
 *
 * The JWT is kept in localStorage (and mirrored in an httpOnly cookie by the
 * backend). A 401 clears the token and bounces to /login, so an expired
 * session can never leave the panel in a half-authenticated state.
 *
 * Orders are stored in our own database — guest checkout, paid via Razorpay —
 * so the order methods below read and update them directly.
 */
import axios from 'axios';

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const TOKEN_KEY = 'sx_admin_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const client = axios.create({ baseURL: BASE, timeout: 60000, withCredentials: true });

client.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && !error.config?.url?.includes('/auth/login')) {
      tokenStore.clear();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      }
    }

    const message =
      error.response?.data?.message ||
      (!error.response ? 'Cannot reach the API. Is the backend running?' : 'Something went wrong');

    return Promise.reject(Object.assign(new Error(message), { status, details: error.response?.data?.details }));
  },
);

const unwrap = (res) => (res.data?.data !== undefined ? res.data.data : res.data);
const withMeta = (res) => ({ items: res.data?.data ?? [], pagination: res.data?.pagination ?? null });

/** Builds multipart form data from a plain object (files included). */
export function toFormData(values, fileFields = []) {
  const fd = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (fileFields.includes(key)) return; // handled below
    if (value === undefined || value === null) return;
    if (Array.isArray(value) || (typeof value === 'object' && !(value instanceof Date))) {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, value);
    }
  });

  fileFields.forEach((field) => {
    const files = values[field];
    if (!files) return;
    if (Array.isArray(files) || files instanceof FileList) {
      Array.from(files).forEach((f) => f instanceof File && fd.append(field, f));
    } else if (files instanceof File) {
      fd.append(field, files);
    }
  });

  return fd;
}

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const api = {
  raw: client,

  /* auth */
  login: (payload) => client.post('/admin/auth/login', payload).then(unwrap),
  me: () => client.get('/admin/auth/me').then(unwrap),
  logout: () => client.post('/admin/auth/logout').then(unwrap),
  updateProfile: (payload) => client.put('/admin/auth/profile', payload).then(unwrap),
  changePassword: (payload) => client.put('/admin/auth/password', payload).then(unwrap),

  /* dashboard */
  dashboard: (days = 30) => client.get('/admin/dashboard', { params: { days } }).then(unwrap),

  /* categories */
  categories: (params) => client.get('/admin/categories', { params }).then(withMeta),
  category: (id) => client.get(`/admin/categories/${id}`).then(unwrap),
  createCategory: (fd) => client.post('/admin/categories', fd, multipart).then(unwrap),
  updateCategory: (id, fd) => client.put(`/admin/categories/${id}`, fd, multipart).then(unwrap),
  deleteCategory: (id) => client.delete(`/admin/categories/${id}`).then(unwrap),
  reorderCategories: (items) => client.post('/admin/categories/reorder', { items }).then(unwrap),

  /* subcategories */
  subCategories: (params) => client.get('/admin/subcategories', { params }).then(withMeta),
  subCategory: (id) => client.get(`/admin/subcategories/${id}`).then(unwrap),
  createSubCategory: (fd) => client.post('/admin/subcategories', fd, multipart).then(unwrap),
  updateSubCategory: (id, fd) => client.put(`/admin/subcategories/${id}`, fd, multipart).then(unwrap),
  deleteSubCategory: (id) => client.delete(`/admin/subcategories/${id}`).then(unwrap),

  /* products */
  products: (params) => client.get('/admin/products', { params }).then(withMeta),
  product: (id) => client.get(`/admin/products/${id}`).then(unwrap),
  createProduct: (fd) => client.post('/admin/products', fd, multipart).then(unwrap),
  updateProduct: (id, fd) => client.put(`/admin/products/${id}`, fd, multipart).then(unwrap),
  deleteProduct: (id) => client.delete(`/admin/products/${id}`).then(unwrap),
  toggleProductFlags: (id, payload) => client.patch(`/admin/products/${id}/flags`, payload).then(unwrap),
  regenerateImages: (id, pages) => client.post(`/admin/products/${id}/regenerate-images`, { pages }).then(unwrap),
  bulkProducts: (payload) => client.post('/admin/products/bulk', payload).then(unwrap),

  /* orders — guest checkout, Razorpay
     Uses `unwrap`, not `withMeta`: this endpoint returns
     { items, total, page, pages, paidRevenue } in one object. */
  orders: (params) => client.get('/admin/orders', { params }).then(unwrap),
  order: (id) => client.get(`/admin/orders/${id}`).then(unwrap),
  updateOrder: (id, payload) => client.patch(`/admin/orders/${id}`, payload).then(unwrap),

  /* banners */
  banners: (params) => client.get('/admin/banners', { params }).then(withMeta),
  banner: (id) => client.get(`/admin/banners/${id}`).then(unwrap),
  createBanner: (fd) => client.post('/admin/banners', fd, multipart).then(unwrap),
  updateBanner: (id, fd) => client.put(`/admin/banners/${id}`, fd, multipart).then(unwrap),
  deleteBanner: (id) => client.delete(`/admin/banners/${id}`).then(unwrap),

  /* coupons */
  coupons: (params) => client.get('/admin/coupons', { params }).then(withMeta),
  createCoupon: (payload) => client.post('/admin/coupons', payload).then(unwrap),
  updateCoupon: (id, payload) => client.put(`/admin/coupons/${id}`, payload).then(unwrap),
  deleteCoupon: (id) => client.delete(`/admin/coupons/${id}`).then(unwrap),

  /* homepage builder */
  homeSections: () => client.get('/admin/home-sections').then(unwrap),
  createHomeSection: (payload) => client.post('/admin/home-sections', payload).then(unwrap),
  updateHomeSection: (id, payload) => client.put(`/admin/home-sections/${id}`, payload).then(unwrap),
  deleteHomeSection: (id) => client.delete(`/admin/home-sections/${id}`).then(unwrap),
  reorderHomeSections: (items) => client.post('/admin/home-sections/reorder', { items }).then(unwrap),

  /* settings */
  settings: () => client.get('/admin/settings').then(unwrap),
  updateSettings: (payload) => client.put('/admin/settings', payload).then(unwrap),
  shiprocketDiagnostics: () => client.get('/admin/shiprocket/diagnostics').then(unwrap),
  resyncShiprocketCatalogue: () => client.post('/admin/shiprocket/resync-catalogue').then(unwrap),

  /* media */
  media: (params) => client.get('/admin/media', { params }).then(withMeta),
  uploadMedia: (fd) => client.post('/admin/media', fd, multipart).then(unwrap),
  updateMedia: (id, payload) => client.put(`/admin/media/${id}`, payload).then(unwrap),
  deleteMedia: (id) => client.delete(`/admin/media/${id}`).then(unwrap),

  /* reviews / newsletter / contact */
  reviews: (params) => client.get('/admin/reviews', { params }).then(withMeta),
  moderateReview: (id, isApproved) => client.patch(`/admin/reviews/${id}`, { isApproved }).then(unwrap),
  deleteReview: (id) => client.delete(`/admin/reviews/${id}`).then(unwrap),
  newsletter: (params) => client.get('/admin/newsletter', { params }).then(withMeta),
  contacts: (params) => client.get('/admin/contacts', { params }).then(withMeta),
  updateContact: (id, payload) => client.put(`/admin/contacts/${id}`, payload).then(unwrap),
};

export default api;
