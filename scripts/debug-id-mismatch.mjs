
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI4NDc5OSwiZXhwIjoyMDgzODYwNzk5fQ.VPxX7u_4TCYOjpHyhYX9lVIr485WGof9p1DAguJSjQA';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkAuthAndProfiles() {
    console.log('--- Auth Users ---');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error('Auth error:', authError);
        return;
    }

    users.forEach(u => console.log(`Auth User - Email: ${u.email}, ID: ${u.id}`));

    console.log('\n--- Profiles ---');
    const { data: profiles, error: profError } = await supabase.from('customer_profiles').select('id, email, is_admin, role');
    if (profError) {
        console.error('Profile error:', profError);
        return;
    }

    profiles.forEach(p => console.log(`Profile - ID: ${p.id}, Email: ${p.email}, Admin: ${p.is_admin}`));
}

checkAuthAndProfiles();
