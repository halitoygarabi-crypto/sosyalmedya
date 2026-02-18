const fs = require('fs');
const https = require('https');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';
const VIDEO_URL = fs.readFileSync('final_video_url.txt', 'utf8').trim();

function postToLimeSocial() {
    const payload = {
        title: "Meta AI Viral Video",
        description: "Shared from Meta AI - Luna AI Influencer Content #AI #Influencer",
        mediaUrl: VIDEO_URL,
        accounts: [
            { platform: "instagram", username: "kasktasarimtr" }
        ],
        postType: "reels"
    };

    const options = {
        hostname: 'api.limesocial.io',
        path: '/v1/post',
        method: 'POST',
        headers: {
            'Authorization': API_KEY,
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: data }));
        });

        req.on('error', (e) => resolve({ error: e.message }));
        req.write(JSON.stringify(payload));
        req.end();
    });
}

console.log('Posting Video to kasktasarimtr...');
postToLimeSocial().then(res => {
    console.log('Status:', res.status);
    console.log('Response:', res.data);
});
