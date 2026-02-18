const https = require('https');
const fs = require('fs');

const url = 'https://meta.ai/media-share/cW4BYOkUh7c';

function scrape(targetUrl) {
  console.log('Fetching:', targetUrl);
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    }
  };

  https.get(targetUrl, options, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log('Redirecting to:', res.headers.location);
        return scrape(res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, targetUrl).href);
    }

    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      fs.writeFileSync('meta_ai_page.html', data);
      console.log('HTML saved to meta_ai_page.html. Length:', data.length);
      
      const mp4Matches = data.match(/https?:\/\/[^"']+\.mp4[^"']*/g);
      if (mp4Matches) console.log('Found MP4 links counts:', mp4Matches.length);

      const cdnMatches = data.match(/https?:\/\/video[^"']+\.(fbcdn|instagram|fna\.fbcdn)[^"']*/g);
      if (cdnMatches) console.log('Found CDN links counts:', cdnMatches.length);
    });
  }).on('error', (err) => {
    console.error('Error:', err.message);
  });
}

scrape(url);
