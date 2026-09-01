# Shiprocket / Fastrr checkout setup

The code supports two checkout choices in Admin → Settings → Commerce:

- **Razorpay** keeps the existing OTP → delivery address → Razorpay flow.
- **Shiprocket / Fastrr** opens the Fastrr hosted checkout after the backend
  validates every cart item against MongoDB.

## Server variables

Add these in the deployed **backend** service, then restart it. Do not put
any of them in a Vite `VITE_*` variable or in the frontend project.

```env
SHIPROCKET_CHECKOUT_ENABLED=true
SHIPROCKET_CHECKOUT_API_KEY=<Fastrr Custom Endpoints API key>
SHIPROCKET_CHECKOUT_API_SECRET=<matching secret>
FASTRR_SELLER_DOMAIN=your-store-domain.in
SHIPROCKET_CHECKOUT_UI_BASE_URL=https://fastrr-boost-ui.pickrr.com

# Optional but recommended: instantaneous catalogue push after admin edits.
SHIPROCKET_AUTO_SYNC=true
FASTRR_PRODUCT_WEBHOOK_URL=<Fastrr product webhook URL>
FASTRR_COLLECTION_WEBHOOK_URL=<Fastrr collection webhook URL>
FASTRR_API_KEY=<Fastrr webhook API key>
FASTRR_WEBHOOK_SECRET=<Fastrr webhook signing secret>

# Used to turn local /uploads image paths into public URLs in catalogue data.
BACKEND_URL=https://api.your-store-domain.in
FRONTEND_URL=https://your-store-domain.in
```

`SHIPROCKET_API_KEY` / `SHIPROCKET_API_SECRET` are also accepted for a
deployment migrated from the reference project, but use one naming pair
consistently.

## Fastrr dashboard endpoints

Use the public backend domain—not the frontend URL—and use the same custom
endpoints API key as `SHIPROCKET_CHECKOUT_API_KEY`.

| Dashboard field | URL |
| --- | --- |
| Product Fetch | `https://api.your-store-domain.in/shiprocket-checkout/products` |
| Collection Fetch | `https://api.your-store-domain.in/shiprocket-checkout/collections` |
| Collection Product Fetch | `https://api.your-store-domain.in/shiprocket-checkout/collections/{collection_id}/products` |
| Checkout webhook | `https://api.your-store-domain.in/shiprocket-checkout/webhook` |

The **Domain Name** configured in Fastrr must exactly match
`FASTRR_SELLER_DOMAIN` (without `https://`, path, or port).

## First sync and smoke test

1. Deploy the backend with the variables above.
2. In Admin → Settings → Commerce, select **Shiprocket / Fastrr**, save, and
   click **Sync catalogue now**.
3. Check the status text in the same card. It reports whether catalogue API,
   webhook, and automatic sync configuration are present (without exposing a
   secret).
4. Add or edit one product in Admin. The backend sends one product webhook and
   its category/subcategory webhook automatically. This push never blocks the
   admin save; failures are logged for retry via **Sync catalogue now**.
5. Test a real low-value checkout. A successful signed Shiprocket webhook
   creates the local order and decrements stock once, so the order is visible
   in the current admin Orders page.

For a direct catalogue diagnostic, call the protected endpoint with the API
key; opening it normally in a browser should be rejected.

```powershell
Invoke-WebRequest 'https://api.your-store-domain.in/shiprocket-checkout/ping?debug=1' `
  -Headers @{ 'X-Api-Key' = '<Fastrr Custom Endpoints API key>' }
```
