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
  for (const host of ['https://www.shubhamxerox.in', 'https://subhamxerox-nxt.web.app', 'https://shubhamxerox-3ae11.web.app']) {
    try {
      const home = await get(host);
      const scripts = [...home.body.matchAll(/\/assets\/[^"']+\.js/g)].map((x) => x[0]);
      console.log('\nHOST', host, 'status', home.status, 'scripts', scripts[0] || '(none)');
      if (!scripts[0]) continue;
      const js = await get(host + scripts[0]);
      const hasWeb = js.body.includes('subhamxerox-nxt.web.app');
      const hasApiRewrite = /origin!==.*uploads/.test(js.body) || js.body.includes('pathname.includes("/uploads/")');
      const apiMatch = js.body.match(/https:\/\/[^"`']+\/api/);
      console.log('  web.app uploads host baked in:', hasWeb);
      console.log('  uploads rewrite logic:', hasApiRewrite);
      console.log('  api url sample:', apiMatch && apiMatch[0]);
    } catch (e) {
      console.log('\nHOST', host, 'ERR', e.message);
    }
  }
})();
