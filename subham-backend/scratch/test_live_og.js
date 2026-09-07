const axios = require('axios');

async function testLiveOg() {
  const slug = 'civil-engineering-through-objective-type-questions-or-revised-and-enlarged-third-edition-or-objective-questions-for-civil-engineering-exams-or-sp-gupta-and-ss-gupta';
  const ogUrl = `https://subhamapi.hypernxt.space/api/og/product/${slug}`;
  const imgUrl = `https://subhamapi.hypernxt.space/api/og/image/${slug}.jpg`;

  console.log('Testing Live OG URL:', ogUrl);
  try {
    const res1 = await axios.get(ogUrl, { headers: { 'User-Agent': 'TelegramBot (like TwitterBot)' } });
    console.log('\n--- Live OG HTML Response ---');
    console.log(res1.data);
  } catch (err) {
    console.error('OG HTML Error:', err.message);
  }

  console.log('\nTesting Live OG Image URL:', imgUrl);
  try {
    const res2 = await axios.get(imgUrl, { responseType: 'arraybuffer' });
    console.log('Image status:', res2.status);
    console.log('Content-Type:', res2.headers['content-type']);
    console.log('Content-Length:', res2.headers['content-length']);
  } catch (err) {
    console.error('Image Proxy Error:', err.message);
  }
}

testLiveOg();
