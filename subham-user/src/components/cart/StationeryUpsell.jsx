import { useMemo, useState } from 'react';
import { FiCheck, FiPlus, FiTrash2, FiX, FiInfo, FiPackage, FiZap } from 'react-icons/fi';
import api from '../../lib/api';
import { useFetch } from '../../hooks';
import { useStore } from '../../context/StoreContext';
import { priceOf, discountOf, resolveAssetUrl } from '../../lib/format';

export default function StationeryUpsell({ compact = false, onItemAdded, onItemRemoved }) {
  const { addToCart, removeFromCart, cart, toast } = useStore();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data, loading } = useFetch(() => api.getProducts({ type: 'stationery', limit: 60 }), []);

  const items = useMemo(() => {
    const raw = data?.items || [];
    if (!raw.length) return [];

    // Categorize by user requested priority:
    // 1. Highlighters / Markers
    // 2. Pens
    // 3. Notebooks / Copies / Registers
    const markers = raw.filter((p) => /marker|highlight|textliner/i.test(p.title));
    const pens = raw.filter((p) => !/marker|highlight|textliner/i.test(p.title) && /pen|ballpoint|gel|roller|ink/i.test(p.title));
    const notebooks = raw.filter((p) => !/marker|highlight|textliner|pen|ballpoint|gel|roller|ink/i.test(p.title) && /notebook|copy|register|diary/i.test(p.title));
    const remaining = raw.filter((p) => !markers.includes(p) && !pens.includes(p) && !notebooks.includes(p));

    return [...markers, ...pens, ...notebooks, ...remaining].slice(0, 10);
  }, [data]);

  if (loading || !items.length) return null;

  const handleAdd = (product, e) => {
    e?.stopPropagation();
    addToCart(product, 1, { open: false, silent: true });
    onItemAdded?.(product);
    toast?.(`Added ${product.title.slice(0, 22)}… to order`);
  };

  const handleRemove = (product, e) => {
    e?.stopPropagation();
    const id = String(product._id || product.id);
    removeFromCart(id);
    onItemRemoved?.(product);
    toast?.(`Removed ${product.title.slice(0, 22)}… from order`);
  };

  return (
    <>
      <div className={`rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 ${compact ? 'my-2.5' : 'my-3.5'}`}>
        <div className="mb-2 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-xs font-bold text-ink-900">
            <span>✏️</span> Add Stationery Essentials
          </p>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
            Frequently Added
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {items.map((item) => {
            const price = priceOf(item);
            const itemId = String(item._id || item.id);
            const isInCart = cart.some((c) => String(c.id || c._id) === itemId);
            const imgUrl = resolveAssetUrl(item.images?.[0]?.thumbUrl || item.images?.[0]?.url);

            return (
              <div
                key={itemId}
                onClick={() => setSelectedProduct(item)}
                className="group relative flex w-32 shrink-0 cursor-pointer flex-col justify-between rounded-lg border border-ink-100 bg-white p-2 text-left shadow-2xs transition-all hover:border-brand-300 hover:shadow-xs"
              >
                <div>
                  <img
                    src={imgUrl}
                    alt=""
                    loading="lazy"
                    className="h-14 w-full rounded bg-ink-50/50 object-contain p-1 transition-transform group-hover:scale-105"
                  />
                  <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-tight text-ink-800 group-hover:text-brand-700">
                    {item.title}
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-1.5">
                  <span className="text-xs font-bold text-ink-900">₹{price}</span>

                  {isInCart ? (
                    <button
                      type="button"
                      onClick={(e) => handleRemove(item, e)}
                      title="Remove item"
                      className="inline-flex items-center gap-0.5 rounded border border-rose-200 bg-rose-50 px-1.5 py-1 text-[10px] font-bold text-rose-600 transition-all hover:bg-rose-600 hover:text-white"
                    >
                      <FiX size={10} /> Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleAdd(item, e)}
                      title="Add to order"
                      className="inline-flex items-center gap-0.5 rounded bg-brand-600 px-2 py-1 text-[10px] font-bold text-white transition-all hover:bg-brand-700 active:scale-95"
                    >
                      <FiPlus size={10} /> Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick Product Details Modal Popup ── */}
      {selectedProduct && (
        <QuickDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isInCart={cart.some((c) => String(c.id || c._id) === String(selectedProduct._id || selectedProduct.id))}
          onAdd={(p) => handleAdd(p)}
          onRemove={(p) => handleRemove(p)}
        />
      )}
    </>
  );
}

function QuickDetailModal({ product, onClose, isInCart, onAdd, onRemove }) {
  const price = priceOf(product);
  const discount = discountOf(product);
  const imgUrl = resolveAssetUrl(product.images?.[0]?.url || product.images?.[0]?.thumbUrl);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-ink-100 bg-ink-50/50 p-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink-500 shadow-xs hover:bg-ink-100 hover:text-ink-900"
            aria-label="Close details"
          >
            <FiX size={18} />
          </button>
          <img
            src={imgUrl}
            alt={product.title}
            className="mx-auto h-36 max-w-full object-contain rounded-lg p-2"
          />
        </div>

        <div className="p-4 space-y-3">
          <div>
            <span className="inline-block rounded-full bg-brand-50 px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-brand-700">
              Stationery Item
            </span>
            <h3 className="mt-1 text-sm font-bold leading-snug text-ink-900">{product.title}</h3>
            {product.brand && <p className="mt-0.5 text-xs text-ink-400">Brand: {product.brand}</p>}
          </div>

          <div className="flex items-baseline gap-2 rounded-xl bg-ink-50 p-3">
            <span className="text-xl font-extrabold text-ink-900">₹{price}</span>
            {product.price > price && (
              <>
                <span className="text-xs text-ink-400 line-through">₹{product.price}</span>
                <span className="text-xs font-bold text-emerald-600">{discount}% OFF</span>
              </>
            )}
          </div>

          {product.highlights?.length > 0 ? (
            <ul className="space-y-1 text-xs text-ink-600">
              {product.highlights.slice(0, 3).map((h, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="mt-0.5 text-emerald-500 font-bold">✓</span> {h}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs leading-relaxed text-ink-500">
              {product.shortDescription || 'Essential stationery item for school, college, and competitive exam preparation.'}
            </p>
          )}

          <div className="pt-2">
            {isInCart ? (
              <button
                type="button"
                onClick={() => { onRemove(product); onClose(); }}
                className="btn border border-rose-200 bg-rose-50 w-full justify-center gap-2 py-3 text-rose-600 font-bold hover:bg-rose-600 hover:text-white"
              >
                <FiTrash2 size={16} /> Remove from Order
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { onAdd(product); onClose(); }}
                className="btn-primary w-full justify-center gap-2 py-3"
              >
                <FiPlus size={16} /> Add to Order (₹{price})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
