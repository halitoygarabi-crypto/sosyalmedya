const https = require('https');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';

function test(path) {
  console.log(`Testing ${path}...`);
  const options = {
    hostname: 'api.limesocial.io',
    path: path,
    headers: { 'Authorization': API_KEY }
  };
  https.get(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log(`${path} Result:`, body.substring(0, 200)));
  }).on('error', console.error);
}

test('/v1/me');
test('/api/me');
test('/me');
