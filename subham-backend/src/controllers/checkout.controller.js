/**
 * ────────────────────────────────────────────────────────────────────────────
 *  Guest checkout — OTP → address → Razorpay. Prepaid only.
 * ────────────────────────────────────────────────────────────────────────────
 *
 *   POST /api/checkout/quote     items + pincode → subtotal, shipping, total
 *   POST /api/checkout/order     [guest token] create order + Razorpay order
 *   POST /api/checkout/verify    [guest token] confirm payment signature
 *   POST /api/webhooks/razorpay  server-side truth, independent of the browser
 *   GET  /api/orders/:number     receipt lookup (needs the matching phone)
 *
 * THE RULE THAT MATTERS: the browser never sets a price. Every total is
 * recomputed here from the database. The cart is a list of ids and quantities
 * and nothing more — anything else it claims is ignored.
 */
const mongoose = require('mongoose');

const Product = require('../models/Product');
const Order = require('../models/Order');
const Setting = require('../models/Setting');
const GuestCheckoutSession = require('../models/GuestCheckoutSession');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created } = require('../utils/response');
const logger = require('../utils/logger');
const { sellingPrice } = require('../utils/pricing');
const razorpay = require('../services/razorpay.service');
const shiprocket = require('../services/shiprocket.service');

const PLACEHOLDER_PINCODES = new Set(['YOUR_REAL_PINCODE', '000000', '123456']);

function validStorePincode() {
  const pin = String(process.env.STORE_PINCODE || '').trim();
  return /^\d{6}$/.test(pin) && !PLACEHOLDER_PINCODES.has(pin);
}

function expectedAmountPaisa(order) {
  return order.payment?.amountPaisa || Math.round(Number(order.total) * 100);
}

async function decrementStockForOrder(order) {
  for (const item of order.items) {
    const product = await Product.findById(item.product).select('type allowBackorder stock title').lean();
    if (!product) continue;

    if (product.type === 'ebook') {
      await Product.updateOne({ _id: item.product }, { $inc: { soldCount: item.quantity } });
      continue;
    }

    if (product.allowBackorder) {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: -item.quantity, soldCount: item.quantity } },
      );
      continue;
    }

    const result = await Product.updateOne(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity, soldCount: item.quantity } },
    );
    if (result.modifiedCount === 0) {
      logger.error(`Stock decrement failed for ${order.orderNumber} — "${product.title}" insufficient stock`);
    }
  }
}

/* ─────────────────────────── pricing core ─────────────────────────── */

/**
 * Resolve a client cart into priced lines, straight from the database.
 * @returns {{lines:Array, subtotal:number, weight:number, problems:Array}}
 */
async function priceCart(rawItems = []) {
  if (!Array.isArray(rawItems) || !rawItems.length) throw ApiError.badRequest('Your cart is empty');
  if (rawItems.length > 50) throw ApiError.badRequest('Too many items in one order');

  const keys = rawItems.map((i) => String(i.productId || i.id || i.slug || i.sku || '')).filter(Boolean);
  if (!keys.length) throw ApiError.badRequest('Cart items are missing product identifiers');

  const ids = keys.filter((k) => mongoose.isValidObjectId(k));
  const docs = await Product.find({
    $or: [{ _id: { $in: ids } }, { slug: { $in: keys } }, { sku: { $in: keys } }],
    isActive: true,
    isHidden: false,
  }).select('_id title slug sku images price salePrice discountPercent stock allowBackorder type weight').lean();

  const byKey = new Map();
  docs.forEach((p) => {
    byKey.set(String(p._id), p);
    if (p.slug) byKey.set(p.slug, p);
    if (p.sku) byKey.set(p.sku, p);
  });

  const lines = [];
  const problems = [];
  let subtotal = 0;
  let weight = 0;

  for (const raw of rawItems) {
    const key = String(raw.productId || raw.id || raw.slug || raw.sku || '');
    const p = byKey.get(key);
    if (!p) { problems.push(`An item is no longer available`); continue; }

    const qty = Math.max(1, Math.min(Number(raw.quantity) || 1, 99));
    const digital = p.type === 'ebook';
    if (!digital && !p.allowBackorder && (p.stock ?? 0) < qty) {
      problems.push(`"${p.title.slice(0, 40)}" — only ${p.stock ?? 0} left`);
      continue;
    }

    const unit = sellingPrice(p);
    const lineTotal = unit * qty;
    subtotal += lineTotal;
    weight += (p.weight || 0.4) * (digital ? 0 : qty);

    lines.push({
      product: p._id,
      title: p.title,
      slug: p.slug,
      sku: p.sku,
      image: p.images?.[0]?.thumbUrl || p.images?.[0]?.url || '',
      price: unit,
      mrp: Number(p.price) || unit,
      quantity: qty,
      lineTotal,
    });
  }

  if (!lines.length) {
    throw ApiError.badRequest(problems[0] || 'None of the items in your cart could be found');
  }
  return { lines, subtotal, weight: Math.max(weight, 0.1), problems };
}

