const https = require('https');

const url = 'https://meta.ai/media-share/cW4BYOkUh7c';

function scrape() {
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
    }
  };

  https.get(url, options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('HTML Length:', data.length);
      
      // Look for video links in the whole HTML
      const mp4Matches = data.match(/https?:\/\/[^"']+\.mp4[^"']*/g);
      if (mp4Matches) {
        console.log('Found MP4 links:', JSON.stringify(mp4Matches, null, 2));
      } else {
        console.log('No direct MP4 links found.');
      }

      // Look for FB/IG CDN links
      const cdnMatches = data.match(/https?:\/\/video[^"']+\.(fbcdn|instagram)[^"']*/g);
      if (cdnMatches) {
          console.log('Found CDN links:', JSON.stringify(cdnMatches, null, 2));
      }

      // Look for content patterns
      const ogVideo = data.match(/property="og:video" content="([^"]+)"/);
      if (ogVideo) {
          console.log('OG Video:', ogVideo[1]);
      }

      // Look for JSON script tags content
      console.log('Searching for video descriptors...');
      const descriptors = data.match(/"(video_url|playable_url|browser_native_sd_url|browser_native_hd_url)":"([^"]+)"/g);
      if (descriptors) {
          console.log('Found descriptors:', JSON.stringify(descriptors, null, 2));
      }
      
      // Print first 500 chars to see if it's a redirect or block
      console.log('HTML Start:', data.substring(0, 500));
    });
  }).on('error', (err) => {
    console.error('Error:', err.message);
  });
}

scrape();
