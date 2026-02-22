import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './supabaseClient';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Müşteri (Client) İşlemleri ---
app.get('/api/clients', async (req, res) => {
    const { data, error } = await supabase
        .from('clients_profiles')
        .select('*')
        .order('company_name', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/clients', async (req, res) => {
    const { data, error } = await supabase
        .from('clients_profiles')
        .insert([req.body])
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.put('/api/clients/:id', async (req, res) => {
    const { error } = await supabase
        .from('clients_profiles')
        .update(req.body)
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});


// --- Post (Gönderi) İşlemleri ---
app.get('/api/posts', async (req, res) => {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// --- Polmark & Sheets Entegrasyon Proxy ---
// Bu route'lar frontend'in yeni env değişkenleri üzerinden backend'i bir köprü (proxy) gibi kullanmasını sağlar.
app.all('/api/polmark*', async (req, res) => {
    // Polmark API'si (n8n veya başka bir servis) için yönlendirme mantığı buraya gelir.
    // Şimdilik sadece isteği aldığımızı onaylıyoruz.
    res.json({ status: 'Polmark proxy active', path: req.path });
});

app.all('/api/sheets*', async (req, res) => {
    // Google Sheets Apps Script proxy mantığı.
    res.json({ status: 'Sheets proxy active', path: req.path });
});

app.post('/api/posts', async (req, res) => {
    const { data, error } = await supabase
        .from('posts')
        .insert([req.body]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

app.put('/api/posts/:id', async (req, res) => {
    const { error } = await supabase
        .from('posts')
        .update(req.body)
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

app.delete('/api/posts/:id', async (req, res) => {
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

// --- İstatistikler ---
app.get('/api/stats', async (req, res) => {
    const { data, error } = await supabase
        .from('platform_stats')
        .select('*');

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// --- Bildirimler ---
app.get('/api/notifications', async (req, res) => {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/notifications', async (req, res) => {
    const { error } = await supabase
        .from('notifications')
        .insert([req.body]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

app.patch('/api/notifications/:id', async (req, res) => {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

// Sağlık kontrolü
// --- Kullanıcı Profil (Customer Profile) İşlemleri ---
app.get('/api/profiles/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.put('/api/profiles/:id', async (req, res) => {
    const { error } = await supabase
        .from('customer_profiles')
        .update(req.body)
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

// --- Influencer İşlemleri ---
app.get('/api/influencers', async (req, res) => {
    const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/influencers', async (req, res) => {
    const { data, error } = await supabase
        .from('influencers')
        .insert([req.body])
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.delete('/api/influencers/:id', async (req, res) => {
    const { error } = await supabase
        .from('influencers')
        .delete()
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

// --- Influencer Atama İşlemleri ---
app.get('/api/client-influencers/:clientId', async (req, res) => {
    const { data, error } = await supabase
        .from('client_influencers')
        .select(`
            influencer_id,
            influencers (*)
        `)
        .eq('client_id', req.params.clientId);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/client-influencers', async (req, res) => {
    const { error } = await supabase
        .from('client_influencers')
        .insert([req.body]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

app.delete('/api/client-influencers/:clientId/:influencerId', async (req, res) => {
    const { error } = await supabase
        .from('client_influencers')
        .delete()
        .eq('client_id', req.params.clientId)
        .eq('influencer_id', req.params.influencerId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

app.get('/api/assignments', async (req, res) => {
    const { data, error } = await supabase
        .from('client_influencers')
        .select('*')
        .order('assigned_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend Hetzner sunucusunda çalışıyor: http://localhost:${PORT}`);
});