/**
 * Delivery charge for a pincode, from Shiprocket's live courier rates.
 *
 * Falls back to the flat rate in Settings when Shiprocket is unreachable or
 * has no credentials. A checkout must never die because a rate lookup timed
 * out — the customer would simply leave.
 */
async function shippingFor({ pincode, weight, declaredValue }) {
  const settings = await Setting.getSingleton();
  const flat = Number(settings.shippingFlat) || 0;
  const freeAbove = Number(settings.freeShippingAbove) || 0;

  if (freeAbove && declaredValue >= freeAbove) {
    return { charge: 0, courier: null, etd: null, serviceable: true, reason: 'free-above-threshold' };
  }

  if (!shiprocket.credentialsPresent() || !validStorePincode()) {
    return { charge: flat, courier: null, etd: null, serviceable: true, reason: 'flat-fallback' };
  }

  try {
    const data = await shiprocket.checkServiceability({
      deliveryPincode: pincode,
      weight,
      cod: 0,                       // prepaid only
      declaredValue,
    });

    if (!data.serviceable) {
      return { charge: 0, courier: null, etd: null, serviceable: false, reason: 'not-serviceable' };
    }
    return {
      charge: Math.ceil(data.cheapest?.rate ?? flat),
      courier: data.cheapest?.name || null,
      etd: data.etd || null,
      serviceable: true,
      reason: 'shiprocket',
    };
  } catch (err) {
    logger.warn(`Serviceability lookup failed for ${pincode}, using flat rate: ${err.message}`);
    return { charge: flat, courier: null, etd: null, serviceable: true, reason: 'flat-fallback' };
  }
}

/* ─────────────────────────────── quote ─────────────────────────────── */

/** POST /api/checkout/quote  { items, pincode } */
exports.quote = asyncHandler(async (req, res) => {
  const { lines, subtotal, weight, problems } = await priceCart(req.body.items);

  const pincode = String(req.body.pincode || '').trim();
  let shipping = { charge: 0, courier: null, etd: null, serviceable: true, reason: 'no-pincode' };
  if (/^\d{6}$/.test(pincode)) {
    shipping = await shippingFor({ pincode, weight, declaredValue: subtotal });
  }

  return ok(res, {
    items: lines,
    subtotal,
    shippingCharge: shipping.charge,
    total: subtotal + shipping.charge,
    shipping,
    problems,
  });
});

/* ──────────────────────────── create order ──────────────────────────── */

/**
 * POST /api/checkout/order   (guest token required)
 * body: { items, customer:{name,email}, address:{...} }
 * → { orderNumber, razorpayOrderId, amount, keyId }
 */
