const https = require('https');
const fs = require('fs');

const url = 'https://www.meta.ai/media-share/cW4BYOkUh7c';

function scrape() {
  const options = {
    headers: {
      'authority': 'www.meta.ai',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'max-age=0',
      'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    }
  };

  https.get(url, options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      fs.writeFileSync('meta_ai_v3.html', data);
      
      const descriptors = data.match(/"(video_url|playable_url|browser_native_sd_url|browser_native_hd_url)":"([^"]+)"/g);
      if (descriptors) console.log('Found descriptors:', descriptors);
      
      const mp4s = data.match(/https?:\/\/[^"']+\.mp4[^"']*/g);
      if (mp4s) console.log('Found MP4s:', mp4s.slice(0, 5));
    });
  }).on('error', console.error);
}

scrape();
