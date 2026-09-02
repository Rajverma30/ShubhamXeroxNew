/**
 * Store settings: identity, contact, commerce rules, announcement bar,
 * testimonials, footer links, policies, popular searches and global SEO.
 */
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiSave, FiX } from 'react-icons/fi';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';
import RichTextEditor from '../components/RichTextEditor';
import {
  CheckboxRow, ErrorBlock, Field, Input, LoadingBlock, PageHeader, SectionCard, Select, Spinner, Textarea,
} from '../components/Ui';

const TABS = [
  ['general', 'General'],
  ['commerce', 'Commerce'],
  ['content', 'Content'],
  ['policies', 'Policies'],
  ['seo', 'SEO'],
];

export default function Settings() {
  const qc = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState('general');
  const [policies, setPolicies] = useState({ about: '', shipping: '', returns: '', privacy: '', terms: '' });

  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['settings'], queryFn: () => api.settings() });

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm({ defaultValues: {} });
  const checkoutMode = watch('checkout.mode');

  const testimonials = useFieldArray({ control, name: 'testimonials' });
  const footerLinks = useFieldArray({ control, name: 'footerLinks' });

  useEffect(() => {
    if (!data) return;
    reset({
      ...data,
      checkout: {
        ...data.checkout,
        // Settings documents created before this selector had `auto`; after a
        // save the store always has one explicit, supported checkout path.
        mode: data.checkout?.mode === 'shiprocket' ? 'shiprocket' : 'razorpay',
      },
      popularSearches: (data.popularSearches || []).join(', '),
      seo: {
        ...data.seo,
        metaKeywords: (data.seo?.metaKeywords || []).join(', '),
      },
    });
    setPolicies({
      about: data.policies?.about || '',
      shipping: data.policies?.shipping || '',
      returns: data.policies?.returns || '',
      privacy: data.policies?.privacy || '',
      terms: data.policies?.terms || '',
    });
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (payload) => api.updateSettings(payload),
    onSuccess: () => { toast('Settings saved'); qc.invalidateQueries({ queryKey: ['settings'] }); },
    onError: (err) => toast(err.message, 'error'),
  });

  const { data: shiprocket, refetch: refetchShiprocket } = useQuery({
    queryKey: ['shiprocket-diagnostics'],
    queryFn: () => api.shiprocketDiagnostics(),
    retry: false,
  });
  const resyncMutation = useMutation({
    mutationFn: () => api.resyncShiprocketCatalogue(),
    onSuccess: (result) => {
      toast(`Queued ${result.queued.products} products and ${result.queued.collections} collections for Shiprocket sync`);
      refetchShiprocket();
    },
    onError: (err) => toast(err.message, 'error'),
  });

  const onSubmit = (values) => {
    mutation.mutate({
      ...values,
      policies,
      popularSearches: String(values.popularSearches || '').split(',').map((s) => s.trim()).filter(Boolean),
      seo: {
        ...values.seo,
        metaKeywords: String(values.seo?.metaKeywords || '').split(',').map((s) => s.trim()).filter(Boolean),
      },
    });
  };

  if (isLoading) return <LoadingBlock label="Loading settings…" />;
  if (error) return <ErrorBlock error={error} onRetry={refetch} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title="Settings & SEO"
        subtitle="Store identity, commerce rules and the content the storefront reads on boot."
        actions={
          <button type="submit" disabled={mutation.isPending} className="btn-primary gap-2">
            {mutation.isPending ? <Spinner size={15} /> : <FiSave size={15} />} Save settings
          </button>
        }
      />

      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-ink-100 no-scrollbar">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === key ? 'border-ink-900 text-ink-900' : 'border-transparent text-ink-400 hover:text-ink-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── general ── */}
      {tab === 'general' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="Identity">
            <div className="grid gap-4">
              <Field label="Store name" required error={errors.storeName}>
                <Input {...register('storeName', { required: 'Store name is required' })} error={errors.storeName} />
              </Field>
              <Field label="Tagline"><Input {...register('tagline')} /></Field>
              <Field label="Logo path" hint="Place your logo.png in the storefront's public/ folder.">
                <Input {...register('logo')} placeholder="/logo.png" />
              </Field>
              <Field label="Favicon path"><Input {...register('favicon')} placeholder="/logo.png" /></Field>
            </div>
          </SectionCard>

          <SectionCard title="Contact & location">
            <div className="grid gap-4">
              <Field label="Support email"><Input type="email" {...register('email')} /></Field>
              <Field label="Phone"><Input {...register('phone')} /></Field>
              <Field
                label="WhatsApp"
                hint="Shown to customers who need help with an order. Falls back to the phone number above."
              >
                <Input {...register('whatsapp')} placeholder="9876543210" />
              </Field>
              <Field label="Store address"><Textarea rows={2} {...register('address')} /></Field>
              <Field label="Opening hours"><Input {...register('openingHours')} placeholder="Mon–Sat, 9:00 AM – 8:00 PM" /></Field>
              <Field label="Google Maps embed URL" hint="Shown on the contact page.">
                <Input {...register('mapEmbedUrl')} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Social profiles" className="lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <Field label="Instagram"><Input {...register('social.instagram')} /></Field>
              <Field label="Facebook"><Input {...register('social.facebook')} /></Field>
              <Field label="YouTube"><Input {...register('social.youtube')} /></Field>
              <Field label="Twitter / X"><Input {...register('social.twitter')} /></Field>
              <Field label="Telegram"><Input {...register('social.telegram')} /></Field>
            </div>
          </SectionCard>

          <SectionCard title="Maintenance" className="lg:col-span-2">
            <CheckboxRow
              label="Maintenance mode"
              description="robots.txt switches to Disallow: / while this is on."
              {...register('maintenanceMode')}
            />
          </SectionCard>
        </div>
      )}

      {/* ── commerce ── */}
      {tab === 'commerce' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="Pricing & tax">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Currency"><Input {...register('currency')} placeholder="INR" /></Field>
              <Field label="Currency symbol"><Input {...register('currencySymbol')} placeholder="₹" /></Field>
              <Field label="Default tax %" hint="Applied to the discounted subtotal at checkout.">
                <Input type="number" min={0} max={28} step="0.01" {...register('taxPercent')} />
              </Field>
              <Field label="Minimum order value (₹)">
                <Input type="number" min={0} {...register('minOrderValue')} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Shipping & payment">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Flat shipping (₹)"><Input type="number" min={0} {...register('shippingFlat')} /></Field>
              <Field label="Free shipping above (₹)" hint="Drives the cart's free-delivery progress bar.">
                <Input type="number" min={0} {...register('freeShippingAbove')} />
              </Field>
              <Field label="COD fee (₹)"><Input type="number" min={0} {...register('codFee')} /></Field>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <CheckboxRow label="Cash on delivery" description="Offer COD at checkout" {...register('codEnabled')} />
              <CheckboxRow label="Prepaid / online" description="Offer online payment at checkout" {...register('prepaidEnabled')} />
            </div>
          </SectionCard>

          <SectionCard title="Checkout provider" className="lg:col-span-2">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
              <Field
                label="Customer checkout"
                hint="Choose the flow customers see when they press Checkout. Credentials remain server-only."
              >
                <Select {...register('checkout.mode')}>
                  <option value="razorpay">Razorpay — OTP, address and payment on this store</option>
                  <option value="shiprocket">Shiprocket / Fastrr — hosted Shiprocket checkout</option>
                </Select>
              </Field>

              <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-4 text-sm">
                <p className="font-semibold text-ink-800">
                  {checkoutMode === 'shiprocket' ? 'Shiprocket Checkout selected' : 'Razorpay Checkout selected'}
                </p>
                {checkoutMode === 'shiprocket' ? (
                  <p className="mt-1.5 leading-relaxed text-ink-500">
                    Products and collections sync automatically after every admin add, edit, flag change or delete.
                    The initial full sync button is useful after connecting a new Fastrr account.
                  </p>
                ) : <p className="mt-1.5 leading-relaxed text-ink-500">The existing OTP + Razorpay checkout remains active. Shiprocket can still be used for shipping rates and tracking.</p>}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-100 p-3.5">
              <p className="text-xs leading-relaxed text-ink-500">
                <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${shiprocket?.catalogueApiConfigured && shiprocket?.webhookConfigured ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                {shiprocket
                  ? `${shiprocket.catalogue.products} products · ${shiprocket.catalogue.collections} collections · catalogue API ${shiprocket.catalogueApiConfigured ? 'configured' : 'missing'} · webhook ${shiprocket.webhookConfigured ? 'configured' : 'missing'}`
                  : 'Checking Shiprocket server configuration…'}
              </p>
              <button
                type="button"
                className="btn-outline btn-sm"
                disabled={resyncMutation.isPending}
                onClick={() => resyncMutation.mutate()}
                title="Push or queue all current products and collections for sync"
              >
                {resyncMutation.isPending ? 'Queueing…' : 'Sync catalogue now'}
              </button>
            </div>
            <p className="mt-2 text-2xs text-ink-400">
              Required server variables: SHIPROCKET_CHECKOUT_API_KEY, SHIPROCKET_CHECKOUT_API_SECRET, FASTRR_SELLER_DOMAIN,
              FASTRR_PRODUCT_WEBHOOK_URL, FASTRR_COLLECTION_WEBHOOK_URL, FASTRR_API_KEY and FASTRR_WEBHOOK_SECRET.
            </p>
          </SectionCard>

          <SectionCard title="Analytics" className="lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Google Analytics ID"><Input {...register('googleAnalyticsId')} placeholder="G-XXXXXXXXXX" /></Field>
              <Field label="Facebook Pixel ID"><Input {...register('facebookPixelId')} /></Field>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── content ── */}
      {tab === 'content' && (
        <div className="space-y-5">
          <SectionCard title="Announcement bar" description="The thin strip above the storefront header.">
            <div className="grid gap-4 sm:grid-cols-[auto_1fr_1fr] sm:items-end">
              <CheckboxRow label="Enabled" {...register('announcementBar.enabled')} />
              <Field label="Text"><Input {...register('announcementBar.text')} placeholder="Free delivery on orders above ₹499" /></Field>
              <Field label="Link (optional)"><Input {...register('announcementBar.url')} placeholder="/offers" /></Field>
            </div>
          </SectionCard>

          <SectionCard title="Popular searches" description="Shown in the search overlay when the box is empty.">
            <Field label="Search terms" hint="Comma separated.">
              <Textarea rows={2} {...register('popularSearches')} placeholder="ssc cgl, upsc prelims, class 10 maths" />
            </Field>
          </SectionCard>

          <SectionCard
            title="Testimonials"
            description="Feed the homepage testimonials carousel."
            actions={
              <button type="button" onClick={() => testimonials.append({ name: '', role: '', rating: 5, text: '' })} className="btn-outline btn-sm gap-1.5">
                <FiPlus size={12} /> Add testimonial
              </button>
            }
          >
            {testimonials.fields.length === 0 ? (
              <p className="rounded-xl border border-dashed border-ink-200 px-4 py-5 text-center text-xs text-ink-400">
                No testimonials yet. The homepage section hides itself when this list is empty.
              </p>
            ) : (
              <div className="space-y-3">
                {testimonials.fields.map((field, index) => (
                  <div key={field.id} className="rounded-xl border border-ink-100 p-3.5">
                    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_90px_auto]">
                      <Field label="Name"><Input {...register(`testimonials.${index}.name`)} /></Field>
                      <Field label="Role / location"><Input {...register(`testimonials.${index}.role`)} placeholder="OSSC aspirant, Cuttack" /></Field>
                      <Field label="Rating"><Input type="number" min={1} max={5} {...register(`testimonials.${index}.rating`)} /></Field>
                      <div className="flex items-end">
                        <button type="button" onClick={() => testimonials.remove(index)} aria-label="Remove testimonial" className="btn-icon text-ink-400 hover:bg-rose-50 hover:text-rose-600">
                          <FiX size={16} />
                        </button>
                      </div>
                    </div>
                    <Field label="Quote" className="mt-3">
                      <Textarea rows={2} {...register(`testimonials.${index}.text`)} />
                    </Field>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Footer links"
            description="Grouped by the “Group” column — e.g. Shop, Help, Company."
            actions={
              <button type="button" onClick={() => footerLinks.append({ group: 'Shop', label: '', url: '' })} className="btn-outline btn-sm gap-1.5">
                <FiPlus size={12} /> Add link
              </button>
            }
          >
            {footerLinks.fields.length === 0 ? (
              <p className="rounded-xl border border-dashed border-ink-200 px-4 py-5 text-center text-xs text-ink-400">
                No custom links — the storefront falls back to a sensible default set.
              </p>
            ) : (
              <div className="space-y-2">
                {footerLinks.fields.map((field, index) => (
                  <div key={field.id} className="grid gap-2 sm:grid-cols-[140px_1fr_1fr_auto]">
                    <Input placeholder="Group" {...register(`footerLinks.${index}.group`)} />
                    <Input placeholder="Label" {...register(`footerLinks.${index}.label`)} />
                    <Input placeholder="/url" {...register(`footerLinks.${index}.url`)} />
                    <button type="button" onClick={() => footerLinks.remove(index)} aria-label="Remove link" className="btn-icon shrink-0 text-ink-400 hover:bg-rose-50 hover:text-rose-600">
                      <FiX size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* ── policies ── */}
      {tab === 'policies' && (
        <div className="space-y-5">
          {[
            ['about', 'About us', '/about'],
            ['shipping', 'Shipping & delivery', '/policy/shipping'],
            ['returns', 'Returns & refunds', '/policy/returns'],
            ['privacy', 'Privacy policy', '/policy/privacy'],
            ['terms', 'Terms of service', '/policy/terms'],
          ].map(([key, label, path]) => (
            <SectionCard key={key} title={label} description={`Published at ${path}`}>
              <RichTextEditor
                value={policies[key]}
                onChange={(html) => setPolicies((p) => ({ ...p, [key]: html }))}
                placeholder={`Write the ${label.toLowerCase()} content…`}
              />
            </SectionCard>
          ))}
        </div>
      )}

      {/* ── seo ── */}
      {tab === 'seo' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="Default meta tags" description="Used on the homepage and as a fallback everywhere else.">
            <div className="grid gap-4">
              <Field label="Meta title" hint="Aim for under 60 characters.">
                <Input maxLength={160} {...register('seo.metaTitle')} />
              </Field>
              <Field label="Meta description" hint="Aim for 150–160 characters.">
                <Textarea rows={3} maxLength={320} {...register('seo.metaDescription')} />
              </Field>
              <Field label="Meta keywords" hint="Comma separated.">
                <Input {...register('seo.metaKeywords')} />
              </Field>
              <Field label="Canonical URL"><Input {...register('seo.canonicalUrl')} placeholder="https://subhamxerox.com" /></Field>
            </div>
          </SectionCard>

          <SectionCard title="Open Graph" description="Controls how links look when shared.">
            <div className="grid gap-4">
              <Field label="OG title"><Input {...register('seo.ogTitle')} /></Field>
              <Field label="OG description"><Textarea rows={3} {...register('seo.ogDescription')} /></Field>
              <Field label="OG image URL" hint="1200 × 630 works best.">
                <Input {...register('seo.ogImage')} />
              </Field>
              <CheckboxRow label="Discourage indexing" description="Adds noindex to the homepage" {...register('seo.noIndex')} />
            </div>
          </SectionCard>

          <SectionCard title="Generated files" className="lg:col-span-2">
            <p className="text-sm leading-relaxed text-ink-600">
              <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">sitemap.xml</code> and{' '}
              <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">robots.txt</code> are generated by the backend
              from your live catalogue — every product, category and collection is included automatically. Point your
              CDN or nginx at the backend for those two paths in production. Turning on maintenance mode switches
              robots.txt to <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">Disallow: /</code>.
            </p>
          </SectionCard>
        </div>
      )}
    </form>
  );
}
