/**
 * Homepage. Every section — order, title, layout, contents — is driven by the
 * admin's homepage builder via GET /api/home. This is just a renderer that
 * maps a section `type` to a component.
 */
import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiDatabase, FiDownloadCloud, FiPackage, FiRefreshCw, FiShield, FiTruck } from 'react-icons/fi';
import api from '../lib/api';
import { useFetch, useRecentlyViewed } from '../hooks';
import { useStore } from '../context/StoreContext';
import Seo from '../components/ui/Seo';
import HeroSlider from '../components/home/HeroSlider';
import BannerStrip from '../components/home/BannerStrip';
import { CategoryGrid, SubCategoryPills } from '../components/home/CategoryGrid';
import NewsletterBlock from '../components/home/NewsletterBlock';
import ProductRail from '../components/product/ProductRail';
import ProductCard from '../components/product/ProductCard';
import { EmptyState, SectionHeader, TrustStrip } from '../components/ui/Common';
import { HeroSkeleton, RowSkeleton, CategoryTileSkeleton } from '../components/ui/Skeleton';

const Testimonials = lazy(() => import('../components/home/Testimonials'));

const TRUST = [
  { icon: FiTruck, title: 'Free delivery above ₹499', description: 'Shipped across India. Delivery calculated for your PIN code.' },
  { icon: FiDownloadCloud, title: 'Free ebook with select guides', description: 'Buy the print copy, download the PDF the same minute.' },
  { icon: FiPackage, title: 'Dispatched within 24 hours', description: 'Orders placed on business days leave the shop next morning.' },
  { icon: FiShield, title: 'No account required', description: 'Add to cart, enter your address, done. We never store passwords.' },
];

export default function Home() {
  const { settings } = useStore();
  const { data, loading, error, refetch } = useFetch(() => api.getHome(), []);
  const { viewed } = useRecentlyViewed();
  const sections = data?.sections || [];

  if (error) {
    return (
      <div className="container-x py-20">
        <EmptyState icon={FiAlertCircle} title="We couldn't load the store" description={error.message}
          action={<button type="button" onClick={refetch} className="btn-primary gap-2"><FiRefreshCw size={15} /> Try again</button>} />
      </div>
    );
  }

  return (
    <>
      <Seo
        description={settings?.seo?.metaDescription || 'Buy exam books, school textbooks, free ebooks and stationery online at Subham Xerox.'}
        path="/" keywords={settings?.seo?.metaKeywords}
        schema={{
          '@context': 'https://schema.org', '@type': 'WebSite',
          name: settings?.storeName || 'Subham Xerox', url: import.meta.env.VITE_SITE_URL,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${import.meta.env.VITE_SITE_URL}/shop?search={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }} />

      {loading && (
        <>
          <HeroSkeleton />
          <div className="container-x space-y-14 py-12"><CategoryTileSkeleton /><RowSkeleton /><RowSkeleton /></div>
        </>
      )}

      {/* An empty catalogue is the most common "the site looks broken" cause,
          so name it explicitly rather than rendering a blank page. */}
      {!loading && sections.length === 0 && (
        <div className="container-x py-20">
          <EmptyState icon={FiDatabase} title="Your storefront has no content yet"
            description="The homepage is built from the sections, banners and products in your database — and right now there aren't any. Run the backend seeder, or add content from the admin panel."
            action={
              <div className="text-left">
                <pre className="mx-auto max-w-md overflow-x-auto rounded-2xl bg-ink-950 px-5 py-4 text-left text-xs leading-relaxed text-white/90">
{`cd subham-backend
npm run seed
npm run dev`}
                </pre>
                <p className="mt-4 text-center text-xs text-ink-400">
                  Already seeded? Check the API is reachable at{' '}
                  <code className="rounded bg-ink-100 px-1.5 py-0.5 text-ink-700">{import.meta.env.VITE_API_URL}</code>
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <button type="button" onClick={refetch} className="btn-outline gap-2"><FiRefreshCw size={15} /> Retry</button>
                  <Link to="/shop" className="btn-primary">Browse the catalogue</Link>
                </div>
              </div>
            } />
        </div>
      )}

      {!loading && sections.map((section, i) => {
        switch (section.type) {
          case 'hero-slider':
            return <HeroSlider key={section.key} banners={section.banners} />;
          case 'featured-categories':
            return (
              <section key={section.key} className="container-x section">
                <SectionHeader eyebrow="Browse" title={section.title || 'Shop by category'} subtitle={section.subtitle} viewAllUrl="/categories" />
                <CategoryGrid categories={section.categories} />
              </section>
            );
          case 'popular-subcategories':
            return (
              <section key={section.key} className="container-x section">
                <SectionHeader eyebrow="Collections" title={section.title || 'Popular collections'} subtitle={section.subtitle} />
                <SubCategoryPills subCategories={section.subCategories} />
              </section>
            );
          case 'banner-strip':
            return <section key={section.key} className="container-x py-6 sm:py-8"><BannerStrip banners={section.banners} /></section>;
          case 'testimonials':
            return (
              <section key={section.key} className="bg-ink-50/70 py-14 sm:py-16">
                <div className="container-x">
                  <SectionHeader eyebrow="Reviews" title={section.title || 'What our customers say'} subtitle={section.subtitle} />
                  <Suspense fallback={<div className="h-56" />}><Testimonials testimonials={section.testimonials} /></Suspense>
                </div>
              </section>
            );
          case 'newsletter':
            return <section key={section.key} className="container-x section"><NewsletterBlock title={section.title} subtitle={section.subtitle} /></section>;
          default: {
            if (!section.products?.length) return null;
            if (section.layout === 'grid') {
              return (
                <section key={section.key} className="container-x section">
                  <SectionHeader title={section.title} subtitle={section.subtitle} viewAllUrl={section.viewAllUrl} />
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {section.products.map((p, idx) => <ProductCard key={p._id} product={p} eager={i < 2 && idx < 4} />)}
                  </div>
                </section>
              );
            }
            return (
              <div key={section.key} className="container-x section">
                <ProductRail title={section.title} subtitle={section.subtitle} viewAllUrl={section.viewAllUrl} products={section.products} />
              </div>
            );
          }
        }
      })}

      {sections.length > 0 && <section className="container-x py-8"><TrustStrip items={TRUST} /></section>}

      {viewed.length > 2 && (
        <section className="container-x section pt-4">
          <SectionHeader eyebrow="Pick up where you left off" title="Recently viewed" />
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {viewed.map((v) => (
              <Link key={v.id} to={`/product/${v.slug}`} className="group flex w-40 shrink-0 flex-col gap-2 sm:w-44">
                <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-ink-100 bg-ink-50">
                  <img src={v.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <p className="line-clamp-2 text-xs font-semibold leading-snug text-ink-800 group-hover:text-brand-700">{v.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mobile-nav-spacer" aria-hidden />
    </>
  );
}
