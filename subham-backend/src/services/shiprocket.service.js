/**
 * Shiprocket integration — the single gateway for shipping in this project.
 *
 * Orders are created and managed inside Shiprocket Checkout, so this module
 * only covers what the storefront still needs: token lifecycle, pincode
 * serviceability for the product page's delivery estimate, and tracking
 * look-ups for the Track Order page.
 *
 * The auth token is valid for ~10 days; we cache it in memory and refresh
 * lazily (and once on a 401 retry) so we never hammer the login endpoint.
 */
const axios = require('axios');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const BASE_URL = process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external';

let cache = { token: null, expiresAt: 0 };

const http = axios.create({ baseURL: BASE_URL, timeout: 30000 });

/** Strip accidental quotes/whitespace from Railway/dotenv values. */
function cleanEnv(value) {
  return String(value || '')
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .trim();
}

function getShippingCredentials() {
  return {
    email: cleanEnv(process.env.SHIPROCKET_EMAIL),
    password: cleanEnv(process.env.SHIPROCKET_PASSWORD),
  };
}

function credentialsPresent() {
  const { email, password } = getShippingCredentials();
  return Boolean(email && password);
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return email ? `(invalid email len=${email.length})` : '(empty)';
  const [u, d] = email.split('@');
  return `${u.slice(0, 2)}***@${d}`;
}

function accessDeniedHint(message = '') {
  const m = String(message || '');
  if (/access denied|403|401|invalid|credential|unauthorized|forbidden/i.test(m)) {
    return (
      ' Tip: Shiprocket panel login mat use karo. Settings → API → Configure → Create API User ' +
      '(alag email), password email pe aata hai, Orders module ON rakho, phir wahi email/password Railway pe set karo (bina quotes).'
    );
  }
  return '';
}

function shiprocketErrorMessage(err, fallback = 'Shiprocket request failed') {
  const payload = err.response?.data;
  if (!payload) return err.message || fallback;
  if (typeof payload === 'string' && payload.trim()) return payload.slice(0, 300);
  return (
    payload.message ||
    payload.error ||
    (payload.errors && JSON.stringify(payload.errors)) ||
    err.message ||
    fallback
  );
}

/** POST /auth/login → bearer token (cached). */
async function login(force = false) {
  const { email, password } = getShippingCredentials();
  if (!email || !password) {
    throw ApiError.internal(
      'Shiprocket Shipping API is not configured. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD ' +
        '(Shiprocket panel → Settings → API → API User) on the server, then restart. ' +
        'Checkout API keys alone are not enough for Push to Shiprocket.',
    );
  }
  if (!force && cache.token && Date.now() < cache.expiresAt) return cache.token;

  try {
    const { data } = await http.post('/auth/login', { email, password });

    if (!data?.token) throw ApiError.internal('Shiprocket login failed — no token returned.');

    cache = { token: data.token, expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000 };
    logger.info(`Shiprocket token refreshed for ${maskEmail(email)}`);
    return cache.token;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const status = err.response?.status;
    const message = shiprocketErrorMessage(err, 'Shiprocket login failed');
    logger.error(`Shiprocket login failed for ${maskEmail(email)} (${status || 'no-status'}): ${message}`);
    if (status === 401 || status === 403) {
      throw ApiError.badRequest(
        `Shiprocket login failed (${status}) for ${maskEmail(email)}: ${message}.` +
          accessDeniedHint(message),
      );
    }
    throw ApiError.badGateway(`Shiprocket login failed: ${message}`);
  }
}

/**
 * Safe status for admin diagnostics — never returns the password.
 */
async function diagnoseConnection() {
  const { email, password } = getShippingCredentials();
  const pickup = cleanEnv(process.env.SHIPROCKET_PICKUP_LOCATION) || 'Primary';
  const result = {
    configured: Boolean(email && password),
    emailMasked: maskEmail(email),
    pickupLocationEnv: pickup,
    loginOk: false,
    httpStatus: null,
    message: null,
    pickupNames: [],
    pickupMatch: null,
  };

  if (!result.configured) {
    result.message =
      'SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD missing on server. Checkout keys cannot replace these.';
    return result;
  }

  try {
    const { status, data } = await http.post(
      '/auth/login',
      { email, password },
      { validateStatus: () => true },
    );
    result.httpStatus = status;
    result.message = data?.message || data?.error || (status === 200 ? 'ok' : 'login rejected');
    result.loginOk = Boolean(data?.token);
    if (!data?.token) return result;

    cache = { token: data.token, expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000 };

    const pickupRes = await http.get('/settings/company/pickup', {
      headers: { Authorization: `Bearer ${data.token}` },
      validateStatus: () => true,
    });
    const locs =
      pickupRes.data?.data?.shipping_address ||
      pickupRes.data?.data ||
      [];
    if (Array.isArray(locs)) {
      result.pickupNames = locs
        .map((l) => l.pickup_location || l.name || '')
        .filter(Boolean);
      result.pickupMatch = result.pickupNames.includes(pickup);
      if (!result.pickupMatch) {
        result.message =
          `Login OK, but pickup "${pickup}" not found. Available: ${result.pickupNames.join(', ') || '(none)'}`;
      } else {
        result.message = 'Login OK and pickup location matched.';
      }
    } else {
      result.message = `Login OK. Pickup list status ${pickupRes.status}: ${pickupRes.data?.message || 'ok'}`;
    }
  } catch (err) {
    result.httpStatus = err.response?.status || null;
    result.message = shiprocketErrorMessage(err);
  }

  return result;
}

