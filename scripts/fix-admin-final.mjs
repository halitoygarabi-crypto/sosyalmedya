
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI4NDc5OSwiZXhwIjoyMDgzODYwNzk5fQ.VPxX7u_4TCYOjpHyhYX9lVIr485WGof9p1DAguJSjQA';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixAdminProfile() {
    const correctId = 'e12a26c1-08d0-4a20-b2d0-c95fd8838ce1';
    const email = 'admin2@test.com';

    console.log(`Fixing profile for ${email} with ID ${correctId}`);

    // Check if auth user exists with this ID
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(correctId);
    if (authError || !user) {
        console.error('Error: Auth user not found for ID:', correctId, authError?.message);
        // List all users to see what IDs are there
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const found = users.find(u => u.email === email);
        if (found) {
            console.log(`Actual ID for ${email} is ${found.id}`);
            return fixProfileWithId(found.id, email);
        }
    } else {
        return fixProfileWithId(correctId, email);
    }
}

async function fixProfileWithId(userId, email) {
    console.log(`Ensuring profile exists for ID: ${userId} (${email})`);
    
    // Check if profile exists
    const { data: profile } = await supabase.from('customer_profiles').select('*').eq('id', userId);
    
    if (profile && profile.length > 0) {
        console.log('Profile exists, updating to admin...');
        const { error } = await supabase.from('customer_profiles').update({
            is_admin: true,
            role: 'admin',
            email: email
        }).eq('id', userId);
        if (error) console.error('Update error:', error);
        else console.log('✅ Updated profile successfully.');
    } else {
        console.log('Profile missing, creating...');
        const { error } = await supabase.from('customer_profiles').insert({
            id: userId,
            company_name: 'Polmark Admin',
            is_admin: true,
            role: 'admin',
            email: email,
            ai_prompt_prefix: 'Profesyonel bir dil kullan.'
        });
        if (error) console.error('Insert error:', error);
        else console.log('✅ Created profile successfully.');
    }
}

fixAdminProfile();
