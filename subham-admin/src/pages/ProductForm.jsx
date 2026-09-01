/**
 * Create / edit a product (book, ebook, stationery or book + free ebook).
 *
 * Key behaviour: if no images are uploaded or kept, the backend rasterises
 * the first 5 pages of the attached PDF and uses those as the gallery. The
 * form surfaces that rule explicitly so it's never a surprise.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FiArrowLeft, FiDownloadCloud, FiFileText, FiInfo, FiPlus, FiSave, FiTrash2, FiX,
} from 'react-icons/fi';
import api, { toFormData } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { PRODUCT_TYPES } from '../lib/format';
import ImageDropzone, { FileDropzone } from '../components/ImageDropzone';
import RichTextEditor from '../components/RichTextEditor';
import {
  CheckboxRow, Field, Input, LoadingBlock, PageHeader, SectionCard, Select, Spinner, Textarea,
} from '../components/Ui';

const DEFAULTS = {
  title: '', sku: '', type: 'book',
  author: '', publisher: '', isbn: '', edition: '', language: ['English'], pages: '', publishYear: '', binding: '',
  brand: '', color: '', material: '',
  price: '', salePrice: '', discountPercent: 0, stock: 0, lowStockThreshold: 5, taxPercent: 0,
  weight: 0.3,
  dimensions: { length: 22, breadth: 15, height: 2, unit: 'cm' },
  shortDescription: '', description: '',
  category: '', subCategory: '',
  tags: '', highlights: '',
  specifications: [],
  isFeatured: false, isTrending: false, isBestSeller: false, isLatest: false, isNewArrival: false,
  isActive: true, isHidden: false, allowBackorder: false,
  seo: { metaTitle: '', metaDescription: '', metaKeywords: '' },
  ebook: { isFree: true, allowPreview: true, previewPages: 5 },
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id) && id !== 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();

  const [images, setImages] = useState([]);       // newly selected File[]
  const [keepImages, setKeepImages] = useState(null); // urls of saved images to keep
  const [pdfFile, setPdfFile] = useState(null);
  const [ebookFile, setEbookFile] = useState(null);
  const [description, setDescription] = useState('');

  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors, isSubmitting } } =
    useForm({ defaultValues: DEFAULTS });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ control, name: 'specifications' });

  const type = watch('type');
  const categoryId = watch('category');
  const price = watch('price');
  const discountPercent = watch('discountPercent');

  const { data: categories } = useQuery({ queryKey: ['categories', 'all'], queryFn: () => api.categories({ limit: 100 }) });
  const { data: subCategories } = useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: () => api.subCategories({ category: categoryId, limit: 200 }),
    enabled: Boolean(categoryId),
  });

  const { data: existing, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.product(id),
    enabled: isEdit,
  });

  /* hydrate the form when editing */
  useEffect(() => {
    if (!existing) return;
    reset({
      ...DEFAULTS,
      ...existing,
      category: existing.category?._id || existing.category || '',
      subCategory: existing.subCategory?._id || existing.subCategory || '',
      tags: (existing.tags || []).join(', '),
      highlights: (existing.highlights || []).join('\n'),
      specifications: existing.specifications || [],
      seo: {
        metaTitle: existing.seo?.metaTitle || '',
        metaDescription: existing.seo?.metaDescription || '',
        metaKeywords: (existing.seo?.metaKeywords || []).join(', '),
      },
      ebook: {
        isFree: existing.ebook?.isFree ?? true,
        allowPreview: existing.ebook?.allowPreview ?? true,
        previewPages: existing.ebook?.previewPages ?? 5,
      },
      salePrice: existing.salePrice ?? '',
      pages: existing.pages ?? '',
      publishYear: existing.publishYear ?? '',
    });
    setDescription(existing.description || '');
    setKeepImages((existing.images || []).map((i) => i.url));
  }, [existing, reset]);

  const savedImages = useMemo(
    () => (existing?.images || []).filter((i) => !keepImages || keepImages.includes(i.url)),
    [existing, keepImages],
  );

  const effectivePrice = useMemo(() => {
    const p = Number(price) || 0;
    const d = Number(discountPercent) || 0;
    return Math.round(p * (1 - d / 100));
  }, [price, discountPercent]);

  /* will the backend generate images from the PDF? */
  const willUsePdfImages =
    images.length === 0 && savedImages.length === 0 && (Boolean(pdfFile) || Boolean(ebookFile) || Boolean(existing?.sourcePdf?.url));

  const mutation = useMutation({
    mutationFn: (fd) => (isEdit ? api.updateProduct(id, fd) : api.createProduct(fd)),
    onSuccess: (doc) => {
      toast(isEdit ? 'Product updated' : 'Product created');
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product', id] });
      if (!isEdit) navigate(`/products/${doc._id}`, { replace: true });
      setImages([]);
      setPdfFile(null);
      setEbookFile(null);
    },
    onError: (err) => {
      toast(err.message, 'error');
      err.details?.forEach((d) => toast(`${d.field}: ${d.message}`, 'error'));
    },
  });

  const onSubmit = (values) => {
    const payload = {
      ...values,
      description,
      tags: String(values.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
      highlights: String(values.highlights || '').split('\n').map((t) => t.trim()).filter(Boolean),
      seo: {
        ...values.seo,
        metaKeywords: String(values.seo?.metaKeywords || '').split(',').map((t) => t.trim()).filter(Boolean),
      },
      images,
      pdf: pdfFile,
      ebook: ebookFile,
    };

    // Tell the API which saved images to keep (edit flow only).
    if (isEdit && keepImages) payload.keepImages = keepImages;

    // Empty strings confuse Mongoose casting for optional numbers.
    ['salePrice', 'pages', 'publishYear'].forEach((k) => { if (payload[k] === '') delete payload[k]; });
    if (!payload.subCategory) delete payload.subCategory;

    // `ebook` is both a file field and an object of settings — send the
    // settings under a distinct key so multer doesn't collide with them.
    payload.ebookSettings = values.ebook;
    delete payload.ebook;
    payload.ebook = ebookFile;

    mutation.mutate(toFormData(payload, ['images', 'pdf', 'ebook']));
  };

  if (isEdit && isLoading) return <LoadingBlock label="Loading product…" />;

  const isBookish = type === 'book' || type === 'book+ebook' || type === 'ebook';

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        breadcrumb={<Link to="/products" className="hover:text-ink-700">← Products</Link>}
        title={isEdit ? 'Edit product' : 'New product'}
        subtitle={isEdit ? existing?.title : 'Add a book, ebook, stationery item, or a book bundled with a free ebook'}
        actions={
          <>
            <Link to="/products" className="btn-outline gap-2"><FiArrowLeft size={15} /> Cancel</Link>
            <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary gap-2">
              {mutation.isPending ? <Spinner size={15} /> : <FiSave size={15} />}
              {isEdit ? 'Save changes' : 'Create product'}
            </button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* ── main column ── */}
        <div className="space-y-5">
          <SectionCard title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" required error={errors.title} className="sm:col-span-2">
                <Input {...register('title', { required: 'Title is required' })} error={errors.title} placeholder="e.g. SSC CGL Tier-I Master Practice Sets" />
              </Field>

              <Field label="Product type" required>
                <Select {...register('type')}>
                  {PRODUCT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              </Field>

              <Field label="SKU" hint="Left blank, one is generated automatically.">
                <Input {...register('sku')} placeholder="SX-BK-0001" />
              </Field>

              <Field label="Category" required error={errors.category}>
                <Select {...register('category', { required: 'Choose a category' })} error={errors.category}>
                  <option value="">Select a category</option>
                  {(categories?.items || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </Select>
              </Field>

              <Field label="Sub category" hint={categoryId ? undefined : 'Pick a category first.'}>
                <Select {...register('subCategory')} disabled={!categoryId}>
                  <option value="">None</option>
                  {(subCategories?.items || []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </Select>
              </Field>

              <Field label="Short description" hint="Shown on cards and in search results. Max 320 characters." className="sm:col-span-2">
                <Textarea rows={2} maxLength={320} {...register('shortDescription')} placeholder="One or two lines that sell the product." />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Description">
            <RichTextEditor
              value={description}
              onChange={setDescription}
              hint="Formatting is preserved. HTML is sanitised on the server before it's stored."
            />
          </SectionCard>

          <SectionCard title="Images" description="The first image is the cover. Cards rotate through the first 5 on hover.">
            <ImageDropzone
              files={images}
              onChange={setImages}
              existing={savedImages}
              onRemoveExisting={(url) => setKeepImages((k) => (k || []).filter((u) => u !== url))}
            />

            {willUsePdfImages && (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-brand-50 px-3.5 py-2.5 text-2xs leading-relaxed text-brand-800">
                <FiInfo size={13} className="mt-0.5 shrink-0" />
                No images set — the first 5 pages of the attached PDF will be converted to images and used as the
                gallery when you save.
              </p>
            )}
          </SectionCard>

          <SectionCard
            title="PDF & free ebook"
            description="Attach the source PDF (used for auto-generated covers) and/or the free ebook customers can download."
          >
            <div className="grid gap-4">
              <FileDropzone
                file={pdfFile}
                onChange={setPdfFile}
                label="Source PDF (for cover generation)"
                hint="PDF up to 60 MB. Only its first 5 pages are rasterised."
                accept={{ 'application/pdf': ['.pdf'] }}
                existingUrl={existing?.sourcePdf?.url}
                icon={FiFileText}
              />

              <FileDropzone
                file={ebookFile}
                onChange={setEbookFile}
                label="Free ebook PDF (customer download)"
                hint="Attaching this switches a book to “Book + free ebook” automatically."
                accept={{ 'application/pdf': ['.pdf'] }}
                existingUrl={existing?.ebook?.fileUrl}
                icon={FiDownloadCloud}
              />

              {(ebookFile || existing?.ebook?.fileUrl) && (
                <div className="grid gap-3 rounded-xl bg-ink-50 p-4 sm:grid-cols-3">
                  <CheckboxRow label="Free download" description="Customers download at no cost" {...register('ebook.isFree')} />
                  <CheckboxRow label="Allow preview" description="Show the sample reader" {...register('ebook.allowPreview')} />
                  <Field label="Preview pages">
                    <Input type="number" min={1} max={20} {...register('ebook.previewPages')} />
                  </Field>
                </div>
              )}

              {existing?.ebook?.downloadCount > 0 && (
                <p className="text-2xs text-ink-400">This ebook has been downloaded {existing.ebook.downloadCount} times.</p>
              )}
            </div>
          </SectionCard>

          {isBookish && (
            <SectionCard title="Book details">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Author"><Input {...register('author')} /></Field>
                <Field label="Publisher"><Input {...register('publisher')} /></Field>
                <Field label="ISBN"><Input {...register('isbn')} placeholder="978-93-xxxxx-xx-x" /></Field>
                <Field label="Edition"><Input {...register('edition')} placeholder="2026 Edition" /></Field>
                <Field label="Language" hint="A title can be bilingual — pick every language it contains">
                  <LanguagePicker value={watch('language')} onChange={(v) => setValue('language', v, { shouldDirty: true })} />
                </Field>
                <Field label="Pages"><Input type="number" min={1} {...register('pages')} /></Field>
                <Field label="Publish year"><Input type="number" {...register('publishYear')} /></Field>
                <Field label="Binding"><Input {...register('binding')} placeholder="Paperback / Hardcover" /></Field>
              </div>
            </SectionCard>
          )}

          {type === 'stationery' && (
            <SectionCard title="Stationery details">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Brand"><Input {...register('brand')} /></Field>
                <Field label="Colour"><Input {...register('color')} /></Field>
                <Field label="Material"><Input {...register('material')} /></Field>
              </div>
            </SectionCard>
          )}

          <SectionCard title="Highlights & specifications">
            <Field label="Highlights" hint="One per line. Shown as bullet chips on the product page.">
              <Textarea rows={4} {...register('highlights')} placeholder={'Complete syllabus coverage\nSolved previous-year papers\nFree ebook included'} />
            </Field>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="label mb-0">Specification rows</span>
                <button type="button" onClick={() => appendSpec({ label: '', value: '' })} className="btn-outline btn-sm gap-1.5">
                  <FiPlus size={12} /> Add row
                </button>
              </div>

              {specFields.length === 0 ? (
                <p className="rounded-xl border border-dashed border-ink-200 px-3.5 py-4 text-2xs text-ink-400">
                  Author, publisher, ISBN and the other fields above are added to the specification table automatically.
                  Use these rows for anything extra.
                </p>
              ) : (
                <div className="space-y-2">
                  {specFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input placeholder="Label" {...register(`specifications.${index}.label`)} />
                      <Input placeholder="Value" {...register(`specifications.${index}.value`)} />
                      <button type="button" onClick={() => removeSpec(index)} aria-label="Remove row" className="btn-icon shrink-0 text-ink-400 hover:bg-rose-50 hover:text-rose-600">
                        <FiX size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="SEO">
            <div className="grid gap-4">
              <Field label="Meta title" hint="Falls back to the product title.">
                <Input maxLength={160} {...register('seo.metaTitle')} />
              </Field>
              <Field label="Meta description" hint="Aim for 150–160 characters.">
                <Textarea rows={2} maxLength={320} {...register('seo.metaDescription')} />
              </Field>
              <Field label="Meta keywords" hint="Comma separated.">
                <Input {...register('seo.metaKeywords')} />
              </Field>
            </div>
          </SectionCard>
        </div>

        {/* ── sidebar ── */}
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <SectionCard title="Pricing">
            <div className="grid gap-4">
              <Field label="MRP / list price" required error={errors.price}>
                <Input type="number" step="0.01" min={0} {...register('price', { required: 'Price is required' })} error={errors.price} />
              </Field>
              <Field label="Discount %" hint="Discount and sale price are alternatives — sale price wins if both are set.">
                <Input type="number" min={0} max={95} {...register('discountPercent')} />
              </Field>
              <Field label="Sale price" hint="Optional. Overrides the discount percentage.">
                <Input type="number" step="0.01" min={0} {...register('salePrice')} />
              </Field>
              <Field label="Tax %">
                <Input type="number" min={0} max={28} {...register('taxPercent')} />
              </Field>

              <div className="rounded-xl bg-ink-50 px-3.5 py-3">
                <p className="text-2xs font-semibold uppercase tracking-wide text-ink-400">Customer pays</p>
                <p className="mt-0.5 text-lg font-bold text-ink-900">₹{effectivePrice || 0}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Inventory">
            <div className="grid gap-4">
              <Field label="Stock quantity" hint={type === 'ebook' ? 'Ignored for digital-only products.' : undefined}>
                <Input type="number" min={0} {...register('stock')} />
              </Field>
              <Field label="Low stock alert at">
                <Input type="number" min={0} {...register('lowStockThreshold')} />
              </Field>
              <CheckboxRow label="Allow backorders" description="Sell even when stock hits zero" {...register('allowBackorder')} />
            </div>
          </SectionCard>

          <SectionCard title="Shipping" description="Used to calculate delivery charges for the PIN code at checkout.">
            <div className="grid gap-4">
              <Field label="Weight (kg)" required>
                <Input type="number" step="0.01" min={0} {...register('weight')} />
              </Field>
              <div className="grid grid-cols-3 gap-2">
                <Field label="L (cm)"><Input type="number" min={0} {...register('dimensions.length')} /></Field>
                <Field label="B (cm)"><Input type="number" min={0} {...register('dimensions.breadth')} /></Field>
                <Field label="H (cm)"><Input type="number" min={0} {...register('dimensions.height')} /></Field>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Merchandising">
            <div className="grid gap-2">
              <CheckboxRow label="Featured" description="Shows in featured homepage sections" {...register('isFeatured')} />
              <CheckboxRow label="Trending" description="Shows in the trending rail" {...register('isTrending')} />
              <CheckboxRow label="Best seller" description="Shows in best sellers" {...register('isBestSeller')} />
              <CheckboxRow label="Latest" description="Shows in “Just landed”" {...register('isLatest')} />
              <CheckboxRow label="New arrival" description="Adds a “New” badge" {...register('isNewArrival')} />
            </div>
          </SectionCard>

          <SectionCard title="Visibility">
            <div className="grid gap-2">
              <CheckboxRow label="Active" description="Uncheck to take it off the storefront" {...register('isActive')} />
              <CheckboxRow label="Hidden" description="Reachable by direct link only" {...register('isHidden')} />
            </div>

            <Field label="Tags" hint="Comma separated. Used by search and related products." className="mt-4">
              <Input {...register('tags')} placeholder="ssc, practice sets, latest edition" />
            </Field>
          </SectionCard>

          {isEdit && (
            <SectionCard title="Danger zone">
              <button
                type="button"
                onClick={async () => {
                  // eslint-disable-next-line no-alert
                  if (!window.confirm(`Delete “${existing?.title}”? This cannot be undone.`)) return;
                  try {
                    await api.deleteProduct(id);
                    toast('Product deleted');
                    qc.invalidateQueries({ queryKey: ['products'] });
                    navigate('/products');
                  } catch (err) {
                    toast(err.message, 'error');
                  }
                }}
                className="btn-danger w-full gap-2"
              >
                <FiTrash2 size={15} /> Delete this product
              </button>
            </SectionCard>
          )}
        </div>
      </div>
    </form>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

/**
 * `language` is an array on the backend, because most MPPSC guides carry both
 * Hindi and English in one book.
 *
 * Accepts a legacy string too ("Hindi", or "Hindi, English") so opening an
 * old product that has not been migrated yet does not blow up.
 */
const LANGUAGES = ['Hindi', 'English', 'Sanskrit', 'Urdu', 'Marathi', 'Odia', 'Bengali', 'NA'];

function LanguagePicker({ value, onChange }) {
  const selected = Array.isArray(value)
    ? value
    : String(value || '').split(',').map((s) => s.trim()).filter(Boolean);

  const toggle = (lang) => {
    onChange(selected.includes(lang) ? selected.filter((l) => l !== lang) : [...selected, lang]);
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {LANGUAGES.map((lang) => {
        const on = selected.includes(lang);
        return (
          <button
            key={lang}
            type="button"
            onClick={() => toggle(lang)}
            aria-pressed={on}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              on
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
            }`}
          >
            {lang}
          </button>
        );
      })}
    </div>
  );
}
