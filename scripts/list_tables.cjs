const https = require('https');
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODQ3OTksImV4cCI6MjA4Mzg2MDc5OX0.7FVQTVVQ8sSd5wv3Z7l3Zh3tXudJaTq7Ax3Gzk3W7S4';

const options = {
    hostname: 'fmcpztikisyauhbzbbvd.supabase.co',
    path: '/rest/v1/', // Root path shows available tables/views if exposed
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
};

https.get(options, (res) => {
    let data = '';
    res.on('data', (d) => data += d);
    res.on('end', () => {
        try {
            const schema = JSON.parse(data);
            console.log('Available Tables:', Object.keys(schema.definitions || {}));
        } catch(e) { console.log('Raw output:', data.substring(0, 500)); }
    });
});
