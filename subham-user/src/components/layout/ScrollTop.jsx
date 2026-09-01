/** Back-to-top button, positioned to clear the mobile bottom nav. */
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowUp } from 'react-icons/fi';
import { useScrolled } from '../../hooks';

export default function ScrollTop() {
  const visible = useScrolled(700);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button type="button"
          initial={{ opacity: 0, scale: 0.8, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 12 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"
          className="fixed bottom-[calc(var(--mobile-nav-h)+1rem)] left-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-ink-900/90 text-white shadow-lift backdrop-blur transition-colors hover:bg-ink-950 lg:bottom-7 lg:left-7">
          <FiArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
