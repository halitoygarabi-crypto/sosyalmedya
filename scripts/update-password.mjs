// Update password for admin@test.com
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODQ3OTksImV4cCI6MjA4Mzg2MDc5OX0.7FVQTVVQ8sSd5wv3Z7l3Zh3tXudJaTq7Ax3Gzk3W7S4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePassword() {
    // First sign in with old password
    console.log('Signing in with old password...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@test.com',
        password: '123456'
    });

    if (signInError) {
        console.error('Sign in error:', signInError.message);
        return;
    }

    console.log('Signed in, updating password...');

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
        password: '1234567'
    });

    if (updateError) {
        console.error('Update error:', updateError.message);
    } else {
        console.log('✅ Password updated successfully!');
        console.log('\nNew credentials:');
        console.log('   Email: admin@test.com');
        console.log('   Password: 1234567');
    }

    await supabase.auth.signOut();
}

updatePassword();
