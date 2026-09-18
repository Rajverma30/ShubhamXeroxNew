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
  FiAlertCircle, FiCheckCircle, FiCreditCard, FiExternalLink, FiMapPin, FiMessageSquare, FiPackage, FiPhone, FiSend, FiTruck, FiUser,
} from 'react-icons/fi';

import api from '../lib/api';
import { useDebounced, useListParams } from '../hooks';
import { useToast } from '../context/ToastContext';
import { dateTime, money, placeholderImage, resolveAssetUrl } from '../lib/format';
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

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.settings(),
  });

  const toggleAutoPush = useMutation({
    mutationFn: (newVal) => api.updateSettings({ shiprocketAutoPush: newVal }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast('Shiprocket Auto-Push setting updated!');
    },
  });

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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleAutoPush.mutate(!settingsData?.shiprocketAutoPush)}
            disabled={toggleAutoPush.isPending}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${
              settingsData?.shiprocketAutoPush
                ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                : 'bg-white text-ink-700 border-ink-200 hover:bg-ink-50'
            }`}
          >
            <FiTruck size={14} />
            Auto-Push to Shiprocket: <span className="font-bold uppercase">{settingsData?.shiprocketAutoPush ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, phone, order #, email, city…"
          className="min-w-[240px] flex-1"
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

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.order(id),
    enabled: Boolean(id),
    retry: 1,
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

  const [sendingWa, setSendingWa] = useState(false);
  const [pushingShiprocket, setPushingShiprocket] = useState(false);

  const handlePushShiprocket = async () => {
    if (!order) return;
    setPushingShiprocket(true);
    try {
      const res = await api.pushToShiprocket(order._id || id);
      toast(res?.message || 'Order pushed to Shiprocket successfully!');
      onSaved();
    } catch (e) {
      toast(e.message || 'Failed to push order to Shiprocket');
    } finally {
      setPushingShiprocket(false);
    }
  };

  const handleSendWhatsApp = async (type) => {
    if (!order) return;
    setSendingWa(true);
    try {
      const res = await api.sendOrderWhatsApp(order._id || id, { type });
      toast(res?.message || 'WhatsApp message processed');
      if (res?.waLink) {
        window.open(res.waLink, '_blank');
      }
    } catch (e) {
      toast(e.message || 'Failed to send WhatsApp message');
    } finally {
      setSendingWa(false);
    }
  };

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
            {!order.isShiprocketSession && (
              <button type="button" onClick={submit} disabled={save.isPending} className="btn-primary gap-2">
                {save.isPending && <Spinner size={14} />} Save changes
              </button>
            )}
          </div>
        )
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner size={22} /></div>
      ) : error ? (
        <div className="p-6 text-center text-sm font-medium text-rose-600">
          {error.message || 'Failed to load order details'}
        </div>
      ) : !order ? (
        <div className="p-6 text-center text-sm text-ink-500">Order not found.</div>
      ) : (
        <div className="space-y-5">
          {order.isShiprocketSession && (
            <p className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs text-sky-800">
              <FiAlertCircle size={15} className="mt-px shrink-0" />
              This is an unconfirmed Fastrr / Shiprocket checkout attempt. Details are read-only until payment is completed.
            </p>
          )}

          {!paid && !order.isShiprocketSession && (
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

          {/* Shiprocket Delivery Integration Controls */}
          {!order.isShiprocketSession && (
            <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-950">
                  <FiTruck size={15} className="text-sky-600" />
                  Shiprocket Delivery Integration
                </div>
                <span className="text-2xs font-medium text-sky-800">
                  {order.shiprocket?.orderId
                    ? `✅ Order #${order.shiprocket.orderId}`
                    : order.shiprocket?.error
                    ? '⚠️ Push Failed'
                    : '⏳ Delivery Not Created'}
                </span>
              </div>

              {order.shiprocket?.error && (
                <div className="text-2xs font-medium text-rose-700 bg-rose-50 p-2 rounded border border-rose-200 space-y-1">
                  <p>Error: {order.shiprocket.error}</p>
                  {/403|access denied|not configured|login/i.test(order.shiprocket.error) && (
                    <p className="text-rose-800/90 font-normal">
                      Fix: Shiprocket → Settings → API → API User banao/edit karo, <strong>Orders</strong> module ON rakho,
                      phir us API User ka email+password Railway pe <code className="font-mono">SHIPROCKET_EMAIL</code> /
                      <code className="font-mono">SHIPROCKET_PASSWORD</code> set karke backend restart karo.
                      (Checkout API key se ye button kaam nahi karta.)
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handlePushShiprocket}
                  disabled={pushingShiprocket}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50 transition-colors shadow-2xs"
                >
                  {pushingShiprocket ? <Spinner size={12} /> : <FiSend size={12} />}
                  {order.shiprocket?.orderId ? 'Re-push Order to Shiprocket' : 'Push to Shiprocket (Create Delivery)'}
                </button>

                {order.shiprocket?.orderId && (
                  <span className="text-2xs font-mono text-sky-900 bg-white px-2.5 py-1.5 rounded border border-sky-200 font-semibold">
                    Shipment ID: {order.shiprocket.shipmentId || 'N/A'} {order.shiprocket.awb ? `| AWB: ${order.shiprocket.awb}` : ''}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* WhatsApp Automation Controls */}
          {order.customer?.phone && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                  <FiMessageSquare size={15} className="text-emerald-600" />
                  WhatsApp Automation (Sender: 9826462963)
                </div>
                {order.whatsappNotifications && (
                  <span className="text-2xs font-medium text-emerald-800">
                    {paid
                      ? order.whatsappNotifications.orderConfirmedSent ? '✅ Confirmation Sent' : '⏳ Confirmation Pending'
                      : order.whatsappNotifications.awaitingPaymentSent ? '✅ Payment Link Sent' : '⏳ Link Pending'}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {!paid ? (
                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp('payment-pending')}
                    disabled={sendingWa}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {sendingWa ? <Spinner size={12} /> : <FiSend size={12} />} Send Payment Link on WhatsApp
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp('order-confirmation')}
                    disabled={sendingWa}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {sendingWa ? <Spinner size={12} /> : <FiSend size={12} />} Send Confirmation Greeting
                  </button>
                )}

                <a
                  href={`https://wa.me/91${String(order.customer.phone).replace(/\D/g, '').slice(-10)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  <FiExternalLink size={12} /> Chat on WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* items */}
          <div className="overflow-hidden rounded-lg border border-ink-100">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-ink-100">
                {(order.items || []).map((l, i) => {
                  const imgUrl = resolveAssetUrl(l.image || l.thumbUrl || l.product?.images?.[0]?.thumbUrl || l.product?.images?.[0]?.url || '') || placeholderImage('Book');
                  return (
                    <tr key={i}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={imgUrl}
                            onError={(e) => { e.target.src = placeholderImage('Book'); }}
                            alt=""
                            loading="lazy"
                            className="h-12 w-10 shrink-0 rounded border border-ink-200 bg-white object-contain p-0.5 shadow-2xs"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium leading-snug text-ink-800">{l.title}</p>
                            {l.sku && <p className="mt-0.5 text-2xs text-ink-400">{l.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="w-16 px-3 py-2.5 text-center text-ink-500 font-medium">× {l.quantity}</td>
                      <td className="w-24 px-3 py-2.5 text-right font-semibold text-ink-900">{money(l.lineTotal)}</td>
                    </tr>
                  );
                })}
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
