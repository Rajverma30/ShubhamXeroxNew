/** Category directory. */
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import api from '../lib/api';
import { useFetch } from '../hooks';
import Seo from '../components/ui/Seo';
import { Breadcrumbs, SectionHeader } from '../components/ui/Common';
import { CategoryTileSkeleton } from '../components/ui/Skeleton';
import { imgUrl } from '../lib/format';

export default function Categories() {
  const { data: categories, loading } = useFetch(() => api.getCategories(), []);

  return (
    <>
      <Seo title="All categories" description="Browse every category at Subham Xerox." path="/categories" />

      <div className="container-x py-7">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Categories' }]} className="mb-5" />
        <SectionHeader eyebrow="Directory" title="Everything we stock, organised"
          subtitle="Pick a category to browse, or jump straight into a collection." />

        {loading ? <CategoryTileSkeleton count={6} /> : (
          <div className="space-y-10">
            {(categories || []).map((cat) => (
              <section key={cat._id}>
                <Link to={`/category/${cat.slug}`}
                  className="group relative mb-4 flex h-32 items-center overflow-hidden rounded-3xl px-6 shadow-soft transition-all duration-500 hover:shadow-lift sm:h-40 sm:px-8"
                  style={{ background: `linear-gradient(135deg, ${cat.color || '#312e81'}, #1e1b4b)` }}>
                  {cat.banner?.url && (
                    <img src={imgUrl(cat.banner, 'card')} alt="" loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-35 transition-transform duration-700 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-ink-950/80 to-transparent" />
                  <div className="relative text-white">
                    <h2 className="font-display text-xl font-bold sm:text-2xl">{cat.name}</h2>
                    {cat.shortDescription && <p className="mt-1 max-w-md text-xs text-white/70 sm:text-sm">{cat.shortDescription}</p>}
                    <span className="mt-2.5 inline-flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wide">
                      Browse {cat.productCount || ''} products
                      <FiArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>

                {cat.subCategories?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {cat.subCategories.map((sub) => (
                      <Link key={sub._id} to={`/collection/${sub.slug}`} className="chip">
                        {sub.name}{sub.productCount > 0 && <span className="text-ink-300">· {sub.productCount}</span>}
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
      <div className="mobile-nav-spacer" aria-hidden />
    </>
  );
}
