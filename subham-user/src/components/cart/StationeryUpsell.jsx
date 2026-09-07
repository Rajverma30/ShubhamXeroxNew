import { useMemo, useState } from 'react';
import { FiCheck, FiPlus } from 'react-icons/fi';
import api from '../../lib/api';
import { useFetch } from '../../hooks';
import { useStore } from '../../context/StoreContext';
import { priceOf, resolveAssetUrl } from '../../lib/format';

export default function StationeryUpsell({ compact = false }) {
  const { addToCart, cart, toast } = useStore();
  const [addedIds, setAddedIds] = useState(new Set());

  const { data, loading } = useFetch(() => api.getProducts({ type: 'stationery', limit: 60 }), []);

  const items = useMemo(() => {
    const raw = data?.items || [];
    if (!raw.length) return [];

    // Filter out items already in cart
    const cartItemIds = new Set(cart.map((c) => String(c.id)));
    const available = raw.filter((p) => !cartItemIds.has(String(p._id)));

    // Categorize by user requested priority:
    // 1. Highlighters / Markers
    // 2. Pens
    // 3. Notebooks / Copies / Registers
    const markers = available.filter((p) => /marker|highlight|textliner/i.test(p.title));
    const pens = available.filter((p) => !/marker|highlight|textliner/i.test(p.title) && /pen|ballpoint|gel|roller|ink/i.test(p.title));
    const notebooks = available.filter((p) => !/marker|highlight|textliner|pen|ballpoint|gel|roller|ink/i.test(p.title) && /notebook|copy|register|diary/i.test(p.title));
    const remaining = available.filter((p) => !markers.includes(p) && !pens.includes(p) && !notebooks.includes(p));

    return [...markers, ...pens, ...notebooks, ...remaining].slice(0, 8);
  }, [data, cart]);

  if (loading || !items.length) return null;

  const handleAdd = (product) => {
    addToCart(product, 1, { open: false, silent: true });
    setAddedIds((prev) => new Set(prev).add(String(product._id)));
    toast?.(`Added ${product.title.slice(0, 22)}… to cart`);
  };

  return (
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
          const isAdded = addedIds.has(String(item._id));
          const imgUrl = resolveAssetUrl(item.images?.[0]?.thumbUrl || item.images?.[0]?.url);

          return (
            <div
              key={item._id}
              className="flex w-32 shrink-0 flex-col justify-between rounded-lg border border-ink-100 bg-white p-2 text-left shadow-2xs"
            >
              <div>
                <img
                  src={imgUrl}
                  alt=""
                  loading="lazy"
                  className="h-14 w-full rounded bg-ink-50/50 object-contain p-1"
                />
                <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-tight text-ink-800">
                  {item.title}
                </p>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-1.5">
                <span className="text-xs font-bold text-ink-900">₹{price}</span>
                <button
                  type="button"
                  disabled={isAdded}
                  onClick={() => handleAdd(item)}
                  className={`inline-flex items-center gap-0.5 rounded px-2 py-1 text-[10px] font-bold transition-all ${
                    isAdded
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-brand-600 text-white hover:bg-brand-700 active:scale-95'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <FiCheck size={10} /> Added
                    </>
                  ) : (
                    <>
                      <FiPlus size={10} /> Add
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
