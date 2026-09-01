/**
 * Sticky glass header: announcement bar, logo, category mega-menu, search,
 * wishlist and cart. On phones the wishlist/cart actions live in the floating
 * bottom nav instead, so this stays uncluttered.
 */
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronDown, FiHeart, FiMenu, FiPhone, FiSearch, FiShoppingBag, FiTruck, FiX } from 'react-icons/fi';
import { useStore } from '../../context/StoreContext';
import { useScrolled } from '../../hooks';
import { Logo } from '../ui/Common';

const STATIC_LINKS = [
  { label: 'All products', to: '/shop' },
  { label: 'Free ebooks', to: '/ebooks' },
  { label: 'Offers', to: '/offers' },
  { label: 'Track order', to: '/track' },
];

export default function Header() {
  const { settings, categories, cartCount, wishlist, setCartOpen, setSearchOpen } = useStore();
  const scrolled = useScrolled(10);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [barVisible, setBarVisible] = useState(true);

  useEffect(() => { setMobileOpen(false); setOpenMenu(null); }, [location.pathname]);

  const announcement = settings?.announcementBar;

  return (
    <>
      <AnimatePresence>
        {announcement?.enabled && announcement.text && barVisible && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="relative overflow-hidden gradient-ink text-white">
            <div className="container-x flex items-center justify-center gap-3 py-2 text-center">
              <FiTruck size={13} className="shrink-0 opacity-70" />
              <p className="text-2xs font-medium sm:text-xs">
                {announcement.url
                  ? <Link to={announcement.url} className="underline decoration-white/30 underline-offset-2 hover:decoration-white">{announcement.text}</Link>
                  : announcement.text}
              </p>
              <button type="button" onClick={() => setBarVisible(false)} aria-label="Dismiss announcement"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 transition-colors hover:text-white">
                <FiX size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-premium ${scrolled ? 'glass shadow-soft' : 'border-b border-transparent bg-white'}`}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="container-x flex h-[var(--header-h)] items-center gap-3 sm:gap-5">
          <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu"
            className="btn-icon -ml-2 text-ink-700 hover:bg-ink-100 lg:hidden">
            <FiMenu size={21} />
          </button>

          {/* the wordmark is dropped on the narrowest phones */}
          <span className="hidden min-[380px]:contents"><Logo className="h-9 w-9 sm:h-10 sm:w-10" /></span>
          <span className="min-[380px]:hidden"><Logo className="h-9 w-9" showText={false} /></span>

          <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Categories">
            {categories.slice(0, 4).map((cat) => (
              <div key={cat._id} className="relative" onMouseEnter={() => setOpenMenu(cat._id)}>
                <Link to={`/category/${cat.slug}`}
                  className={`inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    openMenu === cat._id ? 'bg-ink-100 text-ink-900' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'}`}>
                  {cat.name}
                  {cat.subCategories?.length > 0 && (
                    <FiChevronDown size={13} className={`transition-transform duration-300 ${openMenu === cat._id ? 'rotate-180' : ''}`} />
                  )}
                </Link>
              </div>
            ))}
            {STATIC_LINKS.slice(0, 2).map((l) => (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) => `rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
            <button type="button" onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2.5 rounded-full border border-ink-200 bg-white/70 px-4 py-2.5 text-sm text-ink-400 transition-all duration-300 hover:border-ink-300 hover:text-ink-600 md:flex">
              <FiSearch size={15} />
              <span className="w-36 text-left lg:w-48">Search the store…</span>
              <kbd className="rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-2xs text-ink-400">⌘K</kbd>
            </button>

            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search"
              className="btn-icon text-ink-700 hover:bg-ink-100 md:hidden">
              <FiSearch size={19} />
            </button>

            {/* wishlist + cart live in the mobile nav on phones */}
            <Link to="/wishlist" aria-label="Wishlist" className="btn-icon relative hidden text-ink-700 hover:bg-ink-100 lg:inline-flex">
              <FiHeart size={19} />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-2xs font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <button type="button" onClick={() => setCartOpen(true)} aria-label={`Cart, ${cartCount} items`}
              className="btn-icon relative hidden text-ink-700 hover:bg-ink-100 lg:inline-flex">
              <FiShoppingBag size={19} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span key={cartCount} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-2xs font-bold text-white">
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {openMenu && (() => {
            const cat = categories.find((c) => c._id === openMenu);
            if (!cat?.subCategories?.length) return null;
            return (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 top-full hidden border-t border-ink-100 bg-white/95 shadow-lift backdrop-blur-xl lg:block">
                <div className="container-x py-7">
                  <div className="mb-4 flex items-baseline justify-between">
                    <h3 className="font-display text-lg font-bold text-ink-900">{cat.name}</h3>
                    <Link to={`/category/${cat.slug}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700">View everything →</Link>
                  </div>
                  <div className="grid grid-cols-4 gap-x-6 gap-y-1.5">
                    {cat.subCategories.map((sub) => (
                      <Link key={sub._id} to={`/collection/${sub.slug}`}
                        className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900">
                        <span className="truncate">{sub.name}</span>
                        {sub.productCount > 0 && <span className="ml-2 shrink-0 text-2xs text-ink-300">{sub.productCount}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} categories={categories} settings={settings} />
    </>
  );
}

function MobileMenu({ open, onClose, categories, settings }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            className="fixed inset-0 z-[88] bg-ink-950/50 backdrop-blur-sm lg:hidden" />
          <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="fixed inset-y-0 left-0 z-[89] flex w-[86%] max-w-sm flex-col bg-white shadow-lift lg:hidden">
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-4">
              <Logo className="h-9 w-9" />
              <button type="button" onClick={onClose} aria-label="Close menu" className="btn-icon text-ink-500 hover:bg-ink-100">
                <FiX size={19} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3">
              {categories.map((cat) => (
                <div key={cat._id} className="border-b border-ink-50 last:border-0">
                  <div className="flex items-center">
                    <Link to={`/category/${cat.slug}`} onClick={onClose} className="flex-1 py-3 pl-2 text-sm font-semibold text-ink-900">
                      {cat.name}
                    </Link>
                    {cat.subCategories?.length > 0 && (
                      <button type="button" aria-label={`Toggle ${cat.name}`} aria-expanded={expanded === cat._id}
                        onClick={() => setExpanded(expanded === cat._id ? null : cat._id)} className="btn-icon h-9 w-9 text-ink-400">
                        <FiChevronDown size={16} className={`transition-transform duration-300 ${expanded === cat._id ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                  <AnimatePresence initial={false}>
                    {expanded === cat._id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="grid grid-cols-2 gap-1 pb-3 pl-2">
                          {cat.subCategories.map((sub) => (
                            <Link key={sub._id} to={`/collection/${sub.slug}`} onClick={onClose}
                              className="truncate rounded-lg px-2 py-1.5 text-xs text-ink-600 hover:bg-ink-50">
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <div className="mt-3 space-y-0.5 border-t border-ink-100 pt-3">
                {STATIC_LINKS.map((l) => (
                  <Link key={l.to} to={l.to} onClick={onClose} className="block rounded-xl px-2 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">{l.label}</Link>
                ))}
                <Link to="/about" onClick={onClose} className="block rounded-xl px-2 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">About us</Link>
                <Link to="/contact" onClick={onClose} className="block rounded-xl px-2 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">Contact</Link>
              </div>
            </nav>

            {settings?.phone && (
              <a href={`tel:${settings.phone}`} className="flex items-center gap-2.5 border-t border-ink-100 px-5 py-4 text-sm font-semibold text-ink-900">
                <FiPhone size={15} className="text-brand-600" /> {settings.phone}
              </a>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