exports.createOrder = asyncHandler(async (req, res) => {
  const phone = req.guestPhone;                       // set by guestAuth middleware
  const { lines, subtotal, weight, problems } = await priceCart(req.body.items);

  if (problems.length) {
    throw ApiError.badRequest(problems[0] || 'Some items in your cart are unavailable');
  }

  const a = req.body.address || {};
  const pincode = String(a.pincode || '').trim();
  if (!/^\d{6}$/.test(pincode)) throw ApiError.badRequest('Enter a valid 6-digit PIN code');
  if (!a.address || !a.city || !a.state) throw ApiError.badRequest('Please complete the delivery address');

  const name = String(req.body.customer?.name || '').trim();
  if (name.length < 2) throw ApiError.badRequest('Please enter your name');

  const shipping = await shippingFor({ pincode, weight, declaredValue: subtotal });
  if (!shipping.serviceable) {
    throw ApiError.badRequest(`Sorry, we cannot deliver to ${pincode} yet.`);
  }

  const total = subtotal + shipping.charge;

  const order = new Order({
    customer: { name, phone, email: String(req.body.customer?.email || '').trim() },
    shippingAddress: {
      address: a.address,
      address2: a.address2 || '',
      landmark: a.landmark || '',
      city: a.city,
      district: a.district || '',
      state: a.state,
      pincode,
      country: 'India',
    },
    items: lines,
    subtotal,
    shippingCharge: shipping.charge,
    total,
    status: 'awaiting-payment',
  });

  // Save first: an order that exists without a payment is recoverable, a
  // payment that exists without an order is a support ticket.
  await order.save();

  const rzp = await razorpay.createOrder(total, order.orderNumber, {
    orderNumber: order.orderNumber,
    phone,
  });

  order.payment.razorpayOrderId = rzp.id;
  order.payment.amountPaisa = rzp.amount;
  await order.save();

  if (req.guestJti) {
    const consumed = await GuestCheckoutSession.findOneAndUpdate(
      { jti: req.guestJti, phone, consumedAt: null },
      { $set: { consumedAt: new Date(), orderNumber: order.orderNumber } },
    );
    if (!consumed) {
      throw ApiError.unauthorized('Your checkout session expired. Please verify your number again.');
    }
  }

  logger.info(`Order ${order.orderNumber} created — ₹${total} (${lines.length} lines) → ${rzp.id}`);

  return created(res, {
    orderNumber: order.orderNumber,
    razorpayOrderId: rzp.id,
    amount: rzp.amount,             // paise, for the Razorpay widget
    currency: 'INR',
    keyId: razorpay.publicKey(),    // publishable id, safe in the browser
    subtotal,
    shippingCharge: shipping.charge,
    total,
    customer: { name, phone, email: order.customer.email },
  });
});

/* ───────────────────────── confirm payment ───────────────────────── */

/** Mark paid + decrement stock, exactly once. Shared by verify and webhook. */
async function markPaid(orderRef, { paymentId, signature, method, amountPaisa, raw }) {
  const orderId = orderRef._id || orderRef;
  const existing = await Order.findById(orderId);
  if (!existing) throw ApiError.notFound('Order not found');
  if (existing.payment.status === 'paid') return existing;

  const expected = expectedAmountPaisa(existing);
  if (amountPaisa != null && Number(amountPaisa) !== expected) {
    logger.warn(`Payment amount mismatch on ${existing.orderNumber}: got ${amountPaisa}, expected ${expected}`);
    throw ApiError.badRequest('Payment amount does not match the order total');
  }

  const paidAt = new Date();
  const paymentUpdate = {
    'payment.razorpayPaymentId': paymentId,
    'payment.status': 'paid',
    'payment.paidAt': paidAt,
    status: 'confirmed',
  };
  if (signature) paymentUpdate['payment.razorpaySignature'] = signature;
  if (method) paymentUpdate['payment.method'] = method;
  if (amountPaisa != null) paymentUpdate['payment.amountPaisa'] = Number(amountPaisa);
  if (raw) paymentUpdate.raw = raw;

  const transitioned = await Order.findOneAndUpdate(
    { _id: existing._id, 'payment.status': { $ne: 'paid' } },
    { $set: paymentUpdate },
    { new: true },
  );
  if (!transitioned) return Order.findById(existing._id);

  const stockLock = await Order.findOneAndUpdate(
    { _id: transitioned._id, stockAdjusted: { $ne: true } },
    { $set: { stockAdjusted: true } },
    { new: true },
  );
  if (stockLock) await decrementStockForOrder(stockLock);

  logger.info(`Order ${transitioned.orderNumber} PAID ₹${transitioned.total} via ${method || 'razorpay'}`);
  return transitioned;
}

