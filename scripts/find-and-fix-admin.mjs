
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI4NDc5OSwiZXhwIjoyMDgzODYwNzk5fQ.VPxX7u_4TCYOjpHyhYX9lVIr485WGof9p1DAguJSjQA';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function findAndFix() {
    const email = 'admin2@test.com';
    console.log(`Searching for auth user: ${email}`);
    
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
        console.error('Auth search error:', error);
        return;
    }
    
    const user = users.find(u => u.email === email);
    if (!user) {
        console.log(`User ${email} NOT FOUND in Auth.`);
        return;
    }
    
    console.log(`Found user in Auth! ID: ${user.id}`);
    
    // Check profile
    const { data: profile } = await supabase.from('customer_profiles').select('*').eq('id', user.id).single();
    
    if (!profile) {
        console.log('Profile missing, creating as admin...');
        const { error: insErr } = await supabase.from('customer_profiles').insert({
            id: user.id,
            company_name: 'Polmark Admin',
            is_admin: true,
            role: 'admin',
            email: email, // If table has email column
            ai_prompt_prefix: 'Profesyonel bir dil kullan.'
        });
        if (insErr) console.error('Insert error:', insErr);
        else console.log('✅ Created profile successfully.');
    } else {
        console.log('Updating existing profile to admin...');
        const { error: updErr } = await supabase.from('customer_profiles').update({
            is_admin: true,
            role: 'admin'
        }).eq('id', user.id);
        if (updErr) console.error('Update error:', updErr);
        else console.log('✅ Updated profile successfully.');
    }
}

findAndFix();
