const https = require('https');
https.get('https://shubhamxerox-3ae11.web.app', (res) => {
  let d = '';
  res.on('data', (c) => { d += c; });
  res.on('end', () => {
    const m = d.match(/\/assets\/index-[^"']+\.js/);
    console.log('3ae11 script', m && m[0]);
    if (!m) return;
    https.get('https://shubhamxerox-3ae11.web.app' + m[0], (r2) => {
      let b = '';
      r2.on('data', (c) => { b += c; });
      r2.on('end', () => {
        console.log('has web.app uploads host', b.includes('subhamxerox-nxt.web.app'));
        console.log('has subhamapi api', b.includes('subhamapi.hypernxt.space/api'));
      });
    });
  });
});
