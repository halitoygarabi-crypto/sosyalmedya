const https = require('https');
const crypto = require('crypto');

const SUPABASE_URL = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODQ3OTksImV4cCI6MjA4Mzg2MDc5OX0.7FVQTVVQ8sSd5wv3Z7l3Zh3tXudJaTq7Ax3Gzk3W7S4';

const client_id = crypto.randomUUID();

const profileData = JSON.stringify({
  id: client_id,
  company_name: 'Kask Tasarım',
  industry: 'Giyim & Aksesuar',
  ai_prompt_prefix: 'Modern, güvenli ve şık bir dil kullan.'
});

const postData = (cid) => JSON.stringify({
  id: crypto.randomUUID(),
  customer_id: cid,
  title: 'Kask Tasarım - Yeni Sezon Tanıtım',
  content: 'Özel tasarım kasklarımızla yolların en tarz sürücüsü siz olun! 🏍️\n\n#kasktasarım #motosiklet #customhelmet #safetyfirst',
  image_urls: ['https://fmcpztikisyauhbzbbvd.supabase.co/storage/v1/object/public/posts/kask_tanitim.jpg'],
  platforms: ['instagram'],
  status: 'scheduled',
  scheduled_time: new Date(Date.now() + 3600000).toISOString(),
  created_by: 'admin',
  created_at: new Date().toISOString(),
  likes: 0,
  comments: 0,
  shares: 0,
  reach: 0,
  impressions: 0
});

function postRequest(path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'fmcpztikisyauhbzbbvd.supabase.co',
      path: path,
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(body));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  try {
    console.log('Creating profile...');
    const profileRes = await postRequest('/rest/v1/customer_profiles', profileData);
    console.log('Profile created:', profileRes);

    console.log('Creating post...');
    const postRes = await postRequest('/rest/v1/posts', postData(client_id));
    console.log('Post created:', postRes);
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
