const https = require('https');

const SUPABASE_URL = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODQ3OTksImV4cCI6MjA4Mzg2MDc5OX0.7FVQTVVQ8sSd5wv3Z7l3Zh3tXudJaTq7Ax3Gzk3W7S4';

const options = {
  hostname: 'fmcpztikisyauhbzbbvd.supabase.co',
  path: '/rest/v1/?select=*&limit=1', // This is wrong for columns, I'll use a better way
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  }
};

// I'll try to get the first row and print its keys
const options2 = {
  hostname: 'fmcpztikisyauhbzbbvd.supabase.co',
  path: '/rest/v1/posts?limit=1',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Accept': 'application/json'
  }
};

https.get(options2, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.length > 0) {
        console.log('Columns:', Object.keys(json[0]).join(', '));
      } else {
        console.log('No posts found.');
      }
    } catch (e) {
      console.log('Raw output:', data);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
