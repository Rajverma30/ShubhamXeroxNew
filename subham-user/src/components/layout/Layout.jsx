/** App shell: header, animated outlet, footer, mobile nav and global overlays. */
import { Suspense, useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation, useNavigationType } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';
import ScrollTop from './ScrollTop';
import CartDrawer from '../cart/CartDrawer';
import SearchOverlay from '../search/SearchOverlay';
import ToastStack from '../ui/Toast';
import PopupBanner from '../home/PopupBanner';
import { usePageView } from '../../hooks';
import { Spinner } from '../ui/Common';

export default function Layout() {
  const location = useLocation();
  const navigationType = useNavigationType();
  usePageView(location.pathname);

  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, location.hash]);

  // Enter-only animation — AnimatePresence mode="wait" + exit opacity breaks
  // browser-back (POP) navigation and leaves a blank main area.
  const animatePage = navigationType !== 'POP';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <motion.div
          key={location.key}
          initial={animatePage ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><Spinner size={28} className="text-ink-300" /></div>}>
            <Outlet />
          </Suspense>
        </motion.div>
      </main>

      <Footer />

      {/* Keeps the footer clear of the floating nav on phones. */}
      <div className="mobile-nav-spacer" aria-hidden />

      <MobileNav />
      <CartDrawer />
      <SearchOverlay />
      <ToastStack />
      <PopupBanner />
      <ScrollTop />
      <ScrollRestoration />
    </div>
  );
}
