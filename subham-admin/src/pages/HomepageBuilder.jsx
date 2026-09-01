/**
 * Homepage builder. Sections are reorderable (drag or arrows) and each carries
 * its own title, layout, limit and scope — the storefront's /api/home walks
 * this list in order, so nothing here needs a code change to take effect.
 */
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Reorder } from 'framer-motion';
import {
  FiArrowDown, FiArrowUp, FiEdit2, FiLayout, FiMove, FiPlus, FiSave, FiTrash2,
} from 'react-icons/fi';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';
import { HOME_SECTION_TYPES } from '../lib/format';
import {
  Badge, CheckboxRow, ConfirmDialog, EmptyState, ErrorBlock, Field, Input, LoadingBlock, Modal,
  PageHeader, Select, Spinner, Toggle,
} from '../components/Ui';

const DEFAULTS = {
  key: '', type: 'latest-books', title: '', subtitle: '', viewAllUrl: '',
  layout: 'carousel', limit: 12, categorySlug: '', subCategorySlug: '', productType: '',
  sort: 'newest', bannerPlacement: '', theme: 'default', isActive: true,
};

const NEEDS_SCOPE = (type) =>
  !['hero-slider', 'featured-categories', 'popular-subcategories', 'testimonials', 'newsletter', 'banner-strip'].includes(type);

