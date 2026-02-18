const fs = require('fs');
const https = require('https');

const API_KEY = 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de';

function postToLimeSocial(videoUrl) {
    const payload = {
        title: "Meta AI Video",
        description: "Shared from Meta AI",
        mediaUrl: videoUrl,
        accounts: [
            { platform: "instagram", username: "halitoygarabi" }
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

const html = fs.readFileSync('meta_ai_v3.html', 'utf8');
const regex = /https?:\\\/\\\/[^\s"']+\.mp4[^\s"']*/;
const match = html.match(regex);

if (match) {
    const videoUrl = match[0].replace(/\\\//g, '/');
    console.log('Posting Video:', videoUrl);
    postToLimeSocial(videoUrl).then(res => {
        console.log('Status:', res.status);
        console.log('Response:', res.data);
    });
} else {
    console.log('No video URL found in HTML.');
}
