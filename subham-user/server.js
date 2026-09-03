import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_TARGET = (process.env.BACKEND_URL || 'https://subhamapi.hypernxt.space').replace(/\/$/, '');

app.disable('x-powered-by');

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

// Serve static built assets from dist
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback for all frontend React routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Storefront server listening on port ${PORT}`);
});
