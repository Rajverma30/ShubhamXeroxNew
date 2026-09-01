/**
 * Categories and sub categories. Both are managed with the same modal-driven
 * table, since the fields differ only by the parent-category selector.
 */
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiEdit2, FiGrid, FiLayers, FiPlus, FiTrash2 } from 'react-icons/fi';
import api, { toFormData } from '../lib/api';
import { useDebounced, useListParams } from '../hooks';
import { useToast } from '../context/ToastContext';
import { imgUrl, number } from '../lib/format';
import { FileDropzone } from '../components/ImageDropzone';
import RichTextEditor from '../components/RichTextEditor';
import {
  Badge, CheckboxRow, ConfirmDialog, EmptyState, ErrorBlock, Field, Input, Modal, PageHeader,
  Pagination, SearchInput, Select, Spinner, TableSkeleton, Textarea, Toggle,
} from '../components/Ui';

const DEFAULTS = {
  name: '', shortDescription: '', icon: '', color: '#4f46e5', order: 0,
  isActive: true, isFeatured: false, showOnHomepage: true, isPopular: false, category: '',
  seo: { metaTitle: '', metaDescription: '', metaKeywords: '' },
};

function TaxonomyManager({ kind }) {
  const isCategory = kind === 'category';
  const qc = useQueryClient();
  const toast = useToast();
  const { params, update, setPage } = useListParams({ limit: 50 });

  const [search, setSearch] = useState(params.search || '');
  const debounced = useDebounced(search, 400);
  const [editing, setEditing] = useState(null); // null | 'new' | doc
  const [confirm, setConfirm] = useState(null);
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState({ image: null, banner: null });

  const listKey = isCategory ? 'categories' : 'subcategories';
  const query = { ...params, search: debounced || undefined };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [listKey, query],
    queryFn: () => (isCategory ? api.categories(query) : api.subCategories(query)),
    placeholderData: (prev) => prev,
  });

  const { data: parents } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => api.categories({ limit: 100 }),
    enabled: !isCategory,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: DEFAULTS });

  useEffect(() => {
    if (editing && editing !== 'new') {
      reset({
        ...DEFAULTS,
        ...editing,
        category: editing.category?._id || editing.category || '',
        icon: typeof editing.icon === 'string' ? editing.icon : '',
        seo: {
          metaTitle: editing.seo?.metaTitle || '',
          metaDescription: editing.seo?.metaDescription || '',
          metaKeywords: (editing.seo?.metaKeywords || []).join(', '),
        },
      });
      setDescription(editing.description || '');
    } else if (editing === 'new') {
      reset(DEFAULTS);
      setDescription('');
    }
    setFiles({ image: null, banner: null });
  }, [editing, reset]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [listKey] });
    qc.invalidateQueries({ queryKey: ['categories', 'all'] });
  };

  const saveMutation = useMutation({
    mutationFn: ({ id, fd }) => {
      if (isCategory) return id ? api.updateCategory(id, fd) : api.createCategory(fd);
      return id ? api.updateSubCategory(id, fd) : api.createSubCategory(fd);
    },
    onSuccess: () => { toast(editing === 'new' ? 'Created' : 'Saved'); setEditing(null); invalidate(); },
    onError: (err) => toast(err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => (isCategory ? api.deleteCategory(id) : api.deleteSubCategory(id)),
    onSuccess: () => { toast('Deleted'); setConfirm(null); invalidate(); },
    onError: (err) => toast(err.message, 'error'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => {
      const fd = toFormData({ isActive });
      return isCategory ? api.updateCategory(id, fd) : api.updateSubCategory(id, fd);
    },
    onSuccess: invalidate,
    onError: (err) => toast(err.message, 'error'),
  });

  const onSubmit = (values) => {
    const payload = {
      ...values,
      description,
      seo: { ...values.seo, metaKeywords: String(values.seo?.metaKeywords || '').split(',').map((s) => s.trim()).filter(Boolean) },
      image: files.image,
      banner: files.banner,
    };
    if (isCategory) delete payload.category;
    saveMutation.mutate({
      id: editing !== 'new' ? editing._id : undefined,
      fd: toFormData(payload, ['image', 'banner']),
    });
  };

  const items = data?.items || [];

  return (
    <>
      <PageHeader
        title={isCategory ? 'Categories' : 'Sub categories'}
        subtitle={
          data?.pagination
            ? `${number(data.pagination.total)} ${isCategory ? 'categories' : 'sub categories'}`
            : isCategory
              ? 'Exam Books, School Books, Stationery…'
              : 'SSC, UPSC, Class 8, Pen, Notebook…'
        }
        actions={
          <button type="button" onClick={() => setEditing('new')} className="btn-primary gap-2">
            <FiPlus size={15} /> Add {isCategory ? 'category' : 'sub category'}
          </button>
        }
      />

      <div className="mb-4 grid gap-2.5 sm:grid-cols-3">
        <SearchInput value={search} onChange={(v) => { setSearch(v); update({ search: v }); }} placeholder="Search by name…" className="sm:col-span-2" />
        {!isCategory && (
          <Select value={params.category || ''} onChange={(e) => update({ category: e.target.value })} aria-label="Filter by category">
            <option value="">All categories</option>
            {(parents?.items || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </Select>
        )}
      </div>

      {error ? (
        <ErrorBlock error={error} onRetry={refetch} />
      ) : isLoading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={isCategory ? FiGrid : FiLayers}
          title={`No ${isCategory ? 'categories' : 'sub categories'} yet`}
          description="Create one to start organising your catalogue."
          action={<button type="button" onClick={() => setEditing('new')} className="btn-primary gap-2"><FiPlus size={15} /> Add now</button>}
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                {!isCategory && <th>Category</th>}
                <th>Products</th>
                <th>Order</th>
                <th>{isCategory ? 'Featured' : 'Popular'}</th>
                <th>Active</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img
                        src={imgUrl(row.image, 'thumb')}
                        alt=""
                        loading="lazy"
                        className="h-10 w-10 shrink-0 rounded-lg border border-ink-100 bg-ink-50 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink-900">{row.name}</p>
                        <p className="truncate text-2xs text-ink-400">/{row.slug}</p>
                      </div>
                    </div>
                  </td>
                  {!isCategory && <td className="text-xs">{row.category?.name || row.categorySlug}</td>}
                  <td><Badge>{row.productCount || 0}</Badge></td>
                  <td className="text-xs tabular-nums">{row.order}</td>
                  <td>
                    {(isCategory ? row.isFeatured : row.isPopular)
                      ? <Badge tone="green">Yes</Badge>
                      : <span className="text-2xs text-ink-300">—</span>}
                  </td>
                  <td>
                    <Toggle
                      checked={Boolean(row.isActive)}
                      label={`Toggle ${row.name}`}
                      onChange={(v) => toggleMutation.mutate({ id: row._id, isActive: v })}
                    />
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => setEditing(row)} aria-label={`Edit ${row.name}`} className="btn-icon text-ink-400 hover:bg-ink-100 hover:text-ink-900">
                        <FiEdit2 size={14} />
                      </button>
                      <button type="button" onClick={() => setConfirm(row)} aria-label={`Delete ${row.name}`} className="btn-icon text-ink-400 hover:bg-rose-50 hover:text-rose-600">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={data?.pagination} onChange={setPage} />

      {/* editor modal */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        size="lg"
        title={editing === 'new' ? `New ${isCategory ? 'category' : 'sub category'}` : `Edit ${editing?.name || ''}`}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
            <button type="button" onClick={handleSubmit(onSubmit)} disabled={saveMutation.isPending} className="btn-primary gap-2">
              {saveMutation.isPending ? <Spinner size={14} /> : null} Save
            </button>
          </div>
        }
      >
        <div className="grid gap-4">
          <Field label="Name" required error={errors.name}>
            <Input {...register('name', { required: 'Name is required' })} error={errors.name} />
          </Field>

          {!isCategory && (
            <Field label="Parent category" required error={errors.category}>
              <Select {...register('category', { required: 'Choose a parent category' })} error={errors.category}>
                <option value="">Select a category</option>
                {(parents?.items || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </Select>
            </Field>
          )}

          <Field label="Short description" hint="Shown under the name on category tiles and banners.">
            <Textarea rows={2} maxLength={220} {...register('shortDescription')} />
          </Field>

          <Field label="Full description">
            <RichTextEditor value={description} onChange={setDescription} placeholder="Optional longer copy shown at the bottom of the category page." />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <FileDropzone
              file={files.image}
              onChange={(f) => setFiles((s) => ({ ...s, image: f }))}
              label="Square image (tiles)"
              hint="Recommended 900 × 900"
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
              existingUrl={editing !== 'new' ? editing?.image?.url : undefined}
            />
            <FileDropzone
              file={files.banner}
              onChange={(f) => setFiles((s) => ({ ...s, banner: f }))}
              label="Wide banner (page header)"
              hint="Recommended 1920 × 760"
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
              existingUrl={editing !== 'new' ? editing?.banner?.url : undefined}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {isCategory && (
              <>
                <Field label="Icon name" hint="Any react-icons Fi* name, e.g. FiAward.">
                  <Input {...register('icon')} placeholder="FiAward" />
                </Field>
                <Field label="Accent colour">
                  <Input type="color" {...register('color')} className="h-11 p-1" />
                </Field>
              </>
            )}
            <Field label="Sort order" hint="Lower numbers appear first.">
              <Input type="number" {...register('order')} />
            </Field>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <CheckboxRow label="Active" description="Visible on the storefront" {...register('isActive')} />
            {isCategory ? (
              <>
                <CheckboxRow label="Featured" description="Highlight in nav and menus" {...register('isFeatured')} />
                <CheckboxRow label="Show on homepage" description="Include in the category grid" {...register('showOnHomepage')} />
              </>
            ) : (
              <CheckboxRow label="Popular" description="Include in “Popular collections”" {...register('isPopular')} />
            )}
          </div>

          <div className="grid gap-4 rounded-xl bg-ink-50 p-4">
            <p className="text-2xs font-bold uppercase tracking-wide text-ink-400">SEO</p>
            <Field label="Meta title"><Input maxLength={160} {...register('seo.metaTitle')} /></Field>
            <Field label="Meta description"><Textarea rows={2} maxLength={320} {...register('seo.metaDescription')} /></Field>
            <Field label="Meta keywords" hint="Comma separated."><Input {...register('seo.metaKeywords')} /></Field>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        busy={deleteMutation.isPending}
        title={`Delete “${confirm?.name}”?`}
        message={
          isCategory
            ? 'Its sub categories will be removed too. Products must be moved or deleted first — the API will refuse if any still use it.'
            : 'Products must be moved or deleted first — the API will refuse if any still use it.'
        }
        onConfirm={() => deleteMutation.mutate(confirm._id)}
      />
    </>
  );
}

export const Categories = () => <TaxonomyManager kind="category" />;
export const SubCategories = () => <TaxonomyManager kind="subcategory" />;

export default Categories;
