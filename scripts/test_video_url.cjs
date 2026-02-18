const https = require('https');
const fs = require('fs');

const html = fs.readFileSync('meta_ai_v3.html', 'utf8');
const regex = /https?:\\\/\\\/[^\s"']+\.mp4[^\s"']*/;
const match = html.match(regex);

if (match) {
    const videoUrl = match[0].replace(/\\\//g, '/');
    console.log('Testing Video URL:', videoUrl);
    
    https.get(videoUrl, (res) => {
        console.log('Status:', res.statusCode);
        console.log('Headers:', JSON.stringify(res.headers, null, 2));
    }).on('error', console.error);
} else {
    console.log('No video URL found');
}