export default function HomepageBuilder() {
  const qc = useQueryClient();
  const toast = useToast();

  const [order, setOrder] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['home-sections'], queryFn: () => api.homeSections() });
  const { data: categories } = useQuery({ queryKey: ['categories', 'all'], queryFn: () => api.categories({ limit: 100 }) });

  useEffect(() => { if (data) { setOrder(data); setDirty(false); } }, [data]);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues: DEFAULTS });
  const type = watch('type');

  useEffect(() => {
    if (editing && editing !== 'new') reset({ ...DEFAULTS, ...editing });
    else if (editing === 'new') reset(DEFAULTS);
  }, [editing, reset]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['home-sections'] });

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) => (id ? api.updateHomeSection(id, payload) : api.createHomeSection(payload)),
    onSuccess: () => { toast('Section saved'); setEditing(null); invalidate(); },
    onError: (err) => toast(err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteHomeSection(id),
    onSuccess: () => { toast('Section removed'); setConfirm(null); invalidate(); },
    onError: (err) => toast(err.message, 'error'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.updateHomeSection(id, { isActive }),
    onSuccess: invalidate,
    onError: (err) => toast(err.message, 'error'),
  });

  const reorderMutation = useMutation({
    mutationFn: () => api.reorderHomeSections(order.map((s, i) => ({ id: s._id, order: i + 1 }))),
    onSuccess: () => { toast('Homepage order saved'); setDirty(false); invalidate(); },
    onError: (err) => toast(err.message, 'error'),
  });

  const move = (index, direction) => {
    const next = [...order];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    setDirty(true);
  };

  const onSubmit = (values) => {
    const payload = { ...values, limit: Number(values.limit) || 12 };
    if (!payload.key) payload.key = `${payload.type}-${Date.now().toString(36)}`;
    saveMutation.mutate({ id: editing !== 'new' ? editing._id : undefined, payload });
  };

  if (isLoading) return <LoadingBlock label="Loading homepage layout…" />;
  if (error) return <ErrorBlock error={error} onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="Homepage builder"
        subtitle="Drag to reorder. The storefront renders these sections top to bottom."
        actions={
          <>
            {dirty && (
              <button type="button" onClick={() => reorderMutation.mutate()} disabled={reorderMutation.isPending} className="btn-brand gap-2">
                {reorderMutation.isPending ? <Spinner size={14} /> : <FiSave size={15} />} Save order
              </button>
            )}
            <button type="button" onClick={() => setEditing('new')} className="btn-primary gap-2"><FiPlus size={15} /> Add section</button>
          </>
        }
      />

      {order.length === 0 ? (
        <EmptyState
          icon={FiLayout}
          title="No homepage sections"
          description="Add a hero slider and a few product rails to build the homepage."
          action={<button type="button" onClick={() => setEditing('new')} className="btn-primary gap-2"><FiPlus size={15} /> Add section</button>}
        />
      ) : (
        <Reorder.Group
          axis="y"
          values={order}
          onReorder={(next) => { setOrder(next); setDirty(true); }}
          className="space-y-2.5"
        >
          {order.map((section, index) => (
            <Reorder.Item key={section._id} value={section} className="card flex items-center gap-3.5 p-4">
              <span className="cursor-grab text-ink-300 active:cursor-grabbing" title="Drag to reorder"><FiMove size={16} /></span>

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-2xs font-bold text-ink-600">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink-900">
                  {section.title || <span className="text-ink-400">Untitled section</span>}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-2xs text-ink-400">
                  <Badge tone="brand">{section.type}</Badge>
                  <span>{section.layout}</span>
                  {section.limit ? <span>· up to {section.limit}</span> : null}
                  {section.categorySlug ? <span>· {section.categorySlug}</span> : null}
                  {section.products?.length ? <span>· {section.products.length} hand-picked</span> : null}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" className="btn-icon h-8 w-8 text-ink-400 hover:bg-ink-100 disabled:opacity-25">
                  <FiArrowUp size={14} />
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === order.length - 1} aria-label="Move down" className="btn-icon h-8 w-8 text-ink-400 hover:bg-ink-100 disabled:opacity-25">
                  <FiArrowDown size={14} />
                </button>
                <Toggle checked={Boolean(section.isActive)} label={`Toggle ${section.title}`} onChange={(v) => toggleMutation.mutate({ id: section._id, isActive: v })} />
                <button type="button" onClick={() => setEditing(section)} aria-label="Edit section" className="btn-icon h-8 w-8 text-ink-400 hover:bg-ink-100 hover:text-ink-900">
                  <FiEdit2 size={14} />
                </button>
                <button type="button" onClick={() => setConfirm(section)} aria-label="Delete section" className="btn-icon h-8 w-8 text-ink-400 hover:bg-rose-50 hover:text-rose-600">
                  <FiTrash2 size={14} />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New homepage section' : `Edit ${editing?.title || 'section'}`}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
            <button type="button" onClick={handleSubmit(onSubmit)} disabled={saveMutation.isPending} className="btn-primary gap-2">
              {saveMutation.isPending ? <Spinner size={14} /> : null} Save section
            </button>
          </div>
        }
      >
        <div className="grid gap-4">
          <Field label="Section type" required>
            <Select {...register('type')}>
              {HOME_SECTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>

          <Field label="Key" hint="Unique identifier. Generated automatically if left blank." error={errors.key}>
            <Input {...register('key')} placeholder="latest-books" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Heading"><Input {...register('title')} placeholder="Just landed" /></Field>
            <Field label="Sub-heading"><Input {...register('subtitle')} placeholder="The newest titles on our shelves" /></Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Layout">
              <Select {...register('layout')}>
                <option value="carousel">Carousel</option>
                <option value="grid">Grid</option>
                <option value="banner">Banner</option>
                <option value="masonry">Masonry</option>
              </Select>
            </Field>
            <Field label="Max items">
              <Input type="number" min={1} max={40} {...register('limit')} />
            </Field>
            <Field label="Theme">
              <Select {...register('theme')}>
                <option value="default">Default</option>
                <option value="tinted">Tinted background</option>
                <option value="dark">Dark</option>
              </Select>
            </Field>
          </div>

          <Field label="“View all” link" hint="Where the section header link points.">
            <Input {...register('viewAllUrl')} placeholder="/shop?sort=newest" />
          </Field>

          {NEEDS_SCOPE(type) && (
            <div className="grid gap-4 rounded-xl bg-ink-50 p-4 sm:grid-cols-2">
              <p className="text-2xs font-bold uppercase tracking-wide text-ink-400 sm:col-span-2">Scope & sorting</p>
              <Field label="Limit to category">
                <Select {...register('categorySlug')}>
                  <option value="">Any category</option>
                  {(categories?.items || []).map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Limit to product type">
                <Select {...register('productType')}>
                  <option value="">Any type</option>
                  <option value="book">Book</option>
                  <option value="ebook">Ebook</option>
                  <option value="stationery">Stationery</option>
                  <option value="book+ebook">Book + ebook</option>
                </Select>
              </Field>
              <Field label="Sort by" className="sm:col-span-2">
                <Select {...register('sort')}>
                  <option value="newest">Newest first</option>
                  <option value="best-selling">Best selling</option>
                  <option value="rating">Top rated</option>
                  <option value="discount">Biggest discount</option>
                  <option value="popular">Most viewed</option>
                  <option value="price-asc">Price low → high</option>
                </Select>
              </Field>
            </div>
          )}

          {type === 'banner-strip' && (
            <Field label="Banner placement to pull from" hint="Matches the placement on your banners.">
              <Select {...register('bannerPlacement')}>
                <option value="offer">offer</option>
                <option value="strip">strip</option>
                <option value="desktop">desktop</option>
              </Select>
            </Field>
          )}

          <CheckboxRow label="Active" description="Uncheck to hide the section from the homepage" {...register('isActive')} />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        busy={deleteMutation.isPending}
        title={`Remove “${confirm?.title || confirm?.type}”?`}
        message="The section disappears from the homepage. Your products and banners are untouched."
        confirmLabel="Remove section"
        onConfirm={() => deleteMutation.mutate(confirm._id)}
      />
    </>
  );
}
