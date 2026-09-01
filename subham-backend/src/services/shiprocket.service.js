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

function credentialsPresent() {
  return Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);
}

/** POST /auth/login → bearer token (cached). */
async function login(force = false) {
  if (!credentialsPresent()) {
    throw ApiError.internal('Shiprocket credentials are not configured (SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD).');
  }
  if (!force && cache.token && Date.now() < cache.expiresAt) return cache.token;

  const { data } = await http.post('/auth/login', {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD,
  });

  if (!data?.token) throw ApiError.internal('Shiprocket login failed — no token returned.');

  cache = { token: data.token, expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000 };
  logger.info('Shiprocket token refreshed');
  return cache.token;
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
    const message =
      payload?.message ||
      (payload?.errors && JSON.stringify(payload.errors)) ||
      err.message ||
      'Shiprocket request failed';
    logger.error(`Shiprocket ${method.toUpperCase()} ${url} -> ${status}: ${message}`);
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

module.exports = {
  login,
  credentialsPresent,
  checkServiceability,
  trackByAwb,
  trackByShipmentId,
  trackByOrderId,
  listChannels,
  mapStatus,
};
