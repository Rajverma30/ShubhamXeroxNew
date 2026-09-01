/** Small shared primitives used across every page. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiChevronRight, FiMinus, FiPlus, FiStar } from 'react-icons/fi';
import { money } from '../../lib/format';

/** Tries /logo.png, falling back to the bundled SVG so it never breaks. */
export function Logo({ className = 'h-9 w-9', showText = true, dark = false }) {
  const [src, setSrc] = useState(import.meta.env.VITE_LOGO || '/logo.png');
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Subham Xerox — home">
      <img
        src={src}
        onError={() => setSrc('/logo.svg')}
        alt="Subham Xerox"
        className={`${className} rounded-xl object-contain transition-transform duration-500 ease-snap group-hover:scale-105`}
      />
      {showText && (
        <span className="leading-none">
          <span className={`block font-display text-lg font-bold tracking-tight ${dark ? 'text-white' : 'text-ink-900'}`}>
            Subham Xerox
          </span>
          <span className={`block text-2xs font-medium uppercase tracking-[0.16em] ${dark ? 'text-white/50' : 'text-ink-400'}`}>
            Books &amp; Stationery
          </span>
        </span>
      )}
    </Link>
  );
}

export function Rating({ value = 0, count, size = 13, showCount = true, className = '' }) {
  const rounded = Math.round(Number(value) * 2) / 2;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} aria-label={`Rated ${value} out of 5`}>
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <FiStar key={i} size={size} className={i <= rounded ? 'fill-gold-400 text-gold-400' : 'text-ink-200'} strokeWidth={2} />
        ))}
      </span>
      {showCount && (
        <span className="text-xs font-medium text-ink-400">
          {Number(value).toFixed(1)}{count ? ` (${count})` : ''}
        </span>
      )}
    </span>
  );
}

export function PriceTag({ price, mrp, discount, size = 'md', className = '' }) {
  const sizes = {
    sm: { price: 'text-sm', mrp: 'text-2xs', off: 'text-2xs' },
    md: { price: 'text-lg', mrp: 'text-xs', off: 'text-2xs' },
    lg: { price: 'text-3xl', mrp: 'text-sm', off: 'text-xs' },
  }[size];
  const showMrp = mrp && mrp > price;
  return (
    <span className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`}>
      <span className={`font-bold tracking-tight text-ink-900 ${sizes.price}`}>{money(price)}</span>
      {showMrp && <span className={`text-ink-400 line-through ${sizes.mrp}`}>{money(mrp)}</span>}
      {showMrp && discount > 0 && <span className={`font-bold text-emerald-600 ${sizes.off}`}>{discount}% off</span>}
    </span>
  );
}

export function DiscountBadge({ value }) {
  if (!value) return null;
  return <span className="badge bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm">{value}% off</span>;
}

export function Tag({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-ink-100 text-ink-600',
    brand: 'bg-brand-50 text-brand-700',
    gold: 'bg-gold-100 text-gold-700',
    green: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
    dark: 'bg-ink-900 text-white',
    glass: 'glass text-ink-700',
  };
  return <span className={`badge ${tones[tone]} ${className}`}>{children}</span>;
}

export function SectionHeader({ eyebrow, title, subtitle, viewAllUrl, viewAllLabel = 'View all', className = '' }) {
  return (
    <div className={`mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8 ${className}`}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h2 className="text-balance text-2xl font-bold text-ink-900 sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1.5 text-pretty text-sm text-ink-500">{subtitle}</p>}
      </div>
      {viewAllUrl && (
        <Link to={viewAllUrl} className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-ink-700 transition-colors hover:text-brand-600">
          {viewAllLabel}
          <FiArrowRight className="transition-transform duration-300 ease-premium group-hover:translate-x-1" size={15} />
        </Link>
      )}
    </div>
  );
}

export function QuantityStepper({ value, onChange, min = 1, max = 20, size = 'md', className = '' }) {
  const dims = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  return (
    <div className={`inline-flex items-center rounded-full border border-ink-200 bg-white ${className}`}>
      <button type="button" aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(value - 1)}
        className={`${dims} btn-icon text-ink-500 hover:bg-ink-50 hover:text-ink-900 disabled:opacity-30`}>
        <FiMinus size={14} />
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums text-ink-900">{value}</span>
      <button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)}
        className={`${dims} btn-icon text-ink-500 hover:bg-ink-50 hover:text-ink-900 disabled:opacity-30`}>
        <FiPlus size={14} />
      </button>
    </div>
  );
}

export function Breadcrumbs({ items = [], className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-1 text-xs text-ink-400 ${className}`}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="inline-flex items-center gap-1">
            {i > 0 && <FiChevronRight size={12} className="text-ink-300" />}
            {last || !item.to
              ? <span className="font-medium text-ink-600">{item.label}</span>
              : <Link to={item.to} className="transition-colors hover:text-brand-600">{item.label}</Link>}
          </span>
        );
      })}
    </nav>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-16 text-center ${className}`}>
      {Icon && (
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-ink-400 shadow-soft">
          <Icon size={22} />
        </span>
      )}
      <h3 className="text-lg font-bold text-ink-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

export function Spinner({ size = 18, className = '' }) {
  return (
    <span className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }} role="status" aria-label="Loading" />
  );
}

export function Pagination({ page, pages, onChange, className = '' }) {
  if (!pages || pages <= 1) return null;
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(pages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const nums = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav className={`flex flex-wrap items-center justify-center gap-1.5 ${className}`} aria-label="Pagination">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} className="btn-outline btn-sm">Previous</button>
      {start > 1 && (<><PageBtn n={1} active={page === 1} onClick={onChange} />{start > 2 && <span className="px-1 text-ink-300">…</span>}</>)}
      {nums.map((n) => <PageBtn key={n} n={n} active={n === page} onClick={onChange} />)}
      {end < pages && (<>{end < pages - 1 && <span className="px-1 text-ink-300">…</span>}<PageBtn n={pages} active={page === pages} onClick={onChange} /></>)}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= pages} className="btn-outline btn-sm">Next</button>
    </nav>
  );
}

function PageBtn({ n, active, onClick }) {
  return (
    <button type="button" onClick={() => onClick(n)} aria-current={active ? 'page' : undefined}
      className={`h-9 min-w-9 rounded-full px-3 text-sm font-semibold transition-all duration-200 ${
        active ? 'bg-ink-900 text-white shadow-soft' : 'text-ink-600 hover:bg-ink-100'}`}>
      {n}
    </button>
  );
}

export function TrustStrip({ items, className = '' }) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {items.map(({ icon: Icon, title, description }) => (
        <div key={title} className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Icon size={17} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900">{title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
