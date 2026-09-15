const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let d = '';
      res.on('data', (c) => { d += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: d, headers: res.headers }));
    }).on('error', reject);
  });
}

(async () => {
  const home = await get('https://subhamxerox-nxt.web.app');
  const scripts = [...home.body.matchAll(/\/assets\/[^"']+\.js/g)].map((x) => x[0]);
  console.log('status', home.status, 'scripts', scripts.slice(0, 6));
  if (!scripts[0]) return;
  const js = await get('https://subhamxerox-nxt.web.app' + scripts[0]);
  console.log('js status', js.status, 'bytes', js.body.length);
  console.log('mentions subhamapi.hypernxt.space/uploads', js.body.includes('subhamapi.hypernxt.space/uploads'));
  console.log('mentions subhamxerox-nxt.web.app', js.body.includes('subhamxerox-nxt.web.app'));
  const m = js.body.match(/subhamapi\.hypernxt\.space[^`'"]{0,60}/);
  console.log('snippet', m && m[0]);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
