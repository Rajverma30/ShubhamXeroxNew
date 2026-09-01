/** Admin route table with an auth gate and lazy-loaded screens. */
import { lazy } from 'react';
import { Navigate, createBrowserRouter, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { LoadingBlock } from './components/Ui';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const Products = lazy(() => import('./pages/Products'));
const ProductForm = lazy(() => import('./pages/ProductForm'));
const Banners = lazy(() => import('./pages/Banners'));
const Coupons = lazy(() => import('./pages/Coupons'));
const Orders = lazy(() => import('./pages/Orders'));
const HomepageBuilder = lazy(() => import('./pages/HomepageBuilder'));
const Media = lazy(() => import('./pages/Media'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));

const Categories = lazy(() => import('./pages/Taxonomy').then((m) => ({ default: m.Categories })));
const SubCategories = lazy(() => import('./pages/Taxonomy').then((m) => ({ default: m.SubCategories })));
const Reviews = lazy(() => import('./pages/Engagement').then((m) => ({ default: m.Reviews })));
const Newsletter = lazy(() => import('./pages/Engagement').then((m) => ({ default: m.Newsletter })));
const Messages = lazy(() => import('./pages/Engagement').then((m) => ({ default: m.Messages })));

/** Blocks the panel until /auth/me confirms the stored token. */
function RequireAuth({ children }) {
  const { isAuthed, booting } = useAuth();
  const location = useLocation();

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <LoadingBlock label="Checking your session…" />
      </div>
    );
  }
  if (!isAuthed) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return children;
}

/** Signed-in admins never need to see the login screen. */
function RedirectIfAuthed({ children }) {
  const { isAuthed, booting } = useAuth();
  if (booting) return null;
  if (isAuthed) return <Navigate to="/" replace />;
  return children;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <RedirectIfAuthed>
        <Login />
      </RedirectIfAuthed>
    ),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Dashboard /> },

      { path: 'products', element: <Products /> },
      { path: 'products/new', element: <ProductForm /> },
      { path: 'products/:id', element: <ProductForm /> },

      { path: 'categories', element: <Categories /> },
      { path: 'subcategories', element: <SubCategories /> },

      { path: 'orders', element: <Orders /> },
      { path: 'coupons', element: <Coupons /> },
      { path: 'banners', element: <Banners /> },
      { path: 'homepage', element: <HomepageBuilder /> },
      { path: 'media', element: <Media /> },
      { path: 'reviews', element: <Reviews /> },
      { path: 'newsletter', element: <Newsletter /> },
      { path: 'messages', element: <Messages /> },

      { path: 'settings', element: <Settings /> },
      { path: 'profile', element: <Profile /> },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default router;
