/**
 * Route table. Every page is code-split with React.lazy; <Layout> renders a
 * Suspense fallback while a chunk loads.
 */
import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/layout/ErrorBoundary';
import Home from './pages/Home';

const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Categories = lazy(() => import('./pages/Categories'));
const Cart = lazy(() => import('./pages/Cart'));
const OrderPlaced = lazy(() => import('./pages/OrderPlaced'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Wishlist = lazy(() => import('./pages/Wishlist'));

const CategoryPage = lazy(() => import('./pages/CategoryPage').then((m) => ({ default: m.CategoryPage })));
const CollectionPage = lazy(() => import('./pages/CategoryPage').then((m) => ({ default: m.CollectionPage })));
const About = lazy(() => import('./pages/Static').then((m) => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Static').then((m) => ({ default: m.Contact })));
const Policy = lazy(() => import('./pages/Static').then((m) => ({ default: m.Policy })));
const NotFound = lazy(() => import('./pages/Static').then((m) => ({ default: m.NotFound })));

/** Pre-configured <Shop> variants for the themed listing routes. */
const Ebooks = () => (
  <Shop fixed={{ type: 'ebook,book+ebook' }} heading="Ebooks & free downloads"
    subheading="Digital editions and print titles that ship with a free PDF."
    breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Ebooks' }]}
    seo={{ title: 'Free ebooks & digital editions', description: 'Download free ebooks with selected Subham Xerox titles.', path: '/ebooks' }} />
);

const Stationery = () => (
  <Shop fixed={{ category: 'stationery' }} heading="Stationery"
    subheading="Pens, notebooks, files and art supplies worth keeping on your desk."
    breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Stationery' }]}
    seo={{ title: 'Stationery', description: 'Buy pens, notebooks, registers, files and art supplies online.', path: '/stationery' }} />
);

const Offers = () => (
  <Shop fixed={{ minDiscount: '10', sort: 'discount' }} heading="Offers & discounts"
    subheading="Everything currently marked down, biggest savings first."
    breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Offers' }]}
    seo={{ title: 'Offers & discounts', description: 'Discounted exam books, school textbooks and stationery.', path: '/offers' }} />
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    // NotFound is lazy, and errorElement renders outside the Layout tree, so
    // it needs its own Suspense boundary.
    errorElement: (
      <ErrorBoundary>
        <Suspense fallback={null}><NotFound /></Suspense>
      </ErrorBoundary>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: 'shop', element: <Shop /> },
      { path: 'product/:slug', element: <ProductDetail /> },
      { path: 'categories', element: <Categories /> },
      { path: 'category/:slug', element: <CategoryPage /> },
      { path: 'collection/:slug', element: <CollectionPage /> },
      { path: 'ebooks', element: <Ebooks /> },
      { path: 'stationery', element: <Stationery /> },
      { path: 'offers', element: <Offers /> },
      { path: 'cart', element: <Cart /> },
      // Shiprocket Checkout returns the customer here after payment.
      { path: 'order-placed', element: <OrderPlaced /> },
      { path: 'track', element: <TrackOrder /> },
      { path: 'wishlist', element: <Wishlist /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'policy/:slug', element: <Policy /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
