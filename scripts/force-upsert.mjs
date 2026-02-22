
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI4NDc5OSwiZXhwIjoyMDgzODYwNzk5fQ.VPxX7u_4TCYOjpHyhYX9lVIr485WGof9p1DAguJSjQA';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function forceUpsert() {
    const userId = 'e12a26c1-08d0-4a20-b2d0-c95fd8838ce1';
    console.log(`Force upserting profile for: ${userId}`);
    
    // Delete first to be sure
    await supabase.from('customer_profiles').delete().eq('id', userId);
    
    const { data, error } = await supabase.from('customer_profiles').insert({
        id: userId,
        company_name: 'Admin User 2',
        is_admin: true,
        role: 'admin',
        ai_prompt_prefix: 'Profesyonel dil.'
    }).select();
    
    if (error) {
        console.error('Upsert failed:', error);
    } else {
        console.log('✅ Force upsert success:', data);
    }
}

forceUpsert();
