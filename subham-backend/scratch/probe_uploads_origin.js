const https = require('https');
https.get('https://subhamxerox-nxt.web.app/assets/index-uJKgkpFz.js', (res) => {
  let b = '';
  res.on('data', (c) => { b += c; });
  res.on('end', () => {
    const i = b.indexOf('pathname.includes("/uploads/")');
    console.log('--- context ---');
    console.log(b.slice(i - 250, i + 180));
    // find nearby https origins
    const origins = [...b.matchAll(/https:\/\/[a-z0-9.-]+/gi)].map((m) => m[0]);
    const uniq = [...new Set(origins)];
    console.log('--- origins in bundle ---');
    console.log(uniq);
  });
});
