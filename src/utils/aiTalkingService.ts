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
     * Uses fal-ai/multi-talk or similar
     */
    async generateTalkingVideo(request: TalkingInfluencerRequest): Promise<TalkingInfluencerResponse> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            return { success: false, error: 'API anahtarı bulunamadı. Ayarlardan fal.ai API anahtarınızı girin.' };
        }

        try {
            console.log('🗣️ AI Influencer konuşturuluyor (Kling AI - standard/ai-avatar)...');
            
            // Using fal-ai/kling-video/v1/standard/ai-avatar which takes image_url, text_input, voice and prompt
            const response = await fetch(`${this.baseUrl}/fal-ai/kling-video/v1/standard/ai-avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_url: request.imageUrl,
                    text_input: request.script,
                    voice: request.voiceId || 'Sarah', // Default to Sarah if not specified
                    prompt: 'high quality professional talking head video, realistic skin, stable movement',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Hatası Detayı:', errorData);
                throw new Error(errorData.detail || errorData.message || `API hatası: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                success: true,
                videoUrl: data.video?.url || data.url,
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
