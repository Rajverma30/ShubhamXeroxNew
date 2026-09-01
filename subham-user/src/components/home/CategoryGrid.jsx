/** Category and sub-category tiles. */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import { imgUrl } from '../../lib/format';

export function CategoryGrid({ categories = [] }) {
  if (!categories.length) return null;
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {categories.map((cat, i) => (
        <motion.div key={cat._id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}>
          <Link to={`/category/${cat.slug}`}
            className="group relative flex h-40 flex-col justify-end overflow-hidden rounded-3xl p-4 shadow-soft transition-all duration-500 ease-premium hover:-translate-y-1.5 hover:shadow-lift sm:h-48"
            style={{ background: `linear-gradient(140deg, ${cat.color || '#312e81'} 0%, #1e1b4b 100%)` }}>
            {cat.image?.url && (
              <img src={imgUrl(cat.image, 'card')} alt="" loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-35 transition-all duration-700 ease-premium group-hover:scale-110 group-hover:opacity-45" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/25 to-transparent" />
            <span className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-md transition-all duration-500 ease-snap group-hover:rotate-45 group-hover:opacity-100">
              <FiArrowUpRight size={15} />
            </span>
            <div className="relative text-white">
              <p className="font-display text-base font-bold leading-tight sm:text-lg">{cat.name}</p>
              {cat.productCount > 0 && <p className="mt-0.5 text-2xs text-white/60">{cat.productCount} products</p>}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

export function SubCategoryPills({ subCategories = [] }) {
  if (!subCategories.length) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {subCategories.map((sub, i) => (
        <motion.div key={sub._id} initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3) }}>
          <Link to={`/collection/${sub.slug}`}
            className="group flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-2.5 transition-all duration-500 ease-premium hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft">
            <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-ink-100">
              {sub.image?.url
                ? <img src={imgUrl(sub.image, 'thumb')} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                : <span className="flex h-full w-full items-center justify-center font-display text-base font-bold text-ink-400">{sub.name.slice(0, 2)}</span>}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink-900 transition-colors group-hover:text-brand-700">{sub.name}</span>
              {sub.productCount > 0 && <span className="block text-2xs text-ink-400">{sub.productCount} items</span>}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

export default CategoryGrid;
