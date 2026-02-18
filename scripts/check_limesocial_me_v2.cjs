const https = require('https');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';
const API_URL = 'api.limesocial.io';

function checkMe() {
  const options = {
    hostname: API_URL,
    path: '/v1/me',
    method: 'GET',
    headers: {
      'Authorization': API_KEY
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const parsed = JSON.parse(data);
      console.log('Credits:', parsed.data.creditsRemaining);
      if (parsed.data.accounts) {
          console.log('Accounts:', JSON.stringify(parsed.data.accounts, null, 2));
      } else {
          console.log('No accounts in me response.');
      }
    });
  });

  req.on('error', console.error);
  req.end();
}

checkMe();
