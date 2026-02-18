const https = require('https');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';

const options = {
  hostname: 'api.limesocial.io',
  path: '/api/v1/me',
  headers: {
    'Authorization': API_KEY
  }
};

https.get(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Me:', body));
}).on('error', console.error);
