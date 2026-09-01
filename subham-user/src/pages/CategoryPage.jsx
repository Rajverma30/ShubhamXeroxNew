/** Category and sub-category landing pages — both delegate to <Shop>. */
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { useFetch } from '../hooks';
import Shop from './Shop';
import { SubCategoryPills } from '../components/home/CategoryGrid';
import { SectionHeader, Spinner } from '../components/ui/Common';

export function CategoryPage() {
  const { slug } = useParams();
  const { data: category, loading } = useFetch(() => api.getCategory(slug), [slug]);

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Spinner size={26} className="text-ink-300" /></div>;
  }

  return (
    <>
      <Shop fixed={{ category: slug }} heading={category?.name || 'Category'} subheading={category?.shortDescription}
        banner={category?.banner}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Categories', to: '/categories' }, { label: category?.name || slug }]}
        seo={{
          title: category?.seo?.metaTitle || category?.name,
          description: category?.seo?.metaDescription || category?.shortDescription,
          path: `/category/${slug}`, keywords: category?.seo?.metaKeywords,
        }} />

      {category?.subCategories?.length > 0 && (
        <section className="container-x pb-14">
          <SectionHeader eyebrow="Narrow it down" title={`Collections in ${category.name}`} />
          <SubCategoryPills subCategories={category.subCategories} />
        </section>
      )}

      {category?.description && (
        <section className="container-x pb-16">
          <div className="max-w-3xl rounded-3xl border border-ink-100 bg-ink-50/50 p-6">
            {/* eslint-disable-next-line react/no-danger */}
            <div className="prose-store" dangerouslySetInnerHTML={{ __html: category.description }} />
          </div>
        </section>
      )}
      <div className="mobile-nav-spacer" aria-hidden />
    </>
  );
}

export function CollectionPage() {
  const { slug } = useParams();
  const { data: sub, loading } = useFetch(() => api.getSubCategory(slug), [slug]);

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Spinner size={26} className="text-ink-300" /></div>;
  }

  return (
    <Shop fixed={{ subcategory: slug }} heading={sub?.name || 'Collection'} subheading={sub?.shortDescription}
      banner={sub?.banner}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        ...(sub?.category ? [{ label: sub.category.name, to: `/category/${sub.category.slug}` }] : []),
        { label: sub?.name || slug },
      ]}
      seo={{ title: sub?.seo?.metaTitle || sub?.name, description: sub?.seo?.metaDescription || sub?.shortDescription, path: `/collection/${slug}` }} />
  );
}

export default CategoryPage;
