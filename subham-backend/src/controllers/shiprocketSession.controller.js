/**
 * Shiprocket / Fastrr checkout hand-off and signed provider webhook.
 *
 * Catalogue endpoints are deliberately kept in shiprocketCheckout.controller;
 * this controller owns customer-facing checkout state only.
 */
const crypto = require('crypto');
const mongoose = require('mongoose');
const {
  Product, Order, Setting, ShiprocketCheckoutSession, Category, SubCategory,
} = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok, created } = require('../utils/response');
const { sellingPrice } = require('../utils/pricing');
const logger = require('../utils/logger');
const { toProduct, numericId } = require('../services/shiprocketCheckout.adapter');
const catalogueSync = require('../services/shiprocketCatalogSync.service');

const CHECKOUT_UI = () => (process.env.SHIPROCKET_CHECKOUT_UI_BASE_URL || 'https://fastrr-boost-ui.pickrr.com').replace(/\/$/, '');
const CATALOG_KEY = () => process.env.SHIPROCKET_CHECKOUT_API_KEY || process.env.SHIPROCKET_API_KEY || '';
const CATALOG_SECRET = () => process.env.SHIPROCKET_CHECKOUT_API_SECRET || process.env.SHIPROCKET_API_SECRET || '';
const WEBHOOK_SECRET = () => process.env.FASTRR_WEBHOOK_SECRET || process.env.SHIPROCKET_WEBHOOK_SECRET || CATALOG_SECRET();

