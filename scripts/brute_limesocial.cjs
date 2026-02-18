const https = require('https');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';

const endpoints = [
  '/api/v1/me',
  '/api/v1/account',
  '/api/v1/accounts',
  '/api/v1/post'
];

const headersToTest = [
  { 'Authorization': API_KEY },
  { 'Authorization': `Bearer ${API_KEY}` },
  { 'x-api-key': API_KEY }
];

async function runTests() {
  for (const endpoint of endpoints) {
    for (const headers of headersToTest) {
      console.log(`Testing ${endpoint} with headers:`, JSON.stringify(headers));
      try {
        const result = await new Promise((resolve, reject) => {
          const options = {
            hostname: 'api.limesocial.io',
            path: endpoint,
            headers: headers,
            method: 'GET'
          };
          const req = https.get(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body }));
          });
          req.on('error', reject);
        });
        console.log(`Result: Status ${result.status}, Body: ${result.body.substring(0, 100)}`);
      } catch (e) {
        console.error(`Error:`, e.message);
      }
    }
  }
}

runTests();
