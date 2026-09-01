/**
 * Cart page. Review lines, then open our own checkout.
 *
 * The subtotal here is indicative — delivery is priced per PIN code, and the
 * server recomputes every line from the database at checkout. The totals shown
 * inside CheckoutFlow are the authoritative ones.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowLeft, FiDownload, FiLock, FiShoppingBag, FiTrash2, FiTruck } from 'react-icons/fi';
import { useStore } from '../context/StoreContext';
import CheckoutFlow from '../components/checkout/CheckoutFlow';
import { preloadCheckout } from '../lib/checkout';
import Seo from '../components/ui/Seo';
import { Breadcrumbs, EmptyState, QuantityStepper, SectionHeader, Spinner } from '../components/ui/Common';
import { money, placeholderImage } from '../lib/format';

export default function Cart() {
  const { cart, setQuantity, removeFromCart, clearCart, toast, cartSubtotal, cartMrpTotal, settings } = useStore();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Warm the Razorpay SDK while the customer reviews their cart, so the
  // payment window opens instantly rather than after a script download.
  useEffect(() => { preloadCheckout(); }, []);

  const savings = Math.max(0, cartMrpTotal - cartSubtotal);

  if (!cart.length) {
    return (
      <>
        <Seo title="Your cart" path="/cart" noIndex />
        <div className="container-x py-20">
          <EmptyState icon={FiShoppingBag} title="Your cart is empty"
            description="Add a few titles and check out in under a minute — no account, no password."
            action={<Link to="/shop" className="btn-primary">Browse the catalogue</Link>} />
        </div>
        <div className="mobile-nav-spacer" aria-hidden />
      </>
    );
  }

  return (
    <>
      <Seo title="Your cart" path="/cart" noIndex />

      <div className="container-x py-7">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} className="mb-5" />
        <SectionHeader title="Your cart" subtitle={`${cart.length} item${cart.length > 1 ? 's' : ''} ready to go`} />

        <div className="grid gap-7 lg:grid-cols-[1fr_360px]">
          <div>
            <ul className="divide-y divide-ink-100 overflow-hidden rounded-3xl border border-ink-100 bg-white">
              <AnimatePresence initial={false}>
                {cart.map((line) => (
                  <motion.li key={line.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                    className="flex gap-4 overflow-hidden p-4 sm:p-5">
                    <Link to={`/product/${line.slug}`} className="shrink-0">
                      <img src={line.image || placeholderImage(line.title)} alt="" loading="lazy"
                        className="h-28 w-20 rounded-2xl border border-ink-100 object-cover sm:h-32 sm:w-24" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link to={`/product/${line.slug}`} className="text-sm font-semibold leading-snug text-ink-900 hover:text-brand-700 sm:text-base">
                        {line.title}
                      </Link>
                      {line.author && <p className="mt-0.5 text-xs text-ink-400">{line.author}</p>}
                      {line.hasFreeEbook && (
                        <p className="mt-1.5 inline-flex items-center gap-1 text-2xs font-semibold text-emerald-600"><FiDownload size={10} /> Free ebook included</p>
                      )}
                      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                        <QuantityStepper value={line.quantity} onChange={(q) => setQuantity(line.id, q)}
                          max={Math.max(1, Math.min(20, line.stock || 20))} />
                        <div className="text-right">
                          <p className="text-base font-bold text-ink-900">{money(line.price * line.quantity)}</p>
                          {line.mrp > line.price && <p className="text-2xs text-ink-400 line-through">{money(line.mrp * line.quantity)}</p>}
                        </div>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeFromCart(line.id)} aria-label={`Remove ${line.title}`}
                      className="btn-icon h-8 w-8 shrink-0 self-start text-ink-300 hover:bg-rose-50 hover:text-rose-500">
                      <FiTrash2 size={15} />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-brand-600">
                <FiArrowLeft size={15} /> Continue shopping
              </Link>
              <button type="button" onClick={clearCart} className="text-xs font-semibold text-ink-400 hover:text-rose-500">Empty the cart</button>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
              <h2 className="font-display text-base font-bold text-ink-900">Cart summary</h2>

              <dl className="mt-4 space-y-2.5 border-t border-ink-100 pt-4 text-sm">
                <Row label={`Items (${cart.length})`} value={money(cartSubtotal)} />
                {savings > 0 && <Row label="You save" value={`− ${money(savings)}`} accent="text-emerald-600" />}
                <div className="flex items-baseline justify-between border-t border-ink-100 pt-3">
                  <dt className="text-sm font-bold text-ink-900">Subtotal</dt>
                  <dd className="font-display text-2xl font-bold text-ink-900">{money(cartSubtotal)}</dd>
                </div>
              </dl>

              <p className="mt-3 rounded-xl bg-ink-50 px-3 py-2.5 text-2xs leading-relaxed text-ink-500">
                Delivery is calculated for your PIN code at checkout, so your final total may differ.
              </p>

              <button type="button" onClick={() => setCheckoutOpen(true)} className="btn-primary mt-4 w-full gap-2 py-4">
                Proceed to checkout
              </button>

              <p className="mt-3 flex items-start gap-2 text-2xs leading-relaxed text-ink-400">
                <FiLock size={13} className="mt-0.5 shrink-0" />
                Secure payment by Razorpay — UPI, cards, net banking and wallets. No account needed.
              </p>
              <p className="mt-2 flex items-start gap-2 text-2xs leading-relaxed text-ink-400">
                <FiTruck size={13} className="mt-0.5 shrink-0" />
                Delivery charges are calculated for your PIN code at checkout.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Sticky checkout on phones; the summary card is far below the lines. */}
      <div className="mobile-bar flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-2xs text-ink-400">Subtotal</p>
          <p className="text-lg font-bold leading-tight text-ink-900">{money(cartSubtotal)}</p>
        </div>
        <button type="button" onClick={() => setCheckoutOpen(true)} className="btn-primary flex-1 gap-2 py-3.5">
          Checkout
        </button>
      </div>
      <div className="h-28 lg:hidden" aria-hidden />

      {/* mobile number → OTP → address → Razorpay */}
      {checkoutOpen && <CheckoutFlow onClose={() => setCheckoutOpen(false)} />}
    </>
  );
}

function Row({ label, value, accent = '' }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-ink-500">{label}</dt>
      <dd className={`font-semibold ${accent || 'text-ink-900'}`}>{value}</dd>
    </div>
  );
}
