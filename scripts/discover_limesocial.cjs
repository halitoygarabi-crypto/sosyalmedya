const https = require('https');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';

async function testEndpoint(path) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'api.limesocial.io',
            path: path,
            method: 'GET',
            headers: {
                'Authorization': API_KEY
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ path, status: res.statusCode, data: data }));
        });

        req.on('error', (e) => resolve({ path, error: e.message }));
        req.end();
    });
}

async function run() {
    const endpoints = [
        '/v1/posts',
        '/v1/analytics',
        '/v1/metrics',
        '/v1/history',
        '/v1/stats'
    ];

    for (const ep of endpoints) {
        console.log(`Testing ${ep}...`);
        const res = await testEndpoint(ep);
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            console.log(`Data: ${res.data.slice(0, 200)}...`);
        }
    }
}

run();
