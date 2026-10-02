import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiExternalLink,
  FiMapPin,
  FiPhone,
  FiShoppingBag,
  FiTag,
  FiUser,
} from 'react-icons/fi';
import Seo, { breadcrumbSchema } from '../../components/ui/Seo';
import { BLOG_POSTS } from '../../data/blogs';

const SITE = (import.meta.env.VITE_SITE_URL || 'https://shubhamxerox.in').replace(/\/$/, '');

export function ExtLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2 hover:text-brand-700"
    >
      {children} <FiExternalLink size={12} className="shrink-0 opacity-70" />
    </a>
  );
}

export function SectionTitle({ id, children }) {
  return (
    <h2 id={id} className="scroll-mt-28 text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 pt-2">
      {children}
    </h2>
  );
}

export function Toc({ items }) {
  return (
    <nav aria-label="Table of contents" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 mb-10">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">On this page</h2>
      <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {items.map((item, i) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="text-brand-700 hover:text-brand-900 font-medium inline-flex gap-2">
              <span className="text-slate-400 font-normal tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function FaqBlock({ faqs }) {
  return (
    <div className="space-y-3">
      {faqs.map((f) => (
        <details key={f.q} className="group bg-white rounded-2xl border border-slate-200 open:shadow-sm">
          <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-slate-900 text-sm sm:text-base flex items-start justify-between gap-3">
            <span>{f.q}</span>
            <span className="text-brand-600 text-lg leading-none group-open:rotate-45 transition-transform">+</span>
          </summary>
          <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function ShopCta({
  title = 'Get these books at Shubham Xerox',
  body = 'Original editions, current affairs magazines, PYQs and stationery — delivered across India or pick up at Bhawarkua, Indore.',
  primaryTo = '/shop',
  primaryLabel = 'Browse Books',
  secondaryTo = '/store-indore',
  secondaryLabel = 'Visit Indore Store',
}) {
  return (
    <div className="bg-gradient-to-r from-brand-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-md my-8">
      <h3 className="text-xl sm:text-2xl font-bold mb-2">{title}</h3>
      <p className="text-brand-100 text-sm max-w-2xl mb-5 leading-relaxed">{body}</p>
      <div className="flex flex-wrap gap-3">
        <Link to={primaryTo} className="btn bg-white text-brand-700 hover:bg-brand-50 px-5 py-2.5 font-bold text-sm">
          <FiShoppingBag className="mr-1" /> {primaryLabel}
        </Link>
        <Link to={secondaryTo} className="btn bg-brand-900/40 text-white hover:bg-brand-900/60 border border-white/20 px-5 py-2.5 font-semibold text-sm">
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}

export function RelatedPosts({ currentId }) {
  return (
    <aside className="border-t border-slate-200 pt-8 mt-10">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Related guides</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {BLOG_POSTS.filter((p) => p.id !== currentId).slice(0, 4).map((p) => (
          <Link
            key={p.id}
            to={`/blogs/${p.id}`}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:border-brand-300 hover:shadow-sm transition-all"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600 mb-1">{p.category}</p>
            <p className="text-sm font-semibold text-slate-900 leading-snug">{p.listingTitle || p.title}</p>
          </Link>
        ))}
      </div>
    </aside>
  );
}

export function ClosingCta({ phone, whatsapp }) {
  const tel = phone || whatsapp;
  const telHref = tel ? `tel:${String(tel).replace(/\s+/g, '')}` : null;
  const waHref = whatsapp ? `https://wa.me/${String(whatsapp).replace(/\D/g, '')}` : null;

  return (
    <section className="bg-ink-950 text-white rounded-2xl p-6 sm:p-8 mb-10">
      <h2 className="text-2xl font-bold mb-2">Need books, notes or printouts today?</h2>
      <p className="text-slate-300 text-sm leading-relaxed mb-5 max-w-2xl">
        Shubham Xerox stocks MPPSC, MPESB, MP Board and stationery — order online or visit our Bhawarkua store in Indore.
      </p>
      <ul className="space-y-2 text-sm text-slate-300 mb-6">
        <li className="flex items-start gap-2">
          <FiMapPin className="text-brand-400 mt-0.5 shrink-0" />
          <span>
            Near Bhawarkua Square, Main Road, Indore, MP 452001 —{' '}
            <Link to="/store-indore" className="text-brand-300 font-semibold underline underline-offset-2 hover:text-white">
              store details
            </Link>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <FiClock className="text-brand-400 mt-0.5 shrink-0" />
          <span>Mon–Sat 9:00 AM – 9:30 PM · Sunday 10:00 AM – 7:00 PM</span>
        </li>
        {tel && (
          <li className="flex items-start gap-2">
            <FiPhone className="text-brand-400 mt-0.5 shrink-0" />
            <span>
              {telHref ? <a href={telHref} className="text-brand-300 font-semibold hover:text-white">{tel}</a> : tel}
              {waHref && (
                <>
                  {' · '}
                  <a href={waHref} target="_blank" rel="noopener noreferrer" className="text-brand-300 font-semibold hover:text-white">
                    WhatsApp
                  </a>
                </>
              )}
            </span>
          </li>
        )}
      </ul>
      <div className="flex flex-wrap gap-3">
        <Link to="/shop" className="btn bg-white text-ink-900 hover:bg-brand-50 px-5 py-2.5 font-bold text-sm">
          Order Online <FiArrowRight />
        </Link>
        <Link to="/contact" className="btn border border-white/25 text-white hover:bg-white/10 px-5 py-2.5 font-semibold text-sm">
          Contact Us
        </Link>
      </div>
    </section>
  );
}

/**
 * Shared article chrome: SEO, hero, breadcrumbs, TOC wrapper, related + CTA.
 */
export function ArticleShell({
  post,
  keywords,
  metaTitle,
  metaDescription,
  readTime = '~10 min read',
  updatedLabel,
  toc,
  faqs = [],
  phone,
  whatsapp,
  children,
}) {
  const breadcrumbs = [
    { label: 'Home', to: '/' },
    { label: 'Exam Guides', to: '/blogs' },
    { label: post.listingTitle || post.title },
  ];

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: metaDescription || post.excerpt,
    image: `${SITE}/logo.png`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Organization', name: 'Shubham Xerox' },
    publisher: {
      '@type': 'Organization',
      name: 'Shubham Xerox',
      logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blogs/${post.id}` },
    keywords: (keywords || post.tags || []).join(', '),
  };

  const faqSchema = faqs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null;

  const schemas = [articleSchema, breadcrumbSchema(breadcrumbs)];
  if (faqSchema) schemas.push(faqSchema);

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <Seo
        title={metaTitle || post.title}
        description={metaDescription || post.excerpt}
        path={`/blogs/${post.id}`}
        type="article"
        keywords={keywords || post.tags}
        schema={schemas}
      />

      <div className="bg-gradient-to-r from-ink-950 via-slate-900 to-ink-900 text-white py-12 sm:py-14 px-4 sm:px-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-5" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link to="/blogs" className="hover:text-white">Exam Guides</Link>
            <span>/</span>
            <span className="text-slate-300 truncate max-w-[14rem] sm:max-w-none">{post.listingTitle || post.title}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold px-3 py-1 rounded-full">
              <FiBookOpen className="text-brand-400" /> {post.category}
            </span>
            {updatedLabel && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full">
                <FiClock size={12} /> {updatedLabel}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-[2.5rem] font-extrabold tracking-tight text-white mb-4 leading-tight text-balance">
            {post.title}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mb-5">{post.excerpt}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5"><FiUser size={13} /> {post.author}</span>
            <span className="inline-flex items-center gap-1.5"><FiCalendar size={13} /> {post.date}</span>
            <span className="inline-flex items-center gap-1.5"><FiTag size={13} /> {readTime}</span>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        {toc?.length > 0 && <Toc items={toc} />}
        {children}
        <ClosingCta phone={phone} whatsapp={whatsapp} />
        <RelatedPosts currentId={post.id} />
      </article>
    </div>
  );
}
