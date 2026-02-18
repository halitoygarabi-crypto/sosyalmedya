const axios = require('axios');

const url = 'https://meta.ai/media-share/cW4BYOkUh7c';

async function scrape() {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      }
    });
    const html = response.data;
    console.log('HTML Length:', html.length);
    
    // Look for video links
    const mp4Matches = html.match(/https?:\/\/[^"']+\.mp4[^"']*/g);
    if (mp4Matches) {
      console.log('Found MP4 links:', mp4Matches);
    } else {
      console.log('No direct MP4 links found.');
    }

    // Look for "video_url" or "content_url" in JSON blobs
    const jsonMatches = html.match(/"(video_url|content_url|url)":"([^"]+)"/g);
    if (jsonMatches) {
        console.log('Found JSON-like URL matches:', jsonMatches);
    }

    // Search for meta tags
    const ogVideo = html.match(/property="og:video" content="([^"]+)"/);
    if (ogVideo) {
        console.log('OG Video:', ogVideo[1]);
    }

    // Print a snippet of the HTML to see the structure
    console.log('HTML Snippet:', html.substring(0, 1000));

  } catch (error) {
    console.error('Error scraping:', error.message);
  }
}

scrape();
