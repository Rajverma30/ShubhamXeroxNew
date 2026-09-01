/** Per-page SEO: title, description, canonical, OG/Twitter, JSON-LD. */
import { Helmet } from 'react-helmet-async';

const SITE = (import.meta.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '');
const STORE = import.meta.env.VITE_STORE_NAME || 'Subham Xerox';

export default function Seo({ title, description, path = '', image, type = 'website', noIndex = false, keywords, schema, children }) {
  const fullTitle = title ? `${title} | ${STORE}` : `${STORE} — Books, Exam Guides & Stationery Online`;
  const canonical = `${SITE}${path}`;
  const ogImage = image?.startsWith('http') ? image : `${SITE}${image || '/logo.png'}`;

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords?.length ? <meta name="keywords" content={keywords.join(', ')} /> : null}
      <link rel="canonical" href={canonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={STORE} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />
      {schema && <script type="application/ld+json">{JSON.stringify(schema)}</script>}
      {children}
    </Helmet>
  );
}

export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem', position: i + 1, name: it.label, item: `${SITE}${it.to || ''}`,
  })),
});
