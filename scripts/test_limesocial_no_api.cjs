const https = require('https');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';

const endpoints = [
  '/v1/me',
  '/v1/account',
  '/v1/accounts'
];

async function runTests() {
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint}`);
    try {
      const result = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.limesocial.io',
          path: endpoint,
          headers: { 'Authorization': API_KEY },
          method: 'GET'
        };
        const req = https.get(options, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', reject);
      });
      console.log(`Result: Status ${result.status}, Body: ${result.body}`);
    } catch (e) {
      console.error(`Error:`, e.message);
    }
  }
}

runTests();
