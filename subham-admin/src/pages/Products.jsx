/** Product list: search, filters, bulk actions, inline flag toggles. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FiCopy, FiEdit2, FiExternalLink, FiEye, FiEyeOff, FiImage, FiPackage, FiPlus, FiRefreshCw, FiTrash2,
} from 'react-icons/fi';
import api from '../lib/api';
import { useDebounced, useListParams } from '../hooks';
import { useToast } from '../context/ToastContext';
import { PRODUCT_TYPES, imgUrl, money, number, relativeTime, truncate } from '../lib/format';
import {
  Badge, ConfirmDialog, EmptyState, ErrorBlock, PageHeader, Pagination, SearchInput,
  Select, Spinner, TableSkeleton, Toggle,
} from '../components/Ui';

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'a-z', label: 'Title A–Z' },
  { value: 'price-asc', label: 'Price low → high' },
  { value: 'price-desc', label: 'Price high → low' },
  { value: 'stock', label: 'Lowest stock' },
  { value: 'sold', label: 'Best selling' },
];

export default function Products() {
  const { params, update, setPage } = useListParams({ limit: 20, sort: 'newest' });
  const qc = useQueryClient();
  const toast = useToast();

  const [search, setSearch] = useState(params.search || '');
  const debouncedSearch = useDebounced(search, 400);
  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState(null);

  const query = { ...params, search: debouncedSearch || undefined };

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['products', query],
    queryFn: () => api.products(query),
    placeholderData: (prev) => prev,
  });

  const { data: categories } = useQuery({ queryKey: ['categories', 'all'], queryFn: () => api.categories({ limit: 100 }) });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['products'] });

  const flagMutation = useMutation({
    mutationFn: ({ id, payload }) => api.toggleProductFlags(id, payload),
    onSuccess: () => { invalidate(); },
    onError: (err) => toast(err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteProduct(id),
    onSuccess: () => { toast('Product deleted'); setConfirm(null); invalidate(); },
    onError: (err) => toast(err.message, 'error'),
  });

  const bulkMutation = useMutation({
    mutationFn: (payload) => api.bulkProducts(payload),
    onSuccess: (res) => { toast(res.message || 'Updated'); setSelected([]); invalidate(); },
    onError: (err) => toast(err.message, 'error'),
  });

  const regenMutation = useMutation({
    mutationFn: (id) => api.regenerateImages(id),
    onSuccess: () => { toast('Images regenerated from the PDF'); invalidate(); },
    onError: (err) => toast(err.message, 'error'),
  });

  const items = data?.items || [];
  const allSelected = items.length > 0 && selected.length === items.length;

  const toggleAll = () => setSelected(allSelected ? [] : items.map((p) => p._id));
  const toggleOne = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={data?.pagination ? `${number(data.pagination.total)} products in the catalogue` : 'Books, ebooks and stationery'}
        actions={
          <>
            <button type="button" onClick={refetch} className="btn-outline btn-sm gap-1.5">
              {isFetching ? <Spinner size={13} /> : <FiRefreshCw size={13} />} Refresh
            </button>
            <Link to="/products/new" className="btn-primary gap-2"><FiPlus size={15} /> Add product</Link>
          </>
        }
      />

      {/* filters */}
      <div className="mb-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        <SearchInput value={search} onChange={(v) => { setSearch(v); update({ search: v }); }} placeholder="Title, author, ISBN, SKU…" className="lg:col-span-2" />

        <Select value={params.type || ''} onChange={(e) => update({ type: e.target.value })} aria-label="Filter by type">
          <option value="">All types</option>
          {PRODUCT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>

        <Select value={params.category || ''} onChange={(e) => update({ category: e.target.value })} aria-label="Filter by category">
          <option value="">All categories</option>
          {(categories?.items || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </Select>

        <Select value={params.sort || 'newest'} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort">
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: 'stock', value: 'low', label: 'Low stock' },
          { key: 'stock', value: 'out', label: 'Out of stock' },
          { key: 'isActive', value: 'false', label: 'Inactive' },
        ].map((f) => (
          <button
            key={`${f.key}-${f.value}`}
            type="button"
            onClick={() => update({ [f.key]: params[f.key] === f.value ? '' : f.value })}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              params[f.key] === f.value ? 'border-transparent bg-ink-900 text-white' : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* bulk bar */}
      {selected.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
          <p className="text-xs font-semibold text-brand-900">{selected.length} selected</p>
          <div className="ml-auto flex flex-wrap gap-2">
            <button type="button" onClick={() => bulkMutation.mutate({ ids: selected, action: 'isActive', value: true })} className="btn-outline btn-sm">Activate</button>
            <button type="button" onClick={() => bulkMutation.mutate({ ids: selected, action: 'isActive', value: false })} className="btn-outline btn-sm">Deactivate</button>
            <button type="button" onClick={() => bulkMutation.mutate({ ids: selected, action: 'isFeatured', value: true })} className="btn-outline btn-sm">Feature</button>
            <button type="button" onClick={() => setConfirm({ bulk: true })} className="btn-danger btn-sm">Delete</button>
          </div>
        </div>
      )}

      {error ? (
        <ErrorBlock error={error} onRetry={refetch} />
      ) : isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FiPackage}
          title="No products found"
          description="Try clearing the filters, or add your first product."
          action={<Link to="/products/new" className="btn-primary gap-2"><FiPlus size={15} /> Add product</Link>}
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" className="h-4 w-4 rounded border-ink-300 text-ink-900" />
                </th>
                <th>Product</th>
                <th>Type</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Flags</th>
                <th>Live</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id}>
                  <td>
                    <input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggleOne(p._id)} aria-label={`Select ${p.title}`} className="h-4 w-4 rounded border-ink-300 text-ink-900" />
                  </td>

                  <td>
                    <div className="flex items-center gap-3">
                      <img
                        src={imgUrl(p.images?.[0])}
                        alt=""
                        loading="lazy"
                        className="h-12 w-9 shrink-0 rounded border border-ink-100 bg-ink-50 object-cover"
                      />
                      <div className="min-w-0">
                        <Link to={`/products/${p._id}`} className="block truncate text-sm font-semibold text-ink-900 hover:text-brand-700">
                          {truncate(p.title, 52)}
                        </Link>
                        <p className="truncate text-2xs text-ink-400">
                          {p.author || p.categoryName}
                          {p.sku ? ` · ${p.sku}` : ''}
                          {p.imagesFromPdf ? ' · images from PDF' : ''}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <Badge tone={p.type === 'stationery' ? 'amber' : p.hasFreeEbook ? 'green' : 'brand'}>
                      {p.type === 'book+ebook' ? 'book + ebook' : p.type}
                    </Badge>
                  </td>

                  <td className="whitespace-nowrap">
                    <span className="font-semibold text-ink-900">{money(p.finalPrice || p.price)}</span>
                    {p.discountPercent > 0 && <span className="ml-1.5 text-2xs text-emerald-600">−{p.discountPercent}%</span>}
                  </td>

                  <td>
                    {p.type === 'ebook' ? (
                      <Badge tone="sky">digital</Badge>
                    ) : (
                      <Badge tone={p.stock === 0 ? 'rose' : p.stock <= (p.lowStockThreshold || 5) ? 'amber' : 'green'}>
                        {p.stock}
                      </Badge>
                    )}
                  </td>

                  <td>
                    <div className="flex flex-wrap gap-1">
                      {[
                        ['isFeatured', 'F', 'Featured'],
                        ['isTrending', 'T', 'Trending'],
                        ['isBestSeller', 'B', 'Best seller'],
                        ['isLatest', 'L', 'Latest'],
                      ].map(([key, letter, title]) => (
                        <button
                          key={key}
                          type="button"
                          title={title}
                          onClick={() => flagMutation.mutate({ id: p._id, payload: { [key]: !p[key] } })}
                          className={`flex h-6 w-6 items-center justify-center rounded text-2xs font-bold transition-colors ${
                            p[key] ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-400 hover:bg-ink-200'
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </td>

                  <td>
                    <Toggle
                      checked={Boolean(p.isActive)}
                      label={`Toggle ${p.title}`}
                      onChange={(v) => flagMutation.mutate({ id: p._id, payload: { isActive: v } })}
                    />
                  </td>

                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`${import.meta.env.VITE_SITE_URL || 'http://localhost:5173'}/product/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="View on the storefront"
                        className="btn-icon text-ink-400 hover:bg-ink-100 hover:text-ink-900"
                      >
                        <FiExternalLink size={14} />
                      </a>
                      {p.imagesFromPdf && (
                        <button
                          type="button"
                          title="Regenerate images from the PDF"
                          onClick={() => regenMutation.mutate(p._id)}
                          className="btn-icon text-ink-400 hover:bg-ink-100 hover:text-ink-900"
                        >
                          {regenMutation.isPending && regenMutation.variables === p._id ? <Spinner size={13} /> : <FiImage size={14} />}
                        </button>
                      )}
                      <Link to={`/products/${p._id}`} title="Edit" className="btn-icon text-ink-400 hover:bg-ink-100 hover:text-ink-900">
                        <FiEdit2 size={14} />
                      </Link>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => setConfirm({ id: p._id, title: p.title })}
                        className="btn-icon text-ink-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={data?.pagination} onChange={setPage} />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        busy={deleteMutation.isPending || bulkMutation.isPending}
        title={confirm?.bulk ? `Delete ${selected.length} products?` : 'Delete this product?'}
        message={
          confirm?.bulk
            ? `${selected.length} products will be permanently removed, along with their reviews.`
            : `“${confirm?.title}” will be permanently removed, along with its reviews. This cannot be undone.`
        }
        onConfirm={() => {
          if (confirm?.bulk) bulkMutation.mutate({ ids: selected, action: 'delete' });
          else deleteMutation.mutate(confirm.id);
          if (confirm?.bulk) setConfirm(null);
        }}
      />
    </>
  );
}
