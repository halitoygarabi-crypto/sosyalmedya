// Test Supabase connection and profile fetch
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODQ3OTksImV4cCI6MjA4Mzg2MDc5OX0.7FVQTVVQ8sSd5wv3Z7l3Zh3tXudJaTq7Ax3Gzk3W7S4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection...\n');

    // Test 1: Check if we can connect
    const { data: healthCheck, error: healthError } = await supabase.from('customer_profiles').select('count');

    if (healthError) {
        console.error('❌ Connection error:', healthError.message);
    } else {
        console.log('✅ Connection OK');
    }

    // Test 2: Sign in and fetch profile
    console.log('\nSigning in as admin@test.com...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@test.com',
        password: '123456'
    });

    if (authError) {
        console.error('❌ Auth error:', authError.message);
        return;
    }

    console.log('✅ Auth OK, User ID:', authData.user.id);

    // Test 3: Fetch profile
    console.log('\nFetching profile...');
    const { data: profile, error: profileError } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    if (profileError) {
        console.error('❌ Profile fetch error:', profileError.message);
        console.error('   Error code:', profileError.code);
        console.error('   Details:', profileError.details);
    } else {
        console.log('✅ Profile OK:');
        console.log('   Company:', profile.company_name);
        console.log('   is_admin:', profile.is_admin);
    }

    await supabase.auth.signOut();
}

testConnection();
