/**
 * Banner management. One banner can carry separate desktop / tablet / mobile
 * artwork, a CTA pair, a priority and an optional schedule window.
 */
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiEdit2, FiImage, FiPlus, FiTrash2 } from 'react-icons/fi';
import api, { toFormData } from '../lib/api';
import { useListParams } from '../hooks';
import { useToast } from '../context/ToastContext';
import { BANNER_PLACEMENTS, dateLong, imgUrl, number } from '../lib/format';
import { FileDropzone } from '../components/ImageDropzone';
import {
  Badge, CheckboxRow, ConfirmDialog, EmptyState, ErrorBlock, Field, Input, Modal, PageHeader,
  Pagination, SectionCard, Select, Spinner, TableSkeleton, Textarea, Toggle,
} from '../components/Ui';

const DEFAULTS = {
  placement: 'hero', eyebrow: '', title: '', subtitle: '', description: '',
  buttonText: '', buttonUrl: '', secondaryButtonText: '', secondaryButtonUrl: '',
  textAlign: 'left', theme: 'dark', overlayOpacity: 0.35,
  priority: 0, isActive: true, startsAt: '', endsAt: '',
};

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function Banners() {
  const qc = useQueryClient();
  const toast = useToast();
  const { params, update, setPage } = useListParams({ limit: 30 });

  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [files, setFiles] = useState({ image: null, tabletImage: null, mobileImage: null });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['banners', params],
    queryFn: () => api.banners(params),
    placeholderData: (prev) => prev,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: DEFAULTS });

  useEffect(() => {
    if (editing && editing !== 'new') {
      reset({ ...DEFAULTS, ...editing, startsAt: toDateInput(editing.startsAt), endsAt: toDateInput(editing.endsAt) });
    } else if (editing === 'new') {
      reset(DEFAULTS);
    }
    setFiles({ image: null, tabletImage: null, mobileImage: null });
  }, [editing, reset]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['banners'] });

  const saveMutation = useMutation({
    mutationFn: ({ id, fd }) => (id ? api.updateBanner(id, fd) : api.createBanner(fd)),
    onSuccess: () => { toast('Banner saved'); setEditing(null); invalidate(); },
    onError: (err) => toast(err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteBanner(id),
    onSuccess: () => { toast('Banner deleted'); setConfirm(null); invalidate(); },
    onError: (err) => toast(err.message, 'error'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.updateBanner(id, toFormData({ isActive })),
    onSuccess: invalidate,
    onError: (err) => toast(err.message, 'error'),
  });

  const onSubmit = (values) => {
    const payload = { ...values, ...files };
    if (!payload.startsAt) payload.startsAt = '';
    if (!payload.endsAt) payload.endsAt = '';
    saveMutation.mutate({
      id: editing !== 'new' ? editing._id : undefined,
      fd: toFormData(payload, ['image', 'tabletImage', 'mobileImage']),
    });
  };

  const items = data?.items || [];

  return (
    <>
      <PageHeader
        title="Banners"
        subtitle={data?.pagination ? `${number(data.pagination.total)} banners across all placements` : 'Hero slides, offer strips, popups and category headers'}
        actions={<button type="button" onClick={() => setEditing('new')} className="btn-primary gap-2"><FiPlus size={15} /> Add banner</button>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => update({ placement: '' })}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
            !params.placement ? 'border-transparent bg-ink-900 text-white' : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
          }`}
        >
          All
        </button>
        {BANNER_PLACEMENTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => update({ placement: params.placement === p ? '' : p })}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              params.placement === p ? 'border-transparent bg-ink-900 text-white' : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorBlock error={error} onRetry={refetch} />
      ) : isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FiImage}
          title="No banners yet"
          description="Create a hero slide to fill the top of the homepage."
          action={<button type="button" onClick={() => setEditing('new')} className="btn-primary gap-2"><FiPlus size={15} /> Add banner</button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((b) => (
            <article key={b._id} className="card overflow-hidden">
              <div className="relative aspect-[16/7] bg-ink-100">
                {b.image?.url && <img src={imgUrl(b.image, 'card')} alt={b.title || ''} loading="lazy" className="h-full w-full object-cover" />}
                <span className="absolute left-2.5 top-2.5"><Badge tone="dark">{b.placement}</Badge></span>
                {!b.isActive && (
                  <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-bold text-ink-500">Inactive</span>
                )}
              </div>

              <div className="p-4">
                <p className="truncate text-sm font-bold text-ink-900">{b.title || <span className="text-ink-400">Untitled</span>}</p>
                {b.subtitle && <p className="mt-0.5 line-clamp-2 text-2xs text-ink-500">{b.subtitle}</p>}

                <div className="mt-3 flex flex-wrap items-center gap-2 text-2xs text-ink-400">
                  <span>Priority {b.priority}</span>
                  {b.clicks > 0 && <span>· {b.clicks} clicks</span>}
                  {(b.startsAt || b.endsAt) && (
                    <span>· {b.startsAt ? dateLong(b.startsAt) : 'now'} → {b.endsAt ? dateLong(b.endsAt) : 'always'}</span>
                  )}
                </div>

                <div className="mt-3.5 flex items-center gap-2 border-t border-ink-50 pt-3.5">
                  <Toggle checked={Boolean(b.isActive)} label={`Toggle ${b.title}`} onChange={(v) => toggleMutation.mutate({ id: b._id, isActive: v })} />
                  <span className="text-2xs text-ink-400">{b.isActive ? 'Live' : 'Hidden'}</span>
                  <div className="ml-auto flex gap-1">
                    <button type="button" onClick={() => setEditing(b)} aria-label="Edit banner" className="btn-icon text-ink-400 hover:bg-ink-100 hover:text-ink-900">
                      <FiEdit2 size={14} />
                    </button>
                    <button type="button" onClick={() => setConfirm(b)} aria-label="Delete banner" className="btn-icon text-ink-400 hover:bg-rose-50 hover:text-rose-600">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination pagination={data?.pagination} onChange={setPage} />

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        size="lg"
        title={editing === 'new' ? 'New banner' : `Edit ${editing?.title || 'banner'}`}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
            <button type="button" onClick={handleSubmit(onSubmit)} disabled={saveMutation.isPending} className="btn-primary gap-2">
              {saveMutation.isPending ? <Spinner size={14} /> : null} Save banner
            </button>
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Placement" required>
              <Select {...register('placement')}>
                {BANNER_PLACEMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
            <Field label="Priority" hint="Higher numbers appear first.">
              <Input type="number" {...register('priority')} />
            </Field>
          </div>

          <Field label="Eyebrow" hint="Small label above the title, e.g. “New session 2026”.">
            <Input {...register('eyebrow')} />
          </Field>

          <Field label="Title" required error={errors.title}>
            <Input {...register('title', { required: 'A title is required' })} error={errors.title} />
          </Field>

          <Field label="Subtitle">
            <Textarea rows={2} {...register('subtitle')} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Button text"><Input {...register('buttonText')} placeholder="Shop exam books" /></Field>
            <Field label="Button URL"><Input {...register('buttonUrl')} placeholder="/category/exam-books" /></Field>
            <Field label="Secondary button text"><Input {...register('secondaryButtonText')} /></Field>
            <Field label="Secondary button URL"><Input {...register('secondaryButtonUrl')} /></Field>
          </div>

          <SectionCard title="Artwork" description="Desktop is required; tablet and mobile fall back to it." className="!p-4">
            <div className="grid gap-3.5">
              <FileDropzone
                file={files.image}
                onChange={(f) => setFiles((s) => ({ ...s, image: f }))}
                label="Desktop (1920 × 760)"
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                existingUrl={editing !== 'new' ? editing?.image?.url : undefined}
              />
              <div className="grid gap-3.5 sm:grid-cols-2">
                <FileDropzone
                  file={files.tabletImage}
                  onChange={(f) => setFiles((s) => ({ ...s, tabletImage: f }))}
                  label="Tablet (1280 × 720)"
                  accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                  existingUrl={editing !== 'new' ? editing?.tabletImage?.url : undefined}
                />
                <FileDropzone
                  file={files.mobileImage}
                  onChange={(f) => setFiles((s) => ({ ...s, mobileImage: f }))}
                  label="Mobile (900 × 900)"
                  accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                  existingUrl={editing !== 'new' ? editing?.mobileImage?.url : undefined}
                />
              </div>
            </div>
          </SectionCard>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Text alignment">
              <Select {...register('textAlign')}>
                <option value="left">Left</option>
                <option value="center">Centre</option>
                <option value="right">Right</option>
              </Select>
            </Field>
            <Field label="Text theme" hint="Dark = white text over a dark scrim.">
              <Select {...register('theme')}>
                <option value="dark">Dark background</option>
                <option value="light">Light background</option>
              </Select>
            </Field>
            <Field label="Overlay opacity">
              <Input type="number" step="0.05" min={0} max={1} {...register('overlayOpacity')} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts on" hint="Leave blank to go live immediately.">
              <Input type="date" {...register('startsAt')} />
            </Field>
            <Field label="Ends on" hint="Leave blank to run indefinitely.">
              <Input type="date" {...register('endsAt')} />
            </Field>
          </div>

          <CheckboxRow label="Active" description="Uncheck to hide without deleting" {...register('isActive')} />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        busy={deleteMutation.isPending}
        title={`Delete “${confirm?.title || 'banner'}”?`}
        message="The banner and its artwork references will be removed. This cannot be undone."
        onConfirm={() => deleteMutation.mutate(confirm._id)}
      />
    </>
  );
}
