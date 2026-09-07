/** Per-page SEO: title, description, canonical, OG/Twitter, JSON-LD. */
import { Helmet } from 'react-helmet-async';

const SITE = (import.meta.env.VITE_SITE_URL || 'https://shubhamxerox.in').replace(/\/$/, '');
const STORE = 'Shubham Xerox (Subham Xerox)';

const DEFAULT_KEYWORDS = [
  'Shubham Xerox', 'Subham Xerox', 'Shubham Xerox Indore', 'Subham Xerox Bhawarkua',
  'MPPSC books online Indore', 'MP Board school books', 'Pariksha Bodh 2026',
  'Ghatna Chakra Purvavlokan', 'Stationery shop Bhawarkua Indore', 'Exam books online India',
];

export default function Seo({ title, description, path = '', image, type = 'website', noIndex = false, keywords, schema, children }) {
  const fullTitle = title ? `${title} | Shubham Xerox (Subham Xerox)` : `Shubham Xerox — Books, MPPSC Guides & Stationery Online Indore`;
  const canonical = `${SITE}${path}`;
  const ogImage = image?.startsWith('http') ? image : `${SITE}${image || '/logo.png'}`;

  const allKeywords = Array.from(new Set([...(keywords || []), ...DEFAULT_KEYWORDS]));

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta name="keywords" content={allKeywords.join(', ')} />
      <link rel="canonical" href={canonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Shubham Xerox" />
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

export const storeSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'BookStore',
  name: 'Shubham Xerox',
  alternateName: ['Subham Xerox', 'Shubham Xerox Indore', 'Subham Xerox Bhawarkua'],
  url: 'https://shubhamxerox.in',
  logo: 'https://shubhamxerox.in/logo.png',
  image: 'https://shubhamxerox.in/logo.png',
  description: 'Buy exam books, MPPSC guides, school textbooks and stationery online at Shubham Xerox Indore. Fast delivery across India.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Bhawarkua Square, Main Road',
    addressLocality: 'Indore',
    addressRegion: 'Madhya Pradesh',
    postalCode: '452001',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 22.6934,
    longitude: 75.8677,
  },
  priceRange: '₹',
});
