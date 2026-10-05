import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import https from 'https';
import express from 'express';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_TARGET = (process.env.BACKEND_URL || 'https://subhamapi.hypernxt.space').replace(/\/$/, '');

const BOT_USER_AGENT_REGEX = /(TelegramBot|WhatsApp|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|Discordbot|Pinterest|Googlebot|bingbot|bot|crawler|spider)/i;

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Serve dynamic HTML with Open Graph book cover meta tags for social bots (Telegram, WhatsApp, Facebook, etc.)
app.get(['/product/:slug', '/share/product/:slug', '/og/product/:slug'], async (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const isBot = BOT_USER_AGENT_REGEX.test(userAgent);
  const isExplicitShare = req.path.startsWith('/share/') || req.path.startsWith('/og/');

  if (isBot || isExplicitShare) {
    const slug = req.params.slug;

    // 1. Try backend OG route first
    try {
      const targetUrl = `${BACKEND_TARGET}/api/og/product/${slug}`;
      const ogRes = await axios.get(targetUrl, {
        headers: { 'User-Agent': userAgent },
        responseType: 'text',
        validateStatus: () => true,
      });

      if (ogRes.status === 200 && ogRes.data && ogRes.data.includes('og:image')) {
        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        return res.send(ogRes.data);
      }
    } catch (err) {
      console.error(`OG backend proxy error for ${slug}:`, err.message);
    }

    // 2. Direct product API fallback if backend OG route is not active
    try {
      const prodRes = await axios.get(`${BACKEND_TARGET}/api/products/${slug}`, { validateStatus: () => true });
      if (prodRes.data?.success && prodRes.data?.data?.product) {
        const p = prodRes.data.data.product;
        const finalPrice = p.finalPrice || p.price || 0;
        const mrp = p.price || finalPrice;
        const discountText = p.discountPercent > 0 ? ` (${p.discountPercent}% OFF)` : (mrp > finalPrice ? ` (Save ₹${Math.round(mrp - finalPrice)})` : '');
        const priceText = `₹${finalPrice}${discountText}`;

        const rawTitle = p.seo?.metaTitle || p.title || 'Shubham Xerox';
        const title = escapeHtml(`${rawTitle} — ${priceText}`);
        const rawDesc = p.shortDescription || (p.description || '').replace(/<[^>]*>?/gm, '').slice(0, 180);
        const desc = escapeHtml(`${priceText} · ${rawDesc || `Buy ${rawTitle} online at Shubham Xerox.`}`);
        const rawImg = p.images?.[0]?.url || p.images?.[0]?.thumbUrl || '';
        const imageUrl = rawImg ? `${BACKEND_TARGET}/api/og/image/${slug}.jpg` : 'https://www.shubhamxerox.in/logo.png';
        const pageUrl = `https://www.shubhamxerox.in/product/${slug}`;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="Shubham Xerox">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:price:amount" content="${finalPrice}">
  <meta property="og:price:currency" content="INR">
  <meta property="product:price:amount" content="${finalPrice}">
  <meta property="product:price:currency" content="INR">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="800">
  <meta property="og:image:height" content="1000">
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:title" content="${title}">
  <meta property="twitter:description" content="${desc}">
  <meta property="twitter:image" content="${imageUrl}">
</head>
<body>
  <h1>${title}</h1>
  <p>${desc}</p>
  <img src="${imageUrl}" alt="${title}">
</body>
</html>`;

        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        return res.send(html);
      }
    } catch (err) {
      console.error(`Direct product lookup fallback error for ${slug}:`, err.message);
    }
  }

  // Humans fall through to SPA dist/index.html
  next();
});

// Proxy GoKwik cart API → backend (same paths WooCommerce uses).
app.use(['/wp-json/gokwik/v1', '/gokwik/v1'], (req, res) => {
  const prefix = req.baseUrl;
  const target = new URL(`${BACKEND_TARGET}${prefix}${req.url}`);
  const lib = target.protocol === 'https:' ? https : http;

  const headers = { ...req.headers, host: target.host };
  delete headers['accept-encoding'];

  const proxyReq = lib.request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || (target.protocol === 'https:' ? 443 : 80),
      path: `${target.pathname}${target.search}`,
      method: req.method,
      headers,
      timeout: 60000,
    },
    (proxyRes) => {
      const outHeaders = { ...proxyRes.headers };
      delete outHeaders['transfer-encoding'];
      res.writeHead(proxyRes.statusCode || 502, outHeaders);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on('error', (err) => {
    console.error('GoKwik cart API proxy error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Proxy error', message: err.message });
    }
  });

  req.pipe(proxyReq);
});

// Proxy /shiprocket-checkout → backend.
// CRITICAL: do NOT use req.body here. This server has no body parser for these
// routes; reading req.body yielded `{}` and Fastrr payment webhooks arrived
// empty on the API — checkout then stuck on "Order Pending" despite HTTP 200.
// Stream the raw request bytes through instead.
app.use('/shiprocket-checkout', (req, res) => {
  const target = new URL(`${BACKEND_TARGET}/shiprocket-checkout${req.url}`);
  const lib = target.protocol === 'https:' ? https : http;

  const headers = { ...req.headers, host: target.host };
  // Avoid double-decoding compressed upstream responses through axios-less pipe
  delete headers['accept-encoding'];

  const proxyReq = lib.request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || (target.protocol === 'https:' ? 443 : 80),
      path: `${target.pathname}${target.search}`,
      method: req.method,
      headers,
      timeout: 60000,
    },
    (proxyRes) => {
      const outHeaders = { ...proxyRes.headers };
      delete outHeaders['transfer-encoding'];
      res.writeHead(proxyRes.statusCode || 502, outHeaders);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on('error', (err) => {
    console.error('Shiprocket Checkout proxy error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Proxy error', message: err.message });
    }
  });

  req.pipe(proxyReq);
});

// Proxy /sitemap.xml and /robots.txt to backend service for SEO
app.get(['/sitemap.xml', '/robots.txt'], async (req, res) => {
  try {
    const targetUrl = `${BACKEND_TARGET}${req.path}`;
    const response = await axios.get(targetUrl, { responseType: 'text' });
    res.setHeader('Content-Type', req.path.endsWith('.xml') ? 'application/xml' : 'text/plain');
    return res.send(response.data);
  } catch (err) {
    console.error(`Error proxying ${req.path}:`, err.message);
    return res.status(500).send('Error loading resource');
  }
});

// Serve static built assets from dist
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback for all frontend React routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Storefront server listening on port ${PORT}`);
});
