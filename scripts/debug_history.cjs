const https = require('https');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';

function getHistory() {
  const options = {
    hostname: 'api.limesocial.io',
    path: '/v1/history',
    method: 'GET',
    headers: {
      'Authorization': API_KEY
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const p = JSON.parse(data);
      console.log(JSON.stringify(p.data.slice(0, 3), null, 2));
    });
  });

  req.on('error', console.error);
  req.end();
}

getHistory();
