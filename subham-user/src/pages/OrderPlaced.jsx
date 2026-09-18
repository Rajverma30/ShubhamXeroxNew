/**
 * Order details / receipt page.
 *
 * Handles both:
 * 1. Paid orders -> Confirmed receipt view.
 * 2. Unpaid / Awaiting payment orders -> Shows "Payment Pending" banner with "Complete Payment Now" button.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiCheck, FiClock, FiCopy, FiCreditCard, FiHome, FiMail, FiPhone, FiRefreshCw } from 'react-icons/fi';

import { useStore } from '../context/StoreContext';
import { fetchOrder, payExistingOrder } from '../lib/checkout';
import Seo from '../components/ui/Seo';
import { Spinner } from '../components/ui/Common';
import { money, placeholderImage, resolveAssetUrl } from '../lib/format';

export default function OrderPlaced() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart, settings, toast } = useStore();

  const orderNumber = params.get('order') || params.get('order_id') || '';
  const phone = params.get('phone') || '';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderNumber));
  const [orderError, setOrderError] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

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
    setLoading(true);
    setOrderError('');
    fetchOrder(orderNumber, phone)
      .then((d) => {
        if (!cancelled) setOrder(d);
      })
      .catch((err) => {
        if (!cancelled) setOrderError(err?.message || 'Could not load order details. Please check order number or phone.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [orderNumber, phone]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      toast?.('Order number copied');
    } catch { /* clipboard unavailable */ }
  };

  const handlePayNow = async () => {
    if (!order) return;
    setPaying(true);
    setPayError('');
    try {
      await payExistingOrder(order, {
        storeName: settings?.storeName || 'Shubham Xerox',
        logo: settings?.logo,
      });
      toast?.('Payment successful! Order confirmed.');
      // Refresh order details
      const updated = await fetchOrder(order.orderNumber, phone || order.customer?.phone);
      setOrder(updated);
    } catch (err) {
      setPayError(err?.message || 'Payment was not completed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const isPaid = Boolean(order) && (
    order.payment?.status === 'paid' ||
    (['confirmed', 'processing', 'dispatched', 'delivered', 'completed'].includes(order.status) &&
      order.payment?.status !== 'created' &&
      order.payment?.status !== 'failed')
  ) && order.status !== 'awaiting-payment';

  if (loading) {
    return (
      <div className="container-x max-w-xl py-24 text-center">
        <Spinner size={32} className="mx-auto text-brand-600" />
        <p className="mt-4 text-sm font-medium text-ink-500">Loading order details…</p>
      </div>
    );
  }

  return (
    <>
      <Seo title={isPaid ? "Order Confirmed" : "Complete Payment"} path="/order-placed" noIndex />

      <div className="container-x max-w-xl py-10 text-center sm:py-14">
        {orderError ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center shadow-soft">
            <FiAlertCircle size={32} className="mx-auto mb-2 text-rose-600" />
            <h2 className="font-display text-lg font-bold text-rose-900">Order Details Not Found</h2>
            <p className="mt-1 text-xs leading-relaxed text-rose-700">{orderError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-outline mt-4 inline-flex items-center gap-2 text-xs"
            >
              <FiRefreshCw size={14} /> Try Reloading
            </button>
          </div>
        ) : isPaid ? (
          <>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-glow"
            >
              <FiCheck size={30} strokeWidth={3} />
            </motion.div>

            <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
              Order placed successfully
            </h1>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-500">
              Your payment has been received and your order is confirmed. We will contact you on the number you verified when it ships.
            </p>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 text-white shadow-soft"
            >
              <FiClock size={30} strokeWidth={2.5} />
            </motion.div>

            <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
              Payment Pending
            </h1>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-500">
              Aapka order receive ho gaya hai lekin payment abhi baki hai. Order confirm karne ke liye neeche दिए गए button se payment complete karein.
            </p>
          </>
        )}

        {orderNumber && (
          <div className={`mt-6 rounded-2xl border px-5 py-4 ${isPaid ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <p className={`text-2xs font-bold uppercase tracking-wide ${isPaid ? 'text-emerald-700' : 'text-amber-800'}`}>
              Your order number
            </p>
            <button
              type="button" onClick={copy}
              className="mt-1 inline-flex items-center gap-2 font-display text-2xl font-bold text-ink-900"
            >
              {orderNumber}
              <FiCopy size={15} className={isPaid ? "text-emerald-600" : "text-amber-600"} />
            </button>
            <p className={`mt-1.5 text-2xs ${isPaid ? 'text-emerald-700' : 'text-amber-800'}`}>
              Save this number to track your order status anytime.
            </p>
          </div>
        )}

        {!isPaid && order && (
          <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50/90 p-5 text-left shadow-soft">
            <div className="flex items-start gap-3">
              <FiAlertCircle size={22} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-base font-bold text-amber-900">Payment required to process this order</p>
                <p className="mt-0.5 text-xs text-amber-800">
                  Total amount due: <span className="font-bold text-amber-950 text-sm">{money(order.total)}</span>
                </p>
              </div>
            </div>

            {payError && (
              <p className="mt-3 rounded-lg bg-rose-100 p-2.5 text-xs font-semibold text-rose-700">
                {payError}
              </p>
            )}

            <button
              type="button"
              onClick={handlePayNow}
              disabled={paying}
              className="btn-primary mt-4 w-full gap-2 py-3.5 text-base shadow-lift font-bold"
            >
              {paying ? (
                <><Spinner size={18} /> Processing payment…</>
              ) : (
                <><FiCreditCard size={18} /> Complete Payment ({money(order.total)}) Now via Razorpay</>
              )}
            </button>
          </div>
        )}

        {order && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 text-left bg-white shadow-soft">
            <div className="border-b border-ink-100 bg-ink-50/50 px-4 py-3">
              <p className="text-2xs font-bold uppercase tracking-wide text-ink-400">Order Items</p>
            </div>
            <ul className="divide-y divide-ink-100">
              {(order.items || []).map((line, i) => (
                <li key={i} className="flex items-center gap-3 p-3.5">
                  <img
                    src={resolveAssetUrl(line.image) || placeholderImage(line.title)}
                    alt={line.title}
                    className="h-14 w-11 shrink-0 rounded border border-ink-100 object-cover"
                  />
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
                <dt>{isPaid ? 'Total paid' : 'Total due'}</dt><dd>{money(order.total)}</dd>
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

        <div className="mt-6 text-left">
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
