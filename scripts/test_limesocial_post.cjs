const https = require('https');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';

const payload = {
  title: "Test Post from API",
  description: "This is a test post to verify the endpoint.",
  accounts: [
    { platform: "instagram", username: "kasktasarimtr" }
  ],
  postType: "post", // Try a simple post first, no media
  mediaUrl: "https://images.unsplash.com/photo-1558981403-c5f91cb9c231?q=80&w=1000&auto=format&fit=crop" // Random public image
};

const req = https.request({
  hostname: 'api.limesocial.io',
  path: '/v1/post',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': API_KEY
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