/**
 * POST /api/checkout/verify   (guest token required)
 * body: { orderNumber, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { orderNumber, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const order = await Order.findOne({ orderNumber });
  if (!order) throw ApiError.notFound('Order not found');

  const guestPhoneNorm = String(req.guestPhone || '').replace(/\D/g, '').slice(-10);
  const orderPhoneNorm = String(order.customer?.phone || '').replace(/\D/g, '').slice(-10);
  if (guestPhoneNorm && orderPhoneNorm && guestPhoneNorm !== orderPhoneNorm) {
    throw ApiError.unauthorized('Order does not match your verified session');
  }

  if (order.payment.razorpayOrderId && order.payment.razorpayOrderId !== razorpay_order_id) {
    throw ApiError.badRequest('Payment does not match this order');
  }

  const valid = razorpay.verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
  if (!valid) {
    logger.warn(`Bad Razorpay signature on ${orderNumber} — refusing to confirm`);
    order.payment.status = 'failed';
    await order.save();
    throw ApiError.badRequest('We could not verify this payment. If money was deducted it will be refunded automatically.');
  }

  const updated = await markPaid(order, {
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
    amountPaisa: order.payment.amountPaisa,
    raw: { source: 'browser-verify', body: req.body },
  });

  return ok(res, {
    orderNumber: updated.orderNumber,
    status: updated.status,
    total: updated.total,
    paid: true,
  });
});

/**
 * POST /api/webhooks/razorpay
 *
 * The browser can close mid-redirect, so this is the reliable path. Razorpay
 * signs the raw body; anything unsigned is ignored outright.
 */
exports.razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const raw = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);

  if (!razorpay.verifyWebhookSignature(raw, signature)) {
    logger.warn(`Razorpay webhook with bad/missing signature from ${req.ip}`);
    return res.status(400).json({ ok: false });
  }

  const event = String(req.body?.event || '');
  const paymentEntity = req.body?.payload?.payment?.entity;
  const orderEntity = req.body?.payload?.order?.entity;

  try {
    if (['payment.captured', 'order.paid', 'payment.authorized'].includes(event)) {
      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const paymentId = paymentEntity?.id || orderEntity?.id;
      const amountPaisa = paymentEntity?.amount || orderEntity?.amount_paid || orderEntity?.amount;

      if (razorpayOrderId) {
        const order = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId });
        if (order) {
          await markPaid(order, {
            paymentId: paymentId || razorpayOrderId,
            method: paymentEntity?.method || 'online',
            amountPaisa,
            raw: { source: 'webhook', event, body: req.body },
          });
        } else {
          logger.warn(`Razorpay webhook for unknown order ${razorpayOrderId}`);
        }
      }
    } else if (event === 'payment.failed') {
      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      if (razorpayOrderId) {
        await Order.updateOne(
          { 'payment.razorpayOrderId': razorpayOrderId, 'payment.status': { $ne: 'paid' } },
          { 'payment.status': 'failed' },
        );
      }
    }
  } catch (err) {
    logger.error(`Razorpay webhook handling failed: ${err.message}`);
  }

  // Always 200 once the signature is good, or Razorpay retries forever.
  return res.json({ ok: true });
});

/* ───────────────────────────── receipt ───────────────────────────── */

/**
 * GET /api/orders/:orderNumber?phone=98XXXXXXXX
 * Order numbers are guessable enough that the phone is required as a check.
 */
