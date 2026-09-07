import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = 'https://subhamapi.hypernxt.space';

async function fetchSitemap() {
  try {
    console.log(`Fetching live sitemap from ${BACKEND_URL}/sitemap.xml...`);
    const res = await axios.get(`${BACKEND_URL}/sitemap.xml`, { responseType: 'text' });
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), res.data, 'utf-8');
    console.log('✅ Successfully saved sitemap.xml to public/sitemap.xml');
  } catch (err) {
    console.error('⚠️ Failed to fetch sitemap during build:', err.message);
  }
}

fetchSitemap();
