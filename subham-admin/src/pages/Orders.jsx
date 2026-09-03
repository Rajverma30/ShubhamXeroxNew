/**
 * Orders — list, detail, fulfilment.
 *
 * Payment is Razorpay's job and is read-only here; this screen exists for the
 * part a human does: pack it, hand it to a courier, record the AWB.
 *
 * The API enforces two rules, so the UI mirrors them rather than discovering
 * them through errors:
 *   • nothing but `cancelled` can be set until payment status is `paid`
 *   • shippedAt / deliveredAt are stamped server-side
 */
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FiAlertCircle, FiCheckCircle, FiCreditCard, FiMapPin, FiPackage, FiPhone, FiTruck, FiUser,
} from 'react-icons/fi';

import api from '../lib/api';
import { useDebounced, useListParams } from '../hooks';
import { useToast } from '../context/ToastContext';
import { dateTime, money } from '../lib/format';
import {
  Badge, EmptyState, ErrorBlock, Field, Input, Modal, PageHeader, Pagination,
  SearchInput, Select, Spinner, TableSkeleton,
} from '../components/Ui';

/** Fulfilment states, in the order an order actually moves through them. */
const FULFILMENT = ['confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

/** Uses the panel's own Badge vocabulary — neutral|brand|green|amber|rose|sky|dark. */
const TONE = {
  'awaiting-payment': 'amber',
  confirmed: 'brand',
  packed: 'brand',
  shipped: 'sky',
  delivered: 'green',
  cancelled: 'rose',
};

export default function Orders() {
  const qc = useQueryClient();
  const toast = useToast();
  const { params, update, setPage } = useListParams({ limit: 20 });

  const [search, setSearch] = useState(params.q || '');
  const debounced = useDebounced(search, 400);
  const [open, setOpen] = useState(null);          // order id

  const query = useMemo(
    () => ({ ...params, q: debounced || undefined }),
    [params, debounced],
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', query],
    queryFn: () => api.orders(query),
    placeholderData: (prev) => prev,
    // Someone watching this screen wants to see a new order arrive.
    refetchInterval: 60_000,
  });

  const items = data?.items || [];
  const pagination = data
    ? { page: data.page, pages: data.pages, total: data.total, limit: query.limit }
    : null;

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={
          data
            ? `${data.total} order${data.total === 1 ? '' : 's'} · ${money(data.paidRevenue)} received`
            : 'Guest checkout orders, paid through Razorpay'
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-3">
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => update({ status: '', paymentStatus: '', source: '' })}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              !params.status && !params.paymentStatus && !params.source ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            }`}
          >
            All Orders
          </button>
          <button
            type="button"
            onClick={() => update({ status: '', paymentStatus: 'paid', source: '' })}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              params.paymentStatus === 'paid' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Paid Orders
          </button>
          <button
            type="button"
            onClick={() => update({ status: 'awaiting-payment', paymentStatus: '', source: '' })}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              (params.status === 'awaiting-payment' || params.paymentStatus === 'created') && !params.source ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Manual Attempts
          </button>
          <button
            type="button"
            onClick={() => update({ status: 'shiprocket-attempt', paymentStatus: '', source: 'shiprocket' })}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              params.source === 'shiprocket' || params.status === 'shiprocket-attempt' ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
            }`}
          >
            Shiprocket Attempts
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Order number or phone…"
          className="min-w-[220px] flex-1"
        />
        <Select
          value={params.status || ''}
          onChange={(e) => update({ status: e.target.value })}
          className="w-auto"
        >
          <option value="">All statuses</option>
          {['awaiting-payment', ...FULFILMENT].map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select
          value={params.paymentStatus || ''}
          onChange={(e) => update({ paymentStatus: e.target.value })}
          className="w-auto"
        >
          <option value="">Any payment</option>
          <option value="paid">Paid</option>
          <option value="created">Not paid / Attempted</option>
          <option value="failed">Failed</option>
        </Select>
      </div>

      {error && <ErrorBlock error={error} onRetry={refetch} />}

      {isLoading && !data ? (
        <TableSkeleton rows={8} cols={6} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FiPackage}
          title="No orders yet"
          description="Orders placed or attempted through the storefront will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink-50/70 text-2xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="hidden px-4 py-3 text-left md:table-cell">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {items.map((o) => (
                <tr
                  key={o._id}
                  onClick={() => setOpen(o._id)}
                  className="cursor-pointer transition-colors hover:bg-ink-50/60"
                >
                  <td className="px-4 py-3 font-semibold text-ink-900">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-800">{o.customer?.name}</p>
                    <p className="text-2xs text-ink-400">{o.customer?.phone}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-ink-500 md:table-cell">{(o.items || []).length}</td>
                  <td className="px-4 py-3 text-right font-semibold text-ink-900">{money(o.total)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={o.payment?.status === 'paid' ? 'green' : o.payment?.status === 'failed' ? 'rose' : 'amber'}>
                      {o.payment?.status === 'created' ? 'Attempted' : (o.payment?.status || 'Attempted')}
                    </Badge>
                    {o.payment?.method && <p className="mt-0.5 text-2xs text-ink-400">{o.payment.method}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={TONE[o.status] || 'neutral'}>{o.status}</Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-2xs text-ink-400 lg:table-cell">{dateTime(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={pagination} onChange={setPage} />

      <OrderDetail
        id={open}
        onClose={() => setOpen(null)}
        onSaved={() => { qc.invalidateQueries({ queryKey: ['orders'] }); toast('Order updated'); }}
      />
    </>
  );
}

/* ───────────────────────────── detail ───────────────────────────── */

function OrderDetail({ id, onClose, onSaved }) {
  const toast = useToast();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.order(id),
    enabled: Boolean(id),
  });

  const [form, setForm] = useState({ status: '', courier: '', awb: '', trackingUrl: '', adminNotes: '' });
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!order) return;
    setForm({
      status: order.status,
      courier: order.tracking?.courier || '',
      awb: order.tracking?.awb || '',
      trackingUrl: order.tracking?.url || '',
      adminNotes: order.adminNotes || '',
    });
    setErr('');
  }, [order]);

  const save = useMutation({
    mutationFn: (payload) => api.updateOrder(id, payload),
    onSuccess: () => { onSaved(); onClose(); },
    onError: (e) => setErr(e.message),
  });

  const paid = order?.payment?.status === 'paid';
  const needsTracking = ['shipped', 'delivered'].includes(form.status);

  const submit = () => {
    setErr('');
    if (needsTracking && !form.awb.trim()) {
      setErr('Enter the AWB number before marking this shipped.');
      return;
    }
    save.mutate(form);
  };

  return (
    <Modal
      open={Boolean(id)}
      onClose={onClose}
      size="lg"
      title={order ? order.orderNumber : 'Order'}
      footer={
        order && (
          <div className="flex w-full items-center gap-3">
            {err && <p className="flex-1 text-xs font-medium text-rose-600">{err}</p>}
            <button type="button" onClick={onClose} className="btn-outline ml-auto">Close</button>
            <button type="button" onClick={submit} disabled={save.isPending} className="btn-primary gap-2">
              {save.isPending && <Spinner size={14} />} Save changes
            </button>
          </div>
        )
      }
    >
      {isLoading || !order ? (
        <div className="flex justify-center py-10"><Spinner size={22} /></div>
      ) : (
        <div className="space-y-5">
          {!paid && (
            <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
              <FiAlertCircle size={15} className="mt-px shrink-0" />
              This order has not been paid for. Only “cancelled” can be set until Razorpay confirms payment.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Info icon={FiUser} label="Customer">
              <p className="font-semibold text-ink-900">{order.customer?.name}</p>
              <p className="flex items-center gap-1.5 text-ink-500">
                <FiPhone size={12} /> {order.customer?.phone}
              </p>
              {order.customer?.email && <p className="text-ink-500">{order.customer.email}</p>}
            </Info>

            <Info icon={FiMapPin} label="Deliver to">
              <p className="text-ink-700">
                {order.shippingAddress?.address}
                {order.shippingAddress?.landmark ? `, ${order.shippingAddress.landmark}` : ''}
              </p>
              <p className="text-ink-500">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
              </p>
            </Info>
          </div>

          {/* items */}
          <div className="overflow-hidden rounded-lg border border-ink-100">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-ink-100">
                {(order.items || []).map((l, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-ink-800">{l.title}</p>
                      {l.sku && <p className="text-2xs text-ink-400">{l.sku}</p>}
                    </td>
                    <td className="w-16 px-3 py-2.5 text-center text-ink-500">× {l.quantity}</td>
                    <td className="w-24 px-3 py-2.5 text-right font-semibold text-ink-900">{money(l.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-ink-50/70 text-sm">
                <tr><td className="px-3 py-1.5 text-ink-500" colSpan={2}>Subtotal</td>
                  <td className="px-3 py-1.5 text-right">{money(order.subtotal)}</td></tr>
                <tr><td className="px-3 py-1.5 text-ink-500" colSpan={2}>Delivery</td>
                  <td className="px-3 py-1.5 text-right">{order.shippingCharge ? money(order.shippingCharge) : 'Free'}</td></tr>
                <tr className="font-bold text-ink-900"><td className="px-3 py-2" colSpan={2}>Total</td>
                  <td className="px-3 py-2 text-right">{money(order.total)}</td></tr>
              </tfoot>
            </table>
          </div>

          {/* payment — read-only, Razorpay is the record */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-ink-50/70 px-3 py-2.5 text-xs">
            <FiCreditCard size={14} className="text-ink-400" />
            <Badge tone={paid ? 'green' : 'rose'}>{order.payment?.status}</Badge>
            {order.payment?.method && <span className="text-ink-500">{order.payment.method}</span>}
            {order.payment?.razorpayPaymentId && (
              <span className="font-mono text-2xs text-ink-400">{order.payment.razorpayPaymentId}</span>
            )}
            {order.payment?.paidAt && <span className="text-ink-400">· {dateTime(order.payment.paidAt)}</span>}
          </div>

          {/* fulfilment */}
          <div className="space-y-3">
            <Field label="Fulfilment status">
              <Select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {order.status === 'awaiting-payment' && <option value="awaiting-payment">awaiting-payment</option>}
                {FULFILMENT.map((s) => (
                  <option key={s} value={s} disabled={!paid && s !== 'cancelled'}>{s}</option>
                ))}
              </Select>
            </Field>

            {needsTracking && (
              <div className="space-y-3 rounded-lg border border-sky-200 bg-sky-50/60 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-sky-800">
                  <FiTruck size={14} /> Courier details
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Courier" required>
                    <Input
                      value={form.courier} placeholder="Delhivery, DTDC, India Post…"
                      onChange={(e) => setForm((f) => ({ ...f, courier: e.target.value }))}
                    />
                  </Field>
                  <Field label="AWB / tracking number" required>
                    <Input
                      value={form.awb} placeholder="1234567890"
                      onChange={(e) => setForm((f) => ({ ...f, awb: e.target.value }))}
                    />
                  </Field>
                </div>
                <Field label="Tracking URL" hint="Optional — the customer-facing link">
                  <Input
                    value={form.trackingUrl} placeholder="https://…"
                    onChange={(e) => setForm((f) => ({ ...f, trackingUrl: e.target.value }))}
                  />
                </Field>
              </div>
            )}

            <Field label="Internal notes" hint="Only visible here">
              <Input
                value={form.adminNotes}
                onChange={(e) => setForm((f) => ({ ...f, adminNotes: e.target.value }))}
              />
            </Field>
          </div>

          {order.tracking?.shippedAt && (
            <p className="flex items-center gap-1.5 text-2xs text-ink-400">
              <FiCheckCircle size={12} /> Shipped {dateTime(order.tracking.shippedAt)}
              {order.tracking.deliveredAt && ` · Delivered ${dateTime(order.tracking.deliveredAt)}`}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}

function Info({ icon: Icon, label, children }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wide text-ink-400">
        <Icon size={12} /> {label}
      </p>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
