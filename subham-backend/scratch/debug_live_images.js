const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let d = '';
      res.on('data', (c) => { d += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: d, headers: res.headers }));
    }).on('error', reject);
  });
}

(async () => {
  // 1) Railway API product images
  const api = await get('https://shubhamxeroxnew-production.up.railway.app/api/products?limit=5');
  const j = JSON.parse(api.body);
  const arr = j.data || j.products || j.items || j.docs || [];
  const list = Array.isArray(arr) ? arr : (arr.docs || arr.results || []);
  console.log('API products', list.length);
  for (const p of list.slice(0, 5)) {
    const u = p.images?.[0]?.url;
    console.log('-', (p.title || '').slice(0, 40));
    console.log('  url:', u);
  }

  // 2) www frontend: what does it do with uploads?
  const home = await get('https://www.shubhamxerox.in');
  const script = (home.body.match(/\/assets\/index-[^"']+\.js/) || [])[0];
  console.log('\nwww script', script);
  if (script) {
    const js = await get('https://www.shubhamxerox.in' + script);
    const origins = [...new Set([...js.body.matchAll(/https:\/\/[a-z0-9.-]+/gi)].map((m) => m[0]))];
    console.log('origins', origins);
    console.log('has web.app', js.body.includes('subhamxerox-nxt.web.app'));
    console.log('has railway uploads rewrite?', /railway\.app.*uploads|uploads.*railway/i.test(js.body));
    // find ke/resolve function snippet
    const i = js.body.indexOf('/uploads/');
    console.log('uploads context', js.body.slice(Math.max(0, i - 120), i + 120));
  }

  // 3) HEAD first product image as browser would
  if (list[0]?.images?.[0]?.url) {
    const img = list[0].images[0].url;
    const head = await new Promise((resolve) => {
      const req = https.request(img, { method: 'HEAD' }, (r) => resolve(r.statusCode));
      req.on('error', () => resolve(0));
      req.end();
    });
    console.log('\nfirst image HEAD', head, img);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
