/**
 * AI Influencer Generation Service
 * Uses fal.ai API for generating high-quality influencer images
 */

export interface InfluencerGenerationRequest {
    prompt: string;
    negativePrompt?: string;
    aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
    model?: 'flux-pro' | 'flux-schnell' | 'aura-flow';
    seed?: number;
}

export interface InfluencerGenerationResponse {
    success: boolean;
    imageUrl?: string;
    videoUrl?: string; // Support for video generated from influencer
    type?: 'image' | 'video'; // Distinguish between content types
    error?: string;
    requestId?: string;
    seed?: number;
}

class AIInfluencerService {
    private baseUrl: string = 'https://fal.run';

    getApiKey(): string {
        // Centralized AI Settings (from DashboardContext)
        try {
            const savedSettings = localStorage.getItem('ai_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                if (settings.falKey) return settings.falKey.trim();
            }
        } catch {
            // Silently fail and fallback
        }

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
     * Generate a high-quality influencer image
     */
    async generateInfluencer(request: InfluencerGenerationRequest): Promise<InfluencerGenerationResponse> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            return { success: false, error: 'API anahtarı bulunamadı. Ayarlardan fal.ai API anahtarınızı girin.' };
        }

        try {
            console.log('🤖 AI Influencer üretimi başlatılıyor...');
            
            // Map our model names to fal.ai endpoints
            const modelEndpoint = request.model === 'flux-schnell' 
                ? 'fal-ai/flux/schnell' 
                : request.model === 'aura-flow'
                ? 'fal-ai/aura-flow'
                : 'fal-ai/flux-pro';

            const response = await fetch(`${this.baseUrl}/${modelEndpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: request.prompt,
                    image_size: this.mapAspectRatio(request.aspectRatio || '1:1'),
                    num_inference_steps: request.model === 'flux-schnell' ? 4 : 28,
                    seed: request.seed || Math.floor(Math.random() * 1000000),
                    enable_safety_checker: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || errorData.message || `API hatası: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                success: true,
                imageUrl: data.images?.[0]?.url || data.url,
                requestId: data.request_id,
                seed: data.seed
            };
        } catch (error: unknown) {
            console.error('❌ Influencer üretim hatası:', error);
            const errorMessage = error instanceof Error ? error.message : 'Görsel üretilemedi';
            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    private mapAspectRatio(ratio: '1:1' | '16:9' | '9:16' | '4:3'): string {
        switch (ratio) {
            case '16:9': return 'landscape_16_9';
            case '9:16': return 'portrait_16_9';
            case '4:3': return 'landscape_4_3';
            case '1:1': default: return 'square';
        }
    }

    isConfigured(): boolean {
        return !!this.getApiKey();
    }
}

export const aiInfluencerService = new AIInfluencerService();
