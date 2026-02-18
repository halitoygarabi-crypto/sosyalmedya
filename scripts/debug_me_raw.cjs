const https = require('https');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';

function checkMe() {
  const options = {
    hostname: 'api.limesocial.io',
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
      console.log(data);
    });
  });

  req.on('error', console.error);
  req.end();
}

checkMe();
