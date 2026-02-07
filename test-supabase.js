
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase.from('customer_profiles').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('Supabase connection error:', error.message);
        } else {
            console.log('Supabase connection successful! Row count fetched:', data);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
