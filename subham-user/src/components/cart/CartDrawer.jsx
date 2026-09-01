/**
 * Slide-out guest cart, persisted to localStorage.
 * Totals here are an estimate — the server recomputes every line at checkout.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiDownload, FiShoppingBag, FiTrash2, FiTruck } from 'react-icons/fi';
import { useStore } from '../../context/StoreContext';
import { money, placeholderImage } from '../../lib/format';
import { Drawer } from '../ui/Overlay';
import { EmptyState, QuantityStepper } from '../ui/Common';
import CheckoutFlow from '../checkout/CheckoutFlow';

export default function CartDrawer() {
  const {
    cart, cartOpen, setCartOpen, cartSubtotal, cartMrpTotal, setQuantity, removeFromCart,
    shippingGap, freeShippingAbove, cartCount, toast, settings,
  } = useStore();

  const savings = Math.max(0, cartMrpTotal - cartSubtotal);
  const progress = Math.min(100, (cartSubtotal / freeShippingAbove) * 100);

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  /**
   * Check out straight from the drawer — sending the customer to the cart page
   * first was an extra tap for no benefit. The drawer closes as the overlay
   * opens so the two never stack.
   */
  const goToCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <>
      <Drawer open={cartOpen} onClose={() => setCartOpen(false)} title={`Your cart${cartCount ? ` (${cartCount})` : ''}`}
      footer={cart.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-ink-500">Subtotal</span>
            <span className="text-xl font-bold text-ink-900">{money(cartSubtotal)}</span>
          </div>
          {savings > 0 && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              You're saving {money(savings)} on this order
            </p>
          )}
          <p className="text-2xs text-ink-400">Delivery is calculated for your PIN code at checkout.</p>
          <button type="button" onClick={goToCheckout}  className="btn-primary w-full gap-2">
            {`Checkout · ${money(cartSubtotal)}`}
          </button>
          <Link to="/cart" onClick={() => setCartOpen(false)} className="btn-ghost w-full justify-center">View full cart</Link>
        </div>
      )}>
      {cart.length === 0 ? (
        <div className="p-5">
          <EmptyState icon={FiShoppingBag} title="Your cart is empty"
            description="Browse exam guides, school textbooks and stationery — checkout takes under a minute, no account needed."
            action={<Link to="/shop" onClick={() => setCartOpen(false)} className="btn-primary">Start shopping</Link>} />
        </div>
      ) : (
        <>
          <div className="border-b border-ink-100 bg-ink-50/60 px-5 py-3.5">
            {shippingGap > 0
              ? <p className="mb-2 text-xs text-ink-600">Add <span className="font-bold text-ink-900">{money(shippingGap)}</span> more for free delivery</p>
              : <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><FiTruck size={13} /> Free delivery unlocked</p>}
            <div className="h-1.5 overflow-hidden rounded-full bg-ink-200">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500"
                initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
            </div>
          </div>

          <ul className="divide-y divide-ink-100">
            <AnimatePresence initial={false}>
              {cart.map((line) => (
                <motion.li key={line.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }} transition={{ duration: 0.25 }}
                  className="flex gap-3.5 overflow-hidden p-4">
                  <Link to={`/product/${line.slug}`} onClick={() => setCartOpen(false)} className="shrink-0">
                    <img src={line.image || placeholderImage(line.title)} alt="" loading="lazy"
                      className="h-24 w-[4.5rem] rounded-xl border border-ink-100 object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link to={`/product/${line.slug}`} onClick={() => setCartOpen(false)}
                      className="line-clamp-2 text-sm font-semibold leading-snug text-ink-900 hover:text-brand-700">
                      {line.title}
                    </Link>
                    {line.author && <p className="mt-0.5 truncate text-xs text-ink-400">{line.author}</p>}
                    {line.hasFreeEbook && (
                      <p className="mt-1 inline-flex items-center gap-1 text-2xs font-semibold text-emerald-600"><FiDownload size={10} /> Free ebook included</p>
                    )}
                    <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                      <QuantityStepper size="sm" value={line.quantity} onChange={(q) => setQuantity(line.id, q)}
                        max={Math.max(1, Math.min(20, line.stock || 20))} />
                      <div className="text-right">
                        <p className="text-sm font-bold text-ink-900">{money(line.price * line.quantity)}</p>
                        {line.mrp > line.price && <p className="text-2xs text-ink-400 line-through">{money(line.mrp * line.quantity)}</p>}
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeFromCart(line.id)} aria-label={`Remove ${line.title}`}
                    className="btn-icon h-8 w-8 shrink-0 self-start text-ink-300 hover:bg-rose-50 hover:text-rose-500">
                    <FiTrash2 size={14} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}
      </Drawer>

      {/* mobile number → OTP → address → Razorpay */}
      {checkoutOpen && <CheckoutFlow onClose={() => setCheckoutOpen(false)} />}
    </>
  );
}
