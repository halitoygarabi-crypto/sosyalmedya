const https = require('https');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';

const options = {
  hostname: 'api.limesocial.io',
  path: '/api/v1/accounts',
  headers: {
    'Authorization': API_KEY
  }
};

https.get(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      console.log('Accounts:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Raw:', body);
    }
  });
}).on('error', console.error);
