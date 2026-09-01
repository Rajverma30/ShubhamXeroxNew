/**
 * Shared building blocks for every admin screen.
 *
 * Replaces: subham-admin/src/components/Ui.jsx
 *
 * NOTE ON THE FORM PRIMITIVES (Input / Textarea / Select / CheckboxRow):
 * they MUST be forwardRef components. React Hook Form's `register()` returns
 * `{ name, onChange, onBlur, ref }`, and React silently discards `ref` when it
 * is spread onto a plain function component. Without the ref, RHF never binds
 * to the real DOM node — so values don't register ("Name is required" after
 * typing), `watch()` never fires (category → sub-category stays disabled), and
 * `reset()` can't populate fields when editing an existing record.
 */
import { forwardRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiInbox, FiSearch, FiX } from 'react-icons/fi';

/* ── Logo ────────────────────────────────────────── */

export function Logo({ className = 'h-9 w-9', dark = false, showText = true }) {
  const [src, setSrc] = useState(import.meta.env.VITE_LOGO || '/logo.png');
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img
        src={src}
        onError={() => setSrc('/logo.svg')}
        alt="Subham Xerox"
        className={`${className} rounded-lg object-contain`}
      />
      {showText && (
        <span className="leading-none">
          <span className={`block font-display text-base font-bold ${dark ? 'text-white' : 'text-ink-900'}`}>
            Subham Xerox
          </span>
          <span className={`block text-2xs font-medium uppercase tracking-wider ${dark ? 'text-white/45' : 'text-ink-400'}`}>
            Admin panel
          </span>
        </span>
      )}
    </Link>
  );
}

/* ── Page shell ──────────────────────────────────── */

export function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {breadcrumb && <p className="mb-1 text-2xs font-semibold uppercase tracking-wide text-ink-400">{breadcrumb}</p>}
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionCard({ title, description, children, actions, className = '' }) {
  return (
    <section className={`card p-5 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-bold uppercase tracking-wide text-ink-500">{title}</h2>}
            {description && <p className="mt-1 text-xs text-ink-400">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

/* ── Feedback ────────────────────────────────────── */

export function Spinner({ size = 16, className = '' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function LoadingBlock({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-16 text-sm text-ink-400 ${className}`}>
      <Spinner size={20} /> {label}
    </div>
  );
}

export function ErrorBlock({ error, onRetry }) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-center">
      <p className="text-sm font-semibold text-rose-800">{error?.message || 'Something went wrong'}</p>
      {error?.details?.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs text-rose-700">
          {error.details.map((d, i) => <li key={i}>{d.field}: {d.message}</li>)}
        </ul>
      )}
      {onRetry && <button type="button" onClick={onRetry} className="btn-outline btn-sm mt-4">Try again</button>}
    </div>
  );
}

export function EmptyState({ icon: Icon = FiInbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-14 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-ink-50 text-ink-400"><Icon size={20} /></span>
      <p className="text-base font-bold text-ink-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}><div className="skeleton h-4 w-full" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Badges & toggles ────────────────────────────── */

export function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-ink-100 text-ink-700',
    brand: 'bg-brand-100 text-brand-800',
    green: 'bg-emerald-100 text-emerald-800',
    amber: 'bg-amber-100 text-amber-800',
    rose: 'bg-rose-100 text-rose-800',
    sky: 'bg-sky-100 text-sky-800',
    dark: 'bg-ink-900 text-white',
  };
  return <span className={`badge ${tones[tone] || className || tones.neutral}`}>{children}</span>;
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`toggle ${checked ? 'toggle-on' : ''} ${disabled ? 'opacity-50' : ''}`}
    >
      <span className={`toggle-knob ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

/* ── Search + pagination ─────────────────────────── */

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <FiSearch size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="field pl-10 pr-9"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
        >
          <FiX size={14} />
        </button>
      )}
    </div>
  );
}

export function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-ink-500">
        Showing <span className="font-semibold text-ink-800">{from}–{to}</span> of {total}
      </p>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} className="btn-outline btn-sm gap-1">
          <FiChevronLeft size={13} /> Prev
        </button>
        <span className="px-2 text-xs font-semibold text-ink-600">{page} / {pages}</span>
        <button type="button" onClick={() => onChange(page + 1)} disabled={page >= pages} className="btn-outline btn-sm gap-1">
          Next <FiChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

/* ── Modal + confirm ─────────────────────────────── */

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-ink-950/50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className={`flex max-h-[90vh] w-full ${widths[size]} flex-col overflow-hidden rounded-2xl bg-white shadow-lift`}
            >
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-ink-100 px-5 py-4">
                <h2 className="text-base font-bold text-ink-900">{title}</h2>
                <button type="button" onClick={onClose} aria-label="Close" className="btn-icon text-ink-400 hover:bg-ink-100">
                  <FiX size={17} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">{children}</div>
              {footer && <div className="shrink-0 border-t border-ink-100 bg-ink-50/60 px-5 py-4">{footer}</div>}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', busy = false, danger = true }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || 'Are you sure?'}
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={busy} className={danger ? 'btn-danger' : 'btn-primary'}>
            {busy ? <Spinner size={14} /> : confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-ink-600">{message || 'This action cannot be undone.'}</p>
    </Modal>
  );
}

/* ── Form primitives ─────────────────────────────────────────────────────
 *
 * All four MUST be forwardRef. React Hook Form's register() returns a `ref`,
 * and React silently drops `ref` when spread onto a plain function component —
 * which leaves every field unbound and every form broken.
 */

export function Field({ label, error, hint, required, className = '', children }) {
  return (
    <div className={className}>
      {label && <span className="label">{label}{required && ' *'}</span>}
      {children}
      {error ? <p className="error-text">{error.message || error}</p> : hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

export const Input = forwardRef(function Input({ error, className = '', ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={`field ${error ? 'field-error' : ''} ${className}`}
      aria-invalid={Boolean(error)}
      {...rest}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ error, className = '', rows = 4, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`field resize-y ${error ? 'field-error' : ''} ${className}`}
      aria-invalid={Boolean(error)}
      {...rest}
    />
  );
});

export const Select = forwardRef(function Select({ error, className = '', children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      className={`field ${error ? 'field-error' : ''} ${className}`}
      aria-invalid={Boolean(error)}
      {...rest}
    >
      {children}
    </select>
  );
});

export const CheckboxRow = forwardRef(function CheckboxRow({ label, description, className = '', ...rest }, ref) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border border-ink-100 p-3 transition-colors hover:bg-ink-50 ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-ink-900 focus:ring-2 focus:ring-brand-500/30"
        {...rest}
      />
      <span>
        <span className="block text-sm font-medium text-ink-900">{label}</span>
        {description && <span className="mt-0.5 block text-2xs text-ink-400">{description}</span>}
      </span>
    </label>
  );
});
