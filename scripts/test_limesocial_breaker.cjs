const https = require('https');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';

function test(path, authHeader) {
  console.log(`Testing ${path} with ${authHeader}...`);
  const options = {
    hostname: 'api.limesocial.io',
    path: path,
    headers: { 'Authorization': authHeader }
  };
  https.get(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log(`${path} Result:`, body.substring(0, 300)));
  }).on('error', console.error);
}

test('/api/v1/accounts', `Bearer ${API_KEY}`);
test('/api/v1/accounts', API_KEY);
