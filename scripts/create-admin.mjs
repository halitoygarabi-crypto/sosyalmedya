// Create a fresh admin user
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODQ3OTksImV4cCI6MjA4Mzg2MDc5OX0.7FVQTVVQ8sSd5wv3Z7l3Zh3tXudJaTq7Ax3Gzk3W7S4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const email = 'admin2@test.com';
    const password = 'admin123';

    console.log('Creating new admin user:', email);

    // Sign up new user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
    });

    if (authError) {
        console.error('Auth error:', authError.message);
        return;
    }

    if (!authData.user) {
        console.log('User already exists or confirmation needed');
        return;
    }

    console.log('User created:', authData.user.id);

    // Create profile with admin rights
    const { error: profileError } = await supabase
        .from('customer_profiles')
        .insert({
            id: authData.user.id,
            company_name: 'Admin Company',
            industry: 'Teknoloji',
            is_admin: true,
            ai_prompt_prefix: 'Profesyonel içerik oluştur.'
        });

    if (profileError) {
        console.error('Profile error:', profileError.message);
    } else {
        console.log('✅ Admin user created successfully!');
        console.log('\nLogin credentials:');
        console.log('   Email:', email);
        console.log('   Password:', password);
    }

    await supabase.auth.signOut();
}

createAdmin();
