const https = require('https');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';
const API_URL = 'api.limesocial.io';

async function request(path) {
    return new Promise((resolve) => {
        const options = {
            hostname: API_URL,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: data }));
        });

        req.on('error', (e) => resolve({ error: e.message }));
        req.end();
    });
}

async function run() {
    console.log('Testing /v1/accounts...');
    const accs = await request('/v1/accounts');
    console.log('Accounts Status:', accs.status);
    console.log('Accounts Data:', accs.data);

    console.log('Testing /v1/me...');
    const me = await request('/v1/me');
    console.log('Me Status:', me.status);
    console.log('Me Data:', me.data);
}

run();
