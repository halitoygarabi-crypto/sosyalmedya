const https = require('https');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';

const payload = {
  title: "Test Post with Direct Image",
  description: "This is a test post to verify the endpoint with a direct image link.",
  accounts: [
    { platform: "instagram", username: "kasktasarimtr" }
  ],
  postType: "post",
  mediaUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" // Pikachu!
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
