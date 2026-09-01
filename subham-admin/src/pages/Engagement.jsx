/**
 * Reviews moderation, newsletter subscribers and contact messages.
 *
 * Orders have their own screen (/orders); this covers reviews, newsletter
 * subscribers and contact messages.
 */
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiCheck, FiDownload, FiMail, FiMessageSquare, FiSend, FiStar, FiTrash2, FiX } from 'react-icons/fi';
import api from '../lib/api';
import { useListParams } from '../hooks';
import { useToast } from '../context/ToastContext';
import { dateLong, dateTime, imgUrl, number, relativeTime } from '../lib/format';
import {
  Badge, ConfirmDialog, EmptyState, ErrorBlock, Field, Modal, PageHeader,
  Pagination, Select, Spinner, TableSkeleton, Textarea,
} from '../components/Ui';

/* ── Reviews ─────────────────────────────────────── */

export function Reviews() {
  const qc = useQueryClient();
  const toast = useToast();
  const { params, update, setPage } = useListParams({ limit: 30 });
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reviews', params],
    queryFn: () => api.reviews(params),
    placeholderData: (prev) => prev,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['reviews'] });

  const moderate = useMutation({
    mutationFn: ({ id, isApproved }) => api.moderateReview(id, isApproved),
    onSuccess: () => { toast('Review updated'); invalidate(); },
    onError: (err) => toast(err.message, 'error'),
  });

  const remove = useMutation({
    mutationFn: (id) => api.deleteReview(id),
    onSuccess: () => { toast('Review deleted'); setConfirm(null); invalidate(); },
    onError: (err) => toast(err.message, 'error'),
  });

  const items = data?.items || [];

  return (
    <>
      <PageHeader
        title="Reviews"
        subtitle="Guest reviews appear on the storefront only after you approve them."
        actions={
          <Select value={params.isApproved ?? ''} onChange={(e) => update({ isApproved: e.target.value })} className="!w-auto" aria-label="Filter reviews">
            <option value="">All reviews</option>
            <option value="false">Awaiting approval</option>
            <option value="true">Approved</option>
          </Select>
        }
      />

      {error ? <ErrorBlock error={error} onRetry={refetch} />
        : isLoading ? <TableSkeleton rows={5} cols={5} />
        : items.length === 0 ? <EmptyState icon={FiStar} title="No reviews here" description="Customers can review any product without an account." />
        : (
          <div className="space-y-3">
            {items.map((r) => (
              <article key={r._id} className="card p-4">
                <div className="flex flex-wrap items-start gap-3">
                  {r.product?.images?.[0] && (
                    <img src={imgUrl(r.product.images[0])} alt="" className="h-14 w-11 shrink-0 rounded border border-ink-100 object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-ink-500">{r.product?.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-ink-900">{r.name}</span>
                      <span className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FiStar key={s} size={12} className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-200'} />
                        ))}
                      </span>
                      {r.isVerifiedPurchase && <Badge tone="green">verified purchase</Badge>}
                      <Badge tone={r.isApproved ? 'green' : 'amber'}>{r.isApproved ? 'approved' : 'pending'}</Badge>
                      <span className="text-2xs text-ink-400">{relativeTime(r.createdAt)}</span>
                    </div>
                    {r.title && <p className="mt-2 text-sm font-semibold text-ink-900">{r.title}</p>}
                    {r.comment && <p className="mt-1 text-sm leading-relaxed text-ink-600">{r.comment}</p>}
                    {r.orderNumber && <p className="mt-1.5 text-2xs text-ink-400">Order {r.orderNumber}</p>}
                  </div>

                  <div className="flex shrink-0 gap-1.5">
                    {!r.isApproved ? (
                      <button type="button" onClick={() => moderate.mutate({ id: r._id, isApproved: true })} className="btn-brand btn-sm gap-1.5">
                        <FiCheck size={12} /> Approve
                      </button>
                    ) : (
                      <button type="button" onClick={() => moderate.mutate({ id: r._id, isApproved: false })} className="btn-outline btn-sm gap-1.5">
                        <FiX size={12} /> Unapprove
                      </button>
                    )}
                    <button type="button" onClick={() => setConfirm(r)} aria-label="Delete review" className="btn-icon text-ink-400 hover:bg-rose-50 hover:text-rose-600">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      <Pagination pagination={data?.pagination} onChange={setPage} />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        busy={remove.isPending}
        title="Delete this review?"
        message="The product's average rating will be recalculated. This cannot be undone."
        onConfirm={() => remove.mutate(confirm._id)}
      />
    </>
  );
}

/* ── Newsletter ──────────────────────────────────── */

export function Newsletter() {
  const { params, setPage } = useListParams({ limit: 50 });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['newsletter', params],
    queryFn: () => api.newsletter(params),
    placeholderData: (prev) => prev,
  });

  const items = data?.items || [];

  /** Client-side CSV export — no extra endpoint needed. */
  const exportCsv = () => {
    const rows = [['Email', 'Name', 'Subscribed', 'Source', 'Joined']];
    items.forEach((n) => rows.push([n.email, n.name || '', n.isSubscribed ? 'yes' : 'no', n.source || '', dateLong(n.createdAt)]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `subham-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Newsletter"
        subtitle={data?.pagination ? `${number(data.pagination.total)} subscribers` : 'Footer and homepage signups'}
        actions={
          items.length > 0 && (
            <button type="button" onClick={exportCsv} className="btn-outline gap-2"><FiDownload size={14} /> Export CSV</button>
          )
        }
      />

      {error ? <ErrorBlock error={error} onRetry={refetch} />
        : isLoading ? <TableSkeleton rows={8} cols={4} />
        : items.length === 0 ? <EmptyState icon={FiMail} title="No subscribers yet" description="The footer and homepage forms both feed this list." />
        : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Email</th><th>Name</th><th>Source</th><th>Status</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {items.map((n) => (
                  <tr key={n._id}>
                    <td className="text-sm font-medium text-ink-900">{n.email}</td>
                    <td className="text-xs">{n.name || '—'}</td>
                    <td><Badge>{n.source || 'footer'}</Badge></td>
                    <td><Badge tone={n.isSubscribed ? 'green' : 'neutral'}>{n.isSubscribed ? 'subscribed' : 'unsubscribed'}</Badge></td>
                    <td className="text-xs">{dateLong(n.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      <Pagination pagination={data?.pagination} onChange={setPage} />
    </>
  );
}

/* ── Contact messages ────────────────────────────── */

export function Messages() {
  const qc = useQueryClient();
  const toast = useToast();
  const { params, update, setPage } = useListParams({ limit: 30 });
  const [replying, setReplying] = useState(null);
  const [reply, setReply] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['contacts', params],
    queryFn: () => api.contacts(params),
    placeholderData: (prev) => prev,
  });

  const mutation = useMutation({
    mutationFn: ({ id, payload }) => api.updateContact(id, payload),
    onSuccess: () => {
      toast('Message updated');
      setReplying(null);
      setReply('');
      qc.invalidateQueries({ queryKey: ['contacts'] });
    },
    onError: (err) => toast(err.message, 'error'),
  });

  const items = data?.items || [];

  return (
    <>
      <PageHeader
        title="Contact messages"
        subtitle={data?.pagination ? `${number(data.pagination.total)} messages` : 'Enquiries from the storefront contact form'}
        actions={
          <Select value={params.status || ''} onChange={(e) => update({ status: e.target.value })} className="!w-auto" aria-label="Filter messages">
            <option value="">All messages</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </Select>
        }
      />

      {error ? <ErrorBlock error={error} onRetry={refetch} />
        : isLoading ? <TableSkeleton rows={5} cols={4} />
        : items.length === 0 ? <EmptyState icon={FiMessageSquare} title="No messages" description="Enquiries from the contact form land here." />
        : (
          <div className="space-y-3">
            {items.map((m) => (
              <article key={m._id} className="card p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-ink-900">{m.name}</span>
                      <Badge tone={m.status === 'new' ? 'amber' : m.status === 'replied' ? 'green' : 'neutral'}>{m.status}</Badge>
                      <span className="text-2xs text-ink-400">{relativeTime(m.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 text-2xs text-ink-400">
                      {m.email}{m.phone ? ` · ${m.phone}` : ''}
                    </p>
                    {m.subject && <p className="mt-2 text-sm font-semibold text-ink-800">{m.subject}</p>}
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-600">{m.message}</p>

                    {m.adminReply && (
                      <div className="mt-3 rounded-xl bg-emerald-50 p-3">
                        <p className="text-2xs font-bold uppercase tracking-wide text-emerald-700">Your reply · {dateTime(m.repliedAt)}</p>
                        <p className="mt-1 whitespace-pre-wrap text-xs text-emerald-900">{m.adminReply}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-1.5">
                    <button type="button" onClick={() => { setReplying(m); setReply(m.adminReply || ''); }} className="btn-brand btn-sm gap-1.5">
                      <FiSend size={12} /> Reply
                    </button>
                    {m.status !== 'archived' && (
                      <button type="button" onClick={() => mutation.mutate({ id: m._id, payload: { status: 'archived' } })} className="btn-outline btn-sm">
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      <Pagination pagination={data?.pagination} onChange={setPage} />

      <Modal
        open={Boolean(replying)}
        onClose={() => setReplying(null)}
        title={`Reply to ${replying?.name || ''}`}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setReplying(null)} className="btn-outline">Cancel</button>
            <button
              type="button"
              disabled={!reply.trim() || mutation.isPending}
              onClick={() => mutation.mutate({ id: replying._id, payload: { status: 'replied', adminReply: reply } })}
              className="btn-primary gap-2"
            >
              {mutation.isPending ? <Spinner size={14} /> : <FiSend size={14} />} Send reply
            </button>
          </div>
        }
      >
        <p className="mb-3 rounded-xl bg-ink-50 p-3 text-xs leading-relaxed text-ink-600">{replying?.message}</p>
        <Field label="Your reply" hint={`Emailed to ${replying?.email}.`}>
          <Textarea rows={6} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write your reply…" />
        </Field>
      </Modal>
    </>
  );
}

export default Reviews;
