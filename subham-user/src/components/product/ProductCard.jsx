/**
 * The storefront's primary product card.
 *
 * Signature interaction: hovering the image steps through the first 5 gallery
 * images every 700ms and snaps back to image 1 on mouse-out — see
 * `useHoverImageRotation`. Images cross-fade rather than swap so it reads as
 * premium rather than flickery.
 */
import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiDownload, FiEye, FiHeart, FiShoppingBag } from 'react-icons/fi';
import { useStore } from '../../context/StoreContext';
import { useHoverImageRotation } from '../../hooks';
import { discountOf, galleryUrls, placeholderImage, priceOf, truncate } from '../../lib/format';
import { DiscountBadge, PriceTag, Rating, Tag } from '../ui/Common';
import QuickView from './QuickView';

function ProductCardBase({ product, eager = false, compact = false, className = '' }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [quickView, setQuickView] = useState(false);
  const [imgReady, setImgReady] = useState(false);

  const frames = galleryUrls(product, 5, 'card');
  const { index, hovering, onMouseEnter, onMouseLeave } = useHoverImageRotation(frames, { interval: 700, max: 5 });

  const price = priceOf(product);
  const discount = discountOf(product);
  const wished = isWishlisted(product._id);
  const isEbookOnly = product.type === 'ebook';
  const outOfStock = !isEbookOnly && !product.allowBackorder && (product.stock ?? 0) <= 0;
  const lowStock = !outOfStock && !isEbookOnly && product.stock > 0 && product.stock <= 5;
  const current = frames[index] || frames[0] || placeholderImage(product.title);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft transition-all duration-500 ease-premium hover:-translate-y-1.5 hover:border-ink-200 hover:shadow-lift ${className}`}
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-ink-50 to-ink-100"
          onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
          <Link to={`/product/${product.slug}`} aria-label={product.title} className="block">
            <div className="relative aspect-[3/4] w-full">
              {!imgReady && <div className="skeleton absolute inset-0" aria-hidden />}
              <AnimatePresence initial={false} mode="popLayout">
                <motion.img key={current} src={current}
                  alt={`${product.title}${index > 0 ? ` — view ${index + 1}` : ''}`}
                  loading={eager ? 'eager' : 'lazy'} decoding="async"
                  onLoad={() => setImgReady(true)}
                  onError={(e) => { e.currentTarget.src = placeholderImage(product.title); setImgReady(true); }}
                  initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: hovering ? 1.045 : 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 h-full w-full object-cover" />
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          </Link>

          {/* progress dots tell the user there's more than one image */}
          {frames.length > 1 && (
            <div className={`pointer-events-none absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1 transition-opacity duration-300 ${hovering ? 'opacity-100' : 'opacity-0'}`}>
              {frames.map((f, i) => (
                <span key={f} className={`h-1 rounded-full bg-white transition-all duration-300 ${i === index ? 'w-4 opacity-100' : 'w-1 opacity-50'}`} />
              ))}
            </div>
          )}

          <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
            <DiscountBadge value={discount} />
            {product.hasFreeEbook && <Tag tone="glass" className="gap-1"><FiDownload size={10} /> Free ebook</Tag>}
            {product.isBestSeller && <Tag tone="dark">Best seller</Tag>}
            {product.isNewArrival && !product.isBestSeller && <Tag tone="brand">New</Tag>}
          </div>

          <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5">
            <button type="button" onClick={() => toggleWishlist(product)}
              aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'} aria-pressed={wished}
              className={`btn-icon h-9 w-9 shadow-soft backdrop-blur-md transition-all duration-300 ${
                wished ? 'bg-rose-500 text-white' : 'bg-white/85 text-ink-500 hover:bg-white hover:text-rose-500'
              } sm:translate-x-2 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100`}>
              <FiHeart size={15} className={wished ? 'fill-current' : ''} />
            </button>
            <button type="button" onClick={() => setQuickView(true)} aria-label="Quick view"
              className="btn-icon h-9 w-9 bg-white/85 text-ink-500 shadow-soft backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-brand-600 sm:translate-x-2 sm:opacity-0 sm:delay-[60ms] sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
              <FiEye size={15} />
            </button>
          </div>

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
              <span className="badge bg-ink-900 px-3 py-1.5 text-white">Out of stock</span>
            </div>
          )}
        </div>

        <div className={`flex flex-1 flex-col gap-1.5 ${compact ? 'p-3' : 'p-4'}`}>
          {(product.subCategoryName || product.categoryName) && (
            <p className="truncate text-2xs font-semibold uppercase tracking-wide text-brand-600">
              {product.subCategoryName || product.categoryName}
            </p>
          )}
          <h3 className="text-[13.5px] font-semibold leading-snug text-ink-900 sm:text-sm">
            <Link to={`/product/${product.slug}`} className="transition-colors hover:text-brand-700">
              {truncate(product.title, compact ? 48 : 62)}
            </Link>
          </h3>
          {product.author && <p className="truncate text-xs text-ink-400">{product.author}</p>}
          {product.rating?.count > 0 && <Rating value={product.rating.average} count={product.rating.count} size={11} className="mt-0.5" />}

          <div className="mt-auto pt-2">
            <PriceTag price={price} mrp={product.price} discount={discount} size={compact ? 'sm' : 'md'} />
            {lowStock && <p className="mt-1 text-2xs font-semibold text-amber-600">Only {product.stock} left</p>}
          </div>

          <button type="button" disabled={outOfStock} onClick={() => addToCart(product, 1, { open: false })}
            className="btn mt-2.5 w-full gap-2 border border-ink-200 bg-white py-2.5 text-xs text-ink-900 transition-all duration-300 hover:border-transparent hover:bg-ink-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:text-[13px]">
            <FiShoppingBag size={14} />
            {outOfStock ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </motion.article>

      <QuickView open={quickView} onClose={() => setQuickView(false)} slug={product.slug} fallback={product} />
    </>
  );
}

export default memo(ProductCardBase);
