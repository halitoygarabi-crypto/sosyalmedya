const https = require('https');
const fs = require('fs');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';

const headersToTest = [
  { 'Authorization': API_KEY },
  { 'Authorization': `Bearer ${API_KEY}` },
  { 'x-api-key': API_KEY }
];

async function runTests() {
  let log = '';
  for (const headers of headersToTest) {
    log += `Testing /v1/me with headers: ${JSON.stringify(headers)}\n`;
    try {
      const result = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.limesocial.io',
          path: '/v1/me',
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
      log += `Result: Status ${result.status}, Body: ${result.body}\n\n`;
    } catch (e) {
      log += `Error: ${e.message}\n\n`;
    }
  }
  fs.writeFileSync('limesocial_test_results.txt', log);
}

runTests();
