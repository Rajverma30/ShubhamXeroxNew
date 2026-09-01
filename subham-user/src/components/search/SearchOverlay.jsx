/**
 * Modern search: debounced instant suggestions, keyboard navigation, recent
 * searches (localStorage) and popular searches from the API.
 *
 * Every product suggestion shows image · name · author · price · category ·
 * sub category.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowRight, FiClock, FiCornerDownLeft, FiSearch, FiTrash2, FiTrendingUp, FiX } from 'react-icons/fi';
import api from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { useBodyLock, useDebounced, useKeyPress, useRecentSearches } from '../../hooks';
import { money, placeholderImage, resolveAssetUrl } from '../../lib/format';
import { Spinner } from '../ui/Common';

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen, settings } = useStore();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const [popular, setPopular] = useState([]);

  const debounced = useDebounced(query, 260);
  const { recent, push, clear, removeOne } = useRecentSearches();

  useBodyLock(searchOpen);
  useKeyPress('Escape', () => setSearchOpen(false), searchOpen);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSearchOpen]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      if (!popular.length) {
        const fromSettings = settings?.popularSearches;
        if (fromSettings?.length) setPopular(fromSettings.slice(0, 10));
        else api.popularSearches().then(setPopular).catch(() => {});
      }
    } else {
      setQuery(''); setResults(null); setCursor(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen]);

  useEffect(() => {
    if (debounced.trim().length < 2) { setResults(null); return undefined; }
    const controller = new AbortController();
    setLoading(true);
    api.suggest(debounced.trim(), controller.signal)
      .then((res) => { setResults(res); setCursor(-1); })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [debounced]);

  const flatItems = useMemo(() => {
    if (!results) return [];
    return [
      ...(results.products || []).map((p) => ({ label: p.title, to: `/product/${p.slug}` })),
      ...(results.categories || []).map((c) => ({ label: c.name, to: `/category/${c.slug}` })),
      ...(results.subCategories || []).map((s) => ({ label: s.name, to: `/collection/${s.slug}` })),
      ...(results.authors || []).map((a) => ({ label: a.name, to: `/shop?author=${encodeURIComponent(a.name)}` })),
    ];
  }, [results]);

  const go = useCallback((to, term) => {
    if (term) push(term);
    setSearchOpen(false);
    navigate(to);
  }, [navigate, push, setSearchOpen]);

  const submit = useCallback((e) => {
    e?.preventDefault();
    const term = query.trim();
    if (cursor >= 0 && flatItems[cursor]) { go(flatItems[cursor].to, flatItems[cursor].label); return; }
    if (term.length < 2) return;
    go(`/shop?search=${encodeURIComponent(term)}`, term);
  }, [query, cursor, flatItems, go]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(flatItems.length - 1, c + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(-1, c - 1)); }
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)} className="fixed inset-0 z-[90] bg-ink-950/50 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="fixed inset-x-0 top-0 z-[92] mx-auto w-full max-w-3xl p-3 sm:p-6">
            <div className="overflow-hidden rounded-3xl bg-white shadow-lift">
              <form onSubmit={submit} className="flex items-center gap-3 border-b border-ink-100 px-4 py-3.5 sm:px-5">
                <FiSearch className="shrink-0 text-ink-400" size={19} />
                <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKeyDown}
                  type="search" placeholder="Search books, authors, ISBN, stationery…" aria-label="Search the store"
                  className="flex-1 bg-transparent text-[15px] font-medium text-ink-900 placeholder-ink-400 outline-none" />
                {loading && <Spinner size={15} className="text-ink-300" />}
                <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="btn-icon h-8 w-8 text-ink-400 hover:bg-ink-100">
                  <FiX size={16} />
                </button>
              </form>

              <div className="max-h-[70vh] overflow-y-auto overscroll-contain">
                {!results && (
                  <div className="grid gap-6 p-5 sm:grid-cols-2">
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wide text-ink-400"><FiClock size={11} /> Recent searches</p>
                        {recent.length > 0 && (
                          <button type="button" onClick={clear} className="inline-flex items-center gap-1 text-2xs font-semibold text-ink-400 hover:text-rose-500">
                            <FiTrash2 size={10} /> Clear
                          </button>
                        )}
                      </div>
                      {recent.length === 0 ? (
                        <p className="text-xs text-ink-400">Your searches will show up here.</p>
                      ) : (
                        <ul className="space-y-1">
                          {recent.map((term) => (
                            <li key={term} className="group flex items-center gap-1">
                              <button type="button" onClick={() => go(`/shop?search=${encodeURIComponent(term)}`, term)}
                                className="flex-1 truncate rounded-xl px-2.5 py-2 text-left text-sm text-ink-700 transition-colors hover:bg-ink-50">
                                {term}
                              </button>
                              <button type="button" aria-label={`Remove ${term}`} onClick={() => removeOne(term)}
                                className="btn-icon h-7 w-7 text-ink-300 opacity-0 transition hover:text-rose-500 group-hover:opacity-100">
                                <FiX size={12} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <p className="mb-3 flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wide text-ink-400"><FiTrendingUp size={11} /> Popular right now</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(popular.length ? popular : ['ssc cgl', 'class 10 maths', 'upsc prelims', 'notebook']).map((term) => (
                          <button key={term} type="button" onClick={() => go(`/shop?search=${encodeURIComponent(term)}`, term)} className="chip">{term}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {results && (
                  <div className="p-2 sm:p-3">
                    {flatItems.length === 0 && !loading && (
                      <div className="px-4 py-10 text-center">
                        <p className="text-sm font-semibold text-ink-900">No matches for “{query}”</p>
                        <p className="mt-1 text-xs text-ink-500">Try a shorter phrase, or browse the full catalogue.</p>
                        <button type="button" onClick={() => go('/shop')} className="btn-outline btn-sm mt-4">Browse everything</button>
                      </div>
                    )}

                    {results.products?.length > 0 && (
                      <>
                        <p className="px-3 pb-1.5 pt-2 text-2xs font-bold uppercase tracking-wide text-ink-400">Products</p>
                        <ul>
                          {results.products.map((p, i) => (
                            <li key={p._id}>
                              <button type="button" onMouseEnter={() => setCursor(i)} onClick={() => go(`/product/${p.slug}`, p.title)}
                                className={`flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-colors ${cursor === i ? 'bg-ink-50' : 'hover:bg-ink-50'}`}>
                                <img src={resolveAssetUrl(p.image) || placeholderImage(p.title)} alt="" loading="lazy"
                                  className="h-14 w-11 shrink-0 rounded-lg border border-ink-100 object-cover" />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm font-semibold text-ink-900">{p.title}</span>
                                  {p.author && <span className="block truncate text-xs text-ink-500">by {p.author}</span>}
                                  <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-2xs text-ink-400">
                                    {p.category && <span className="rounded bg-ink-100 px-1.5 py-0.5 font-medium">{p.category}</span>}
                                    {p.subCategory && <span className="rounded bg-brand-50 px-1.5 py-0.5 font-medium text-brand-700">{p.subCategory}</span>}
                                  </span>
                                </span>
                                <span className="shrink-0 text-right">
                                  <span className="block text-sm font-bold text-ink-900">{money(p.price)}</span>
                                  {p.mrp > p.price && <span className="block text-2xs text-ink-400 line-through">{money(p.mrp)}</span>}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {(results.categories?.length > 0 || results.subCategories?.length > 0) && (
                      <>
                        <p className="px-3 pb-1.5 pt-3 text-2xs font-bold uppercase tracking-wide text-ink-400">Collections</p>
                        <div className="flex flex-wrap gap-1.5 px-2.5 pb-1">
                          {results.categories?.map((c) => (
                            <button key={c._id} type="button" onClick={() => go(`/category/${c.slug}`, c.name)} className="chip">{c.name}</button>
                          ))}
                          {results.subCategories?.map((s) => (
                            <button key={s._id} type="button" onClick={() => go(`/collection/${s.slug}`, s.name)} className="chip">{s.name}</button>
                          ))}
                        </div>
                      </>
                    )}

                    {results.authors?.length > 0 && (
                      <>
                        <p className="px-3 pb-1.5 pt-3 text-2xs font-bold uppercase tracking-wide text-ink-400">Authors</p>
                        <div className="flex flex-wrap gap-1.5 px-2.5 pb-2">
                          {results.authors.map((a) => (
                            <button key={a.name} type="button" onClick={() => go(`/shop?author=${encodeURIComponent(a.name)}`, a.name)} className="chip">
                              {a.name} <span className="text-ink-400">· {a.count}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    <button type="button" onClick={submit}
                      className="mt-2 flex w-full items-center justify-between gap-2 rounded-2xl bg-ink-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-950">
                      <span className="truncate">See all results for “{query}”</span>
                      <FiArrowRight size={15} />
                    </button>
                  </div>
                )}
              </div>

              <div className="hidden items-center gap-4 border-t border-ink-100 px-5 py-2.5 text-2xs text-ink-400 sm:flex">
                <span className="inline-flex items-center gap-1"><kbd className="rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 font-sans">↑↓</kbd> navigate</span>
                <span className="inline-flex items-center gap-1"><kbd className="rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 font-sans"><FiCornerDownLeft size={9} /></kbd> open</span>
                <span className="inline-flex items-center gap-1"><kbd className="rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 font-sans">esc</kbd> close</span>
                <span className="ml-auto inline-flex items-center gap-1"><kbd className="rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 font-sans">⌘K</kbd> anywhere</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
