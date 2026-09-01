/**
 * ════════════════════════════════════════════════════════════════════════════
 *  Guest checkout — OTP → address → Razorpay
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Replaces src/lib/shiprocketCheckout.js entirely. Shiprocket no longer sees
 * the checkout; it is only used server-side for delivery rates.
 *
 * DESIGN NOTES
 * ------------
 * No accounts. A phone number verified by OTP mints a 30-minute token that is
 * only good for placing one order, held in memory for the duration of the
 * flow. Nothing is persisted — refreshing the page means verifying again,
 * which is the correct trade-off for a store with no profile section.
 *
 * The cart's prices are never sent. Every request carries product ids and
 * quantities; the server recomputes totals from the database. That is what
 * stops a customer editing their cart to ₹1 in devtools.
 *
 * `api` here is your existing object of named helpers, so the raw axios
 * client (`api.raw`) is used for these new endpoints.
 */
import api from './api';

const RAZORPAY_SDK = 'https://checkout.razorpay.com/v1/checkout.js';

/* ───────────────────────────── OTP ───────────────────────────── */

export function normalisePhone(input) {
  const digits = String(input || '').replace(/\D/g, '');
  const ten = digits.length > 10 ? digits.slice(-10) : digits;
  return /^[6-9]\d{9}$/.test(ten) ? ten : null;
}

/** POST /auth/otp/send */
export async function sendOtp(phone) {
  const clean = normalisePhone(phone);
  if (!clean) throw new Error('Enter a valid 10-digit mobile number');
  const res = await api.raw.post('/auth/otp/send', { phone: clean });
  return res.data?.data ?? res.data;
}

/** POST /auth/otp/verify → guest token */
export async function verifyOtp(phone, code) {
  const clean = normalisePhone(phone);
  if (!clean) throw new Error('Enter a valid 10-digit mobile number');
  const res = await api.raw.post('/auth/otp/verify', { phone: clean, code: String(code).trim() });
  const data = res.data?.data ?? res.data;
  if (!data?.token) throw new Error('Verification failed. Please try again.');
  return data.token;
}

/* ──────────────────────────── quote ──────────────────────────── */

/**
 * Live totals for the cart, including delivery for a pincode.
 * Safe to call on every pincode keystroke-complete — it writes nothing.
 */
export async function getQuote(cart, pincode) {
  const res = await api.raw.post('/checkout/quote', {
    items: toItems(cart),
    pincode: pincode || undefined,
  });
  return res.data?.data ?? res.data;
}

const toItems = (cart) => cart.map((line) => ({
  productId: line.id || line._id,
  slug: line.slug,
  sku: line.sku,
  quantity: line.quantity,
}));

/* ─────────────────────────── payment ─────────────────────────── */

let sdkPromise = null;

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = RAZORPAY_SDK;
    el.async = true;
    el.onload = resolve;
    el.onerror = () => {
      sdkPromise = null;                 // let a retry work
      reject(new Error('Could not load the payment window. Check your connection and try again.'));
    };
    document.body.appendChild(el);
  });
  return sdkPromise;
}

/** Warm the SDK while the customer is still typing their address. */
export function preloadCheckout() {
  loadRazorpay().catch(() => {});
}

/**
 * Create the order, open Razorpay, verify the payment.
 *
 * @param {Array}  cart
 * @param {Object} args  { token, customer:{name,email}, address, storeName, logo }
 * @returns {Promise<{orderNumber, total}>} resolves only after payment is verified
 */
export async function placeOrder(cart, { token, customer, address, storeName, logo }) {
  if (!cart?.length) throw new Error('Your cart is empty');
  if (!token) throw new Error('Please verify your mobile number first');

  const auth = { headers: { Authorization: `Bearer ${token}` } };

  /* 1. our order + a Razorpay order id */
  let order;
  try {
    const res = await api.raw.post('/checkout/order', {
      items: toItems(cart),
      customer,
      address,
    }, auth);
    order = res.data?.data ?? res.data;
  } catch (err) {
    throw new Error(err?.message || 'Could not start the payment. Please try again.');
  }

  await loadRazorpay();

  /* 2. hand off to Razorpay */
  const result = await new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,             // paise, straight from the server
      currency: order.currency || 'INR',
      name: storeName || 'Subham Xerox',
      description: `Order ${order.orderNumber}`,
      image: logo || undefined,
      order_id: order.razorpayOrderId,
      prefill: {
        name: customer?.name || '',
        email: customer?.email || '',
        contact: order.customer?.phone || '',
      },
      notes: { orderNumber: order.orderNumber },
      theme: { color: '#7f1d1d' },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled. Your order has not been placed.')),
        escape: true,
      },
    });

    rzp.on('payment.failed', (e) => {
      reject(new Error(e?.error?.description || 'Payment failed. Please try another method.'));
    });

    rzp.open();
  });

  /* 3. verify server-side before showing success.
        The handler firing is not proof of payment — only the signature is. */
  try {
    const res = await api.raw.post('/checkout/verify', {
      orderNumber: order.orderNumber,
      razorpay_order_id: result.razorpay_order_id,
      razorpay_payment_id: result.razorpay_payment_id,
      razorpay_signature: result.razorpay_signature,
    }, auth);
    const verified = res.data?.data ?? res.data;
    return { orderNumber: verified.orderNumber, total: order.total, paid: true };
  } catch (err) {
    // The money may well have left the account. Never imply it did not — the
    // Razorpay webhook will confirm the order server-side regardless.
    throw new Error(
      `Payment received but confirmation is pending for order ${order.orderNumber}. ` +
      'Please save this number and contact us if you do not get a confirmation shortly.',
    );
  }
}

/** GET /orders/:number?phone= — the receipt page. */
export async function fetchOrder(orderNumber, phone) {
  const res = await api.raw.get(`/orders/${orderNumber}`, { params: { phone } });
  return res.data?.data ?? res.data;
}

export default placeOrder;
