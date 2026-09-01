/** Product gallery: cursor-follow zoom on desktop, lightbox everywhere. */
import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from 'react-icons/fi';
import { imgUrl, placeholderImage } from '../../lib/format';
import { useKeyPress, useMediaQuery } from '../../hooks';

export default function Gallery({ images = [], title = '' }) {
  const list = images.length ? images : [{ url: placeholderImage(title) }];
  const [active, setActive] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [lightbox, setLightbox] = useState(false);
  const frameRef = useRef(null);
  const canHover = useMediaQuery('(hover: hover)');

  useKeyPress('Escape', () => setLightbox(false), lightbox);
  useKeyPress('ArrowRight', () => setActive((i) => (i + 1) % list.length), lightbox);
  useKeyPress('ArrowLeft', () => setActive((i) => (i - 1 + list.length) % list.length), lightbox);

  const onMove = (e) => {
    if (!canHover) return;
    const rect = frameRef.current.getBoundingClientRect();
    setOrigin({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  const src = imgUrl(list[active], 'full');

  return (
    <div className="lg:sticky lg:top-24">
      <div ref={frameRef}
        onMouseEnter={() => canHover && setZooming(true)} onMouseLeave={() => setZooming(false)} onMouseMove={onMove}
        className="group relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-3xl border border-ink-100 bg-gradient-to-br from-ink-50 to-ink-100"
        onClick={() => setLightbox(true)} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setLightbox(true)} aria-label="Open full-size image">
        <AnimatePresence initial={false} mode="wait">
          <motion.img key={src} src={src} alt={`${title} — image ${active + 1}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            onError={(e) => { e.currentTarget.src = placeholderImage(title); }}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out"
            style={{ transform: zooming ? 'scale(2)' : 'scale(1)', transformOrigin: `${origin.x}% ${origin.y}%` }} />
        </AnimatePresence>

        <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-ink-950/60 px-3 py-1.5 text-2xs font-semibold text-white opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
          <FiMaximize2 size={11} /> {canHover ? 'Hover to zoom · click to expand' : 'Tap to expand'}
        </span>

        {list.length > 1 && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink-950/55 px-2.5 py-1 text-2xs font-semibold text-white backdrop-blur-md">
            {active + 1} / {list.length}
          </span>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {list.map((img, i) => (
            <button key={img.url || i} type="button" onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} aria-current={i === active}
              className={`relative h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ease-premium ${
                i === active ? 'border-ink-900 shadow-soft' : 'border-transparent opacity-55 hover:-translate-y-0.5 hover:opacity-100'}`}>
              <img src={imgUrl(img, 'thumb')} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-ink-950/95 p-4" onClick={() => setLightbox(false)}>
            <button type="button" aria-label="Close" className="btn-icon absolute right-4 top-4 bg-white/10 text-white hover:bg-white/20">
              <FiX size={20} />
            </button>
            {list.length > 1 && (
              <>
                <button type="button" aria-label="Previous image"
                  onClick={(e) => { e.stopPropagation(); setActive((i) => (i - 1 + list.length) % list.length); }}
                  className="btn-icon absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 text-white hover:bg-white/20 sm:left-8">
                  <FiChevronLeft size={22} />
                </button>
                <button type="button" aria-label="Next image"
                  onClick={(e) => { e.stopPropagation(); setActive((i) => (i + 1) % list.length); }}
                  className="btn-icon absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 text-white hover:bg-white/20 sm:right-8">
                  <FiChevronRight size={22} />
                </button>
              </>
            )}
            <motion.img key={src} src={src} alt={title}
              initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
