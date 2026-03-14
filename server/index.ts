import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from './supabaseClient';
import { PostizClient } from './postiz-client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://socialhub.polmarkai.pro',
        'https://api.socialhub.polmarkai.pro'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
}));
app.use(express.json());

// Log middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});


// --- Postiz API Proxy ---
const postizClient = new PostizClient({
    baseUrl: process.env.POSTIZ_API_URL || 'https://api.postiz.com',
    apiKey: process.env.POSTIZ_API_KEY || ''
});

app.all('/api/postiz', async (req, res) => {
    const { action, startDate, endDate, postId } = req.query;

    try {
        if (!process.env.POSTIZ_API_KEY) {
            return res.status(400).json({ error: 'POSTIZ_API_KEY is not configured' });
        }

        switch (action) {
            case 'integrations': {
                const integrations = await postizClient.getIntegrations();
                return res.json({ data: integrations });
            }
                
            case 'posts': {
                const posts = await postizClient.getPosts(startDate as string, endDate as string);
                return res.json({ data: posts });
            }

            case 'bulk-post': {
                // For bulk post we need integrations to get identifiers
                const allIntegrations = await postizClient.getIntegrations();
                const result = await postizClient.createBulkPost(
                    req.body.content,
                    req.body.integrationIds,
                    allIntegrations,
                    req.body
                );
                return res.json({ data: result });
            }

            case 'delete-post': {
                await postizClient.deletePost(postId as string);
                return res.json({ data: { success: true } });
            }

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (err: unknown) {
        console.error('Postiz Proxy Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: errorMessage });
    }
});

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

// --- Kullanıcı Profil (Customer Profile) İşlemleri ---
app.get('/api/profiles/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('customer_profiles')
            .select('*')
            .eq('id', req.params.id);

        if (error) {
            console.error('Supabase error fetching profile:', error);
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            console.log(`No profile found for ID: ${req.params.id}`);
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(data[0]);
    } catch (err) {
        console.error('Crash in /api/profiles/:id:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/profiles/:id', async (req, res) => {
    const { error } = await supabase
        .from('customer_profiles')
        .update(req.body)
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

// --- Polmark & Sheets Entegrasyon Proxy ---
app.use('/api/polmark', async (req, res) => {
    res.json({ status: 'Polmark proxy active', path: req.path });
});

app.use('/api/sheets', async (req, res) => {
    res.json({ status: 'Sheets proxy active', path: req.path });
});

app.post('/api/posts', async (req, res) => {
    const { error } = await supabase
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

// --- Debug ---
app.get('/api/debug-profiles', async (req, res) => {
    const { data, error } = await supabase.from('customer_profiles').select('id, company_name, is_admin, role');
    res.json({ data, error });
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

// --- AI Asistan ---
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ASSISTANT_SYSTEM_PROMPT = `Sen N99 SocialHub Dashboard'un yapay zeka asistanısın. Bu platform, sosyal medya ajansları için tasarlanmış kapsamlı bir yönetim panelidir.

## Platform Özellikleri

**Kullanıcı Rolleri:**
- Admin: Tüm sisteme tam erişim, müşteri/içerik üreticisi yönetimi, AI influencer yönetimi
- Content Creator: Atanmış müşteriler için içerik oluşturma, zamanlama, AI araçları
- Client: Kendi sosyal medya performansını izleme, analytics raporları

**Ana Bölümler:**
- Dashboard: KPI kartları, etkileşim grafikleri, platform istatistikleri, son paylaşımlar
- Analytics: Detaylı raporlar, takipçi büyümesi, Metricool entegrasyonu
- İçerik Yönetimi: İçerik oluşturma, platform/durum filtreleme (Instagram, Twitter/X, LinkedIn, TikTok), içerik arşivi
- Yayın Takvimi: İçerik planlama ve zamanlama
- Video Üretici: Kling AI ile AI destekli video oluşturma
- Postiz Komuta Merkezi: Çoklu platforma toplu paylaşım
- AI Influencer Üretici: Sanal AI influencer karakterleri oluşturma, kampanya yönetimi
- Kitle Analizi: Takipçi büyüme, duygu analizi
- Performans: Platform karşılaştırma, en iyi içerikler
- Otomasyon Merkezi: Hashtag performansı, otomasyon kontrolleri
- Entegrasyonlar/Ayarlar: API anahtarları yönetimi (Postiz, Metricool, Replicate, FAL AI)
- Admin Paneli: Müşteri/içerik üreticisi yönetimi, atamalar

**Teknik:** React + TypeScript, Supabase veritabanı, Express.js backend, Postiz sosyal medya entegrasyonu.

## Görevin
Kullanıcılara platformu kullanırken yardımcı olmak. Türkçe yanıt ver. Kısa, net ve pratik ol. Gerektiğinde adım adım rehberlik et.

## İçerik Oluşturma
Kullanıcı sosyal medya içeriği, caption, post veya paylaşım yazmanı/oluşturmanı istediğinde, önce kısa bir açıklama yaz, ardından içeriği MUTLAKA şu formatta ekle (başka format kullanma):

[CONTENT_ACTION]
{"caption":"İçerik metni buraya (emoji kullanabilirsin)","hashtags":["#hashtag1","#hashtag2","#hashtag3"],"platform":"instagram"}
[/CONTENT_ACTION]

Kurallar:
- caption: Tam paylaşım metni, emojili ve etkileyici
- hashtags: 5-10 hashtag, array formatında
- platform: kullanıcının belirttiği platform; belirtmediyse "all"
- JSON geçerli ve tek satır olmalı
- Bu bloğu her içerik üretim isteğinde kullan`;

app.post('/api/assistant/chat', async (req, res) => {
    const { messages, context } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ error: 'ANTHROPIC_API_KEY yapılandırılmamış.' });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Mesaj listesi gerekli.' });
    }

    const systemPrompt = context
        ? `${ASSISTANT_SYSTEM_PROMPT}\n\n**Kullanıcı Bağlamı:** Rol: ${context.role || 'bilinmiyor'}, Şirket: ${context.company || 'bilinmiyor'}, Aktif Bölüm: ${context.section || 'dashboard'}`
        : ASSISTANT_SYSTEM_PROMPT;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const stream = anthropic.messages.stream({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: systemPrompt,
            messages,
        });

        stream.on('text', (text) => {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
        });

        stream.on('finalMessage', () => {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
        });

        stream.on('error', (err) => {
            console.error('Asistan stream hatası:', err);
            res.write(`data: ${JSON.stringify({ error: 'Yanıt alınamadı.' })}\n\n`);
            res.end();
        });
    } catch (err) {
        console.error('Asistan endpoint hatası:', err);
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
        res.status(500).json({ error: msg });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend Hetzner sunucusunda çalışıyor: http://localhost:${PORT}`);
});
