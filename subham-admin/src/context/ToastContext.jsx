/** Toast notifications for the panel. */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiAlertCircle, FiCheck, FiInfo, FiLoader, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);
let seq = 0;

const VARIANTS = {
  success: { icon: FiCheck, chip: 'bg-emerald-500' },
  error: { icon: FiAlertCircle, chip: 'bg-rose-500' },
  info: { icon: FiInfo, chip: 'bg-brand-500' },
  loading: { icon: FiLoader, chip: 'bg-ink-500' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (message, variant = 'success', duration = 3600) => {
      // eslint-disable-next-line no-plusplus
      const id = ++seq;
      setToasts((t) => [...t, { id, message, variant }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-2" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const v = VARIANTS[t.variant] || VARIANTS.info;
            const Icon = v.icon;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 24, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 16, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl bg-ink-950/95 px-4 py-3 text-white shadow-lift backdrop-blur"
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${v.chip}`}>
                  <Icon size={13} className={t.variant === 'loading' ? 'animate-spin' : ''} />
                </span>
                <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
                <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-white/50 hover:text-white">
                  <FiX size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx.toast;
}
