const https = require('https');

const API_KEY = 'e388f615-bd3f-4976-b10d-ca8894426f59:69e839057a207abf14f3461827641336';

async function testV16() {
  console.log(`Testing v1.6 with key e388f615...`);
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'fal.run',
      path: '/fal-ai/kling-video/v1.6/standard/text-to-video',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${API_KEY}`
      },
      timeout: 10000
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });

    req.on('error', (e) => resolve({ error: e.message }));
    req.on('timeout', () => {
        req.destroy();
        resolve({ error: 'Timeout' });
    });
    req.write(JSON.stringify({ prompt: "test" }));
    req.end();
  });
}

testV16().then(res => console.log('Result:', JSON.stringify(res)));
