
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI4NDc5OSwiZXhwIjoyMDgzODYwNzk5fQ.VPxX7u_4TCYOjpHyhYX9lVIr485WGof9p1DAguJSjQA';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function cleanup() {
    const userId = 'e12a26c1-08d0-4a20-b2d0-c95fd8838ce1';
    console.log(`Cleaning up profiles for: ${userId}`);
    
    const { data: profiles } = await supabase.from('customer_profiles').select('*').eq('id', userId);
    console.log(`Found ${profiles?.length || 0} profiles.`);
    
    if (profiles && profiles.length > 1) {
        console.log('Deleting all and recreating one...');
        await supabase.from('customer_profiles').delete().eq('id', userId);
        
        await supabase.from('customer_profiles').insert({
            id: userId,
            company_name: 'Polmark Admin',
            is_admin: true,
            role: 'admin',
            ai_prompt_prefix: 'Profesyonel ve kurumsal bir dil kullan.'
        });
        console.log('✅ Cleaned up and recreated single admin profile.');
    } else if (profiles && profiles.length === 1) {
        console.log('Only one profile exists. Ensuring is_admin=true...');
        await supabase.from('customer_profiles').update({ is_admin: true, role: 'admin' }).eq('id', userId);
        console.log('✅ Admin flag updated.');
    } else {
        console.log('No profile exists. Creating one...');
        await supabase.from('customer_profiles').insert({
            id: userId,
            company_name: 'Polmark Admin',
            is_admin: true,
            role: 'admin',
            ai_prompt_prefix: 'Profesyonel ve kurumsal bir dil kullan.'
        });
        console.log('✅ Created admin profile.');
    }
}

cleanup();