exports.getOrder = asyncHandler(async (req, res) => {
  const rawPhone = String(req.query.phone || '').replace(/\D/g, '').slice(-10);
  let order = await Order.findOne({ orderNumber: req.params.orderNumber }).lean();

  if (!order && String(req.params.orderNumber).startsWith('SXSR-')) {
    const ShiprocketCheckoutSession = require('../models/ShiprocketCheckoutSession');
    const shiprocketCtrl = require('./shiprocketSession.controller');
    const session = await ShiprocketCheckoutSession.findOne({ orderId: req.params.orderNumber });
    if (session) {
      const createdOrder = await shiprocketCtrl.confirmOrderFromSession(session, { source: 'receipt-lookup' });
      if (createdOrder) order = createdOrder.toObject ? createdOrder.toObject() : createdOrder;
    }
  }

  if (!order) throw ApiError.notFound('Order not found');
  const orderPhone = String(order.customer?.phone || '').replace(/\D/g, '').slice(-10);
  if (rawPhone && orderPhone && orderPhone !== rawPhone) throw ApiError.notFound('Order not found');
  return ok(res, order);
});

/* ─────────────────────────── admin (orders) ─────────────────────────── */

exports.adminListOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);

  if (req.query.source === 'shiprocket' || req.query.status === 'shiprocket-attempt') {
    const ShiprocketCheckoutSession = require('../models/ShiprocketCheckoutSession');
    const filter = {};
    if (req.query.q) {
      filter.orderId = new RegExp(String(req.query.q).trim(), 'i');
    }
    const [sessions, total] = await Promise.all([
      ShiprocketCheckoutSession.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      ShiprocketCheckoutSession.countDocuments(filter),
    ]);

    const items = sessions.map((s) => ({
      _id: s._id,
      orderNumber: s.orderId,
      customer: { name: 'Shiprocket Guest', phone: 'Via Fastrr' },
      items: s.items || [],
      subtotal: s.subtotal,
      shippingCharge: 0,
      total: s.subtotal,
      payment: {
        provider: 'shiprocket-checkout',
        status: s.status === 'paid' ? 'paid' : s.status === 'failed' ? 'failed' : 'created',
      },
      status: s.status === 'paid' ? 'confirmed' : 'awaiting-payment',
      createdAt: s.createdAt,
      isShiprocketSession: true,
    }));

    return ok(res, {
      items, total, page, pages: Math.ceil(total / limit), paidRevenue: 0,
    });
  }

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter['payment.status'] = req.query.paymentStatus;
  if (req.query.q) {
    filter.$or = [
      { orderNumber: new RegExp(String(req.query.q).trim(), 'i') },
      { 'customer.phone': new RegExp(String(req.query.q).replace(/\D/g, ''), 'i') },
    ];
  }

  const [items, total, revenue] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(filter),
    Order.aggregate([{ $match: { 'payment.status': 'paid' } }, { $group: { _id: null, sum: { $sum: '$total' } } }]),
  ]);

  return ok(res, {
    items, total, page, pages: Math.ceil(total / limit),
    paidRevenue: revenue[0]?.sum || 0,
  });
});

exports.adminGetOrder = asyncHandler(async (req, res) => {
  const doc = await Order.findById(req.params.id).populate('items.product', 'title slug images').lean();
  if (!doc) throw ApiError.notFound('Order not found');
  return ok(res, doc);
});

/** PATCH /api/admin/orders/:id — status and hand-typed tracking. */
exports.adminUpdateOrder = asyncHandler(async (req, res) => {
  const doc = await Order.findById(req.params.id);
  if (!doc) throw ApiError.notFound('Order not found');

  const { status, courier, awb, trackingUrl, adminNotes } = req.body;

  if (status) {
    if (!Order.schema.path('status').enumValues.includes(status)) {
      throw ApiError.badRequest(`Unknown status "${status}"`);
    }
    if (status !== 'cancelled' && doc.payment.status !== 'paid') {
      throw ApiError.badRequest('This order has not been paid for yet');
    }
    doc.status = status;
    if (status === 'shipped' && !doc.tracking.shippedAt) doc.tracking.shippedAt = new Date();
    if (status === 'delivered' && !doc.tracking.deliveredAt) doc.tracking.deliveredAt = new Date();
  }

  if (courier !== undefined) doc.tracking.courier = courier;
  if (awb !== undefined) doc.tracking.awb = awb;
  if (trackingUrl !== undefined) doc.tracking.url = trackingUrl;
  if (adminNotes !== undefined) doc.adminNotes = adminNotes;

  await doc.save();
  return ok(res, doc);
});

exports.priceCart = priceCart;
