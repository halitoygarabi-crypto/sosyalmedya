const https = require('https');

const SUPABASE_URL = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODQ3OTksImV4cCI6MjA4Mzg2MDc5OX0.7FVQTVVQ8sSd5wv3Z7l3Zh3tXudJaTq7Ax3Gzk3W7S4';

const clientData = JSON.stringify({
    company_name: 'Avyna',
    industry: 'Mobilya & İç Mimarlık',
    ai_prompt_prefix: 'Luxurious modern furniture, high-end interior, scandinavian minimal design',
    limesocial_api_key: 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de'
});

const options = {
    hostname: 'fmcpztikisyauhbzbbvd.supabase.co',
    path: '/rest/v1/clients_profiles',
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
    res.on('data', (d) => body += d);
    res.on('end', () => console.log('Avyna Created:', body));
});

req.on('error', (e) => console.error(e));
req.write(clientData);
req.end();
