/**
 * LTX-2 Video Generation Service
 * Uses fal.ai API for video generation
 */

export interface VideoGenerationRequest {
    prompt: string;
    negativePrompt?: string;
    imageUrl?: string; // For image-to-video
    duration?: number; // 3, 5, 10, 15, 20 seconds
    aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
    resolution?: 'HD' | 'FHD' | '4K';
    fps?: 24 | 30 | 50;
    mode?: 'fast' | 'quality';
}

export interface VideoGenerationResponse {
    success: boolean;
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    error?: string;
    requestId?: string;
}

export interface VideoGenerationStatus {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    videoUrl?: string;
    error?: string;
}

class LTXVideoService {
    private baseUrl: string = 'https://fal.run';


    setApiKey(key: string) {
        localStorage.setItem('ltx_api_key', key);
    }


    getApiKey(): string {
        // Priority 1: ai_settings from localStorage
        try {
            const savedSettings = localStorage.getItem('ai_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                if (settings.falKey && settings.falKey.trim().length > 10) {
                    return settings.falKey.trim();
                }
            }
        } catch {}

        // Priority 2: direct ltx_api_key
        const localKey = localStorage.getItem('ltx_api_key');
        if (localKey && localKey.trim().length > 10) {
            return localKey.trim();
        }

        // Priority 3: Environment Variable (VITE_FAL_API_KEY is the working one)
        const envKey = import.meta.env.VITE_FAL_API_KEY;
        if (envKey && envKey.length > 10) {
            return envKey.trim();
        }

        return '';
    }

    async generateFromText(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            return { success: false, error: 'API anahtarı bulunamadı. Ayarlardan fal.ai API anahtarınızı girin.' };
        }

        try {
            const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
            console.log(`🎬 Kling AI Video üretimi başlatılıyor... (Key: ${maskedKey})`);
            
            const response = await fetch(`${this.baseUrl}/fal-ai/kling-video/v1.6/standard/text-to-video`, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: request.prompt.length > 1000 ? request.prompt.substring(0, 999) : request.prompt,
                    negative_prompt: request.negativePrompt || 'blurry, low quality, distorted, ugly',
                    duration: (request.duration || 5) > 5 ? "10" : "5",
                    aspect_ratio: this.mapAspectRatio(request.aspectRatio || '16:9'),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error Response:', errorData);
                throw new Error(errorData.detail || errorData.message || `API hatası: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Video başarıyla oluşturuldu:', data);

            return {
                success: true,
                videoUrl: data.video?.url || data.video_url || data.url,
                thumbnailUrl: data.thumbnail?.url,
                duration: request.duration || 5,
                requestId: data.request_id,
            };
        } catch (error: unknown) {
            console.error('❌ Video üretim hatası:', error);
            const errorMessage = error instanceof Error ? error.message : 'Video üretilemedi';
            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Generate video from image using Kling AI via fal.ai
     */
    async generateFromImage(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            return { success: false, error: 'API anahtarı bulunamadı. Ayarlardan fal.ai API anahtarınızı girin.' };
        }

        if (!request.imageUrl) {
            return { success: false, error: 'Görsel URL\'si gerekli' };
        }

        try {
            const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
            console.log(`🎬 Kling AI Image-to-Video üretimi başlatılıyor... (Key: ${maskedKey})`);

            const response = await fetch(`${this.baseUrl}/fal-ai/kling-video/v1.6/standard/image-to-video`, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_url: request.imageUrl,
                    prompt: request.prompt.length > 1000 ? request.prompt.substring(0, 999) : request.prompt,
                    negative_prompt: request.negativePrompt || 'blurry, low quality, distorted',
                    duration: (request.duration || 5) > 5 ? "10" : "5",
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error Response:', errorData);
                throw new Error(errorData.detail || errorData.message || `API hatası: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Video başarıyla oluşturuldu:', data);

            return {
                success: true,
                videoUrl: data.video?.url || data.video_url || data.url,
                thumbnailUrl: data.thumbnail?.url,
                duration: request.duration || 5,
                requestId: data.request_id,
            };
        } catch (error: unknown) {
            console.error('❌ Video üretim hatası:', error);
            const errorMessage = error instanceof Error ? error.message : 'Video üretilemedi';
            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    private mapAspectRatio(ratio: string): string {
        switch (ratio) {
            case '16:9': return '16:9';
            case '9:16': return '9:16';
            case '1:1': return '1:1';
            case '4:3': return '4:3';
            default: return '16:9';
        }
    }


    /**
     * Check if API key is configured
     */
    isConfigured(): boolean {
        return !!this.getApiKey();
    }
}

export const ltxVideoService = new LTXVideoService();
