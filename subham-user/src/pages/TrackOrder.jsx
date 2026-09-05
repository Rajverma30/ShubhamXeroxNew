/**
 * Guest order tracking & My Orders lookup.
 *
 * Orders are stored in our own database. The customer enters:
 * 1. Their 10-digit mobile number to see ALL their past orders & live payment status.
 * 2. An order number (e.g. SX-260905-KXJY7).
 * 3. An AWB tracking number from courier SMS.
 */
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiChevronRight, FiMapPin, FiPackage, FiPhoneCall, FiSearch, FiTruck } from 'react-icons/fi';
import api from '../lib/api';
import Seo from '../components/ui/Seo';
import { Breadcrumbs, SectionHeader, Spinner, Tag } from '../components/ui/Common';
import { dateLong, dateTime, money, ORDER_STATUS_LABEL } from '../lib/format';

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(
    searchParams.get('phone') || searchParams.get('order') || searchParams.get('awb') || '',
  );
  const [singleOrderData, setSingleOrderData] = useState(null);
  const [phoneOrdersList, setPhoneOrdersList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async (e) => {
    e?.preventDefault();
    const ref = reference.trim();
    if (!ref) {
      setError('Enter your Mobile number, Order number, or AWB');
      return;
    }
    setError('');
    setLoading(true);
    setSingleOrderData(null);
    setPhoneOrdersList(null);

    try {
      const cleanDigits = ref.replace(/\D/g, '');
      // If 10-digit mobile number -> fetch all orders by phone
      if (cleanDigits.length === 10 && /^[6-9]\d{9}$/.test(cleanDigits)) {
        const list = await api.getOrdersByPhone(cleanDigits);
        if (!list || !list.length) {
          setError(`No orders found for mobile number ${cleanDigits}.`);
        } else {
          setPhoneOrdersList(list);
        }
      } else {
        // Otherwise treat as order number or AWB number
        const isAwb = /^\d{9,}$/.test(ref);
        const data = await api.trackOrder(isAwb ? { awb: ref } : { order: ref });
        setSingleOrderData(data);
      }
    } catch (err) {
      setError(err.message || 'Could not find order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('phone') || searchParams.get('order') || searchParams.get('awb')) {
      lookup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelled = ['cancelled', 'returned', 'rto', 'failed'].includes(singleOrderData?.status);

  return (
    <>
      <Seo title="Track your order / My Orders" description="Track your Subham Xerox orders — no account needed." path="/track" />

      <div className="container-x max-w-3xl py-7">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Track order & My Orders' }]} className="mb-5" />
        <SectionHeader
          eyebrow="Order status"
          title="Track your orders"
          subtitle="Enter your 10-digit mobile number to view all your orders, or enter an Order number / AWB."
        />

        <form onSubmit={lookup} className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
          <label htmlFor="tr-ref" className="label">Mobile Number, Order Number, or AWB *</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="tr-ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Enter Mobile Number (e.g. 9876543210) or Order # (SX-...)"
              className="field"
            />
            <button type="submit" disabled={loading} className="btn-primary shrink-0 gap-2 sm:px-8">
              {loading ? <Spinner size={15} /> : <><FiSearch size={15} /> Look up</>}
            </button>
          </div>
          {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}
        </form>

        {/* ────────────────── List of orders found by Phone Number ────────────────── */}
        {phoneOrdersList && phoneOrdersList.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink-900">
                Found {phoneOrdersList.length} Order{phoneOrdersList.length > 1 ? 's' : ''}
              </h2>
              <span className="text-2xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Auto-Synced Live
              </span>
            </div>

            {phoneOrdersList.map((ord) => {
              const isPaid = ord.payment?.status === 'paid';
              const phone = ord.customer?.phone || '';
              return (
                <div key={ord._id || ord.orderNumber} className="overflow-hidden rounded-3xl border border-ink-100 bg-white p-5 shadow-soft transition-all hover:border-brand-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 pb-3.5">
                    <div>
                      <p className="text-2xs font-bold uppercase tracking-wide text-ink-400">Order Number</p>
                      <p className="font-display text-lg font-bold text-ink-900">{ord.orderNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag tone={isPaid ? 'green' : 'amber'}>
                        {isPaid ? 'PAID & CONFIRMED' : 'AWAITING PAYMENT'}
                      </Tag>
                      <Tag tone={ord.status === 'delivered' ? 'green' : ord.status === 'shipped' ? 'brand' : 'gray'}>
                        {ORDER_STATUS_LABEL[ord.status] || ord.status}
                      </Tag>
                    </div>
                  </div>

                  <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="text-ink-500">Placed on: <span className="font-semibold text-ink-800">{dateLong(ord.createdAt)}</span></p>
                      <p className="mt-0.5 text-ink-500">Items: <span className="font-semibold text-ink-800">{(ord.items || []).length} items</span></p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-2xs font-bold uppercase tracking-wide text-ink-400">Total Amount</p>
                      <p className="font-display text-xl font-bold text-ink-900">{money(ord.total)}</p>
                    </div>
                  </div>

                  {/* Item preview */}
                  <ul className="mt-3.5 divide-y divide-ink-50 rounded-2xl bg-ink-50/50 p-3">
                    {(ord.items || []).slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between py-1.5 text-xs">
                        <span className="truncate max-w-[240px] font-medium text-ink-900">{item.title}</span>
                        <span className="text-ink-500">Qty {item.quantity} × {money(item.price)}</span>
                      </li>
                    ))}
                    {(ord.items || []).length > 3 && (
                      <li className="pt-1 text-2xs text-ink-400 font-medium">
                        + {(ord.items || []).length - 3} more items
                      </li>
                    )}
                  </ul>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 pt-3.5">
                    <Link
                      to={`/order-placed?order=${ord.orderNumber}&phone=${encodeURIComponent(phone)}`}
                      className="btn-outline btn-sm gap-1.5 text-brand-600 hover:text-brand-700"
                    >
                      View Receipt & Details <FiChevronRight size={14} />
                    </Link>
                    <Link
                      to={`/track?order=${ord.orderNumber}`}
                      className="btn-primary btn-sm gap-1.5"
                    >
                      <FiTruck size={13} /> Live Courier Track
                    </Link>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ────────────────── Single Order / AWB Details ────────────────── */}
        {singleOrderData && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-5">
            <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-2xs font-bold uppercase tracking-wide text-ink-400">Current status</p>
                  <p className="mt-1 font-display text-xl font-bold text-ink-900">{ORDER_STATUS_LABEL[singleOrderData.status] || singleOrderData.statusLabel}</p>
                </div>
                <Tag tone={cancelled ? 'rose' : singleOrderData.status === 'delivered' ? 'green' : 'brand'}>Live status</Tag>
              </div>

              <dl className="mt-4 grid gap-3 border-t border-ink-100 pt-4 text-xs sm:grid-cols-3">
                {singleOrderData.awb && <div><dt className="text-ink-400">AWB number</dt><dd className="mt-0.5 font-semibold text-ink-900">{singleOrderData.awb}</dd></div>}
                {singleOrderData.courierName && <div><dt className="text-ink-400">Courier</dt><dd className="mt-0.5 font-semibold text-ink-900">{singleOrderData.courierName}</dd></div>}
                {singleOrderData.etd && <div><dt className="text-ink-400">Expected delivery</dt><dd className="mt-0.5 font-semibold text-ink-900">{singleOrderData.etd}</dd></div>}
              </dl>

              {singleOrderData.trackUrl && (
                <a href={singleOrderData.trackUrl} target="_blank" rel="noreferrer" className="btn-outline btn-sm mt-4 gap-2">
                  <FiTruck size={13} /> Open courier tracking page
                </a>
              )}
            </div>

            {!cancelled && singleOrderData.stages?.length > 0 && (
              <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
                <ol className="relative flex justify-between">
                  <span className="absolute left-0 right-0 top-3.5 h-0.5 bg-ink-100" aria-hidden />
                  <motion.span className="absolute left-0 top-3.5 h-0.5 bg-emerald-500" initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, (singleOrderData.stage / (singleOrderData.stages.length - 1)) * 100)}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} aria-hidden />
                  {singleOrderData.stages.map((stage, i) => {
                    const done = i <= singleOrderData.stage;
                    return (
                      <li key={stage} className="relative flex w-full flex-col items-center gap-2 text-center">
                        <span className={`z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 text-2xs font-bold transition-colors duration-500 ${
                          done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-ink-200 bg-white text-ink-300'}`}>
                          {done ? <FiCheck size={13} strokeWidth={3} /> : i + 1}
                        </span>
                        <span className={`hidden text-2xs font-semibold leading-tight sm:block ${done ? 'text-ink-900' : 'text-ink-300'}`}>
                          {ORDER_STATUS_LABEL[stage]}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {singleOrderData.activities?.length > 0 && (
              <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
                <p className="mb-4 font-display text-base font-bold text-ink-900">Journey so far</p>
                <ol className="space-y-4">
                  {singleOrderData.activities.map((a, i) => (
                    <li key={i} className="relative flex gap-3.5 pl-1">
                      <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-brand-500 ring-4 ring-brand-100" />
                      <div className="min-w-0 flex-1 border-b border-ink-50 pb-3.5 last:border-0">
                        <p className="text-sm font-semibold text-ink-900">{a.activity || a.status}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-2xs text-ink-400">
                          <span>{dateTime(a.date)}</span>
                          {a.location && <span className="inline-flex items-center gap-1"><FiMapPin size={9} /> {a.location}</span>}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </motion.div>
        )}

        {!singleOrderData && !phoneOrdersList && !loading && (
          <div className="mt-6 rounded-3xl border border-dashed border-ink-200 bg-ink-50/50 p-6 text-center">
            <FiPackage size={22} className="mx-auto mb-3 text-ink-300" />
            <p className="text-sm text-ink-500">
              Enter your mobile number to list all your orders, or enter your Order Number / AWB for live tracking.
            </p>
          </div>
        )}
      </div>
      <div className="mobile-nav-spacer" aria-hidden />
    </>
  );
}
