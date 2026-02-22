
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmcpztikisyauhbzbbvd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3B6dGlraXN5YXVoYnpiYnZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI4NDc5OSwiZXhwIjoyMDgzODYwNzk5fQ.VPxX7u_4TCYOjpHyhYX9lVIr485WGof9p1DAguJSjQA';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function ensureAdmin() {
    const email = 'admin2@test.com';
    const password = '123456';
    
    console.log(`Checking for user: ${email}`);
    
    // We can't search by email directly in auth easily without auth.admin.listUsers
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
        console.error('Error listing users:', listError.message);
        return;
    }
    
    let user = users.find(u => u.email === email);
    let userId;
    
    if (!user) {
        console.log(`User ${email} not found, creating...`);
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });
        
        if (createError) {
            console.error('Error creating user:', createError.message);
            return;
        }
        
        userId = newUser.user.id;
        console.log(`User created with ID: ${userId}`);
    } else {
        userId = user.id;
        console.log(`User found with ID: ${userId}. Resetting password to 123456...`);
        await supabase.auth.admin.updateUserById(userId, { password });
    }
    
    // Ensure profile exists and is admin
    const { data: profile } = await supabase.from('customer_profiles').select('*').eq('id', userId).single();
    
    if (!profile) {
        console.log('Profile missing, creating...');
        await supabase.from('customer_profiles').insert({
            id: userId,
            company_name: 'Polmark Admin',
            is_admin: true,
            role: 'admin',
            ai_prompt_prefix: 'Profesyonel ve kurumsal bir dil kullan.'
        });
    } else {
        console.log('Updating profile to admin...');
        await supabase.from('customer_profiles').update({
            is_admin: true,
            role: 'admin'
        }).eq('id', userId);
    }
    
    console.log('✅ Admin user ensure complete!');
}

ensureAdmin();
