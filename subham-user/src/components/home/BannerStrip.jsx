/** Promotional banner tiles between product rails. */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import api from '../../lib/api';
import { imgUrl } from '../../lib/format';

export default function BannerStrip({ banners = [] }) {
  if (!banners.length) return null;
  return (
    <div className={`grid gap-4 ${banners.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {banners.map((banner, i) => (
        <motion.div key={banner._id || i} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}>
          <Link to={banner.buttonUrl || '/shop'} onClick={() => api.trackBannerClick(banner._id)}
            className="group relative flex h-48 flex-col justify-center overflow-hidden rounded-3xl px-6 shadow-soft transition-all duration-500 ease-premium hover:-translate-y-1 hover:shadow-lift sm:h-56 sm:px-8">
            {banner.image?.url && (
              <img src={imgUrl(banner.image, 'card')} alt="" loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-premium group-hover:scale-105" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/45 to-transparent" />
            <div className="relative max-w-[70%] text-white">
              {banner.eyebrow && <p className="mb-1.5 text-2xs font-bold uppercase tracking-wider text-white/60">{banner.eyebrow}</p>}
              <p className="text-balance font-display text-lg font-bold leading-tight sm:text-xl">{banner.title}</p>
              {banner.subtitle && <p className="mt-1.5 line-clamp-2 text-xs text-white/70">{banner.subtitle}</p>}
              {banner.buttonText && (
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                  {banner.buttonText}
                  <FiArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
