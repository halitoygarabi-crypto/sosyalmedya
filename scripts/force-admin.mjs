// Script to verify and force admin status
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODQ3OTksImV4cCI6MjA4Mzg2MDc5OX0.7FVQTVVQ8sSd5wv3Z7l3Zh3tXudJaTq7Ax3Gzk3W7S4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceAdmin() {
    // Sign in to get user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin2@test.com',
        password: '123456'
    });


    if (signInError) {
        console.error('Sign in error:', signInError.message);
        return;
    }

    const userId = signInData.user.id;
    console.log('User ID:', userId);

    // Check current profile
    const { data: profile, error: fetchError } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', userId)
        .single();

    console.log('\nCurrent profile:', profile);
    console.log('is_admin value:', profile?.is_admin);

    if (profile && !profile.is_admin) {
        console.log('\n⚠️ is_admin is FALSE, updating to TRUE...');

        const { error: updateError } = await supabase
            .from('customer_profiles')
            .update({ is_admin: true })
            .eq('id', userId);

        if (updateError) {
            console.error('Update error:', updateError.message);
        } else {
            console.log('✅ Admin flag updated!');

            // Verify
            const { data: updated } = await supabase
                .from('customer_profiles')
                .select('is_admin')
                .eq('id', userId)
                .single();

            console.log('Verified is_admin:', updated?.is_admin);
        }
    } else if (profile?.is_admin) {
        console.log('\n✅ User is already admin!');
    }

    await supabase.auth.signOut();
    console.log('\n🔄 Please refresh the page and login again!');
}

forceAdmin();
