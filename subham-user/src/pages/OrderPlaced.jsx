/**
 * Order confirmation.
 *
 * Reached only via CheckoutFlow, which navigates with `replace: true` after
 * the payment signature has been verified server-side:
 *
 *     /order-placed?order=SX-260815-K2M9P&phone=9876543210
 *
 * Two behaviours worth calling out:
 *
 * 1. BACK GOES HOME. Landing back on the cart or the payment screen after a
 *    successful order invites a double payment. A duplicate history entry is
 *    pushed on mount, so the first Back press fires popstate and we redirect
 *    to the homepage instead.
 *
 * 2. THE CART IS CLEARED HERE TOO. CheckoutFlow already clears it, but if the
 *    customer reopens this URL the cart must not still be sitting there.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiCopy, FiHome, FiMail, FiPackage, FiPhone } from 'react-icons/fi';

import { useStore } from '../context/StoreContext';
import { fetchOrder } from '../lib/checkout';
import Seo from '../components/ui/Seo';
import { Spinner } from '../components/ui/Common';
import { money } from '../lib/format';

export default function OrderPlaced() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart, settings, toast } = useStore();

  const orderNumber = params.get('order') || params.get('order_id') || '';
  const phone = params.get('phone') || '';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderNumber));

  /* Empty the cart. Safe to run twice. */
  useEffect(() => { clearCart?.(); }, [clearCart]);

  /* Back → home, never back into the payment flow. */
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const onPop = () => navigate('/', { replace: true });
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [navigate]);

  /* The receipt. */
  useEffect(() => {
    if (!orderNumber) { setLoading(false); return; }
    let cancelled = false;
    fetchOrder(orderNumber, phone)
      .then((d) => { if (!cancelled) setOrder(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [orderNumber, phone]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      toast?.('Order number copied');
    } catch { /* clipboard unavailable */ }
  };

  return (
    <>
      <Seo title="Order confirmed" path="/order-placed" noIndex />

      <div className="container-x max-w-xl py-12 text-center sm:py-16">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-glow"
        >
          <FiCheck size={30} strokeWidth={3} />
        </motion.div>

        <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
          Order placed successfully
        </h1>
        <p className="mt-2.5 text-pretty text-sm leading-relaxed text-ink-500">
          Your payment has been received and your order is confirmed. We will
          contact you on the number you verified when it ships.
        </p>

        {orderNumber && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <p className="text-2xs font-bold uppercase tracking-wide text-emerald-700">Your order number</p>
            <button
              type="button" onClick={copy}
              className="mt-1 inline-flex items-center gap-2 font-display text-2xl font-bold text-ink-900"
            >
              {orderNumber}
              <FiCopy size={15} className="text-emerald-600" />
            </button>
            <p className="mt-1.5 text-2xs text-emerald-700">
              Save this. There is no account, so it is how we find your order.
            </p>
          </div>
        )}

        {loading && (
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-400">
            <Spinner size={15} /> Loading your order…
          </p>
        )}

        {order && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 text-left">
            <ul className="divide-y divide-ink-100">
              {(order.items || []).map((line, i) => (
                <li key={i} className="flex items-center gap-3 p-3.5">
                  {line.image && (
                    <img src={line.image} alt="" className="h-14 w-11 shrink-0 rounded object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-ink-900">{line.title}</p>
                    <p className="mt-0.5 text-2xs text-ink-400">Qty {line.quantity} × {money(line.price)}</p>
                  </div>
                  <p className="text-sm font-bold text-ink-900">{money(line.lineTotal)}</p>
                </li>
              ))}
            </ul>

            <dl className="space-y-1.5 border-t border-ink-100 bg-ink-50/60 p-4 text-sm">
              <Row label="Subtotal" value={money(order.subtotal)} />
              <Row label="Delivery" value={order.shippingCharge ? money(order.shippingCharge) : 'Free'} />
              <div className="flex justify-between border-t border-ink-200 pt-2 font-bold text-ink-900">
                <dt>Total paid</dt><dd>{money(order.total)}</dd>
              </div>
            </dl>

            {order.shippingAddress && (
              <div className="border-t border-ink-100 p-4 text-sm">
                <p className="text-2xs font-bold uppercase tracking-wide text-ink-400">Delivering to</p>
                <p className="mt-1 font-semibold text-ink-900">{order.customer?.name}</p>
                <p className="text-ink-500">
                  {order.shippingAddress.address}
                  {order.shippingAddress.landmark ? `, ${order.shippingAddress.landmark}` : ''}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <Link to="/" className="btn-primary flex-1 gap-2">
            <FiHome size={16} /> Back to home
          </Link>
          <Link to="/shop" className="btn-outline flex-1">Continue shopping</Link>
        </div>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
          <Card icon={FiPackage} title="Dispatched within 24 hours"
            body="On business days. We will share tracking details as soon as your parcel ships." />
          <Card icon={settings?.phone ? FiPhone : FiMail} title="Need help with this order?"
            body={settings?.phone
              ? `Call us on ${settings.phone} with your order number.`
              : 'Contact us with your order number and we will look it up.'} />
        </div>
      </div>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-ink-600">
      <dt>{label}</dt><dd>{value}</dd>
    </div>
  );
}

function Card({ icon: Icon, title, body }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4">
      <Icon size={17} className="text-brand-600" />
      <p className="mt-2 text-sm font-bold text-ink-900">{title}</p>
      <p className="mt-1 text-2xs leading-relaxed text-ink-500">{body}</p>
    </div>
  );
}