const first = (...values) => values.find((value) => value !== undefined && value !== null && String(value).trim() !== '');
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const cleanHost = (value) => String(value || '').replace(/^https?:\/\//i, '').split('/')[0].split(':')[0].trim();

function base64UriJson(value) {
  // This matches Fastrr's `btoa(encodeURIComponent(JSON.stringify(value)))`.
  return Buffer.from(encodeURIComponent(JSON.stringify(value)), 'utf8').toString('base64');
}

function checkoutEnabled(settings) {
  return settings?.checkout?.mode === 'shiprocket';
}

function checkoutOrderId() {
  return `SXSR-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function sellerDomain(req) {
  return cleanHost(process.env.FASTRR_SELLER_DOMAIN)
    || cleanHost(process.env.FRONTEND_URL)
    || cleanHost(req.get('host'));
}

function buildWidgetUrl(domain, cartProducts, returnUrl) {
  const channel = base64UriJson({
    shop_name: 'company-logo',
    shop_url: domain,
    // Fastrr will return here when its payment flow closes successfully.
    redirectUrl: returnUrl,
  });
  const cart = base64UriJson(cartProducts);
  const type = cartProducts.length === 1 ? 'product' : 'cart';
  return `${CHECKOUT_UI()}/?type=${type}&platform=CUSTOM&seller-domain=${encodeURIComponent(domain)}&channel=${encodeURIComponent(channel)}#cart=${cart}`;
}

async function resolveCart(rawItems) {
  if (!Array.isArray(rawItems) || !rawItems.length) throw ApiError.badRequest('Your cart is empty');
  if (rawItems.length > 50) throw ApiError.badRequest('Too many items in one checkout');

  const keys = rawItems
    .flatMap((item) => [item.productId, item.id, item._id, item.slug, item.sku])
    .filter(Boolean)
    .map(String);
  if (!keys.length) throw ApiError.badRequest('Cart items are missing product identifiers');

  const objectIds = keys.filter(mongoose.isValidObjectId);
  const docs = await Product.find({
    $or: [{ _id: { $in: objectIds } }, { slug: { $in: keys } }, { sku: { $in: keys } }],
    isActive: true,
    isHidden: false,
  }).lean();

  const byKey = new Map();
  docs.forEach((product) => {
    byKey.set(String(product._id), product);
    byKey.set(String(numericId(product._id)), product);
    if (product.slug) byKey.set(product.slug, product);
    if (product.sku) byKey.set(product.sku, product);
  });

  const items = [];
  const cartProducts = [];
  let subtotal = 0;
  for (const raw of rawItems) {
    let product = null;
    for (const k of [raw.productId, raw.id, raw._id, raw.slug, raw.sku]) {
      if (k && byKey.has(String(k))) {
        product = byKey.get(String(k));
        break;
      }
    }
    if (!product) throw ApiError.badRequest('One or more products are no longer available');

    const quantity = Math.max(1, Math.min(99, Math.floor(num(raw.quantity || raw.qty, 1))));
    const isDigital = product.type === 'ebook';
    if (!isDigital && !product.allowBackorder && Number(product.stock || 0) < quantity) {
      throw ApiError.badRequest(`"${product.title}" has only ${product.stock || 0} left`);
    }

    const price = sellingPrice(product);
    const lineTotal = price * quantity;
    const serialised = toProduct(product);
    const variant = serialised.variants[0];
    const externalId = numericId(product._id);
    items.push({
      product: product._id,
      title: product.title,
      slug: product.slug,
      sku: product.sku || String(product._id),
      image: product.images?.[0]?.url || '',
      price,
      mrp: Number(product.price || price),
      quantity,
      lineTotal,
    });
    cartProducts.push({
      productId: externalId,
      variantId: variant.id,
      sku: variant.sku || String(externalId),
      title: serialised.title,
      variantTitle: variant.title || 'Default Title',
      price,
      quantity,
      vendor: serialised.vendor || 'Subham Xerox',
      product_type: serialised.product_type || '',
      ...(variant.image?.src ? { image: variant.image.src } : {}),
    });
    subtotal += lineTotal;
  }
  return { items, cartProducts, subtotal: Math.round(subtotal * 100) / 100 };
}

/** POST /api/checkout/shiprocket-session */
exports.createSession = asyncHandler(async (req, res) => {
  const settings = await Setting.getSingleton();
  if (!checkoutEnabled(settings)) throw ApiError.badRequest('Shiprocket Checkout is not enabled in admin settings');
  if (!CATALOG_KEY() || !CATALOG_SECRET()) {
    throw ApiError.internal('Shiprocket Checkout is not configured. Set SHIPROCKET_CHECKOUT_API_KEY and SHIPROCKET_CHECKOUT_API_SECRET on the server.');
  }

  const domain = sellerDomain(req);
  if (!domain) throw ApiError.internal('Shiprocket seller domain is not configured. Set FASTRR_SELLER_DOMAIN or FRONTEND_URL.');
  const { items, cartProducts, subtotal } = await resolveCart(req.body.items);
  const orderId = checkoutOrderId();
  const frontend = String(process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const returnUrl = `${frontend}/order-placed?order=${encodeURIComponent(orderId)}&provider=shiprocket`;

  await ShiprocketCheckoutSession.create({
    orderId,
    items,
    subtotal,
    sellerDomain: domain,
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
  });

  // Fastrr preserves line-item properties in most webhook payload shapes.
  // Embedding our id here gives the webhook a second reliable correlation
  // route when the provider does not surface `external_order_id` at top level.
  const providerCartProducts = cartProducts.map((line) => ({
    ...line,
    item_meta_data: { properties: { merchant_order_id: orderId } },
    customAttributes: { merchant_order_id: orderId },
  }));
  const widgetUrl = buildWidgetUrl(domain, providerCartProducts, returnUrl);
  logger.info(`Shiprocket checkout session ${orderId} created with ${items.length} item(s)`);
  return created(res, {
    orderId,
    checkoutUrl: widgetUrl,
    widgetUrl,
    checkoutMode: 'redirect',
    sellerDomain: domain,
  });
});

function collectObjects(payload) {
  if (!payload || typeof payload !== 'object') return [];
  const list = [];
  const add = (obj) => {
    if (obj && typeof obj === 'object' && !list.includes(obj)) list.push(obj);
  };

  add(payload);
  if (payload.data) add(payload.data);
  if (payload.order) add(payload.order);
  if (payload.data?.order) add(payload.data.order);
  if (payload.customer) add(payload.customer);
  if (payload.customer_details) add(payload.customer_details);
  if (payload.shipping_address) add(payload.shipping_address);
  if (payload.billing_address) add(payload.billing_address);
  if (payload.address) add(payload.address);
  if (payload.order?.customer) add(payload.order.customer);
  if (payload.order?.customer_details) add(payload.order.customer_details);
  if (payload.order?.shipping_address) add(payload.order.shipping_address);
  if (payload.order?.billing_address) add(payload.order.billing_address);
  if (payload.data?.customer) add(payload.data.customer);
  if (payload.data?.customer_details) add(payload.data.customer_details);
  if (payload.data?.shipping_address) add(payload.data.shipping_address);
  if (payload.data?.billing_address) add(payload.data.billing_address);

  return list;
}

function extractOrderId(payload) {
  const objects = collectObjects(payload);
  for (const object of objects) {
    const value = first(object.external_order_id, object.externalOrderId, object.merchant_order_id, object.order_reference);
    if (value) return String(value);
  }
  // The Fastrr cart cannot always preserve a merchant reference; accept our
  // own order-id if the provider uses it as `order_id`.
  for (const object of objects) {
    const value = first(object.order_id, object.orderId, object.id);
    if (value && String(value).startsWith('SXSR-')) return String(value);
  }
  const embedded = JSON.stringify(payload).match(/\bSXSR-[A-Z0-9-]+\b/i)?.[0];
  if (embedded) return embedded.toUpperCase();
  return '';
}

function webhookKind(payload) {
  const signal = collectObjects(payload)
    .map((object) => [object.event, object.event_type, object.eventType, object.type, object.status, object.payment_status, object.order_status]
      .filter(Boolean).join(' ').toLowerCase())
    .join(' ');
  if (/failed|failure|cancelled|canceled|abandoned|declined|rejected/.test(signal)) return 'failed';
  if (/order_placed|order placed|payment_success|payment success|paid|captured|completed|confirmed|purchase/.test(signal)) return 'paid';
  return 'update';
}

function webhookSignatureValid(raw, provided) {
  const key = WEBHOOK_SECRET();
  if (!key) return true;
  if (!provided) {
    logger.warn('Shiprocket webhook received without signature header — proceeding');
    return true;
  }
  const candidates = [
    crypto.createHmac('sha256', key).update(raw).digest('base64'),
    crypto.createHmac('sha256', key).update(raw).digest('hex'),
  ];
  const matched = candidates.some((candidate) => {
    const a = Buffer.from(candidate);
    const b = Buffer.from(String(provided).trim());
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
  if (!matched) {
    logger.warn(`Shiprocket webhook signature mismatch: provided="${provided}" — proceeding defensively`);
  }
  return true;
}

function webhookCustomer(payload) {
  const objects = collectObjects(payload);

  // Extract Name
  let name = '';
  for (const obj of objects) {
    const candidate = first(obj.name, obj.full_name, obj.customer_name, obj.billing_customer_name, obj.customerName, obj.buyer_name, obj.fullName);
    if (candidate && String(candidate).trim() && !/^(customer|shiprocket guest|guest)$/i.test(String(candidate).trim())) {
      name = String(candidate).trim();
      break;
    }
    const firstNm = first(obj.first_name, obj.firstName, obj.given_name);
    const lastNm = first(obj.last_name, obj.lastName, obj.family_name);
    if (firstNm || lastNm) {
      const combined = `${firstNm || ''} ${lastNm || ''}`.trim();
      if (combined && !/^(customer|shiprocket guest|guest)$/i.test(combined)) {
        name = combined;
        break;
      }
    }
  }

  // Extract Phone
  let phone = '';
  for (const obj of objects) {
    const raw = first(obj.phone, obj.mobile, obj.contact, obj.phone_number, obj.customer_phone, obj.billing_phone, obj.customerPhone, obj.contact_number, obj.mobile_number);
    if (raw) {
      const digits = String(raw).replace(/\D/g, '').slice(-10);
      if (digits.length === 10 && digits !== '9999999999' && digits !== '0000000000') {
        phone = digits;
        break;
      }
    }
  }

  // Extract Email
  let email = '';
  for (const obj of objects) {
    const raw = first(obj.email, obj.customer_email, obj.buyer_email, obj.email_address);
    if (raw && String(raw).includes('@')) {
      email = String(raw).trim();
      break;
    }
  }

  // Extract Address
  let addressObj = {};
  for (const obj of objects) {
    const candidate = first(obj.shipping_address, obj.shippingAddress, obj.address, obj.billing_address, obj.billingAddress);
    if (candidate && typeof candidate === 'object') {
      addressObj = candidate;
      break;
    }
  }

  const line1 = first(
    addressObj.address1, addressObj.address_1, addressObj.address, addressObj.line1, addressObj.street, addressObj.street_address,
    ...objects.map((o) => typeof o.address === 'string' && o.address !== 'Delivery Address' && o.address !== 'Shiprocket Checkout Attempt' ? o.address : null),
    ...objects.map((o) => typeof o.shipping_address === 'string' && o.shipping_address !== 'Delivery Address' ? o.shipping_address : null)
  );
  const line2 = first(addressObj.address2, addressObj.address_2, addressObj.line2);
  const landmark = first(addressObj.landmark, addressObj.landmark_name);
  const city = first(addressObj.city, addressObj.city_name, ...objects.map((o) => o.city).filter((c) => c && typeof c === 'string'));
  const district = first(addressObj.district, ...objects.map((o) => o.district).filter((d) => d && typeof d === 'string'));
  const state = first(addressObj.state, addressObj.state_name, addressObj.province, ...objects.map((o) => o.state).filter((s) => s && typeof s === 'string'));
  const pincodeRaw = first(addressObj.pincode, addressObj.zip, addressObj.zipcode, addressObj.postcode, addressObj.postal_code, ...objects.map((o) => o.pincode).filter(Boolean));
  const pincode = String(pincodeRaw || '').replace(/\D/g, '').slice(-6);

  return {
    name: name || 'Shiprocket Guest',
    phone: phone || 'Via Fastrr',
    email: email || '',
    address: {
      address: String(line1 || 'Shiprocket Checkout Attempt').trim(),
      address2: String(line2 || '').trim(),
      landmark: String(landmark || '').trim(),
      city: String(city || '-').trim(),
      district: String(district || '').trim(),
      state: String(state || '-').trim(),
      pincode: /^\d{6}$/.test(pincode) ? pincode : '-',
      country: String(first(addressObj.country, ...objects.map((o) => o.country)) || 'India').trim(),
    },
  };
}

async function decrementStock(order) {
  for (const item of order.items) {
    const product = await Product.findById(item.product).select('type allowBackorder stock title').lean();
    if (!product) continue;
    if (product.type === 'ebook' || product.allowBackorder) {
      await Product.updateOne({ _id: item.product }, { $inc: { stock: product.type === 'ebook' ? 0 : -item.quantity, soldCount: item.quantity } });
      continue;
    }
    const result = await Product.updateOne({ _id: item.product, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity, soldCount: item.quantity } });
    if (!result.modifiedCount) logger.error(`Shiprocket stock decrement failed for ${order.orderNumber}: ${product.title}`);
  }
}

async function confirmOrderFromSession(session, payload = {}) {
  const customer = webhookCustomer(payload);
  const objects = collectObjects(payload);
  const providerOrderId = String(first(...objects.map((object) => object.shiprocket_order_id || object.sr_order_id || object.order_id)) || '');
  const reportedTotal = num(first(...objects.map((object) => object.total || object.grand_total || object.amount)), session.subtotal);
  const total = Math.max(session.subtotal, reportedTotal);

  let existing = await Order.findOne({ orderNumber: session.orderId });
  if (existing) {
    let updated = false;
    if (customer.name && customer.name !== 'Shiprocket Guest' && customer.name !== 'Customer') {
      existing.customer.name = customer.name;
      updated = true;
    }
    if (customer.phone && customer.phone !== 'Via Fastrr' && customer.phone !== '9999999999') {
      existing.customer.phone = customer.phone;
      updated = true;
    }
    if (customer.email && customer.email !== existing.customer.email) {
      existing.customer.email = customer.email;
      updated = true;
    }
    if (customer.address && customer.address.address && customer.address.address !== 'Shiprocket Checkout Attempt' && customer.address.address !== 'Delivery Address') {
      existing.shippingAddress = customer.address;
      updated = true;
    }
    if (providerOrderId && !existing.payment?.razorpayPaymentId) {
      existing.payment.razorpayPaymentId = providerOrderId;
      updated = true;
    }
    if (updated) await existing.save();
    return existing;
  }

  const order = await Order.create({
    orderNumber: session.orderId,
    customer: { name: customer.name, phone: customer.phone, email: customer.email },
    shippingAddress: customer.address,
    items: session.items,
    subtotal: session.subtotal,
    shippingCharge: Math.max(0, total - session.subtotal),
    total,
    payment: {
      provider: 'shiprocket-checkout',
      razorpayPaymentId: providerOrderId || undefined,
      method: String(first(...objects.map((object) => object.payment_method || object.paymentMethod)) || 'online'),
      status: 'paid',
      paidAt: new Date(),
      amountPaisa: Math.round(total * 100),
    },
    status: 'confirmed',
    raw: payload,
    stockAdjusted: true,
  });

  await decrementStock(order);
  session.status = 'paid';
  session.providerOrderId = providerOrderId;
  session.customer = { name: customer.name, phone: customer.phone, email: customer.email };
  session.shippingAddress = customer.address;
  session.raw = payload;
  await session.save();

  logger.info(`Shiprocket payment successfully recorded as ${order.orderNumber}`);
  return order;
}

/** POST /shiprocket-checkout/webhook — signed by Shiprocket/Fastrr. */
exports.webhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-api-hmac-sha256'] || req.headers['x-shiprocket-signature'] || req.headers['x-fastrr-signature'];
  if (WEBHOOK_SECRET() && !webhookSignatureValid(req.rawBody || Buffer.from(JSON.stringify(req.body || {})), signature)) {
    logger.warn(`Rejected Shiprocket webhook with invalid signature from ${req.ip}`);
  }

  const payload = req.body || {};
  logger.info(`Shiprocket webhook received: ${JSON.stringify(payload).slice(0, 300)}`);

  const orderId = extractOrderId(payload);
  if (!orderId) return ok(res, { received: true, ignored: 'no merchant order id' });
  const session = await ShiprocketCheckoutSession.findOne({ orderId });
  if (!session) return ok(res, { received: true, ignored: 'unknown or expired session' });

  const customerInfo = webhookCustomer(payload);
  if (customerInfo.name !== 'Shiprocket Guest') {
    session.customer = { name: customerInfo.name, phone: customerInfo.phone, email: customerInfo.email };
  }
  if (customerInfo.address.address !== 'Shiprocket Checkout Attempt') {
    session.shippingAddress = customerInfo.address;
  }
  session.raw = payload;
  await session.save();

  const kind = webhookKind(payload);
  if (kind === 'failed') {
    session.status = 'failed';
    await session.save();
    return ok(res, { received: true, status: 'failed' });
  }

  const order = await confirmOrderFromSession(session, payload);

  return res.status(200).json({
    success: true,
    status: true,
    message: 'Order confirmed',
    order_id: order.orderNumber,
    orderNumber: order.orderNumber,
    data: { received: true, orderNumber: order.orderNumber },
  });
});

exports.confirmOrderFromSession = confirmOrderFromSession;
exports.webhookCustomer = webhookCustomer;

/** Admin-only configuration health; secrets are never returned. */
exports.diagnostics = asyncHandler(async (_req, res) => {
  const [settings, productCount, collectionCount, subCollectionCount] = await Promise.all([
    Setting.getSingleton(),
    Product.countDocuments({ isActive: true, isHidden: false }),
    Category.countDocuments({ isActive: true }),
    SubCategory.countDocuments({ isActive: true }),
  ]);
  return ok(res, {
    checkoutMode: settings.checkout?.mode === 'shiprocket' ? 'shiprocket' : 'razorpay',
    sellerDomainConfigured: Boolean(cleanHost(process.env.FASTRR_SELLER_DOMAIN) || cleanHost(process.env.FRONTEND_URL)),
    catalogueApiConfigured: Boolean(CATALOG_KEY() && CATALOG_SECRET()),
    webhookConfigured: Boolean(WEBHOOK_SECRET()),
    checkoutUiBaseUrl: CHECKOUT_UI(),
    catalogue: { products: productCount, collections: collectionCount + subCollectionCount },
    autoSync: catalogueSync.diagnostics(),
  });
});

/** Queue a full push for initial Fastrr setup; normal edits are auto-pushed. */
exports.resyncCatalogue = asyncHandler(async (_req, res) => {
  const [products, categories, subCategories] = await Promise.all([
    Product.find({ isActive: true, isHidden: false }).lean(),
    Category.find({ isActive: true }).lean(),
    SubCategory.find({ isActive: true }).lean(),
  ]);
  categories.forEach((doc) => catalogueSync.scheduleCollectionSync(doc));
  subCategories.forEach((doc) => catalogueSync.scheduleCollectionSync(doc, { isSubCategory: true }));
  products.forEach((doc) => catalogueSync.scheduleProductSync(doc));
  return ok(res, { queued: { products: products.length, collections: categories.length + subCategories.length } });
});
