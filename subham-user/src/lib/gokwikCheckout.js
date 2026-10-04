/**
 * GoKwik Checkout storefront hand-off.
 *
 * Matches GoKwik's WooCommerce plugin (kwikcheckout-woo gokwik-custom.js):
 *   gokwikSdk.initCheckout({
 *     environment, type: 'merchantInfo', mid,
 *     merchantParams: { merchantCheckoutId: sessionKey }
 *   })
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

function waitForSdk(timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      const sdk = window.gokwikSdk;
      if (sdk && typeof sdk.initCheckout === 'function') {
        resolve(sdk);
        return;
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error('GoKwik checkout script did not become ready. Check your connection and try again.'));
        return;
      }
      setTimeout(tick, 50);
    };
    tick();
  });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (window.gokwikSdk && typeof window.gokwikSdk.initCheckout === 'function') {
      resolve(window.gokwikSdk);
      return;
    }

    const existing = document.querySelector('script[data-gokwik-sdk="1"]');
    if (existing) {
      waitForSdk().then(resolve).catch(reject);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.gokwikSdk = '1';
    script.onload = () => {
      waitForSdk().then(resolve).catch(reject);
    };
    script.onerror = () => reject(new Error('Failed to load GoKwik checkout'));
    document.head.appendChild(script);
  });
}

function pickOrderNumber(payload) {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;
  return (
    payload.merchant_order_id
    || payload.id
    || payload.order_id
    || payload.orderId
    || payload.orderNumber
    || payload.detail?.merchant_order_id
    || payload.detail?.id
    || payload.detail?.order_id
    || null
  );
}

/**
 * Open the GoKwik popup for an existing session.
 * @returns {() => void} cleanup — remove listeners
 */
export async function openGokwikCheckout(session, { onComplete, onError, onClose, onOpened } = {}) {
  const { sessionKey, mid, environment, scriptUrl } = session;
  const sdk = await loadScript(scriptUrl);

  if (!sdk || typeof sdk.initCheckout !== 'function') {
    throw new Error('GoKwik SDK or initCheckout function not available');
  }

  let settled = false;
  const finish = (orderNumber) => {
    if (settled || !orderNumber) return;
    settled = true;
    onComplete?.(String(orderNumber));
  };

  const fail = (err) => {
    if (settled) return;
    settled = true;
    const error = err instanceof Error ? err : new Error(String(err?.message || err || 'GoKwik checkout failed'));
    onError?.(error);
  };

  const onOrderComplete = (payload) => finish(pickOrderNumber(payload));
  const onInitFailure = (payload) => {
    const msg = payload?.message || payload?.error || payload?.failure_reason
      || 'GoKwik could not open checkout. Confirm your Merchant ID is mapped to this store.';
    fail(new Error(typeof msg === 'string' ? msg : 'GoKwik checkout failed to start'));
  };
  const onCheckoutClose = () => {
    if (settled) return;
    settled = true;
    onClose?.();
  };

  if (typeof sdk.on === 'function') {
    try { sdk.on('order-complete', onOrderComplete); } catch { /* ignore */ }
    try { sdk.on('checkout-initiation-failure', onInitFailure); } catch { /* ignore */ }
    try { sdk.on('checkout-close', onCheckoutClose); } catch { /* ignore */ }
  }

  // Same payload shape as GoKwik's WooCommerce plugin (gokwik-custom.js).
  const gcObj = {
    environment: environment || 'production',
    type: 'merchantInfo',
    mid,
    merchantParams: {
      merchantCheckoutId: sessionKey,
    },
  };

  try {
    sdk.initCheckout(gcObj);
    onOpened?.();
  } catch (err) {
    fail(err);
    throw err;
  }

  return () => {
    settled = true;
    try {
      if (typeof sdk.close === 'function') sdk.close();
    } catch { /* ignore */ }
  };
}

/** Full hand-off: create session → open SDK. */
export async function beginGokwikCheckout(cart, handlers = {}) {
  const session = await createGokwikSession(cart);
  const cleanup = await openGokwikCheckout(session, handlers);
  return { session, cleanup };
}
