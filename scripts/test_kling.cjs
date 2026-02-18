const https = require('https');

const API_KEY = 'e388f615-bd3f-4976-b10d-ca8894426f59:69e839057a207abf14f3461827641336';

const payload = {
  prompt: "A cute cat playing with a ball",
  duration: "5",
  aspect_ratio: "16:9"
};

const req = https.request({
  hostname: 'fal.run',
  path: '/fal-ai/kling-video/v1/standard/text-to-video',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Key ${API_KEY}`
  }
}, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
  });
});

req.on('error', console.error);
req.write(JSON.stringify(payload));
req.end();
