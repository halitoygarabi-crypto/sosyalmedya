/**
 * AI Talking Influencer Service
 * Uses fal.ai API for generating talking head videos from images and text
 */

export interface TalkingInfluencerRequest {
    imageUrl: string;
    script: string;
    voiceId?: string; // Optional: specific voice to use
}

export interface TalkingInfluencerResponse {
    success: boolean;
    videoUrl?: string;
    error?: string;
    requestId?: string;
}

class AITalkingService {
    private baseUrl: string = 'https://fal.run';

    getApiKey(): string {
        // Priority: LocalStorage (manual entry) > Environment Variable
        const localKey = localStorage.getItem('ltx_api_key');
        if (localKey && localKey.trim()) {
            return localKey.trim();
        }

        const envKey = import.meta.env.VITE_FAL_API_KEY;
        if (envKey && envKey !== 'senin-yeni-anahtarin') {
            return envKey.trim();
        }
        return '';
    }

    /**
     * Generate a talking video from an image and script
     * Uses fal-ai/multi-talk for text-to-speech avatar generation
     */
    async generateTalkingVideo(request: TalkingInfluencerRequest): Promise<TalkingInfluencerResponse> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            return { success: false, error: 'API anahtarı bulunamadı. Ayarlardan fal.ai API anahtarınızı girin.' };
        }

        try {
            console.log('🗣️ AI Influencer konuşturuluyor (MultiTalk)...');
            
            // Using fal-ai/multi-talk which takes image_url, text, and optional voice settings
            const response = await fetch(`${this.baseUrl}/fal-ai/multi-talk`, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_url: request.imageUrl,
                    text: request.script,
                    voice: request.voiceId || 'Sarah',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Hatası Detayı:', errorData);
                
                // If multi-talk fails, try sadtalker as fallback (requires audio file)
                // For now, just return the error
                throw new Error(errorData.detail || errorData.message || `API hatası: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ MultiTalk yanıtı:', data);
            
            return {
                success: true,
                videoUrl: data.video?.url || data.video_url || data.url,
                requestId: data.request_id
            };
        } catch (error: unknown) {
            console.error('❌ Influencer konuşturma hatası:', error);
            const errorMessage = error instanceof Error ? error.message : 'Video üretilemedi';
            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    isConfigured(): boolean {
        return !!this.getApiKey();
    }
}

export const aiTalkingService = new AITalkingService();
