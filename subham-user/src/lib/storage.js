/**
 * Safe localStorage wrapper. Private-mode Safari throws on setItem, so every
 * call is guarded — features degrade instead of crashing the app.
 */
export function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}

export function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

export function remove(key) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

export const KEYS = {
  cart: 'sx_cart_v1',
  wishlist: 'sx_wishlist_v1',
  recentSearches: 'sx_recent_searches_v1',
  recentlyViewed: 'sx_recently_viewed_v1',
  popupSeen: 'sx_popup_seen_v1',
};
