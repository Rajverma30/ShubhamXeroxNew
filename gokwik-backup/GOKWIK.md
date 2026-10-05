# GoKwik Checkout

Checkout on this store is GoKwik (Kwik Checkout). It replaced Shiprocket (Fastrr) Checkout.
Shiprocket is still used for one thing only: PIN-code delivery estimates and courier tracking.

## How it works

```
Customer presses Checkout
   │
   ├─ 1. storefront → POST /api/checkout/session        (product ids + quantities only)
   │                  ← { sessionKey, mid, environment }
   │
   ├─ 2. storefront loads gokwik.js and calls
   │        gokwikSdk.initCheckout({ mid, merchantParams: { merchantCheckoutId: sessionKey } })
   │
   ├─ 3. GoKwik's servers → this API   /wp-json/gokwik/v1/cart/…   (App ID + App Secret headers)
   │        read cart · list/apply coupons · set address · place-order
   │
   └─ 4. gokwikSdk fires 'order-complete' → storefront opens /order-placed?order=SX-…
```

Prices never come from the browser. Every amount GoKwik shows is computed here from the
database (`src/services/gokwik/cart.js`): item price, coupon, delivery charge, total.

| What | Where it is set |
| --- | --- |
| Item prices, stock | Admin → Products |
| Coupons | Admin → Coupons (one coupon per order) |
| Delivery charge / free-delivery amount | Admin → Settings → Flat shipping, Free shipping above |
| COD on/off, COD fee, prepaid discount, payment methods | GoKwik dashboard |

## Setup — three steps

### 1. Put the credentials in `.env`

```
GOKWIK_ENV=production
GOKWIK_MID=          # Merchant ID
GOKWIK_APP_ID=       # App ID
GOKWIK_APP_SECRET=   # App Secret
```

Restart the server. On boot it logs `GoKwik Checkout ready (production)`.

The App Secret is a password. Keep it out of chat, email and git. `.env` is currently
**tracked by git in this repository** — stop tracking it before pushing anywhere:

```
git rm --cached .env && echo ".env" >> .gitignore
```

### 2. Check your side

```
npm test               # 13 tests of the whole checkout path, no database needed
npm run gokwik:check   # tests the LIVE server at BACKEND_URL the way GoKwik will call it
```

`gokwik:check` opens a session and reads the cart. It places no order and never contacts GoKwik.

### 3. What to send GoKwik

GoKwik has to point your Merchant ID at this server. Send their integration / onboarding team:

> Our store runs on a custom Node.js backend that implements the same merchant cart API as
> your WooCommerce plugin (kwikcheckout-woo v1.1.6), at the same paths.
>
> - Store / API base URL: `https://www.shubhamxerox.in`
> - Cart API: `https://www.shubhamxerox.in/wp-json/gokwik/v1/cart`
>   (also available at `/gokwik/v1/cart`; proxied to the Node backend)
> - Health check: `https://www.shubhamxerox.in/wp-json/gokwik/v1/cart/health-check`
> - Auth: `appid` + `appsecret` headers (also accepts `app-id`/`app-secret`, `gk-app-id`/`gk-app-secret`)
> - `merchantCheckoutId` passed to `gokwikSdk.initCheckout` is the `session_key` for every cart call
> - `place-order` returns `{ "id": "SX-261004-AB12C" }` — a string order number, used as `merchant_order_id`
> - Storefront domain: `https://www.shubhamxerox.in`
>
> Please configure our MID for this endpoint and confirm.

**Until GoKwik confirms this, the popup will not load your cart.** That step is on their side
and cannot be done from this code.

Then place one real test order (a low-value item, COD and one prepaid) and check it appears in
Admin → Orders.

## Endpoints GoKwik calls

All under `/wp-json/gokwik/v1` (alias `/gokwik/v1`). Errors use WordPress's shape:
`{ code, message, data: { status } }`.

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/cart` | `session_key` → the cart |
| GET | `/cart/get-coupons` | coupons marked "show on site" that apply to this cart |
| POST | `/cart/apply-coupon`, `/cart/remove-coupon` | invalid coupons answer HTTP 200 with an error body, as the plugin does |
| POST | `/cart/set-address`, `/cart/set-shipping-method` | |
| POST | `/cart/remove-out-of-stock-items` | |
| POST | `/cart/place-order` | idempotent per session and per `gokwik_order_id`; refuses a total that differs from ours |
| POST | `/cart/check-order-exists`, `/cart/update-order-status` | |
| POST | `/cart/get-wallet-balance`, `/cart/deduct-wallet-balance` | no wallet on this store |
| POST | `/cart/process-refund` | no app headers; verified by merchant id + sha512 hmac |
| ANY | `/cart/health-check` | no auth |

When an admin changes an order's status or adds an AWB, this server tells GoKwik
(`POST v3/orders/update`), so their dashboard stays in step.

## If something does not work

| Symptom | Cause |
| --- | --- |
| Button says "Online checkout is not set up yet" | One of the three `GOKWIK_*` values is empty on the running server, or it was not restarted |
| Popup opens, then shows an error / empty cart | GoKwik has not mapped the MID to this server yet, or cannot reach `BACKEND_URL` — run `npm run gokwik:check` |
| Log: `GoKwik cart API: rejected … wrong app id/secret` | The App ID/Secret in `.env` differ from the ones GoKwik holds (regenerated?) |
| Log: `place-order total mismatch` | GoKwik charged a different amount than this server computed — usually a COD fee or prepaid discount it did not send as `fee_lines`; send GoKwik the log line |
| Refunds rejected with `gc_invalid_hmac` | GoKwik signs refunds differently for your account; ask them for the formula. As a stop-gap `GOKWIK_REFUND_HMAC=off` skips the check |
| `health-check` is 404 on the live URL | nginx is not passing `/wp-json/` to Node, or old code is deployed |

## Honest limits

- This is built from GoKwik's published WooCommerce plugin, the only public description of the
  cart API. It is fully tested on this side, but it has **not** been run against GoKwik's live
  servers — that needs their mapping (step 3) and one real test order.
- `GOKWIK_ENV=sandbox` needs sandbox credentials from GoKwik; production keys do not work there.

## What was removed

Shiprocket (Fastrr) Checkout: token minting, catalogue feed, order webhook, catalogue push.
The files are in `_removed/shiprocket-checkout/` at the project root (and in git history) —
delete that folder once GoKwik is live. `SHIPROCKET_EMAIL` / `SHIPROCKET_PASSWORD` are still
used for delivery estimates and tracking.
