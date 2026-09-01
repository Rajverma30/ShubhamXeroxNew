/** Quick view modal — fetches the full product on open. */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiDownload, FiHeart, FiShoppingBag, FiTruck } from 'react-icons/fi';
import api from '../../lib/api';
import { discountOf, galleryUrls, imgUrl, priceOf, stripHtml, truncate, TYPE_LABEL } from '../../lib/format';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../ui/Overlay';
import { PriceTag, QuantityStepper, Rating, Spinner, Tag } from '../ui/Common';
import LazyImage from '../ui/LazyImage';

export default function QuickView({ open, onClose, slug, fallback }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!open || !slug) return undefined;
    let alive = true;
    setLoading(true); setQty(1); setActive(0);
    api.getProduct(slug)
      .then((res) => alive && setData(res.product))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [open, slug]);

  const product = data || fallback;
  if (!product) return null;

  const frames = galleryUrls(product, 5, 'card');
  const price = priceOf(product);
  const discount = discountOf(product);
  const wished = isWishlisted(product._id);
  const outOfStock = product.type !== 'ebook' && (product.stock ?? 0) <= 0;

  return (
    <Modal open={open} onClose={onClose} title="Quick view" size="xl">
      <div className="grid gap-6 p-5 sm:grid-cols-[minmax(0,260px)_1fr] sm:gap-8 sm:p-6">
        <div>
          <LazyImage src={frames[active] || imgUrl(product.images?.[0], 'full')} alt={product.title}
            aspect="aspect-[3/4]" wrapperClassName="rounded-2xl border border-ink-100" eager />
          {frames.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {frames.map((f, i) => (
                <button key={f} type="button" onClick={() => setActive(i)} aria-label={`View image ${i + 1}`}
                  className={`h-16 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                    i === active ? 'border-ink-900' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={f} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="brand">{TYPE_LABEL[product.type] || 'Product'}</Tag>
            {product.hasFreeEbook && <Tag tone="green" className="gap-1"><FiDownload size={10} /> Free ebook included</Tag>}
            {loading && <Spinner size={13} className="text-ink-300" />}
          </div>

          <h3 className="mt-2.5 text-balance font-display text-xl font-bold leading-snug text-ink-900 sm:text-2xl">{product.title}</h3>

          {product.author && (
            <p className="mt-1 text-sm text-ink-500">
              by <span className="font-medium text-ink-700">{product.author}</span>
              {product.publisher ? ` · ${product.publisher}` : ''}
            </p>
          )}

          {product.rating?.count > 0 && <Rating value={product.rating.average} count={product.rating.count} className="mt-2" />}

          <div className="mt-4"><PriceTag price={price} mrp={product.price} discount={discount} size="lg" /></div>

          {(product.shortDescription || product.description) && (
            <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-500">
              {truncate(product.shortDescription || stripHtml(product.description), 240)}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, Math.min(20, product.stock || 20))} />
            <button type="button" disabled={outOfStock} onClick={() => { addToCart(product, qty); onClose(); }}
              className="btn-primary flex-1 gap-2 disabled:opacity-40">
              <FiShoppingBag size={16} />{outOfStock ? 'Out of stock' : 'Add to cart'}
            </button>
            <button type="button" onClick={() => toggleWishlist(product)} aria-label="Save to wishlist"
              className={`btn-icon h-12 w-12 border ${wished ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-ink-200 text-ink-400 hover:text-rose-500'}`}>
              <FiHeart size={17} className={wished ? 'fill-current' : ''} />
            </button>
          </div>

          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-500">
            <FiTruck size={13} /> Free delivery on orders above ₹499
          </p>

          <Link to={`/product/${product.slug}`} onClick={onClose}
            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
            View full details
            <FiArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </Modal>
  );
}
