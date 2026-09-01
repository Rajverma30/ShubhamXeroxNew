/**
 * Guest order tracking.
 *
 * Orders are stored in our own database. The customer enters the
 * order number from their confirmation, or the AWB from the courier SMS.
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiMapPin, FiPackage, FiSearch, FiTruck } from 'react-icons/fi';
import api from '../lib/api';
import Seo from '../components/ui/Seo';
import { Breadcrumbs, SectionHeader, Spinner, Tag } from '../components/ui/Common';
import { dateTime, ORDER_STATUS_LABEL } from '../lib/format';

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(searchParams.get('order') || searchParams.get('awb') || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async (e) => {
    e?.preventDefault();
    const ref = reference.trim();
    if (!ref) { setError('Enter your order number or AWB number'); return; }
    setError(''); setLoading(true);
    try {
      // AWBs are long digit strings; order numbers aren't.
      const isAwb = /^\d{9,}$/.test(ref);
      setData(await api.trackOrder(isAwb ? { awb: ref } : { order: ref }));
    } catch (err) {
      setError(err.message); setData(null);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (searchParams.get('order') || searchParams.get('awb')) lookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelled = ['cancelled', 'returned', 'rto', 'failed'].includes(data?.status);

  return (
    <>
      <Seo title="Track your order" description="Track your Subham Xerox order — no account needed." path="/track" />

      <div className="container-x max-w-3xl py-7">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Track order' }]} className="mb-5" />
        <SectionHeader eyebrow="Order status" title="Track your order"
          subtitle="Enter the order number from your confirmation email, or the AWB number from your courier SMS." />

        <form onSubmit={lookup} className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
          <label htmlFor="tr-ref" className="label">Order number or AWB *</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input id="tr-ref" value={reference} onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. 123456789 or SR12345678" className="field" />
            <button type="submit" disabled={loading} className="btn-primary shrink-0 gap-2 sm:px-8">
              {loading ? <Spinner size={15} /> : <><FiSearch size={15} /> Track</>}
            </button>
          </div>
          {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}
        </form>

        {data && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-5">
            <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-2xs font-bold uppercase tracking-wide text-ink-400">Current status</p>
                  <p className="mt-1 font-display text-xl font-bold text-ink-900">{ORDER_STATUS_LABEL[data.status] || data.statusLabel}</p>
                </div>
                <Tag tone={cancelled ? 'rose' : data.status === 'delivered' ? 'green' : 'brand'}>Live status</Tag>
              </div>

              <dl className="mt-4 grid gap-3 border-t border-ink-100 pt-4 text-xs sm:grid-cols-3">
                {data.awb && <div><dt className="text-ink-400">AWB number</dt><dd className="mt-0.5 font-semibold text-ink-900">{data.awb}</dd></div>}
                {data.courierName && <div><dt className="text-ink-400">Courier</dt><dd className="mt-0.5 font-semibold text-ink-900">{data.courierName}</dd></div>}
                {data.etd && <div><dt className="text-ink-400">Expected delivery</dt><dd className="mt-0.5 font-semibold text-ink-900">{data.etd}</dd></div>}
              </dl>

              {data.trackUrl && (
                <a href={data.trackUrl} target="_blank" rel="noreferrer" className="btn-outline btn-sm mt-4 gap-2">
                  <FiTruck size={13} /> Open courier tracking page
                </a>
              )}
            </div>

            {!cancelled && data.stages?.length > 0 && (
              <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
                <ol className="relative flex justify-between">
                  <span className="absolute left-0 right-0 top-3.5 h-0.5 bg-ink-100" aria-hidden />
                  <motion.span className="absolute left-0 top-3.5 h-0.5 bg-emerald-500" initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, (data.stage / (data.stages.length - 1)) * 100)}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} aria-hidden />
                  {data.stages.map((stage, i) => {
                    const done = i <= data.stage;
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

            {data.activities?.length > 0 && (
              <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-soft">
                <p className="mb-4 font-display text-base font-bold text-ink-900">Journey so far</p>
                <ol className="space-y-4">
                  {data.activities.map((a, i) => (
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

        {!data && !loading && (
          <div className="mt-6 rounded-3xl border border-dashed border-ink-200 bg-ink-50/50 p-6 text-center">
            <FiPackage size={22} className="mx-auto mb-3 text-ink-300" />
            <p className="text-sm text-ink-500">
              Tracking appears once your parcel has been picked up by the courier — usually within a day of ordering.
            </p>
          </div>
        )}
      </div>
      <div className="mobile-nav-spacer" aria-hidden />
    </>
  );
}
