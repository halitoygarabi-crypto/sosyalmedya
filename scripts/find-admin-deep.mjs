
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI4NDc5OSwiZXhwIjoyMDgzODYwNzk5fQ.VPxX7u_4TCYOjpHyhYX9lVIr485WGof9p1DAguJSjQA';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function findAdmin() {
    const { data: profiles, error } = await supabase.from('customer_profiles').select('*');
    if (error) {
        console.error(error);
        return;
    }
    
    console.log(`Total profiles: ${profiles.length}`);
    profiles.forEach(p => console.log(`ID: "${p.id}" Email: "${p.email}" Admin: ${p.is_admin}`));
    
    // Check for ID e12a26c1-08d0-4a20-b2d0-c95fd8838ce1
    const byId = profiles.filter(p => p.id === 'e12a26c1-08d0-4a20-b2d0-c95fd8838ce1');
    console.log(`Profiles for ID e12a26c1-08d0-4a20-b2d0-c95fd8838ce1: ${byId.length}`);
    if (byId.length > 0) {
        console.log('First one is_admin:', byId[0].is_admin);
    }
}

findAdmin();
