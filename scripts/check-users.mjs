
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODQ3OTksImV4cCI6MjA4Mzg2MDc5OX0.7FVQTVVQ8sSd5wv3Z7l3Zh3tXudJaTq7Ax3Gzk3W7S4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
    console.log('--- Auth Users ---');
    // Auth users can't be listed with anon key, but we can try to sign in
    const emails = ['admin2@test.com', 'admin@test.com'];
    for (const email of emails) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: '123456'
        });
        if (error) {
            console.log(`${email}: Sign in failed - ${error.message}`);
        } else {
            console.log(`${email}: Sign in success! ID: ${data.user.id}`);
            
            // Check Profile
            const { data: profile, error: profileError } = await supabase
                .from('customer_profiles')
                .select('*')
                .eq('id', data.user.id);
            
            console.log(`Profile for ${email}:`, profile ? profile[0] : 'NOT FOUND');
            
            if (profile && profile.length === 0) {
                console.log(`⚠️ Profile missing for ${email}, creating...`);
                await supabase.from('customer_profiles').insert({
                    id: data.user.id,
                    company_name: 'Admin Company',
                    is_admin: true,
                    role: 'admin'
                });
                console.log('✅ Profile created and set as admin.');
            } else if (profile && !profile[0].is_admin) {
                console.log(`⚠️ User is not admin, updating...`);
                await supabase.from('customer_profiles').update({ is_admin: true, role: 'admin' }).eq('id', data.user.id);
                console.log('✅ Admin flag updated.');
            }
        }
    }
}

checkUsers();
