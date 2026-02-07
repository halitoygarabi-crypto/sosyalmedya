// Script to fix user profile and make admin
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODQ3OTksImV4cCI6MjA4Mzg2MDc5OX0.7FVQTVVQ8sSd5wv3Z7l3Zh3tXudJaTq7Ax3Gzk3W7S4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAndCreateAdmin() {
    console.log('Attempting to sign in with admin@test.com...\n');

    // Try to sign in to get the user ID
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@test.com',
        password: '123456'
    });

    if (signInError) {
        console.error('Sign in error:', signInError.message);
        console.log('\nThe user might not exist. Please try registering again.');
        return;
    }

    const userId = signInData.user.id;
    console.log('User found! ID:', userId);

    // Check if profile exists
    const { data: existingProfile } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (existingProfile) {
        console.log('Profile already exists:', existingProfile.company_name);

        // Make admin
        const { error: updateError } = await supabase
            .from('customer_profiles')
            .update({ is_admin: true })
            .eq('id', userId);

        if (updateError) {
            console.error('Update error:', updateError.message);
        } else {
            console.log('\n✅ User is now ADMIN!');
        }
    } else {
        console.log('Profile does not exist, creating...');

        // Create profile with admin rights
        const { error: insertError } = await supabase
            .from('customer_profiles')
            .insert({
                id: userId,
                company_name: 'Test Firma',
                industry: 'E-ticaret',
                is_admin: true,
                ai_prompt_prefix: 'Test firma için profesyonel içerik oluştur.'
            });

        if (insertError) {
            console.error('Insert error:', insertError.message);
        } else {
            console.log('\n✅ Profile created with ADMIN rights!');
        }
    }

    // Sign out
    await supabase.auth.signOut();
    console.log('\n🎉 Done! You can now login at http://localhost:5173/login');
    console.log('   Email: admin@test.com');
    console.log('   Password: 123456');
}

fixAndCreateAdmin();
