const axios = require('axios');

async function testLive() {
  const oldSlug = 'parikshadham-samanya-prabandhan-or-or-general-management-or-new-syllabus-book-in-hindi-for-mp-patwari-group-2-subgroup-4-and-all-mppeb-exams-2026-27';

  try {
    const res = await axios.get(`https://shubhamxeroxnew-production.up.railway.app/api/legacy/resolve?path=/product/${oldSlug}`);
    console.log('Live Backend Legacy Resolve Response:', res.data);
  } catch (err) {
    console.error('Error fetching live legacy resolve:', err.response?.data || err.message);
  }

  try {
    const ogRes = await axios.get(`https://shubhamxeroxnew-production.up.railway.app/api/og/product/${oldSlug}`, {
      maxRedirects: 0,
      validateStatus: null
    });
    console.log('Live Backend OG Endpoint Status:', ogRes.status);
    console.log('Live Backend OG Endpoint Location Header:', ogRes.headers.location);
  } catch (err) {
    console.error('Error fetching OG endpoint:', err.message);
  }
}

testLive();
