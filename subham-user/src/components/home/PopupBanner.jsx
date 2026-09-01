/** Scheduled popup banner, shown once per browser. */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import api from '../../lib/api';
import { KEYS, read, write } from '../../lib/storage';
import { imgUrl } from '../../lib/format';

export default function PopupBanner() {
  const [banner, setBanner] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (read(KEYS.popupSeen, false)) return undefined;
    let alive = true;
    const timer = setTimeout(() => {
      api.getBanners({ placement: 'popup', limit: 1 })
        .then((list) => {
          if (!alive || !list?.length) return;
          setBanner(list[0]); setOpen(true);
        })
        .catch(() => {});
    }, 4200);
    return () => { alive = false; clearTimeout(timer); };
  }, []);

  const dismiss = () => { setOpen(false); write(KEYS.popupSeen, true); };

  return (
    <AnimatePresence>
      {open && banner && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={dismiss}
            className="fixed inset-0 z-[86] bg-ink-950/50 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-[87] w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-4xl bg-white shadow-lift">
            <button type="button" onClick={dismiss} aria-label="Close" className="btn-icon absolute right-3 top-3 z-10 bg-white/85 text-ink-500 backdrop-blur hover:bg-white">
              <FiX size={16} />
            </button>
            {banner.image?.url && <img src={imgUrl(banner.image, 'card')} alt={banner.title || ''} className="h-44 w-full object-cover" />}
            <div className="p-6 text-center">
              {banner.eyebrow && <p className="eyebrow mb-1.5">{banner.eyebrow}</p>}
              <h2 className="text-balance font-display text-xl font-bold text-ink-900">{banner.title}</h2>
              {banner.subtitle && <p className="mt-2 text-pretty text-sm text-ink-500">{banner.subtitle}</p>}
              {banner.buttonText && (
                <Link to={banner.buttonUrl || '/shop'} onClick={() => { api.trackBannerClick(banner._id); dismiss(); }} className="btn-brand mt-5 w-full">
                  {banner.buttonText}
                </Link>
              )}
              <button type="button" onClick={dismiss} className="mt-2 text-2xs text-ink-400 hover:text-ink-600">No thanks</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
