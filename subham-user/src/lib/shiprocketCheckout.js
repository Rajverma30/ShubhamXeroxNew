/**
 * ════════════════════════════════════════════════════════════════════════════
 *  Shiprocket Checkout hand-off — rewritten to the official custom-platform
 *  integration guide.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Replaces: subham-user/src/lib/shiprocketCheckout.js
 *
 * WHAT CHANGED AND WHY
 * --------------------
 * The previous version called `window.fastrr.open(payload)` with the cart. That
 * was a guess made before the integration document existed, and it is wrong.
 * The documented flow is:
 *
 *   1. OUR BACKEND mints a token   POST /api/checkout/token
 *      (Shiprocket requires the request to be HMAC-signed with the API secret,
 *       so this cannot happen in the browser)
 *   2. the browser loads          https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js
 *   3. the browser calls          HeadlessCheckout.addToCart(event, token, { fallbackUrl })
 *   4. Shiprocket opens its iframe, takes payment, and POSTs the order to our
 *      webhook. The customer returns to /order-placed.
 *
 * The cart is NOT sent from here. Only product ids and quantities go to our
 * own API, which re-reads prices from the database — a browser-supplied price
 * is never trusted.
 *
 * CONFIGURATION — admin panel → Settings → Checkout, or env vars:
 *   scriptUrl   VITE_SHIPROCKET_CHECKOUT_SCRIPT
 *   styleUrl    VITE_SHIPROCKET_CHECKOUT_STYLE
 *   mode        VITE_SHIPROCKET_CHECKOUT_MODE     auto | off
 * Defaults point at Shiprocket's production URLs, so checkout works with no
 * configuration at all once the backend has its API key.
 */
// NOTE: `api` is an object of named helpers, not an axios instance — there is
// no api.post(). The underlying axios client is exposed as `api.raw`, which is
// what a new endpoint like this has to use.
import api from './api';

const ENV = import.meta.env;

const DEFAULT_SCRIPT = 'https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js';
const DEFAULT_STYLE = 'https://checkout-ui.shiprocket.com/assets/styles/shopify.css';

/* ─────────────────────────── configuration ─────────────────────────── */

export function resolveConfig(settings = {}) {
  const cfg = settings || {};
  const declared = cfg.mode || ENV.VITE_SHIPROCKET_CHECKOUT_MODE || 'auto';

  return {
    enabled: declared !== 'off',
    scriptUrl: cfg.scriptUrl || ENV.VITE_SHIPROCKET_CHECKOUT_SCRIPT || DEFAULT_SCRIPT,
    styleUrl: cfg.styleUrl || ENV.VITE_SHIPROCKET_CHECKOUT_STYLE || DEFAULT_STYLE,
    globalName: cfg.globalName || 'HeadlessCheckout',
  };
}

/** Kept for existing call sites. Checkout is available unless switched off. */
export function isConfigured(settings) {
  return resolveConfig(settings).enabled;
}

export function checkoutMode(a, b) {
  const settings = (b && typeof b === 'object') ? b : (a && typeof a === 'object' ? a : undefined);
  return isConfigured(settings) ? 'shiprocket' : 'unconfigured';
}

/* ──────────────────────── script / style loading ──────────────────────── */

let scriptPromise = null;

function ensureStyle(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Shiprocket's script reads the merchant domain from a hidden #sellerDomain
 * input. It must exist in the DOM BEFORE the script runs, so it is injected
 * here rather than in index.html — that keeps the whole integration in one
 * file and survives a redeploy of the shell.
 */
function ensureSellerDomain() {
  if (document.getElementById('sellerDomain')) return;
  const input = document.createElement('input');
  input.type = 'hidden';
  input.id = 'sellerDomain';
  input.value = window.location.host;
  document.body.appendChild(input);
}

function loadScript(src) {
  if (scriptPromise) return scriptPromise;

  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing && existing.dataset.loaded === 'true') {
    scriptPromise = Promise.resolve();
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.dataset.loaded = 'false';
    el.onload = () => { el.dataset.loaded = 'true'; resolve(); };
    el.onerror = () => {
      scriptPromise = null;            // allow a later attempt to retry
      reject(new Error('Could not load the Shiprocket checkout script. Check your connection and try again.'));
    };
    document.head.appendChild(el);
  });

  return scriptPromise;
}

/** Warm the script and styles while the customer reviews their cart. */
export function preloadCheckout(checkoutSettings) {
  const c = resolveConfig(checkoutSettings);
  if (!c.enabled) return;
  ensureStyle(c.styleUrl);
  ensureSellerDomain();
  loadScript(c.scriptUrl).catch(() => {});
}

/* ──────────────────────────── hand-off ──────────────────────────── */

/**
 * Open Shiprocket Checkout with the current cart.
 *
 * @param {Array}  cart     [{ id, slug, sku, quantity, ... }]
 * @param {Object} options  { checkout, phone, event, couponCode }
 */
export async function beginCheckout(cart, options = {}) {
  if (!cart?.length) throw new Error('Your cart is empty');

  const cfg = resolveConfig(options.checkout);
  if (!cfg.enabled) {
    const contact = options.phone ? ` on ${options.phone}` : '';
    throw new Error(`Checkout is currently switched off. Please contact us${contact} to place your order.`);
  }

  ensureStyle(cfg.styleUrl);
  ensureSellerDomain();

  /* 1. our backend mints the signed token (prices re-read server-side) */
  let token;
  try {
    const res = await api.raw.post('/checkout/token', {
      items: cart.map((line) => ({
        productId: line.id || line._id,
        slug: line.slug,
        sku: line.sku,
        quantity: line.quantity,
      })),
      redirectUrl: `${window.location.origin}/order-placed`,
    });
    // The API responds { success, data: { token } }. An interceptor may already
    // have unwrapped it, so accept either depth.
    const body = res?.data ?? res;
    token = body?.data?.token ?? body?.token;
  } catch (err) {
    // Surface the server's real message ("not configured", "out of stock", …)
    // instead of a generic failure — that is what makes this debuggable.
    const msg = err?.message || err?.response?.data?.message;
    console.error('[checkout] token request failed:', err);
    throw new Error(msg || 'Could not start checkout. Please try again in a moment.');
  }
  if (!token) throw new Error('Checkout did not start — no token returned. Please try again.');

  /* 2. Shiprocket's widget */
  await loadScript(cfg.scriptUrl);

  const sdk = window[cfg.globalName] || window.HeadlessCheckout;
  if (!sdk || typeof sdk.addToCart !== 'function') {
    throw new Error(
      `The checkout script loaded but window.${cfg.globalName}.addToCart() is missing. ` +
      'Shiprocket may have changed the snippet — check Settings → Checkout in the Fastrr dashboard.',
    );
  }

  /* 3. open it. `event` matters: Shiprocket reads it to keep the popup inside
        the user gesture, otherwise the browser blocks it. */
  sdk.addToCart(options.event || window.event, token, {
    fallbackUrl: `${window.location.origin}/cart`,
  });

  return { mode: 'sdk', token };
}

export default beginCheckout;
