# Subham Xerox — Getting Started

Three independent projects. Unzip each wherever you like; they talk over HTTP.

```
subham-backend.zip   Node.js + Express + MongoDB API   → :5000
subham-user.zip      React storefront (customers)      → :5173
subham-admin.zip     React admin panel                 → :5174
```

Each has its own `README.md`, `package.json` and `.env.example`.

---

## How checkout works

**Shiprocket Checkout owns the purchase.** The storefront shows the catalogue
and the cart; clicking *Proceed to checkout* hands the cart to Shiprocket
Checkout (branded **Fastrr Checkout**), which collects the address, applies
discounts, takes payment and creates the order.

Consequences worth knowing:

- This backend **never stores orders or customers**. Those collections don't
  exist. Orders, refunds and payouts are managed in the Shiprocket dashboard at
  <https://checkout-dashboard.shiprocket.in>.
- The admin panel therefore has **no Orders, Customers or revenue reporting** —
  only the catalogue, merchandising, content and settings.
- `/track` on the storefront queries Shiprocket live; nothing is persisted.
- Shiprocket reads your catalogue through the endpoints the backend exposes at
  `/shiprocket-checkout/*`.

```
customer → storefront cart → Shiprocket Checkout → payment → Shiprocket order
                ↑                      ↓
        catalogue sync          /order-placed (thank-you page)
   /shiprocket-checkout/*
```

---

## Run it in order

### 1. Backend

```bash
cd subham-backend
cp .env.example .env          # set MONGO_URI + JWT_SECRET at minimum
npm install
npm run seed                  # demo catalogue + admin/admin account
npm run dev                   # http://localhost:5000/health
npm run doctor                # diagnose an empty or broken storefront
```

For automatic PDF → cover-image extraction install Poppler
(`sudo apt-get install poppler-utils` / `brew install poppler`). Without it,
PDF uploads still work — only the auto-generated gallery is skipped.

### 2. Storefront

```bash
cd subham-user
cp .env.example .env          # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                   # http://localhost:5173
```

### 3. Admin panel

```bash
cd subham-admin
cp .env.example .env
npm install
npm run dev                   # http://localhost:5174 — sign in with admin / admin
```

Change the admin password under **My profile** immediately. Credentials live in
the database, not in code.

---

## Connecting Shiprocket

You need two things from the client's Shiprocket account, and they're separate.

### a) Catalogue sync — Shiprocket calls you

```bash
# subham-backend/.env
SHIPROCKET_CHECKOUT_API_KEY=...
SHIPROCKET_CHECKOUT_SECRET=...
```

Register these URLs in the checkout dashboard:

| Field | URL |
| --- | --- |
| PRODUCT FETCH | `https://your-domain/shiprocket-checkout/products` |
| COLLECTION FETCH | `https://your-domain/shiprocket-checkout/collections` |
| COLLECTION PRODUCT FETCH | `https://your-domain/shiprocket-checkout/products?collection_id={id}` |

Verify with:

```bash
curl -H "x-api-key: <key>" http://localhost:5000/shiprocket-checkout/ping?debug=1
```

### b) Checkout hand-off — you call Shiprocket

```bash
# subham-user/.env
VITE_SHIPROCKET_CHECKOUT_MODE=sdk
VITE_SHIPROCKET_CHECKOUT_SCRIPT=<script src from the dashboard snippet>
VITE_SHIPROCKET_CHECKOUT_GLOBAL=fastrr
```

Until this is set the mode stays `disabled` and the checkout button explains
what's missing rather than failing silently.

> **Both payload shapes are informed defaults, not verified specs.** Shiprocket
> doesn't publish the custom-platform contract — it's sent during onboarding.
> Ask the client for the integration document (or email
> integration@shiprocket.in) and diff it against `/ping?debug=1`. Each side is
> isolated in exactly one file:
> `subham-backend/src/services/shiprocketCheckout.adapter.js` and
> `subham-user/src/lib/shiprocketCheckout.js`.

---

## Branding

Replace `logo.png` in `subham-user/public/` and `subham-admin/public/` with the
real file — same filename, nothing else to change. A placeholder is included,
and the `<Logo>` component falls back to a bundled SVG if the PNG is missing.

## Production checklist

- `NODE_ENV=production` and a long random `JWT_SECRET`.
- Real `FRONTEND_URL` / `ADMIN_URL` — CORS and cookies depend on them.
- `BACKEND_URL` must be absolute; stored image URLs are built from it.
- `subham-backend/uploads/` on a persistent volume, or `USE_CLOUDINARY=true`.
- `poppler-utils` present in the backend image.
- Both frontends served as SPAs (rewrite all paths to `index.html`).
- Point your CDN/nginx at the backend for `/sitemap.xml`, `/robots.txt` and
  `/shiprocket-checkout/*`.
- Put the admin panel behind IP allow-listing or a VPN.
- Rotate the Shiprocket API key/secret once integration is signed off.
