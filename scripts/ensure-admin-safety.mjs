
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI4NDc5OSwiZXhwIjoyMDgzODYwNzk5fQ.VPxX7u_4TCYOjpHyhYX9lVIr485WGof9p1DAguJSjQA';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createSafetyProfile() {
    const ids = [
        'e12a26c1-08d0-4a20-b2d0-c95fd8838ce1', // The one with 8
        'e12a26c1-08d0-4a20-b2d0-c95fd0838ce1'  // The one with 0
    ];

    for (const userId of ids) {
        console.log(`Checking/Creating profile for ID: ${userId}`);
        const { data: existing } = await supabase.from('customer_profiles').select('*').eq('id', userId);
        
        if (existing && existing.length > 0) {
            console.log(`Profile ${userId} exists, ensuring admin status.`);
            await supabase.from('customer_profiles').update({ is_admin: true, role: 'admin' }).eq('id', userId);
        } else {
            console.log(`Profile ${userId} missing, creating safety admin profile.`);
            // This might fail if the ID doesn't exist in Auth (due to FK constraint if exists)
            const { error } = await supabase.from('customer_profiles').insert({
                id: userId,
                company_name: 'Admin Safety Profile',
                is_admin: true,
                role: 'admin',
                ai_prompt_prefix: 'Profesyonel dil.'
            });
            if (error) console.log(`Could not create ${userId}: ${error.message} (expected if not in Auth)`);
            else console.log(`✅ Created ${userId} successfully.`);
        }
    }
}

createSafetyProfile();
