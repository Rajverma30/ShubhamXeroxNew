/**
 * Shiprocket Checkout catalogue routes.
 *
 * Mounted in app.js at SHIPROCKET_CHECKOUT_ROUTE_PREFIX (default
 * "/shiprocket-checkout"), i.e. OUTSIDE the /api namespace, so the URLs match
 * exactly what the client registered with Shiprocket:
 *
 *   https://shubhamxerox.in/shiprocket-checkout/products
 *   https://shubhamxerox.in/shiprocket-checkout/collections
 *
 * Every route is behind the API-key/secret check.
 */
const express = require('express');
const rateLimit = require('express-rate-limit');

const shiprocketCheckoutAuth = require('../middleware/shiprocketCheckoutAuth');
const ctrl = require('../controllers/shiprocketCheckout.controller');
const sessionCtrl = require('../controllers/shiprocketSession.controller');

const router = express.Router();

// Catalogue sync is bursty — allow far more than the storefront limiter,
// but still cap it so a misconfigured poller can't hammer the database.
const syncLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: 'Too many catalogue sync requests' },
});

// Provider payment webhooks use their own HMAC verification. Catalogue GETs
// below continue to require the separate catalogue API credentials.
router.post('/webhook', sessionCtrl.webhook);
router.use(syncLimiter, shiprocketCheckoutAuth);

router.get('/ping', ctrl.ping);
router.get('/products', ctrl.products);      // also COLLECTION PRODUCT FETCH via ?collection_id=
router.get('/collections', ctrl.collections);
router.get('/collections/:collectionId/products', ctrl.collectionProducts);

module.exports = router;
