/** Wishlist — localStorage only, works with no account. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useStore } from '../context/StoreContext';
import api from '../lib/api';
import Seo from '../components/ui/Seo';
import { Breadcrumbs, EmptyState, PriceTag, SectionHeader, Spinner } from '../components/ui/Common';
import { placeholderImage } from '../lib/format';

export default function Wishlist() {
  const { wishlist, toggleWishlist, clearWishlist, addToCart, toast } = useStore();
  const [busyId, setBusyId] = useState(null);

  /** Fetch the live product first so stock and price stay authoritative. */
  const moveToCart = async (item) => {
    setBusyId(item.id);
    try {
      const res = await api.getProduct(item.slug);
      addToCart(res.product, 1, { open: false });
      toggleWishlist({ _id: item.id });
    } catch (err) { toast(err.message, 'error'); }
    finally { setBusyId(null); }
  };

  return (
    <>
      <Seo title="Your wishlist" path="/wishlist" noIndex />

      <div className="container-x py-7">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} className="mb-5" />

        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader title="Your wishlist"
            subtitle={wishlist.length ? `${wishlist.length} saved item${wishlist.length > 1 ? 's' : ''} — stored on this device` : undefined}
            className="mb-5" />
          {wishlist.length > 0 && (
            <button type="button" onClick={clearWishlist} className="mb-5 text-xs font-semibold text-ink-400 hover:text-rose-500">Clear wishlist</button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <EmptyState icon={FiHeart} title="Nothing saved yet"
            description="Tap the heart on any product to keep it here for later. No account needed — it's saved in this browser."
            action={<Link to="/shop" className="btn-primary">Find something to save</Link>} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <AnimatePresence>
              {wishlist.map((item) => (
                <motion.article key={item.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft">
                  <Link to={`/product/${item.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-ink-50">
                    <img src={item.image || placeholderImage(item.title)} alt="" loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 ease-premium group-hover:scale-105" />
                  </Link>
                  <div className="flex flex-1 flex-col gap-1.5 p-3.5">
                    <Link to={`/product/${item.slug}`} className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink-900 hover:text-brand-700">
                      {item.title}
                    </Link>
                    {item.author && <p className="truncate text-xs text-ink-400">{item.author}</p>}
                    <div className="mt-auto pt-2"><PriceTag price={item.price} mrp={item.mrp} discount={item.discountPercent} size="sm" /></div>
                    <div className="mt-2 flex gap-1.5">
                      <button type="button" onClick={() => moveToCart(item)} disabled={busyId === item.id}
                        className="btn flex-1 gap-1.5 border border-ink-200 py-2 text-2xs text-ink-900 hover:border-transparent hover:bg-ink-900 hover:text-white">
                        {busyId === item.id ? <Spinner size={12} /> : <><FiShoppingBag size={12} /> Add to cart</>}
                      </button>
                      <button type="button" onClick={() => toggleWishlist({ _id: item.id })} aria-label={`Remove ${item.title}`}
                        className="btn-icon h-8 w-8 border border-ink-200 text-ink-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500">
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <div className="mobile-nav-spacer" aria-hidden />
    </>
  );
}
