/** Toast stack — clears the mobile nav and the home indicator. */
import { AnimatePresence, motion } from 'framer-motion';
import { FiAlertCircle, FiCheck, FiInfo, FiLoader, FiX } from 'react-icons/fi';
import { useStore } from '../../context/StoreContext';

const VARIANTS = {
  success: { icon: FiCheck, ring: 'ring-emerald-500/20', chip: 'bg-emerald-500' },
  error: { icon: FiAlertCircle, ring: 'ring-rose-500/20', chip: 'bg-rose-500' },
  info: { icon: FiInfo, ring: 'ring-brand-500/20', chip: 'bg-brand-500' },
  loading: { icon: FiLoader, ring: 'ring-ink-500/20', chip: 'bg-ink-500' },
};

export default function ToastStack() {
  const { toasts, dismissToast } = useStore();
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--mobile-nav-h)+1rem)] z-[100] flex flex-col items-center gap-2 px-4 sm:right-6 sm:left-auto sm:items-end sm:px-0 lg:bottom-6"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      role="region" aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const v = VARIANTS[t.variant] || VARIANTS.info;
          const Icon = v.icon;
          return (
            <motion.div key={t.id} layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-ink-950/95 px-4 py-3 text-white shadow-lift ring-1 ${v.ring} backdrop-blur-xl`}>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${v.chip}`}>
                <Icon size={15} className={t.variant === 'loading' ? 'animate-spin' : ''} />
              </span>
              <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
              <button type="button" onClick={() => dismissToast(t.id)} aria-label="Dismiss"
                className="btn-icon h-7 w-7 text-white/60 hover:bg-white/10 hover:text-white">
                <FiX size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
