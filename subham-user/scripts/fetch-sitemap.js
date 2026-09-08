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
    let sitemapData = res.data;

    // Ensure all URLs use canonical domain shubhamxerox.in
    sitemapData = sitemapData.replace(/https?:\/\/[a-zA-Z0-9.-]+\.web\.app/g, 'https://shubhamxerox.in');
    sitemapData = sitemapData.replace(/https?:\/\/localhost:\d+/g, 'https://shubhamxerox.in');

    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapData, 'utf-8');
    console.log('✅ Successfully saved sanitized sitemap.xml to public/sitemap.xml');
  } catch (err) {
    console.error('⚠️ Failed to fetch sitemap during build:', err.message);
  }
}

fetchSitemap();
