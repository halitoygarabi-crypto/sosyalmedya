const https = require('https');

const API_KEY = '5b1a53fd-1e3c-4a3b-ba12-1608f4e74ff1:fdc5e07aa0fcc314647f79faeb1b260c46deba56506f2a4a622cc4915b9759ae';

async function testKey() {
  console.log(`Testing key 5b1a53fd...`);
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'fal.run',
      path: '/fal-ai/flux-pro',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${API_KEY}`
      },
      timeout: 5000
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

testKey().then(res => console.log('Result:', JSON.stringify(res)));
