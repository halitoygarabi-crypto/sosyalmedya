const https = require('https');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';

function test(host, path) {
  console.log(`Testing ${host}${path}...`);
  const options = {
    hostname: host,
    path: path,
    headers: { 'Authorization': API_KEY }
  };
  https.get(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log(`${host}${path} Result:`, body.substring(0, 200)));
  }).on('error', console.error);
}

test('limesocial.io', '/api/v1/me');
test('limesocial.io', '/api/me');
test('limesocial.io', '/v1/me');
