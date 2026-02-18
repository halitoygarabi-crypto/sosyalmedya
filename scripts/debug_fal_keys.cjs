const https = require('https');

const keys = [
  'e388f615-bd3f-4976-b10d-ca8894426f59:69e839057a207abf14f3461827641336',
  '41adaa86-cd34-4d89-a492-ae7170f9b4c1:9997498e526f461d8697c62c62820b21'
];

async function testKey(key) {
  console.log(`Testing key starts with ${key.substring(0, 8)}...`);
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'fal.run',
      path: '/fal-ai/kling-video/v1/standard/text-to-video',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${key}`
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
    // Dummy payload to trigger auth check
    req.write(JSON.stringify({ prompt: "test" }));
    req.end();
  });
}

async function run() {
  for (const key of keys) {
    const res = await testKey(key);
    console.log('Result:', JSON.stringify(res));
  }
}

run();
