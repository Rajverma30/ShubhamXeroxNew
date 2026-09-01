# Subham Xerox — Storefront

Customer-facing store: React 18 + Vite + Tailwind CSS + Framer Motion +
React Router + Swiper + Axios. **No customer login** — cart and wishlist live
in localStorage, and checkout is handed to Shiprocket Checkout.

---

## Quick start

```bash
cp .env.example .env         # point VITE_API_URL at the backend
npm install
npm run dev                  # http://localhost:5173
npm run build
```

The backend must be running and seeded for content to appear.

> **Port matters.** `VITE_API_URL` must match the backend's `PORT` /
> `BACKEND_URL`. Product images are served from that same origin, so a mismatch
> shows up as missing images. On macOS, port 5000 is taken by AirPlay Receiver
> (it answers 403), which is why the default here is **5005**.

---

## Checkout

Shiprocket Checkout is the only checkout — there's no alternative provider and
no fallback by design. The entire hand-off is one file:
**`src/lib/shiprocketCheckout.js`**, one `beginCheckout(cart)` function.

**Configured from the admin panel**, under Settings → Checkout: script URL,
global name, channel id and mode. Shiprocket issues that embed snippet per
merchant from `checkout-dashboard.shiprocket.in`, so it can't be baked into the
build — this way the client pastes it in and it takes effect immediately, no
rebuild. `VITE_SHIPROCKET_CHECKOUT_*` env vars work as a per-deployment
override.

Until a script URL is set, the checkout button reports that plainly rather than
failing silently.

---

## Mobile

- **Floating bottom nav** — Home, Search, Wishlist, Cart, with live counts.
  Search and Cart open overlays rather than navigating, so the customer never
  loses their place in a product list. Hidden from `lg` up.
- **Sticky action bars** on the product and cart pages, stacked directly above
  the nav so the two never overlap.
- **Inputs forced to 16px under 768px.** Below that, iOS Safari zooms the whole
  viewport on focus — the classic "broken on iPhone" bug.
- **Safe-area insets** on every fixed element, clearing the home indicator.
- Icon buttons grow 40px → 44px on touch devices.
- `overflow-x: hidden` so one wide element can't shift the page sideways.
- The logo drops its wordmark below 380px.

---

## Typography

**Plus Jakarta Sans** throughout — one sans-serif family, no serif, nothing
italic (`<em>`/`<i>` are normalised upright). To swap it, change the Google
Fonts `<link>` in `index.html` and `fontFamily` in `tailwind.config.js`.

All text is scaled by one CSS variable in `src/styles/index.css`:

```css
:root { --font-scale: 1.06; }   /* 1 = original · 0.95 = compact · 1.15 = large */
```

Tailwind's `fontSize` scale is `calc(<rem> * var(--font-scale))`, so this
resizes **text only** — spacing stays on the normal rem scale and nothing
reflows.

---

## Structure

```
src/
  main.jsx / App.jsx / routes.jsx      entry, providers, code-split routes
  context/StoreContext.jsx             settings · cart · wishlist · toasts
  hooks/index.js                       useFetch, useHoverImageRotation, …
  lib/
    api.js                             axios instance, guest id, envelope unwrap
    format.js                          money, price maths, image URL resolution
    storage.js                         safe localStorage wrapper
    shiprocketCheckout.js              the checkout hand-off
  components/
    layout/    Header · Footer · Layout · MobileNav · ScrollTop · ErrorBoundary
    ui/        Common · Overlay · Skeleton · Toast · Seo · LazyImage
    product/   ProductCard · QuickView · Gallery · BookPreview · ProductRail · Filters
    home/      HeroSlider · CategoryGrid · BannerStrip · Testimonials
               NewsletterBlock · PopupBanner
    search/    SearchOverlay
    cart/      CartDrawer
  pages/       Home · Shop · ProductDetail · CategoryPage · Categories · Cart
               OrderPlaced · TrackOrder · Wishlist · Static
```

## Feature notes

**Hover image rotation.** `useHoverImageRotation` drives the spec'd
interaction: hovering a product image steps through the first **5** gallery
images every **700 ms**, returning to image 1 on mouse-out. Images cross-fade
via Framer Motion, progress dots fade in, and touch devices are excluded — a
tap shouldn't start an animation the user can't stop.

**Search.** `⌘K` / `Ctrl+K` anywhere. Suggestions are debounced (260 ms) and
abortable; each row shows image, title, author, price, category and
sub-category.

**Filters as URL state.** Every filter, sort and page lives in the query
string, so filtered views are shareable and the back button behaves.

**Image URLs survive a backend move.** Stored image URLs are absolute, which
would break if the API changed port. `resolveAssetUrl()` — the single point all
images pass through — rewrites the origin to whatever `VITE_API_URL` points at.

**Tracking without stored orders.** `/track` sends the order number or AWB to
the backend, which queries Shiprocket live. Nothing is persisted locally.
