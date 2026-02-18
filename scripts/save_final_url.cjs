const fs = require('fs');
const html = fs.readFileSync('meta_ai_v3.html', 'utf8');
const regex = /https?:\\\/\\\/[^\s"']+\.mp4[^\s"']*/g;
const matches = html.match(regex);
if (matches) {
    fs.writeFileSync('final_video_url.txt', matches[0].replace(/\\\//g, '/'));
}
