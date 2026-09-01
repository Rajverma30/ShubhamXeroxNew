/** Modal and Drawer with focus + scroll management. */
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useBodyLock, useKeyPress } from '../../hooks';

function Backdrop({ onClick }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }} onClick={onClick}
      className="fixed inset-0 z-[80] bg-ink-950/45 backdrop-blur-[3px]" />
  );
}

export function Modal({ open, onClose, title, children, size = 'md', hideClose = false }) {
  useBodyLock(open);
  useKeyPress('Escape', onClose, open);
  const panelRef = useRef(null);
  useEffect(() => { if (open) panelRef.current?.focus(); }, [open]);
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <Backdrop onClick={onClose} />
          <div className="fixed inset-0 z-[85] flex items-end justify-center p-0 sm:items-center sm:p-6">
            <motion.div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
              initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }} transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className={`relative flex max-h-[92vh] w-full ${widths[size]} flex-col overflow-hidden rounded-t-4xl bg-white shadow-lift outline-none sm:rounded-4xl`}>
              {(title || !hideClose) && (
                <div className="flex items-center justify-between gap-4 border-b border-ink-100 px-5 py-4">
                  <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>
                  {!hideClose && (
                    <button type="button" onClick={onClose} aria-label="Close" className="btn-icon text-ink-400 hover:bg-ink-100 hover:text-ink-900">
                      <FiX size={18} />
                    </button>
                  )}
                </div>
              )}
              <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Drawer({ open, onClose, title, children, footer, side = 'right', width = 'max-w-md' }) {
  useBodyLock(open);
  useKeyPress('Escape', onClose, open);
  const x = side === 'right' ? '100%' : '-100%';

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <Backdrop onClick={onClose} />
          <motion.aside role="dialog" aria-modal="true" aria-label={title}
            initial={{ x }} animate={{ x: 0 }} exit={{ x }}
            transition={{ type: 'spring', stiffness: 340, damping: 36 }}
            className={`fixed inset-y-0 z-[85] flex w-full ${width} flex-col bg-white shadow-lift ${side === 'right' ? 'right-0' : 'left-0'}`}>
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-ink-100 px-5 py-4">
              <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="btn-icon text-ink-400 hover:bg-ink-100 hover:text-ink-900">
                <FiX size={18} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
            {footer && (
              <footer className="shrink-0 border-t border-ink-100 bg-ink-50/60 px-5 pt-5"
                style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
                {footer}
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default Modal;
