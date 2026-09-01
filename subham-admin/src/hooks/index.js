/** Panel hooks: debounce, list query state, confirm dialogs, body lock. */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useDebounced(value, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/**
 * Keeps list filters (search, page, dropdowns) in the URL so a browser refresh
 * or a shared link lands on the exact same view.
 */
export function useListParams(defaults = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    const obj = { ...defaults };
    searchParams.forEach((v, k) => { obj[k] = v; });
    obj.page = Number(obj.page) || 1;
    obj.limit = Number(obj.limit) || defaults.limit || 20;
    return obj;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, JSON.stringify(defaults)]);

  const update = useCallback(
    (patch, { resetPage = true } = {}) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([k, v]) => {
        if (v === '' || v === undefined || v === null) next.delete(k);
        else next.set(k, String(v));
      });
      if (resetPage && !('page' in patch)) next.delete('page');
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const reset = useCallback(() => setSearchParams(new URLSearchParams()), [setSearchParams]);

  return { params, update, reset, setPage: (p) => update({ page: p }, { resetPage: false }) };
}

export function useBodyLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [locked]);
}

export function useKeyPress(key, handler, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const fn = (e) => { if (e.key === key) handler(e); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [key, handler, active]);
}

/** Local object URLs for image previews, revoked on unmount. */
export function useFilePreviews(files) {
  const [urls, setUrls] = useState([]);
  useEffect(() => {
    const list = Array.from(files || []).filter((f) => f instanceof File);
    const next = list.map((f) => ({ name: f.name, size: f.size, url: URL.createObjectURL(f) }));
    setUrls(next);
    return () => next.forEach((n) => URL.revokeObjectURL(n.url));
  }, [files]);
  return urls;
}
