/**
 * Floating bottom navigation for phones.
 *
 * Home · Search · Wishlist · Cart — the four things people reach for most.
 * Hidden from `lg` up, where the header already carries all of this.
 *
 * Search and Cart open their overlays rather than navigating, so the customer
 * never loses their place in a product list. Wishlist and Cart carry live
 * counts. The bar clears the iPhone home indicator via the safe-area inset in
 * `.mobile-nav`, and every page renders a `.mobile-nav-spacer` so content is
 * never hidden behind it.
 */
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiHome, FiSearch, FiShoppingBag } from 'react-icons/fi';
import { useStore } from '../../context/StoreContext';

export default function MobileNav() {
  const { cartCount, wishlist, setCartOpen, setSearchOpen, searchOpen, cartOpen } = useStore();
  const { pathname } = useLocation();

  const items = [
    { key: 'home', label: 'Home', icon: FiHome, to: '/', active: pathname === '/' },
    { key: 'search', label: 'Search', icon: FiSearch, onClick: () => setSearchOpen(true), active: searchOpen },
    { key: 'wishlist', label: 'Wishlist', icon: FiHeart, to: '/wishlist', active: pathname === '/wishlist', count: wishlist.length },
    { key: 'cart', label: 'Cart', icon: FiShoppingBag, onClick: () => setCartOpen(true), active: cartOpen, count: cartCount },
  ];

  return (
    <nav className="mobile-nav" aria-label="Main">
      <ul className="flex items-stretch" style={{ height: 'var(--mobile-nav-h)' }}>
        {items.map((item) => {
          const Icon = item.icon;

          const inner = (
            <>
              <span className="relative">
                <Icon size={21} strokeWidth={item.active ? 2.4 : 1.9} />
                {item.count > 0 && (
                  <span className={`absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${
                    item.key === 'wishlist' ? 'bg-rose-500' : 'bg-brand-600'
                  }`}>
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-semibold leading-none">{item.label}</span>
              {item.active && (
                <motion.span
                  layoutId="mobile-nav-active"
                  className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-ink-900"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
            </>
          );

          const cls = `relative flex h-full w-full flex-col items-center justify-center gap-1 transition-colors duration-200 ${
            item.active ? 'text-ink-900' : 'text-ink-400'
          }`;

          return (
            <li key={item.key} className="flex-1">
              {item.to ? (
                <Link to={item.to} className={cls} aria-current={item.active ? 'page' : undefined}>{inner}</Link>
              ) : (
                <button type="button" onClick={item.onClick} className={cls} aria-label={item.label}>{inner}</button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
