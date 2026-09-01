# Subham Xerox — Admin Panel

Single-admin control panel: React 18 + Vite + Tailwind CSS + TanStack React
Query + React Hook Form + Recharts + react-dropzone + react-quill.

---

## Quick start

```bash
cp .env.example .env         # point VITE_API_URL at the backend
npm install
npm run dev                  # http://localhost:5174
npm run build && npm run preview
```

Sign in with the credentials created by the backend seeder — **`admin` / `admin`**
by default. Change them under **My profile** immediately after the first login;
they live in the database, not in code.

Drop the real **`logo.png`** into `public/` (a placeholder `logo.svg` is bundled
and used automatically as a fallback).

---

## Screens

| Route | What it does |
| --- | --- |
| `/login` | JWT sign-in, rate-limited server-side |
| `/` | Dashboard — catalogue and traffic cards, traffic chart, product mix, most viewed, low stock, search insights |
| `/products` | Table with search, type/category filters, bulk actions, inline flag toggles, PDF re-extraction |
| `/products/new` · `/products/:id` | Full product editor (see below) |
| `/categories` · `/subcategories` | Modal CRUD with square image, wide banner, icon, colour, order, SEO |
| `/coupons` | Percent / flat / free-shipping codes with limits and schedules |
| `/banners` | Per-breakpoint artwork, CTA pair, priority, schedule window |
| `/homepage` | Drag-to-reorder homepage builder |
| `/media` | Bulk drag & drop library with copy-URL |
| `/reviews` | Approve, unapprove or delete guest reviews |
| `/newsletter` | Subscriber list with CSV export |
| `/messages` | Contact enquiries with inline email replies |
| `/settings` | Identity, commerce, content, policies, SEO (5 tabs) |
| `/profile` | Account details and password change |

---

## Product editor

One form covers all four product families (`book`, `ebook`, `stationery`,
`book+ebook`) and reveals only the relevant fields as you switch type.

**The PDF rule, surfaced in the UI.** Uploaded images always win. If you leave
the gallery empty and attach a PDF, the form tells you plainly that the backend
will rasterise its **first 5 pages** into WebP images and use those as the
gallery. On existing products, the images table shows a `from PDF` chip and the
product list offers a one-click re-extract.

Attaching a free-ebook PDF automatically promotes a `book` to `book+ebook`, and
exposes the free-download, preview and preview-page-count settings.

Uploads are `multipart/form-data`: `images[]` (≤12), `pdf` (1), `ebook` (1).
When editing, the form sends a `keepImages` array so removing a saved image is
explicit rather than inferred.

---

## Orders live in Shiprocket, not here

Checkout is handled by **Shiprocket Checkout** (branded *Fastrr Checkout*), so
Shiprocket owns the cart, payment, the order record and the customer record.
This panel therefore has **no Orders, no Customers and no revenue reporting** —
showing a partial copy of data we don't own would be misleading.

Manage orders, refunds, shipping and payouts at
**https://checkout-dashboard.shiprocket.in**. There's a shortcut in the sidebar
and on the dashboard.

What this panel still owns: the catalogue (products, categories, ebooks,
stationery), merchandising (banners, coupons, homepage builder), content
(media, reviews, newsletter, contact messages) and store settings/SEO. The
backend publishes the catalogue to Shiprocket through the endpoints documented
in the backend README.

## Architecture notes

- **React Query** owns all server state. Query keys include the filter object,
  so a filter change is a cache key change. `placeholderData: (prev) => prev`
  keeps the previous page visible while the next one loads — no table flicker.
  4xx responses are never retried.
- **URL as state.** `useListParams` keeps search, filters and page in the query
  string, so refreshing or sharing a link lands on the same view.
- **Auth.** The token is stored in localStorage and mirrored in an httpOnly
  cookie by the backend. A 401 on any request clears it and redirects to
  `/login?next=…`. `RequireAuth` blocks rendering until `/auth/me` confirms the
  session, so a stale token never paints a broken shell.
- **Forms.** React Hook Form throughout; `toFormData()` in `lib/api.js`
  serialises nested objects to JSON and appends files, so one helper covers
  every multipart endpoint.
- **Shared design tokens.** `tailwind.config.js` mirrors the storefront's
  palette, fonts and shadows so both apps read as one product.

## Deployment

```bash
npm run build     # → dist/
```

Serve `dist/` as a SPA (rewrite everything to `index.html`) on a **private or
access-controlled host** — `index.html` sets `noindex, nofollow`, but that isn't
access control. Set `VITE_API_URL` at build time, and make sure the backend's
`ADMIN_URL` matches this origin or CORS will reject the panel.
