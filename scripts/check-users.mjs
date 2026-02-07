// Script to check existing users and make one admin
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODQ3OTksImV4cCI6MjA4Mzg2MDc5OX0.7FVQTVVQ8sSd5wv3Z7l3Zh3tXudJaTq7Ax3Gzk3W7S4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
    console.log('Fetching customer profiles...\n');

    const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log('No users found. Please register first at http://localhost:5173/register');
        return;
    }

    console.log('Found users:');
    console.log('='.repeat(60));
    data.forEach((user, i) => {
        console.log(`${i + 1}. ${user.company_name}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Industry: ${user.industry || 'N/A'}`);
        console.log(`   Admin: ${user.is_admin ? '✅ Yes' : '❌ No'}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleDateString('tr-TR')}`);
        console.log('-'.repeat(60));
    });
}

listUsers();
