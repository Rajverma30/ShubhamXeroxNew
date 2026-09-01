/** Admin shell: collapsible sidebar, topbar, and the routed outlet. */
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiBarChart2, FiBookOpen, FiEdit3, FiExternalLink, FiFileText, FiGrid, FiHome, FiImage, FiLayers,
  FiLayout, FiLogOut, FiMail, FiMenu, FiMessageSquare, FiPackage, FiPercent, FiSettings,
  FiShoppingBag, FiStar, FiUser, FiX,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { Logo, Spinner } from './Ui';

const NAV = [
  {
    group: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: FiHome, end: true }],
  },
  {
    group: 'Catalogue',
    items: [
      { to: '/products', label: 'All products', icon: FiPackage },
      { to: '/products?type=book,book%2Bebook', label: 'Books', icon: FiBookOpen },
      { to: '/products?type=ebook', label: 'Ebooks', icon: FiFileText },
      { to: '/products?type=stationery', label: 'Stationery', icon: FiEdit3 },
      { to: '/categories', label: 'Categories', icon: FiGrid },
      { to: '/subcategories', label: 'Sub categories', icon: FiLayers },
    ],
  },
  {
    group: 'Selling',
    items: [{ to: '/coupons', label: 'Coupons & offers', icon: FiPercent }],
  },
  {
    group: 'Storefront',
    items: [
      { to: '/homepage', label: 'Homepage builder', icon: FiLayout },
      { to: '/banners', label: 'Banners', icon: FiImage },
      { to: '/media', label: 'Media library', icon: FiImage },
      { to: '/reviews', label: 'Reviews', icon: FiStar },
    ],
  },
  {
    group: 'Engage',
    items: [
      { to: '/newsletter', label: 'Newsletter', icon: FiMail },
      { to: '/messages', label: 'Contact messages', icon: FiMessageSquare },
    ],
  },
  {
    group: 'Configuration',
    items: [
      { to: '/settings', label: 'Settings & SEO', icon: FiSettings },
      { to: '/profile', label: 'My profile', icon: FiUser },
    ],
  },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname, location.search]);

  const signOut = async () => {
    setSigningOut(true);
    await logout();
    navigate('/login');
  };

  const sidebar = (
    <>
      <div className="px-4 py-5">
        <Logo dark className="h-9 w-9" />
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4 no-scrollbar">
        {NAV.map((section) => (
          <div key={section.group}>
            <p className="mb-1.5 px-3 text-2xs font-bold uppercase tracking-wider text-white/35">{section.group}</p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                // Query-string nav items need manual active detection.
                const [path, search] = item.to.split('?');
                const isActive = search
                  ? location.pathname === path && location.search.includes(search.split('=')[1]?.slice(0, 6) || search)
                  : undefined;

                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive: routerActive }) => {
                        const active = isActive !== undefined ? isActive : routerActive && !location.search;
                        return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          active ? 'bg-white text-ink-900 shadow-soft' : 'text-white/60 hover:bg-white/10 hover:text-white'
                        }`;
                      }}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        {/* Orders sits where the old "Orders in Shiprocket" link was, but as a
            normal in-app route: same tab, no external hop. */}
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <FiShoppingBag size={16} /> Orders
        </NavLink>
        <a
          href={import.meta.env.VITE_SITE_URL || 'http://localhost:5173'}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <FiExternalLink size={16} /> View storefront
        </a>
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-rose-500/20 hover:text-rose-200"
        >
          {signingOut ? <Spinner size={15} /> : <FiLogOut size={16} />} Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink-950 lg:flex">{sidebar}</aside>

      {/* mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-[70] bg-ink-950/60 lg:hidden" />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="fixed inset-y-0 left-0 z-[75] flex w-72 flex-col bg-ink-950 lg:hidden"
            >
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 text-white/50 hover:text-white">
                <FiX size={19} />
              </button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-ink-100 bg-white/85 px-4 backdrop-blur-xl sm:px-6">
          <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu" className="btn-icon -ml-1 text-ink-600 hover:bg-ink-100 lg:hidden">
            <FiMenu size={20} />
          </button>

          <div className="hidden items-center gap-2 text-sm text-ink-400 sm:flex">
            <FiBarChart2 size={15} />
            <span className="font-medium text-ink-600">Subham Xerox control panel</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <NavLink to="/profile" className="flex items-center gap-2.5 rounded-full border border-ink-200 py-1 pl-1 pr-3.5 transition-colors hover:bg-ink-50">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-2xs font-bold text-white">
                {(admin?.name || admin?.username || 'A').slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden text-xs font-semibold text-ink-800 sm:block">{admin?.name || admin?.username}</span>
            </NavLink>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-[1400px]"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
