
export interface PolmarkGenerationRequest {
    prompt: string;
    imageUrl?: string;
    mode?: string;
    aspectRatio?: string;
    duration?: number;
}

export interface PolmarkGenerationResponse {
    success: boolean;
    videoUrl?: string;
    error?: string;
    requestId?: string;
}

class PolmarkService {
    private falBaseUrl = 'https://fal.run';

    /**
     * Get fal.ai API key from multiple sources
     */
    private getApiKey(): string {
        // Priority 1: ai_settings from localStorage
        try {
            const savedSettings = localStorage.getItem('ai_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                if (settings.falKey && settings.falKey.trim().length > 10) {
                    return settings.falKey.trim();
                }
            }
        } catch { /* ignore */ }

        // Priority 2: Environment variable
        const envKey = import.meta.env.VITE_FAL_API_KEY;
        if (envKey && envKey.length > 10) {
            return envKey.trim();
        }

        return '';
    }

    async generateVideo(request: PolmarkGenerationRequest): Promise<PolmarkGenerationResponse> {
        try {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                return {
                    success: false,
                    error: 'Fal.ai API anahtarı bulunamadı. Ayarlardan API anahtarınızı girin.',
                };
            }

            const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
            console.log(`🚀 Polmark AI video üretimi başlatılıyor... (Key: ${maskedKey})`);
            console.log('📋 İstek:', { prompt: request.prompt.substring(0, 50) + '...', mode: request.mode, duration: request.duration });

            const isImageToVideo = request.mode === 'image-to-video' && request.imageUrl;
            const endpoint = isImageToVideo
                ? `${this.falBaseUrl}/fal-ai/kling-video/v1.6/standard/image-to-video`
                : `${this.falBaseUrl}/fal-ai/kling-video/v1.6/standard/text-to-video`;

            const body: Record<string, unknown> = {
                prompt: request.prompt.length > 1000 ? request.prompt.substring(0, 999) : request.prompt,
                negative_prompt: 'blurry, low quality, distorted, ugly, watermark',
                duration: (request.duration || 5) > 5 ? '10' : '5',
                aspect_ratio: request.aspectRatio || '16:9',
            };

            if (isImageToVideo && request.imageUrl) {
                body.image_url = request.imageUrl;
            }

            console.log(`📡 Polmark -> Kling API çağrılıyor: ${isImageToVideo ? 'image-to-video' : 'text-to-video'}`);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Polmark API Error:', errorData);
                const detail = (errorData as Record<string, string>).detail || 
                               (errorData as Record<string, string>).message || 
                               `API hatası: ${response.status}`;
                throw new Error(detail);
            }

            const data = await response.json();
            console.log('✅ Polmark AI video başarıyla oluşturuldu:', data);

            const videoUrl = data.video?.url || data.video_url || data.url;

            if (!videoUrl) {
                throw new Error('Video URL alınamadı. API yanıtı beklenmeyen formatta.');
            }

            return {
                success: true,
                videoUrl,
                requestId: data.request_id || 'polmark-' + Date.now(),
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Polmark video üretilemedi';
            console.error('❌ Polmark video üretim hatası:', error);
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

export const polmarkService = new PolmarkService();
