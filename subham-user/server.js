import path from 'path';
import { fileURLToPath } from 'url';
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
        const title = escapeHtml(p.seo?.metaTitle || p.title || 'Subham Xerox');
        const desc = escapeHtml(p.seo?.metaDescription || p.shortDescription || (p.description || '').replace(/<[^>]*>?/gm, '').slice(0, 200));
        const rawImg = p.images?.[0]?.url || p.images?.[0]?.thumbUrl || '';
        const imageUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${BACKEND_TARGET}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`) : 'https://www.shubhamxerox.in/logo.png';
        const pageUrl = `https://www.shubhamxerox.in/product/${slug}`;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Subham Xerox</title>
  <meta name="description" content="${desc}">
  <meta property="og:type" content="book">
  <meta property="og:site_name" content="Subham Xerox">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
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

// Proxy /shiprocket-checkout requests to backend service
app.use('/shiprocket-checkout', async (req, res) => {
  try {
    const targetUrl = `${BACKEND_TARGET}/shiprocket-checkout${req.url}`;
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        ...req.headers,
        host: new URL(BACKEND_TARGET).host,
      },
      data: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      validateStatus: () => true,
    });

    Object.entries(response.headers).forEach(([k, v]) => {
      if (k !== 'transfer-encoding' && k !== 'content-encoding' && k !== 'content-length') {
        res.setHeader(k, v);
      }
    });

    return res.status(response.status).send(response.data);
  } catch (err) {
    console.error('Shiprocket Checkout proxy error:', err.message);
    return res.status(502).json({ error: 'Proxy error', message: err.message });
  }
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
