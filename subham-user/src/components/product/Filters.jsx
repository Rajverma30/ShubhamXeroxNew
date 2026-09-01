/**
 * Faceted filter sidebar. Options come from /products/facets so counts always
 * reflect the live catalogue. State lives in the URL, making every filtered
 * view shareable and back-button friendly.
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronDown, FiSliders, FiX } from 'react-icons/fi';
import { money, TYPE_LABEL } from '../../lib/format';
import { Drawer } from '../ui/Overlay';

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'discount', label: 'Biggest discount' },
  { value: 'best-selling', label: 'Best selling' },
  { value: 'rating', label: 'Top rated' },
  { value: 'a-z', label: 'Title: A to Z' },
];

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ink-100 py-4 last:border-0">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between text-left">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-900">{title}</span>
        <FiChevronDown size={15} className={`text-ink-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckList({ options = [], selected = [], onToggle, limit = 8 }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? options : options.slice(0, limit);
  if (!options.length) return <p className="text-xs text-ink-400">Nothing to filter here yet.</p>;

  return (
    <>
      <ul className="space-y-1.5">
        {visible.map((opt) => {
          const value = opt.value ?? opt;
          const label = opt.label || value;
          const checked = selected.includes(String(value));
          return (
            <li key={value}>
              <label className="group flex cursor-pointer items-center gap-2.5">
                <input type="checkbox" checked={checked} onChange={() => onToggle(String(value))}
                  className="h-4 w-4 shrink-0 rounded border-ink-300 text-ink-900 focus:ring-2 focus:ring-brand-500/30" />
                <span className={`min-w-0 flex-1 truncate text-[13px] transition-colors ${checked ? 'font-semibold text-ink-900' : 'text-ink-600 group-hover:text-ink-900'}`}>
                  {TYPE_LABEL[label] || label}
                </span>
                {opt.count !== undefined && <span className="shrink-0 text-2xs text-ink-300">{opt.count}</span>}
              </label>
            </li>
          );
        })}
      </ul>
      {options.length > limit && (
        <button type="button" onClick={() => setExpanded((e) => !e)} className="mt-2.5 text-2xs font-bold uppercase tracking-wide text-brand-600 hover:text-brand-700">
          {expanded ? 'Show less' : `Show all ${options.length}`}
        </button>
      )}
    </>
  );
}

function FilterBody({ facets, params, update, toggleMulti, clearAll, activeCount }) {
  const priceMin = facets?.price?.min ?? 0;
  const priceMax = facets?.price?.max ?? 5000;
  const [localMax, setLocalMax] = useState(Number(params.maxPrice) || priceMax);
  useEffect(() => { setLocalMax(Number(params.maxPrice) || priceMax); }, [params.maxPrice, priceMax]);

  return (
    <div className="px-1">
      {activeCount > 0 && (
        <div className="flex items-center justify-between border-b border-ink-100 py-3">
          <span className="text-xs font-semibold text-ink-600">{activeCount} filter{activeCount > 1 ? 's' : ''} applied</span>
          <button type="button" onClick={clearAll} className="text-2xs font-bold uppercase tracking-wide text-rose-500 hover:text-rose-600">Clear all</button>
        </div>
      )}

      <Section title="Price">
        <div className="flex items-center gap-2">
          <input type="number" inputMode="numeric" value={params.minPrice || ''} onChange={(e) => update({ minPrice: e.target.value })}
            placeholder={String(priceMin)} aria-label="Minimum price" className="field py-2 text-xs" />
          <span className="text-ink-300">–</span>
          <input type="number" inputMode="numeric" value={params.maxPrice || ''} onChange={(e) => update({ maxPrice: e.target.value })}
            placeholder={String(priceMax)} aria-label="Maximum price" className="field py-2 text-xs" />
        </div>
        <input type="range" min={priceMin} max={priceMax} value={localMax}
          onChange={(e) => setLocalMax(Number(e.target.value))}
          onMouseUp={(e) => update({ maxPrice: e.target.value })} onTouchEnd={(e) => update({ maxPrice: e.target.value })}
          aria-label="Maximum price slider" className="mt-3.5 w-full accent-ink-900" />
        <p className="mt-1 text-2xs text-ink-400">Up to {money(localMax)}</p>
      </Section>

      {facets?.subCategories?.length > 1 && (
        <Section title="Collection">
          <CheckList options={facets.subCategories} selected={(params.subcategory || '').split(',').filter(Boolean)} onToggle={(v) => toggleMulti('subcategory', v)} />
        </Section>
      )}

      {facets?.types?.length > 1 && (
        <Section title="Product type">
          <CheckList options={facets.types} selected={(params.type || '').split(',').filter(Boolean)} onToggle={(v) => toggleMulti('type', v)} />
        </Section>
      )}

      {facets?.authors?.length > 0 && (
        <Section title="Author" defaultOpen={false}>
          <CheckList options={facets.authors} selected={(params.author || '').split(',').filter(Boolean)} onToggle={(v) => toggleMulti('author', v)} />
        </Section>
      )}

      {facets?.languages?.length > 1 && (
        <Section title="Language" defaultOpen={false}>
          <CheckList options={facets.languages} selected={(params.language || '').split(',').filter(Boolean)} onToggle={(v) => toggleMulti('language', v)} />
        </Section>
      )}

      <Section title="Discount" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {[10, 20, 30, 40, 50].map((d) => (
            <button key={d} type="button" onClick={() => update({ minDiscount: String(params.minDiscount) === String(d) ? '' : d })}
              className={`chip ${String(params.minDiscount) === String(d) ? 'chip-active' : ''}`}>
              {d}% &amp; above
            </button>
          ))}
        </div>
      </Section>

      <Section title="Availability">
        <div className="space-y-1.5">
          {[{ value: 'in-stock', label: 'In stock' }, { value: 'out-of-stock', label: 'Out of stock' }].map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2.5">
              <input type="radio" name="availability" checked={params.availability === opt.value} onChange={() => update({ availability: opt.value })}
                className="h-4 w-4 border-ink-300 text-ink-900 focus:ring-2 focus:ring-brand-500/30" />
              <span className="text-[13px] text-ink-600">{opt.label}</span>
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" checked={params.hasFreeEbook === 'true'} onChange={() => update({ hasFreeEbook: params.hasFreeEbook === 'true' ? '' : 'true' })}
              className="h-4 w-4 rounded border-ink-300 text-ink-900 focus:ring-2 focus:ring-brand-500/30" />
            <span className="text-[13px] text-ink-600">Includes a free ebook</span>
          </label>
        </div>
      </Section>
    </div>
  );
}

export function FilterSidebar(props) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl border border-ink-100 bg-white p-4 pr-3 shadow-soft">
        <p className="mb-1 flex items-center gap-2 text-sm font-bold text-ink-900"><FiSliders size={15} /> Filters</p>
        <FilterBody {...props} />
      </div>
    </aside>
  );
}

export function FilterDrawer({ open, onClose, resultCount, ...props }) {
  return (
    <Drawer open={open} onClose={onClose} title="Filters" side="left"
      footer={
        <div className="flex gap-2.5">
          <button type="button" onClick={props.clearAll} className="btn-outline flex-1">Clear all</button>
          <button type="button" onClick={onClose} className="btn-primary flex-1">Show {resultCount ?? ''} results</button>
        </div>
      }>
      <div className="p-4"><FilterBody {...props} /></div>
    </Drawer>
  );
}

export function ActiveFilterChips({ params, remove, clearAll }) {
  const entries = [];
  const push = (key, value, label) => entries.push({ key, value, label });

  ['subcategory', 'type', 'author', 'language'].forEach((key) => {
    (params[key] || '').split(',').filter(Boolean).forEach((v) => push(key, v, TYPE_LABEL[v] || v));
  });
  if (params.minPrice) push('minPrice', params.minPrice, `Min ${money(params.minPrice)}`);
  if (params.maxPrice) push('maxPrice', params.maxPrice, `Max ${money(params.maxPrice)}`);
  if (params.minDiscount) push('minDiscount', params.minDiscount, `${params.minDiscount}%+ off`);
  if (params.availability) push('availability', params.availability, params.availability === 'in-stock' ? 'In stock' : 'Out of stock');
  if (params.hasFreeEbook === 'true') push('hasFreeEbook', 'true', 'Free ebook');
  if (params.search) push('search', params.search, `“${params.search}”`);

  if (!entries.length) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {entries.map((e) => (
        <button key={`${e.key}-${e.value}`} type="button" onClick={() => remove(e.key, e.value)}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-2xs font-semibold text-white transition-colors hover:bg-ink-700">
          {e.label}<FiX size={11} />
        </button>
      ))}
      <button type="button" onClick={clearAll} className="text-2xs font-bold uppercase tracking-wide text-ink-400 hover:text-rose-500">Clear all</button>
    </div>
  );
}

export default FilterSidebar;
