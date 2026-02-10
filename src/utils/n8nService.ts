import type { Post, PlatformStats } from '../types';

const API_URL = import.meta.env.VITE_N8N_API_URL;
const API_KEY = import.meta.env.VITE_N8N_API_KEY;
const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

const headers = {
    'X-N8N-API-KEY': API_KEY,
    'Content-Type': 'application/json',
};

export const n8nService = {
    // Fetch all posts from n8n-managed database
    fetchPosts: async (): Promise<Post[]> => {
        try {
            const response = await fetch(`${API_URL}/posts`, { headers });
            if (!response.ok) throw new Error('Postlar getirilemedi');
            return await response.json();
        } catch (error) {
            console.error('n8n API Error (fetchPosts):', error);
            return []; // Hata durumunda boş döner veya mock dataya fallback yapabiliriz
        }
    },

    // Send a new post to n8n workflow
    createPost: async (postData: Partial<Post>, limeSocialSettings?: Record<string, string>): Promise<boolean> => {
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_post',
                    data: postData,
                    limesocial: limeSocialSettings
                }),
            });
            return response.ok;
        } catch (error) {
            console.error('n8n Webhook Error (createPost):', error);
            return false;
        }
    },

    // Fetch performance metrics
    fetchStats: async (): Promise<PlatformStats[]> => {
        try {
            const response = await fetch(`${API_URL}/stats`, { headers });
            if (!response.ok) throw new Error('İstatistikler getirilemedi');
            return await response.json();
        } catch (error) {
            console.error('n8n API Error (fetchStats):', error);
            return [];
        }
    },

    // Update a scheduled post
    updatePost: async (id: string, updates: Partial<Post>): Promise<boolean> => {
        try {
            const response = await fetch(`${WEBHOOK_URL}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update_post',
                    postId: id,
                    updates,
                }),
            });
            return response.ok;
        } catch (error) {
            console.error('n8n Webhook Error (updatePost):', error);
            return false;
        }
    },

    // Generate AI content (caption + video) with customer-specific prompt
    generateContent: async (content: string, customerId: string, limeSocialSettings?: Record<string, string>): Promise<{ caption: string; videoUrl: string } | null> => {
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_content',
                    content,
                    customerId,
                    limesocial: limeSocialSettings
                }),
            });

            if (!response.ok) {
                throw new Error('AI içerik üretimi başarısız');
            }

            const result = await response.json();
            return {
                caption: result.caption || '',
                videoUrl: result.videoUrl || '',
            };
        } catch (error) {
            console.error('n8n Webhook Error (generateContent):', error);
            return null;
        }
    },

    // Manually publish a verified post to LimeSocial
    publishToLimeSocial: async (post: Post, limeSocialSettings: Record<string, string>): Promise<boolean> => {
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'publish_to_limesocial',
                    post: post,
                    limesocial: limeSocialSettings
                }),
            });
            return response.ok;
        } catch (error) {
            console.error('n8n Webhook Error (publishToLimeSocial):', error);
            return false;
        }
    }
};