/** Authenticated request with one automatic re-login on 401. */
async function request(method, url, { data, params } = {}, retry = true) {
  const token = await login();
  try {
    const res = await http.request({
      method,
      url,
      data,
      params,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return res.data;
  } catch (err) {
    const status = err.response?.status;
    if (status === 401 && retry) {
      cache = { token: null, expiresAt: 0 };
      return request(method, url, { data, params }, false);
    }
    const payload = err.response?.data;
    const message = shiprocketErrorMessage(err);
    logger.error(`Shiprocket ${method.toUpperCase()} ${url} -> ${status}: ${message}`);
    if (status === 401 || status === 403) {
      throw ApiError.badRequest(
        `Shiprocket API access denied (${status}): ${message}.` + accessDeniedHint(message),
      );
    }
    throw new ApiError(status && status < 500 ? 400 : 502, `Shiprocket: ${message}`, payload);
  }
}

/* ─────────────────────────── Serviceability ─────────────────────────── */

/**
 * Can we deliver to this pincode, and what will it cost?
 * @returns {{serviceable:boolean, couriers:Array, cheapest:Object|null, etd:string|null}}
 */
async function checkServiceability({ deliveryPincode, weight = 0.5, cod = 0, declaredValue = 0 }) {
  const data = await request('get', '/courier/serviceability/', {
    params: {
      pickup_postcode: process.env.STORE_PINCODE,
      delivery_postcode: deliveryPincode,
      weight,
      cod: cod ? 1 : 0,
      declared_value: declaredValue,
    },
  });

  const couriers = data?.data?.available_courier_companies || [];
  const sorted = [...couriers].sort((a, b) => Number(a.rate) - Number(b.rate));
  const cheapest = sorted[0] || null;

  return {
    serviceable: couriers.length > 0,
    couriers: sorted.map((c) => ({
      courierCompanyId: c.courier_company_id,
      name: c.courier_name,
      rate: Number(c.rate),
      etd: c.etd,
      estimatedDeliveryDays: c.estimated_delivery_days,
      codAvailable: Boolean(c.cod),
      rating: c.rating,
    })),
    cheapest: cheapest
      ? { courierCompanyId: cheapest.courier_company_id, name: cheapest.courier_name, rate: Number(cheapest.rate) }
      : null,
    etd: cheapest?.etd || null,
  };
}

/* ──────────────────────────── Tracking ─────────────────────────────── */

/** Normalises the several tracking response shapes Shiprocket returns. */
function normaliseTracking(raw) {
  const td = raw?.tracking_data || raw?.[Object.keys(raw || {})[0]]?.tracking_data || {};
  const activities = td.shipment_track_activities || [];
  const track = (td.shipment_track || [])[0] || {};
  return {
    currentStatus: track.current_status || td.shipment_status_text || 'Unknown',
    awb: track.awb_code || null,
    courierName: track.courier_name || null,
    etd: track.edd || null,
    trackUrl: td.track_url || null,
    activities: activities.map((a) => ({
      date: a.date,
      status: a.status,
      activity: a.activity,
      location: a.location,
    })),
  };
}

const trackByAwb = async (awb) => normaliseTracking(await request('get', `/courier/track/awb/${awb}`));

/**
 * Track by the order id Shiprocket Checkout gave the customer.
 * `channel_id` scopes the lookup to this store's checkout channel.
 */
const trackByOrderId = async (orderId) =>
  normaliseTracking(
    await request('get', '/courier/track', {
      params: { order_id: orderId, channel_id: process.env.SHIPROCKET_CHANNEL_ID || undefined },
    }),
  );
const trackByShipmentId = async (id) => normaliseTracking(await request('get', `/courier/track/shipment/${id}`));

/** GET /channels — useful when filling SHIPROCKET_CHANNEL_ID. */
const listChannels = () => request('get', '/channels');

/** Maps a Shiprocket status string onto our internal ORDER_STATUS enum. */
function mapStatus(shiprocketStatus = '') {
  const s = String(shiprocketStatus).toUpperCase();
  if (s.includes('DELIVERED')) return 'delivered';
  if (s.includes('OUT FOR DELIVERY')) return 'out-for-delivery';
  if (s.includes('RTO')) return 'rto';
  if (s.includes('RETURN')) return 'returned';
  if (s.includes('CANCEL')) return 'cancelled';
  if (s.includes('TRANSIT') || s.includes('SHIPPED')) return 'in-transit';
  if (s.includes('PICKED')) return 'shipped';
  if (s.includes('READY')) return 'ready-to-ship';
  if (s.includes('LOST') || s.includes('UNDELIVERED')) return 'failed';
  if (s.includes('NEW') || s.includes('PENDING')) return 'confirmed';
  return 'processing';
}

/**
 * Create a custom/adhoc B2C Order in Shiprocket for delivery fulfillment.
 * Endpoint: POST /orders/create/adhoc
 */
async function createAdhocOrder(order) {
  if (!credentialsPresent()) {
    throw ApiError.internal(
      'Shiprocket Shipping API is not configured. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD on the server (Shiprocket → Settings → API).',
    );
  }

  if (!order || !order.shippingAddress) {
    throw ApiError.badRequest('Invalid order or missing shipping address.');
  }

  const nameParts = String(order.customer?.name || 'Customer').trim().split(/\s+/);
  const firstName = nameParts[0] || 'Customer';
  // Shiprocket requires billing_last_name to be present (non-empty).
  const lastName = nameParts.slice(1).join(' ') || firstName;

  const orderDateFormatted = order.createdAt
    ? new Date(order.createdAt).toISOString().replace('T', ' ').substring(0, 19)
    : new Date().toISOString().replace('T', ' ').substring(0, 19);

  const orderItems = (order.items || []).map((item) => ({
    name: String(item.title || 'Product').slice(0, 200),
    sku: String(item.sku || `SKU-${item.product || 'item'}`).slice(0, 50),
    units: Number(item.quantity) || 1,
    selling_price: Number(item.price) || 0,
    discount: 0,
    tax: 0,
    hsn: 4901,
  }));

  if (!orderItems.length) {
    throw ApiError.badRequest('Order has no items to push to Shiprocket.');
  }

  const phone = String(order.customer?.phone || '').replace(/\D/g, '').slice(-10);
  if (phone.length !== 10) {
    throw ApiError.badRequest('Customer phone must be a valid 10-digit Indian mobile for Shiprocket.');
  }

  const subTotal = orderItems.reduce(
    (sum, i) => sum + Number(i.selling_price || 0) * Number(i.units || 1),
    0,
  );

  const payload = {
    order_id: String(order.orderNumber),
    order_date: orderDateFormatted,
    pickup_location: cleanEnv(process.env.SHIPROCKET_PICKUP_LOCATION) || 'Primary',
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: order.shippingAddress.address || '',
    billing_address_2: order.shippingAddress.landmark || order.shippingAddress.address2 || '',
    billing_city: order.shippingAddress.city || '',
    billing_pincode: String(order.shippingAddress.pincode || ''),
    billing_state: order.shippingAddress.state || '',
    billing_country: order.shippingAddress.country || 'India',
    billing_email: order.customer?.email || 'customer@shubhamxerox.in',
    billing_phone: phone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: order.payment?.status === 'paid' ? 'Prepaid' : 'COD',
    sub_total: subTotal,
    length: 10,
    breadth: 10,
    height: 5,
    weight: Math.max(0.5, orderItems.length * 0.4),
  };

  const channelId = cleanEnv(process.env.SHIPROCKET_CHANNEL_ID);
  if (channelId) payload.channel_id = Number(channelId) || channelId;

  logger.info(`Pushing Order ${order.orderNumber} to Shiprocket adhoc API...`);
  // request() expects { data, params } — passing the payload object directly
  // sent an empty body and Shiprocket returned "Either empty or Invalid JSON".
  const data = await request('post', '/orders/create/adhoc', { data: payload });
  return data;
}

module.exports = {
  login,
  credentialsPresent,
  diagnoseConnection,
  checkServiceability,
  trackByAwb,
  trackByShipmentId,
  trackByOrderId,
  listChannels,
  mapStatus,
  createAdhocOrder,
};
