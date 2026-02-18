import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findClient() {
    const { data, error } = await supabase
        .from('customer_profiles')
        .select('id, company_name')
        .ilike('company_name', '%kask%');
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Found clients:', JSON.stringify(data));
}

findClient();
