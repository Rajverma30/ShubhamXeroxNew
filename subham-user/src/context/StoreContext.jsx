/**
 * Global storefront state: settings, cart, wishlist, toasts.
 *
 * There is no user account, so cart and wishlist live entirely in
 * localStorage and survive reloads. Totals here are an estimate for the cart
 * UI only — the server recalculates price, discounts, shipping and
 * tax authoritatively at hand-off.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import api from '../lib/api';
import { KEYS, read, write } from '../lib/storage';
import { priceOf, resolveAssetUrl } from '../lib/format';

const StoreContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'add': {
      const { product, quantity = 1 } = action;
      const id = String(product._id);
      const existing = state.find((l) => l.id === id);
      if (existing) {
        return state.map((l) => (l.id === id ? { ...l, quantity: Math.min(20, l.quantity + quantity) } : l));
      }
      return [...state, {
        id,
        slug: product.slug,
        sku: product.sku,
        title: product.title,
        author: product.author,
        type: product.type,
        image: resolveAssetUrl(product.images?.[0]?.thumbUrl || product.images?.[0]?.url || ''),
        price: priceOf(product),
        mrp: product.price,
        stock: product.stock,
        hasFreeEbook: product.hasFreeEbook,
        quantity: Math.max(1, quantity),
      }];
    }
    case 'setQuantity':
      return state
        .map((l) => (l.id === action.id ? { ...l, quantity: Math.max(0, Math.min(20, action.quantity)) } : l))
        .filter((l) => l.quantity > 0);
    case 'remove': return state.filter((l) => l.id !== action.id);
    case 'clear': return [];
    default: return state;
  }
};

let toastSeq = 0;

export function StoreProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [cart, dispatch] = useReducer(cartReducer, [], () => read(KEYS.cart, []));
  const [wishlist, setWishlist] = useState(() => read(KEYS.wishlist, []));
  const [toasts, setToasts] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const cartRef = useRef(cart);
  cartRef.current = cart;

  useEffect(() => {
    let alive = true;
    Promise.all([api.getSettings().catch(() => null), api.getCategories().catch(() => [])])
      .then(([s, c]) => {
        if (!alive) return;
        setSettings(s);
        setCategories(Array.isArray(c) ? c : []);
      })
      .finally(() => alive && setSettingsLoading(false));
    return () => { alive = false; };
  }, []);

  useEffect(() => { write(KEYS.cart, cart); }, [cart]);
  useEffect(() => { write(KEYS.wishlist, wishlist); }, [wishlist]);

  const toast = useCallback((message, variant = 'success', duration = 3200) => {
    // eslint-disable-next-line no-plusplus
    const id = ++toastSeq;
    setToasts((t) => [...t, { id, message, variant }]);
    if (duration) setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
    return id;
  }, []);
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const addToCart = useCallback((product, quantity = 1, { open = true, silent = false } = {}) => {
    if (!product?._id) return;
    const inCart = cartRef.current.find((l) => l.id === String(product._id));
    const max = product.type === 'ebook' ? 99 : product.stock ?? 0;
    if (!product.allowBackorder && product.type !== 'ebook' && (inCart?.quantity || 0) + quantity > max) {
      toast(max > 0 ? `Only ${max} left in stock` : 'This item is out of stock', 'error');
      return;
    }
    dispatch({ type: 'add', product, quantity });
    if (!silent) toast(`${product.title.slice(0, 40)} added to cart`);
    if (open) setCartOpen(true);
  }, [toast]);

  const setQuantity = useCallback((id, quantity) => dispatch({ type: 'setQuantity', id, quantity }), []);
  const removeFromCart = useCallback((id) => {
    dispatch({ type: 'remove', id });
    toast('Removed from cart', 'info');
  }, [toast]);
  const clearCart = useCallback(() => dispatch({ type: 'clear' }), []);

  const isWishlisted = useCallback((id) => wishlist.some((w) => w.id === String(id)), [wishlist]);

  const toggleWishlist = useCallback((product) => {
    const id = String(product._id);
    setWishlist((list) => {
      if (list.some((w) => w.id === id)) {
        toast('Removed from wishlist', 'info');
        return list.filter((w) => w.id !== id);
      }
      toast('Saved to your wishlist');
      return [{
        id,
        slug: product.slug,
        title: product.title,
        author: product.author,
        image: resolveAssetUrl(product.images?.[0]?.cardUrl || product.images?.[0]?.url || ''),
        price: priceOf(product),
        mrp: product.price,
        discountPercent: product.discountPercent,
        addedAt: Date.now(),
      }, ...list];
    });
  }, [toast]);

  const clearWishlist = useCallback(() => setWishlist([]), []);

  const cartCount = useMemo(() => cart.reduce((s, l) => s + l.quantity, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((s, l) => s + l.price * l.quantity, 0), [cart]);
  const cartMrpTotal = useMemo(() => cart.reduce((s, l) => s + (l.mrp || l.price) * l.quantity, 0), [cart]);

  const freeShippingAbove = settings?.freeShippingAbove ?? 499;
  const shippingGap = Math.max(0, freeShippingAbove - cartSubtotal);

  const value = useMemo(() => ({
    settings, settingsLoading, categories,
    cart, cartCount, cartSubtotal, cartMrpTotal, shippingGap, freeShippingAbove,
    addToCart, setQuantity, removeFromCart, clearCart, cartOpen, setCartOpen,
    wishlist, isWishlisted, toggleWishlist, clearWishlist,
    searchOpen, setSearchOpen, toasts, toast, dismissToast,
  }), [
    settings, settingsLoading, categories, cart, cartCount, cartSubtotal, cartMrpTotal,
    shippingGap, freeShippingAbove, addToCart, setQuantity, removeFromCart, clearCart,
    cartOpen, wishlist, isWishlisted, toggleWishlist, clearWishlist, searchOpen,
    toasts, toast, dismissToast,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
