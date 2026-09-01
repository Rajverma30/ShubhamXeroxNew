/**
 * Catalogue page — powers /shop, /category/:slug, /collection/:slug, /ebooks,
 * /stationery and /offers by pre-seeding the query from props.
 * All filter/sort/page state lives in the URL, so every view is shareable.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiPackage, FiRefreshCw } from 'react-icons/fi';
import api from '../lib/api';
import { useFetch } from '../hooks';
import Seo, { breadcrumbSchema } from '../components/ui/Seo';
import ProductCard from '../components/product/ProductCard';
import { ActiveFilterChips, FilterDrawer, FilterSidebar, SORT_OPTIONS } from '../components/product/Filters';
import { Breadcrumbs, EmptyState, Pagination, SectionHeader } from '../components/ui/Common';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { imgUrl } from '../lib/format';

export default function Shop({ fixed = {}, heading, subheading, banner, breadcrumbs = [], seo = {} }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const params = useMemo(() => ({ ...Object.fromEntries(searchParams.entries()), ...fixed }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, JSON.stringify(fixed)]);

  const page = Number(params.page) || 1;
  const sort = params.sort || 'newest';
  const query = useMemo(() => ({ ...params, page, limit: 20, sort }), [params, page, sort]);
  const queryKey = JSON.stringify(query);

  const { data, loading, error, refetch } = useFetch(() => api.getProducts(query), [queryKey]);
  const { data: facets } = useFetch(() => api.getFacets({ category: params.category, subcategory: params.subcategory }),
    [params.category, params.subcategory]);

  const items = data?.items || [];
  const pagination = data?.pagination;

  const update = useCallback((patch, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v === undefined || v === null) next.delete(k);
      else next.set(k, String(v));
    });
    if (resetPage) next.delete('page');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const toggleMulti = useCallback((key, value) => {
    const current = (searchParams.get(key) || '').split(',').filter(Boolean);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    update({ [key]: next.join(',') });
  }, [searchParams, update]);

  const removeFilter = useCallback((key, value) => {
    const current = (searchParams.get(key) || '').split(',').filter(Boolean);
    if (current.length > 1) update({ [key]: current.filter((v) => v !== value).join(',') });
    else update({ [key]: '' });
  }, [searchParams, update]);

  const clearAll = useCallback(() => {
    const next = new URLSearchParams();
    if (searchParams.get('search')) next.set('search', searchParams.get('search'));
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const activeCount = useMemo(() =>
    ['subcategory', 'type', 'author', 'language', 'minPrice', 'maxPrice', 'minDiscount', 'availability', 'hasFreeEbook']
      .reduce((n, k) => n + (searchParams.get(k) ? searchParams.get(k).split(',').length : 0), 0),
    [searchParams]);

  useEffect(() => { setDrawerOpen(false); }, [queryKey]);

  const filterProps = { facets, params, update, toggleMulti, clearAll, activeCount };

  return (
    <>
      <Seo title={seo.title || heading || 'Shop all products'}
        description={seo.description || subheading || 'Browse exam books, school textbooks, ebooks and stationery.'}
        path={seo.path || '/shop'} image={banner ? imgUrl(banner, 'card') : undefined}
        keywords={seo.keywords} schema={breadcrumbs.length ? breadcrumbSchema(breadcrumbs) : undefined} />

      {banner?.url && (
        <div className="container-x pt-4">
          <div className="relative h-40 overflow-hidden rounded-4xl sm:h-56 lg:h-64">
            <img src={imgUrl(banner, 'full')} alt={heading || ''} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/45 to-transparent" />
            <div className="container-x relative flex h-full flex-col justify-center text-white">
              <h1 className="text-balance font-display text-2xl font-bold sm:text-4xl">{heading}</h1>
              {subheading && <p className="mt-2 max-w-lg text-pretty text-sm text-white/70">{subheading}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="container-x py-6 sm:py-8">
        {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} className="mb-5" />}
        {!banner?.url && (
          <SectionHeader title={heading || (params.search ? `Results for “${params.search}”` : 'All products')} subtitle={subheading} className="mb-5" />
        )}

        <div className="flex gap-7">
          <FilterSidebar {...filterProps} />

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => setDrawerOpen(true)} className="btn-outline btn-sm gap-2 lg:hidden">
                <FiFilter size={14} /> Filters
                {activeCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-900 px-1 text-2xs font-bold text-white">{activeCount}</span>
                )}
              </button>
              <p className="text-xs text-ink-500">
                {loading ? 'Loading…' : `${pagination?.total ?? items.length} product${(pagination?.total ?? items.length) === 1 ? '' : 's'}`}
              </p>
              <label className="ml-auto flex items-center gap-2 text-xs text-ink-500">
                <span className="hidden sm:inline">Sort by</span>
                <select value={sort} onChange={(e) => update({ sort: e.target.value })}
                  className="rounded-full border border-ink-200 bg-white px-3.5 py-2 text-xs font-medium text-ink-900 outline-none transition-colors hover:border-ink-300 focus:border-brand-400">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
            </div>

            <ActiveFilterChips params={params} remove={removeFilter} clearAll={clearAll} />

            {loading ? <ProductGridSkeleton count={10} />
              : error ? (
                <EmptyState icon={FiRefreshCw} title="Couldn't load products" description={error.message}
                  action={<button type="button" onClick={refetch} className="btn-primary">Try again</button>} />
              ) : items.length === 0 ? (
                <EmptyState icon={FiPackage} title="No products match those filters"
                  description="Try widening your price range or clearing a filter or two."
                  action={<button type="button" onClick={clearAll} className="btn-primary">Clear filters</button>} />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                    {items.map((p, i) => <ProductCard key={p._id} product={p} eager={i < 4} />)}
                  </div>
                  <Pagination page={pagination?.page || 1} pages={pagination?.pages || 1}
                    onChange={(n) => { update({ page: n }, { resetPage: false }); window.scrollTo({ top: 200, behavior: 'smooth' }); }}
                    className="mt-10" />
                </>
              )}
          </div>
        </div>
      </div>

      <div className="mobile-nav-spacer" aria-hidden />
      <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} resultCount={pagination?.total} {...filterProps} />
    </>
  );
}
