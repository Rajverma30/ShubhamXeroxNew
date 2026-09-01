/**
 * Product detail: gallery with zoom, specifications, free-ebook download,
 * sample reader, delivery estimate, related rails and guest reviews.
 * A sticky action bar keeps Add to cart / Buy now reachable on phones.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBookOpen, FiCheck, FiDownload, FiHeart, FiMapPin, FiPackage, FiRefreshCw,
  FiShare2, FiShoppingBag, FiStar, FiTruck, FiZap,
} from 'react-icons/fi';
import api from '../lib/api';
import { useFetch, useRecentlyViewed } from '../hooks';
import { useStore } from '../context/StoreContext';
import CheckoutFlow from '../components/checkout/CheckoutFlow';
import Seo from '../components/ui/Seo';
import Gallery from '../components/product/Gallery';
import BookPreview from '../components/product/BookPreview';
import ProductRail from '../components/product/ProductRail';
import { Breadcrumbs, EmptyState, PriceTag, QuantityStepper, Rating, Spinner, Tag } from '../components/ui/Common';
import { DetailSkeleton } from '../components/ui/Skeleton';
import { dateLong, discountOf, priceOf, resolveAssetUrl, stripHtml, TYPE_LABEL } from '../lib/format';

/** `language` is an array now — an un-joined array renders as "Hindi,English". */
const formatLanguage = (v) => {
  const list = (Array.isArray(v) ? v : [v]).filter((x) => x && x !== 'NA');
  return list.length ? list.join(', ') : null;
};

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart, toggleWishlist, isWishlisted, toast, cart, settings } = useStore();
  const { record } = useRecentlyViewed();

  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState(null);

  const { data, loading, error, refetch } = useFetch(() => api.getProduct(slug), [slug]);
  const product = data?.product;

  useEffect(() => { setQty(1); setTab('description'); }, [slug]);
  useEffect(() => { if (product) record(product); }, [product, record]);

  const price = product ? priceOf(product) : 0;
  const discount = product ? discountOf(product) : 0;
  const wished = product ? isWishlisted(product._id) : false;
  const outOfStock = product && product.type !== 'ebook' && !product.allowBackorder && (product.stock ?? 0) <= 0;

  /**
   * Buy now: add this product to the cart, then open the checkout overlay.
   *
   * The line is passed explicitly as well — addToCart() is async state and has
   * not flushed by the time this runs, so relying on `cart` alone would drop
   * the item the customer just clicked.
   */
  const buyNow = () => {
    const line = {
      id: String(product._id), slug: product.slug, sku: product.sku, title: product.title,
      image: resolveAssetUrl(product.images?.[0]?.thumbUrl || product.images?.[0]?.url || ''),
      price: priceOf(product), quantity: qty,
    };
    addToCart(product, qty, { open: false, silent: true });
    setCheckoutItems([...cart.filter((l) => l.id !== line.id), line]);
    setCheckoutOpen(true);
  };

  const specs = useMemo(() => {
    if (!product) return [];
    const rows = [
      ['Author', product.author], ['Publisher', product.publisher], ['ISBN', product.isbn],
      ['Edition', product.edition], ['Language', formatLanguage(product.language)],
      ['Pages', product.pages], ['Binding', product.binding], ['Publish year', product.publishYear],
      ['Brand', product.brand], ['Colour', product.color], ['Material', product.material],
      ['Weight', product.weight ? `${product.weight} kg` : null],
      ['Category', product.categoryName], ['Sub category', product.subCategoryName], ['SKU', product.sku],
    ].filter(([, v]) => v !== null && v !== undefined && v !== '');
    return [...rows.map(([label, value]) => ({ label, value: String(value) })), ...(product.specifications || [])];
  }, [product]);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.title, url });
      else { await navigator.clipboard.writeText(url); toast('Link copied to clipboard'); }
    } catch { /* user cancelled */ }
  };

  if (loading) return <DetailSkeleton />;

  if (error || !product) {
    return (
      <div className="container-x py-24">
        <EmptyState icon={FiPackage} title="We couldn't find that product"
          description={error?.message || 'It may have been removed or the link is out of date.'}
          action={
            <div className="flex gap-3">
              <button type="button" onClick={refetch} className="btn-outline gap-2"><FiRefreshCw size={15} /> Retry</button>
              <Link to="/shop" className="btn-primary">Browse the catalogue</Link>
            </div>
          } />
      </div>
    );
  }

  const crumbs = [
    { label: 'Home', to: '/' },
    { label: product.categoryName || 'Shop', to: `/category/${product.categorySlug}` },
    ...(product.subCategoryName ? [{ label: product.subCategoryName, to: `/collection/${product.subCategorySlug}` }] : []),
    { label: product.title },
  ];

  return (
    <>
      <Seo title={product.seo?.metaTitle || product.title}
        description={product.seo?.metaDescription || product.shortDescription || stripHtml(product.description).slice(0, 200)}
        path={`/product/${product.slug}`} image={resolveAssetUrl(product.images?.[0]?.url)} type="product"
        keywords={product.seo?.metaKeywords}
        schema={{
          '@context': 'https://schema.org',
          '@type': product.type === 'stationery' ? 'Product' : 'Book',
          name: product.title,
          image: (product.images || []).map((i) => resolveAssetUrl(i.url)),
          description: product.shortDescription || stripHtml(product.description).slice(0, 300),
          sku: product.sku,
          ...(product.isbn ? { isbn: product.isbn } : {}),
          ...(product.author ? { author: { '@type': 'Person', name: product.author } } : {}),
          offers: {
            '@type': 'Offer', priceCurrency: 'INR', price,
            availability: outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          },
          ...(product.rating?.count ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating.average, reviewCount: product.rating.count } } : {}),
        }} />

      <div className="container-x py-5 sm:py-7">
        <Breadcrumbs items={crumbs} className="mb-5" />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-12">
          <Gallery images={product.images} title={product.title} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Tag tone="brand">{TYPE_LABEL[product.type] || 'Product'}</Tag>
              {product.hasFreeEbook && <Tag tone="green" className="gap-1"><FiDownload size={10} /> Free ebook included</Tag>}
              {product.isBestSeller && <Tag tone="gold">Best seller</Tag>}
              {product.edition && <Tag>{product.edition}</Tag>}
            </div>

            <h1 className="mt-3 text-balance font-display text-2xl font-bold leading-tight text-ink-900 sm:text-3xl">{product.title}</h1>

            {(product.author || product.publisher) && (
              <p className="mt-2 text-sm text-ink-500">
                {product.author && (
                  <>by <Link to={`/shop?author=${encodeURIComponent(product.author)}`}
                    className="font-medium text-ink-800 underline decoration-ink-200 underline-offset-2 hover:text-brand-700">{product.author}</Link></>
                )}
                {product.publisher && <span className="text-ink-400"> · {product.publisher}</span>}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-4">
              {product.rating?.count > 0
                ? <button type="button" onClick={() => setTab('reviews')} className="transition-opacity hover:opacity-70">
                    <Rating value={product.rating.average} count={product.rating.count} />
                  </button>
                : <span className="text-xs text-ink-400">No reviews yet</span>}
              {product.soldCount > 20 && <span className="text-xs font-medium text-ink-500">{product.soldCount}+ sold</span>}
            </div>

            <div className="mt-5 rounded-3xl border border-ink-100 bg-ink-50/60 p-5">
              <PriceTag price={price} mrp={product.price} discount={discount} size="lg" />
              {product.price > price && (
                <p className="mt-1.5 text-xs font-semibold text-emerald-600">You save ₹{Math.round(product.price - price)} on this order</p>
              )}
              <p className="mt-1 text-2xs text-ink-400">Inclusive of all taxes · Shipping calculated at checkout</p>
              <div className="mt-4 flex items-center gap-2 text-sm">
                {outOfStock ? <span className="font-semibold text-rose-600">Out of stock</span>
                  : product.type === 'ebook' ? <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600"><FiCheck size={15} /> Instant download</span>
                  : <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                      <FiCheck size={15} /> In stock
                      {product.stock <= 5 && <span className="font-normal text-amber-600">· only {product.stock} left</span>}
                    </span>}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, Math.min(20, product.stock || 20))} />
              <button type="button" disabled={outOfStock} onClick={() => addToCart(product, qty)}
                className="btn-outline flex-1 gap-2 py-3.5 disabled:opacity-40 sm:flex-none sm:px-8">
                <FiShoppingBag size={16} /> Add to cart
              </button>
              <button type="button" disabled={outOfStock} onClick={buyNow}
                className="btn-brand flex-1 gap-2 py-3.5 disabled:opacity-40 sm:flex-none sm:px-8">
                <><FiZap size={16} /> Buy now</>
              </button>
              <button type="button" onClick={() => toggleWishlist(product)} aria-label="Save to wishlist"
                className={`btn-icon h-12 w-12 border ${wished ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-ink-200 text-ink-400 hover:text-rose-500'}`}>
                <FiHeart size={18} className={wished ? 'fill-current' : ''} />
              </button>
              <button type="button" onClick={share} aria-label="Share" className="btn-icon h-12 w-12 border border-ink-200 text-ink-400 hover:text-ink-900">
                <FiShare2 size={17} />
              </button>
            </div>

            {(product.ebook?.available || product.imagesFromPdf) && (
              <div className="mt-5 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5">
                <p className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                  <FiBookOpen size={16} /> {product.ebook?.available ? 'Free ebook with this title' : 'Sample pages available'}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-emerald-700/80">
                  {product.ebook?.available
                    ? 'Download the complete PDF at no extra cost — no account needed.'
                    : 'Read the first few pages before you buy.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {product.ebook?.available && (
                    <a href={api.ebookUrl(product.slug)} target="_blank" rel="noreferrer" className="btn bg-emerald-600 px-5 py-2.5 text-white hover:bg-emerald-700">
                      <FiDownload size={15} /> Download free ebook
                    </a>
                  )}
                  <button type="button" onClick={() => setPreviewOpen(true)} className="btn border border-emerald-300 bg-white px-5 py-2.5 text-emerald-800 hover:bg-emerald-50">
                    <FiBookOpen size={15} /> Read a sample
                  </button>
                </div>
              </div>
            )}

            <DeliveryEstimator weight={product.weight} value={price} />

            {product.highlights?.length > 0 && (
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 rounded-2xl border border-ink-100 bg-white px-3.5 py-2.5 text-xs text-ink-600">
                    <FiCheck size={13} className="mt-0.5 shrink-0 text-emerald-500" />{h}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-12">
          <div className="flex gap-1 overflow-x-auto border-b border-ink-100 no-scrollbar">
            {[['description', 'Description'], ['specifications', `Specifications${specs.length ? ` (${specs.length})` : ''}`],
              ['reviews', `Reviews${product.rating?.count ? ` (${product.rating.count})` : ''}`], ['shipping', 'Shipping & returns']].map(([key, label]) => (
              <button key={key} type="button" onClick={() => setTab(key)}
                className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition-colors ${tab === key ? 'text-ink-900' : 'text-ink-400 hover:text-ink-700'}`}>
                {label}
                {tab === key && <motion.span layoutId="tab-underline" className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-ink-900" />}
              </button>
            ))}
          </div>

          <div className="py-7">
            {tab === 'description' && (
              <div className="max-w-3xl">
                {product.description
                  // Sanitised server-side against an allow-list before storage.
                  // eslint-disable-next-line react/no-danger
                  ? <div className="prose-store" dangerouslySetInnerHTML={{ __html: product.description }} />
                  : <p className="text-sm text-ink-500">{product.shortDescription || 'No description has been added yet.'}</p>}
              </div>
            )}

            {tab === 'specifications' && (
              <div className="max-w-2xl overflow-hidden rounded-3xl border border-ink-100">
                <table className="w-full text-sm">
                  <tbody>
                    {specs.map((s, i) => (
                      <tr key={`${s.label}-${i}`} className={i % 2 ? 'bg-ink-50/50' : 'bg-white'}>
                        <th scope="row" className="w-2/5 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">{s.label}</th>
                        <td className="px-4 py-3 font-medium text-ink-800">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'reviews' && <Reviews slug={slug} product={product} reviews={data?.reviews || []} onSubmitted={refetch} />}

            {tab === 'shipping' && (
              <div className="grid max-w-4xl gap-4 sm:grid-cols-3">
                {[
                  { icon: FiTruck, title: 'Delivery', body: 'Dispatched within 24 hours on business days. 2–6 days across India via Shiprocket partner couriers. Free above ₹499.' },
                  { icon: FiRefreshCw, title: 'Returns', body: 'Damaged or wrong item? Tell us within 7 days of delivery for a free replacement or full refund.' },
                  { icon: FiDownload, title: 'Digital items', body: 'Free ebooks download instantly and are licensed for personal use. Digital purchases are non-refundable.' },
                ].map(({ icon: Icon, title, body }) => (
                  <div key={title} className="rounded-3xl border border-ink-100 bg-white p-5">
                    <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon size={16} /></span>
                    <p className="text-sm font-bold text-ink-900">{title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {data?.related?.length > 0 && <div className="mt-6"><ProductRail title="Related titles" subtitle="Often bought alongside this one" products={data.related} /></div>}
        {data?.recommended?.length > 0 && (
          <div className="mt-14">
            <ProductRail title="Recommended for you" subtitle={`More from ${product.categoryName}`} products={data.recommended} viewAllUrl={`/category/${product.categorySlug}`} />
          </div>
        )}
      </div>

      {/* On a phone the action buttons scroll out of view — pin them. */}
      <div className="mobile-bar flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <PriceTag price={price} mrp={product.price} discount={discount} size="sm" />
        </div>
        <button type="button" disabled={outOfStock} onClick={() => addToCart(product, qty)} aria-label="Add to cart"
          className="btn-outline shrink-0 px-4 py-3 disabled:opacity-40">
          <FiShoppingBag size={16} />
        </button>
        <button type="button" disabled={outOfStock} onClick={buyNow} className="btn-brand shrink-0 gap-2 px-6 py-3 disabled:opacity-40">
          <><FiZap size={15} /> Buy now</>
        </button>
      </div>
      {/* clears both the action bar and the floating nav */}
      <div className="h-28 lg:hidden" aria-hidden />

      <BookPreview open={previewOpen} onClose={() => setPreviewOpen(false)} slug={product.slug}
        title={product.title} ebookAvailable={product.ebook?.available} />

      {/* Buy now → mobile number → OTP → address → Razorpay. */}
      {checkoutOpen && (
        <CheckoutFlow
          items={checkoutItems}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </>
  );
}

function DeliveryEstimator({ weight, value }) {
  const [pin, setPin] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const check = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pin)) { setErr('Enter a valid 6-digit PIN code'); return; }
    setErr(''); setBusy(true);
    try { setResult(await api.serviceability({ pincode: pin, weight: weight || 0.4, value })); }
    catch (e2) { setErr(e2.message); setResult(null); }
    finally { setBusy(false); }
  };

  return (
    <div className="mt-5 rounded-3xl border border-ink-100 bg-white p-5">
      <p className="flex items-center gap-2 text-sm font-bold text-ink-900"><FiMapPin size={15} className="text-brand-600" /> Check delivery to your area</p>
      <form onSubmit={check} className="mt-3 flex gap-2">
        <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric"
          placeholder="6-digit PIN code" aria-label="PIN code" className={`field py-2.5 ${err ? 'field-error' : ''}`} />
        <button type="submit" disabled={busy} className="btn-primary shrink-0 px-5 py-2.5">{busy ? <Spinner size={15} /> : 'Check'}</button>
      </form>
      {err && <p className="mt-2 text-xs text-rose-600">{err}</p>}
      {result && (
        <div className="mt-3.5 space-y-2 text-xs">
          {result.serviceable === false && <p className="font-semibold text-rose-600">Sorry, we can't deliver to {pin} right now.</p>}
          {result.serviceable === null && <p className="text-ink-500">{result.message || 'Live rates are unavailable at the moment.'}</p>}
          {result.serviceable && (
            <>
              <p className="font-semibold text-emerald-700">Delivery available to {pin}</p>
              {result.etd && <p className="text-ink-600">Estimated arrival: <span className="font-semibold text-ink-900">{result.etd}</span></p>}
              {result.couriers?.slice(0, 3).map((c) => (
                <p key={c.courierCompanyId} className="flex items-center justify-between border-t border-ink-100 pt-2 text-ink-600">
                  <span className="truncate">{c.name}</span>
                  <span className="shrink-0 font-medium text-ink-800">{c.estimatedDeliveryDays ? `${c.estimatedDeliveryDays} days` : c.etd}</span>
                </p>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Reviews({ slug, product, reviews, onSubmitted }) {
  const { toast } = useStore();
  const [form, setForm] = useState({ name: '', email: '', rating: 5, title: '', comment: '', orderNumber: '' });
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) { toast('Please add your name', 'error'); return; }
    setBusy(true);
    try {
      const res = await api.postReview(slug, form);
      toast(res?.message || 'Thanks for your review!');
      setForm({ name: '', email: '', rating: 5, title: '', comment: '', orderNumber: '' });
      setShowForm(false);
      onSubmitted?.();
    } catch (err) { toast(err.message, 'error'); }
    finally { setBusy(false); }
  };

  return (
    <div className="grid max-w-4xl gap-8 lg:grid-cols-[280px_1fr]">
      <div>
        <div className="rounded-3xl border border-ink-100 bg-ink-50/60 p-5 text-center">
          <p className="font-display text-4xl font-bold text-ink-900">{(product.rating?.average || 0).toFixed(1)}</p>
          <Rating value={product.rating?.average || 0} showCount={false} className="mt-2 justify-center" />
          <p className="mt-1.5 text-xs text-ink-500">
            {product.rating?.count ? `${product.rating.count} verified review${product.rating.count > 1 ? 's' : ''}` : 'No reviews yet'}
          </p>
        </div>
        <button type="button" onClick={() => setShowForm((s) => !s)} className="btn-outline mt-3 w-full">
          {showForm ? 'Cancel' : 'Write a review'}
        </button>
      </div>

      <div>
        {showForm && (
          <form onSubmit={submit} className="mb-6 rounded-3xl border border-ink-100 bg-white p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="rv-name" className="label">Your name *</label>
                <input id="rv-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" required />
              </div>
              <div>
                <label htmlFor="rv-email" className="label">Email (not published)</label>
                <input id="rv-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" />
              </div>
            </div>
            <div className="mt-3">
              <span className="label">Your rating</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })} aria-label={`${r} stars`} className="p-0.5">
                    <FiStar size={24} className={r <= form.rating ? 'fill-gold-400 text-gold-400' : 'text-ink-200 hover:text-gold-300'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <label htmlFor="rv-title" className="label">Headline</label>
              <input id="rv-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sum it up in a line" className="field" />
            </div>
            <div className="mt-3">
              <label htmlFor="rv-comment" className="label">Your review</label>
              <textarea id="rv-comment" rows={4} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className="field resize-none" />
            </div>
            <button type="submit" disabled={busy} className="btn-primary mt-4 w-full sm:w-auto">
              {busy ? <Spinner size={15} /> : 'Submit review'}
            </button>
            <p className="mt-2 text-2xs text-ink-400">Reviews appear after a quick check by our team.</p>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-ink-200 bg-ink-50/50 px-5 py-10 text-center text-sm text-ink-500">
            No reviews yet — be the first to share what you think.
          </p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r._id} className="rounded-3xl border border-ink-100 bg-white p-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                    {r.name?.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink-900">{r.name}</span>
                    <span className="block text-2xs text-ink-400">{dateLong(r.createdAt)}</span>
                  </span>
                  {r.isVerifiedPurchase && <Tag tone="green" className="ml-auto gap-1"><FiCheck size={9} /> Verified purchase</Tag>}
                </div>
                <Rating value={r.rating} showCount={false} size={13} className="mt-3" />
                {r.title && <p className="mt-2 text-sm font-bold text-ink-900">{r.title}</p>}
                {r.comment && <p className="mt-1.5 text-pretty text-sm leading-relaxed text-ink-600">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
