const https = require('https');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';
const INSTAGRAM_POST_ID = '17962178277043457';

async function testMetrics(path) {
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
        `/v1/post/${INSTAGRAM_POST_ID}/metrics`,
        `/v1/metrics/instagram/${INSTAGRAM_POST_ID}`,
        `/v1/analytics/instagram/${INSTAGRAM_POST_ID}`,
        `/v1/engagement/instagram/${INSTAGRAM_POST_ID}`,
        `/v1/post-metrics?platform=instagram&post_id=${INSTAGRAM_POST_ID}`
    ];

    for (const ep of endpoints) {
        console.log(`Testing ${ep}...`);
        const res = await testMetrics(ep);
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            console.log(`Data: ${res.data}`);
        }
    }
}

run();
