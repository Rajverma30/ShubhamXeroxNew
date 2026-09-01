/** Small, focused hooks shared across pages. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../lib/api';
import { KEYS, read, write } from '../lib/storage';
import { resolveAssetUrl } from '../lib/format';

/** Minimal fetch hook with abort + retry. */
export function useFetch(fn, deps = [], { skip = false, initial = null } = {}) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const [nonce, setNonce] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (skip) { setLoading(false); return undefined; }
    let alive = true;
    setLoading(true);
    setError(null);
    Promise.resolve(fnRef.current())
      .then((res) => alive && setData(res))
      .catch((err) => alive && setError(err))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, skip, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);
  return { data, loading, error, refetch, setData };
}

export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useBodyLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [locked]);
}

export function useKeyPress(key, handler, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const listener = (e) => { if (e.key === key) handler(e); };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [key, handler, active]);
}

export function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

/**
 * The spec'd hover interaction: stepping through the first 5 images every
 * 700ms while hovered, snapping back to image 1 on mouse-out. Touch devices
 * are excluded so a tap doesn't start an animation the user can't stop.
 */
export function useHoverImageRotation(images = [], { interval = 700, max = 5 } = {}) {
  const frames = useMemo(() => images.slice(0, max), [images, max]);
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!hovering || frames.length < 2) return undefined;
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % frames.length), interval);
    return () => clearInterval(timerRef.current);
  }, [hovering, frames.length, interval]);

  const onMouseEnter = useCallback(() => {
    if (window.matchMedia('(hover: none)').matches) return;
    setHovering(true);
    setIndex((i) => (frames.length > 1 ? (i + 1) % frames.length : i));
  }, [frames.length]);

  const onMouseLeave = useCallback(() => {
    setHovering(false);
    clearInterval(timerRef.current);
    setIndex(0);
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);
  return { frames, index, hovering, onMouseEnter, onMouseLeave };
}

/** Recent searches, capped and de-duplicated, in localStorage. */
export function useRecentSearches(limit = 8) {
  const [recent, setRecent] = useState(() => read(KEYS.recentSearches, []));

  const push = useCallback((term) => {
    const clean = String(term || '').trim();
    if (clean.length < 2) return;
    setRecent((list) => {
      const next = [clean, ...list.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, limit);
      write(KEYS.recentSearches, next);
      return next;
    });
  }, [limit]);

  const clear = useCallback(() => { setRecent([]); write(KEYS.recentSearches, []); }, []);
  const removeOne = useCallback((term) => {
    setRecent((list) => {
      const next = list.filter((t) => t !== term);
      write(KEYS.recentSearches, next);
      return next;
    });
  }, []);

  return { recent, push, clear, removeOne };
}

export function useRecentlyViewed() {
  const [viewed, setViewed] = useState(() => read(KEYS.recentlyViewed, []));
  const record = useCallback((product) => {
    if (!product?._id) return;
    setViewed((list) => {
      const entry = {
        id: String(product._id),
        slug: product.slug,
        title: product.title,
        image: resolveAssetUrl(product.images?.[0]?.cardUrl || product.images?.[0]?.url || ''),
        price: product.finalPrice || product.price,
      };
      const next = [entry, ...list.filter((v) => v.id !== entry.id)].slice(0, 12);
      write(KEYS.recentlyViewed, next);
      return next;
    });
  }, []);
  return { viewed, record };
}

export function usePageView(path) {
  useEffect(() => { api.trackPageView(path); }, [path]);
}
