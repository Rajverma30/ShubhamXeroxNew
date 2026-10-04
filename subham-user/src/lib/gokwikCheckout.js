/**
 * GoKwik Checkout storefront hand-off.
 *
 * Flow (GOKWIK.md):
 *   1. POST /api/checkout/session  → { sessionKey, mid, environment, scriptUrl }
 *   2. load gokwik.js
 *   3. gokwikSdk.initCheckout({ mid, merchantParams: { merchantCheckoutId: sessionKey } })
 *   4. on order-complete → /order-placed?order=SX-…
 *
 * Secrets never reach the browser — only mid / environment / scriptUrl / sessionKey.
 */
import api from './api';

function unwrapError(err) {
  return err?.response?.data?.message || err?.message || 'Could not start GoKwik checkout';
}

/** Create a server-side checkout session from the local cart. */
export async function createGokwikSession(cart) {
  const items = (cart || []).map((line) => ({
    productId: line.id || line._id || line.productId,
    slug: line.slug,
    sku: line.sku,
    quantity: Math.max(1, Number(line.quantity) || 1),
  })).filter((i) => i.productId || i.slug || i.sku);

  if (!items.length) throw new Error('Your cart is empty.');

  try {
    const res = await api.raw.post('/checkout/session', { items });
    const data = res.data?.data;
    if (!data?.sessionKey || !data?.mid || !data?.scriptUrl) {
      throw new Error(res.data?.message || 'GoKwik checkout is not set up yet');
    }
    return data;
  } catch (err) {
    throw new Error(unwrapError(err));
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (window.gokwikSdk) {
      resolve(window.gokwikSdk);
      return;
    }
    const existing = document.querySelector(`script[data-gokwik-sdk="1"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.gokwikSdk));
      existing.addEventListener('error', () => reject(new Error('Failed to load GoKwik checkout')));
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.gokwikSdk = '1';
    script.onload = () => {
      if (window.gokwikSdk) resolve(window.gokwikSdk);
      else reject(new Error('GoKwik script loaded but SDK is unavailable'));
    };
    script.onerror = () => reject(new Error('Failed to load GoKwik checkout'));
    document.head.appendChild(script);
  });
}

/**
 * Open the GoKwik popup for an existing session.
 * @returns {() => void} cleanup — remove listeners
 */
export async function openGokwikCheckout(session, { onComplete, onError } = {}) {
  const { sessionKey, mid, environment, scriptUrl } = session;
  const sdk = await loadScript(scriptUrl);

  const finish = (orderNumber) => {
    if (!orderNumber) return;
    onComplete?.(String(orderNumber));
  };

  const onOrderComplete = (payload) => {
    const orderNumber =
      (typeof payload === 'string' && payload)
      || payload?.id
      || payload?.order_id
      || payload?.orderId
      || payload?.merchant_order_id
      || payload?.detail?.id
      || payload?.detail?.order_id
      || payload?.detail?.merchant_order_id;
    finish(orderNumber);
  };

  const onWindowEvent = (event) => onOrderComplete(event?.detail ?? event);

  window.addEventListener('gokwik.order-complete', onWindowEvent);
  window.addEventListener('order-complete', onWindowEvent);
  if (typeof sdk?.on === 'function') {
    try { sdk.on('order-complete', onOrderComplete); } catch { /* older SDK */ }
  }

  try {
    sdk.initCheckout({
      mid,
      environment: environment || 'production',
      type: 'checkout',
      merchantParams: {
        merchantCheckoutId: sessionKey,
      },
    });
  } catch (err) {
    onError?.(err);
    throw err;
  }

  return () => {
    window.removeEventListener('gokwik.order-complete', onWindowEvent);
    window.removeEventListener('order-complete', onWindowEvent);
  };
}

/** Full hand-off: create session → open SDK. */
export async function beginGokwikCheckout(cart, handlers = {}) {
  const session = await createGokwikSession(cart);
  const cleanup = await openGokwikCheckout(session, handlers);
  return { session, cleanup };
}
