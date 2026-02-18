const https = require('https');

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
        return scrape(res.headers.location);
    }

    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('HTML Length:', data.length);
      
      const mp4Matches = data.match(/https?:\/\/[^"']+\.mp4[^"']*/g);
      if (mp4Matches) console.log('Found MP4 links:', JSON.stringify(mp4Matches, null, 2));

      const cdnMatches = data.match(/https?:\/\/video[^"']+\.(fbcdn|instagram|fna\.fbcdn)[^"']*/g);
      if (cdnMatches) console.log('Found CDN links:', JSON.stringify(cdnMatches, null, 2));

      const descriptors = data.match(/"(video_url|playable_url|browser_native_sd_url|browser_native_hd_url)":"([^"]+)"/g);
      if (descriptors) console.log('Found descriptors:', JSON.stringify(descriptors, null, 2));
      
      console.log('HTML Start:', data.substring(0, 500));
    });
  }).on('error', (err) => {
    console.error('Error:', err.message);
  });
}

scrape(url);
