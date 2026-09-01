/** Coupons & offers — percent, flat and free-shipping codes with limits. */
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiEdit2, FiPercent, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../lib/api';
import { useDebounced, useListParams } from '../hooks';
import { useToast } from '../context/ToastContext';
import { dateLong, money, number } from '../lib/format';
import {
  Badge, CheckboxRow, ConfirmDialog, EmptyState, ErrorBlock, Field, Input, Modal, PageHeader,
  Pagination, SearchInput, Select, Spinner, TableSkeleton, Textarea,
} from '../components/Ui';

const DEFAULTS = {
  code: '', description: '', type: 'percent', value: 10, maxDiscount: '', minOrderValue: 0,
  usageLimit: '', perCustomerLimit: '', startsAt: '', expiresAt: '', isActive: true, showOnSite: true,
};

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function Coupons() {
  const qc = useQueryClient();
  const toast = useToast();
  const { params, update, setPage } = useListParams({ limit: 30 });

  const [search, setSearch] = useState(params.search || '');
  const debounced = useDebounced(search, 400);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const query = { ...params, search: debounced || undefined };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['coupons', query],
    queryFn: () => api.coupons(query),
    placeholderData: (prev) => prev,
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues: DEFAULTS });
  const type = watch('type');

  useEffect(() => {
    if (editing && editing !== 'new') {
      reset({
        ...DEFAULTS,
        ...editing,
        maxDiscount: editing.maxDiscount ?? '',
        usageLimit: editing.usageLimit ?? '',
        perCustomerLimit: editing.perCustomerLimit ?? '',
        startsAt: toDateInput(editing.startsAt),
        expiresAt: toDateInput(editing.expiresAt),
      });
    } else if (editing === 'new') reset(DEFAULTS);
  }, [editing, reset]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['coupons'] });

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) => (id ? api.updateCoupon(id, payload) : api.createCoupon(payload)),
    onSuccess: () => { toast('Coupon saved'); setEditing(null); invalidate(); },
    onError: (err) => toast(err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteCoupon(id),
    onSuccess: () => { toast('Coupon deleted'); setConfirm(null); invalidate(); },
    onError: (err) => toast(err.message, 'error'),
  });

  const onSubmit = (values) => {
    const payload = { ...values };
    ['maxDiscount', 'usageLimit', 'perCustomerLimit'].forEach((k) => {
      payload[k] = payload[k] === '' ? null : Number(payload[k]);
    });
    ['startsAt', 'expiresAt'].forEach((k) => { if (!payload[k]) payload[k] = null; });
    saveMutation.mutate({ id: editing !== 'new' ? editing._id : undefined, payload });
  };

  const items = data?.items || [];

  return (
    <>
      <PageHeader
        title="Coupons & offers"
        subtitle={data?.pagination ? `${number(data.pagination.total)} codes` : 'Percentage, flat and free-shipping discounts'}
        actions={<button type="button" onClick={() => setEditing('new')} className="btn-primary gap-2"><FiPlus size={15} /> Add coupon</button>}
      />

      <SearchInput value={search} onChange={(v) => { setSearch(v); update({ search: v }); }} placeholder="Search by code…" className="mb-4 max-w-sm" />

      {error ? (
        <ErrorBlock error={error} onRetry={refetch} />
      ) : isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FiPercent}
          title="No coupons yet"
          description="Create a welcome code to nudge first-time buyers."
          action={<button type="button" onClick={() => setEditing('new')} className="btn-primary gap-2"><FiPlus size={15} /> Add coupon</button>}
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Minimum order</th>
                <th>Used</th>
                <th>Valid until</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => {
                const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                return (
                  <tr key={c._id}>
                    <td>
                      <p className="font-mono text-sm font-bold text-ink-900">{c.code}</p>
                      {c.description && <p className="max-w-xs truncate text-2xs text-ink-400">{c.description}</p>}
                    </td>
                    <td className="text-sm font-semibold text-ink-800">
                      {c.type === 'percent' && `${c.value}%${c.maxDiscount ? ` (max ${money(c.maxDiscount)})` : ''}`}
                      {c.type === 'flat' && money(c.value)}
                      {c.type === 'free-shipping' && 'Free shipping'}
                    </td>
                    <td className="text-xs">{c.minOrderValue ? money(c.minOrderValue) : '—'}</td>
                    <td className="text-xs">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                    <td className="text-xs">{c.expiresAt ? dateLong(c.expiresAt) : 'No expiry'}</td>
                    <td>
                      <Badge tone={!c.isActive ? 'neutral' : expired ? 'rose' : 'green'}>
                        {!c.isActive ? 'Disabled' : expired ? 'Expired' : 'Active'}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => setEditing(c)} aria-label={`Edit ${c.code}`} className="btn-icon text-ink-400 hover:bg-ink-100 hover:text-ink-900">
                          <FiEdit2 size={14} />
                        </button>
                        <button type="button" onClick={() => setConfirm(c)} aria-label={`Delete ${c.code}`} className="btn-icon text-ink-400 hover:bg-rose-50 hover:text-rose-600">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={data?.pagination} onChange={setPage} />

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New coupon' : `Edit ${editing?.code || ''}`}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
            <button type="button" onClick={handleSubmit(onSubmit)} disabled={saveMutation.isPending} className="btn-primary gap-2">
              {saveMutation.isPending ? <Spinner size={14} /> : null} Save coupon
            </button>
          </div>
        }
      >
        <div className="grid gap-4">
          <Field label="Code" required error={errors.code} hint="Stored uppercase. Customers type it at checkout.">
            <Input {...register('code', { required: 'A code is required' })} error={errors.code} placeholder="WELCOME10" className="font-mono uppercase" />
          </Field>

          <Field label="Description" hint="Shown on the storefront offers list.">
            <Textarea rows={2} {...register('description')} placeholder="10% off your first order" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type" required>
              <Select {...register('type')}>
                <option value="percent">Percentage off</option>
                <option value="flat">Flat amount off</option>
                <option value="free-shipping">Free shipping</option>
              </Select>
            </Field>

            {type !== 'free-shipping' && (
              <Field label={type === 'percent' ? 'Percentage' : 'Amount (₹)'} required>
                <Input type="number" min={0} max={type === 'percent' ? 95 : undefined} {...register('value')} />
              </Field>
            )}

            {type === 'percent' && (
              <Field label="Maximum discount (₹)" hint="Caps the percentage. Blank = uncapped.">
                <Input type="number" min={0} {...register('maxDiscount')} />
              </Field>
            )}

            <Field label="Minimum order value (₹)">
              <Input type="number" min={0} {...register('minOrderValue')} />
            </Field>
            <Field label="Total usage limit" hint="Blank = unlimited.">
              <Input type="number" min={1} {...register('usageLimit')} />
            </Field>
            <Field label="Starts on" hint="Blank = live now.">
              <Input type="date" {...register('startsAt')} />
            </Field>
            <Field label="Expires on" hint="Blank = never expires.">
              <Input type="date" {...register('expiresAt')} />
            </Field>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <CheckboxRow label="Active" description="Can be redeemed at checkout" {...register('isActive')} />
            <CheckboxRow label="Advertise on the site" description="Show in the storefront offers list" {...register('showOnSite')} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        busy={deleteMutation.isPending}
        title={`Delete ${confirm?.code}?`}
        message="Customers using this code at checkout will get an error. This cannot be undone."
        onConfirm={() => deleteMutation.mutate(confirm._id)}
      />
    </>
  );
}
