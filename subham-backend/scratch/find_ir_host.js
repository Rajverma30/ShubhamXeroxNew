const https = require('https');

https.get('https://www.shubhamxerox.in/assets/index-CmFeL9IH.js', (res) => {
  let b = '';
  res.on('data', (c) => { b += c; });
  res.on('end', () => {
    // find ir= assignment near uploads rewrite
    const i = b.indexOf('if(t.includes("/uploads/"))');
    console.log('context before uploads rewrite:\n', b.slice(i - 350, i + 200));

    // search for ir=
    const matches = [...b.matchAll(/[,;]ir=("https:\/\/[^"]+"|`[^`]+`|[^,;]+)/g)].slice(0, 20);
    console.log('\nir assignments:', matches.map((m) => m[0]).slice(0, 10));

    const j = b.search(/ir="/);
    console.log('\nir=" at', j, b.slice(j, j + 100));

    const k = b.search(/UPLOADS|uploads origin|web\.app|VITE_UPLOADS/i);
    console.log('keyword', k, b.slice(Math.max(0, k - 20), k + 80));
  });
});
