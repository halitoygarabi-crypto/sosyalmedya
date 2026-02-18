import type { Post, PlatformStats } from '../types';
import { llmService } from './llmService';
import { replicateService } from './replicateService';
import { aiInfluencerService } from './aiInfluencerService';
import { googleSheetsService } from './googleSheetsService';
import { limeSocialService } from './limeSocialService';
import type { LimeSocialSettings } from './limeSocialService';

/**
 * Refactored n99Service (No n8n version)
 * This service now handles all logic locally within the app
 * by coordinating between direct API services.
 */

export const n99Service = {
    // Fetch posts from Supabase or memory
    fetchPosts: async (): Promise<Post[]> => {
        const { supabaseService } = await import('./supabaseService');
        return supabaseService.fetchPosts();
    },

    // Handle post creation in Supabase
    createPost: async (postData: Post): Promise<boolean> => {
        console.log('📝 Post veritabanına kaydediliyor:', postData);
        const { supabaseService } = await import('./supabaseService');
        return supabaseService.createPost(postData);
    },

    // Fetch stats from Supabase
    fetchStats: async (): Promise<PlatformStats[]> => {
        const { supabaseService } = await import('./supabaseService');
        return supabaseService.fetchStats();
    },

    // Update post in Supabase
    updatePost: async (id: string, updates: Partial<Post>): Promise<boolean> => {
        console.log('📝 Post güncelleniyor:', id, updates);
        const { supabaseService } = await import('./supabaseService');
        return supabaseService.updatePost(id, updates);
    },

    /**
     * Generate AI content (caption + visual)
     * DIRECT APP IMPLEMENTATION (NO n8n)
     */
    generateContent: async (
        prompt: string, 
        customerId: string, 
        postType: 'post' | 'reel' | 'story' = 'post',
        platforms: string[] = []
    ): Promise<{ caption: string; videoUrl: string } | null> => {
        try {
            console.log('🚀 AI İçerik üretimi başlatılıyor (Direct Uygulama)...');

            // 1. Generate Caption using LLM
            const caption = await llmService.generateCaption(prompt, `Müşteri: ${customerId}`, platforms[0] || 'instagram');

            // 2. Generate Visual using Replicate or Fal.ai
            let visualUrl = '';
            
            console.log('🖼️ Görsel üretimi deneniyor (Replicate)...');
            visualUrl = await replicateService.generateImage(prompt) || '';
            console.log('🖼️ Replicate Sonucu:', visualUrl ? 'Başarılı' : 'Başarısız');
            
            // Fallback to fal.ai if replicate fails
            if (!visualUrl) {
                console.log('⚠️ Replicate başarısız veya anahtar yok, Fal.ai deneniyor...');
                const falResponse = await aiInfluencerService.generateInfluencer({
                    prompt: prompt,
                    model: 'flux-schnell'
                });
                visualUrl = falResponse.imageUrl || '';
                console.log('🖼️ Fal.ai Sonucu:', visualUrl ? 'Başarılı' : 'Başarısız');
                if (!visualUrl) {
                    console.warn('❌ Tüm görsel üretim servisleri başarısız oldu.');
                }
            }

            console.log('📊 Google Sheets kaydı için hazırlanan veriler:', {
                prompt,
                customerId,
                caption: caption ? (caption.slice(0, 50) + '...') : 'MİSSİNG',
                visualUrl
            });

            // 3. Log to Google Sheets (Non-blocking)
            if (caption && googleSheetsService.isConfigured()) {
                googleSheetsService.saveToNamedSheet('n99', {
                    date: new Date().toISOString(),
                    prompt: prompt,
                    imageUrl: visualUrl,
                    type: postType === 'post' ? 'image' : 'video',
                    clientName: customerId,
                    metadata: {
                        caption: caption,
                        postType: postType,
                        platforms: platforms.join(', '),
                        method: 'Direct App (No n8n)'
                    }
                }).then(res => console.log('✅ Google Sheets Log Sonucu:', res))
                  .catch(err => console.error('❌ Google Sheets Log Hatası:', err));
            }

            if (!caption) {
                throw new Error('Metin içeriği üretilemedi (OpenAI Error)');
            }

            return {
                caption: caption,
                videoUrl: visualUrl,
            };
        } catch (error) {
            console.error('Direct App Content Generation Error:', error);
            throw error; // UI bileşeninin hatayı yakalaması için
        }
    },

    // Direct publishing to LimeSocial
    publishToLimeSocial: async (post: Post, limeSocialSettings: LimeSocialSettings): Promise<{ success: boolean; error?: string }> => {
        try {
            return await limeSocialService.publishPost(post, limeSocialSettings);
        } catch (error) {
            console.error('Publish Error:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Bilinmeyen hata' };
        }
    }
};
