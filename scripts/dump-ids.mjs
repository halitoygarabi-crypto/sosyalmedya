
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI4NDc5OSwiZXhwIjoyMDgzODYwNzk5fQ.VPxX7u_4TCYOjpHyhYX9lVIr485WGof9p1DAguJSjQA';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function dumpFiltered() {
    const { data } = await supabase.from('customer_profiles').select('id, email, is_admin');
    console.log('--- DB Profiles ---');
    data.forEach(p => {
        console.log(`ID: [${p.id}] Email: [${p.email}] Admin: [${p.is_admin}]`);
    });
}

dumpFiltered();
