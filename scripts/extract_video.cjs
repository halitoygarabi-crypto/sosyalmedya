const fs = require('fs');
const html = fs.readFileSync('meta_ai_v3.html', 'utf8');

// Find all matches for https...mp4 or similar JSON escaped URLs
const regex = /https?:\\\/\\\/[^\s"']+\.mp4[^\s"']*/g;
const matches = html.match(regex);

if (matches) {
    const unescaped = matches.map(m => m.replace(/\\\//g, '/'));
    console.log('Found URLs:', JSON.stringify(unescaped, null, 2));
} else {
    // Try literal https
    const regex2 = /https?:\/\/[^\s"']+\.mp4[^\s"']*/g;
    const matches2 = html.match(regex2);
    if (matches2) {
        console.log('Found Literal URLs:', JSON.stringify(matches2, null, 2));
    } else {
        console.log('No MP4 links found.');
    }
}

// Search for video_url specifically
const videoUrlRegex = /"(video_url|playable_url|browser_native_sd_url|browser_native_hd_url)":"([^"]+)"/g;
let match;
console.log('--- Video Descriptors ---');
while ((match = videoUrlRegex.exec(html)) !== null) {
    console.log(`${match[1]}: ${match[2].replace(/\\\//g, '/')}`);
}
