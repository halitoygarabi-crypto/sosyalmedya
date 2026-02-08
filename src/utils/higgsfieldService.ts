/**
 * Higgsfield AI Video Generation Service
 * Uses Higgsfield v2 API for high-aesthetic video generation
 */

export interface HiggsfieldGenerationRequest {
    prompt: string;
    imageUrl?: string;
    model?: 'dop-lite' | 'dop-preview' | 'dop-turbo';
    aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
}

export interface HiggsfieldGenerationResponse {
    success: boolean;
    videoUrl?: string;
    error?: string;
    requestId?: string;
}

class HiggsfieldService {
    private baseUrl: string = 'https://api.higgsfield.ai/v2';

    setApiKey(key: string) {
        localStorage.setItem('higgsfield_api_key', key);
    }

    getApiKey(): string {
        const localKey = localStorage.getItem('higgsfield_api_key');
        if (localKey && localKey.trim()) {
            return localKey.trim();
        }

        const envKey = import.meta.env.VITE_HIGGSFIELD_API_KEY;
        return envKey || '';
    }

    /**
     * Generate video using Higgsfield DoP (Director of Photography) model
     */
    async generateVideo(request: HiggsfieldGenerationRequest): Promise<HiggsfieldGenerationResponse> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            return { success: false, error: 'Higgsfield API anahtarı bulunamadı. Lütfen .env dosyasını kontrol edin.' };
        }

        try {
            console.log('🎬 Higgsfield Video üretimi başlatılıyor...');
            
            // Initiate the subscription/generation
            const response = await fetch(`${this.baseUrl}/subscribe`, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'sosyal-medya-dashboard/1.0'
                },
                body: JSON.stringify({
                    endpoint: request.model || 'dop-preview',
                    input: {
                        prompt: request.prompt,
                        image: request.imageUrl,
                        aspect_ratio: request.aspectRatio || '16:9',
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API hatası: ${response.status}`);
            }

            const data = await response.json();
            const requestId = data.id || data.request_id;

            if (!requestId) {
                throw new Error('İstek ID\'si alınamadı');
            }

            // Start polling for status
            return await this.pollStatus(requestId);
        } catch (error: unknown) {
            console.error('❌ Higgsfield üretim hatası:', error);
            const errorMessage = error instanceof Error ? error.message : 'Video üretilemedi';
            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Poll the status of a request until it's completed or fails
     */
    private async pollStatus(requestId: string, maxAttempts = 60): Promise<HiggsfieldGenerationResponse> {
        const apiKey = this.getApiKey();
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const response = await fetch(`${this.baseUrl}/requests/${requestId}/status`, {
                    headers: {
                        'Authorization': `Key ${apiKey}`,
                    }
                });

                if (!response.ok) {
                    throw new Error(`Durum kontrolü hatası: ${response.status}`);
                }

                const data = await response.json();
                const status = data.status;

                if (status === 'completed' || status === 'success') {
                    return {
                        success: true,
                        videoUrl: data.outputs?.[0]?.url || data.url,
                        requestId
                    };
                }

                if (status === 'failed' || status === 'error') {
                    return {
                        success: false,
                        error: data.error || 'Video üretimi başarısız oldu',
                        requestId
                    };
                }

                // Wait 5 seconds before next poll
                await new Promise(resolve => setTimeout(resolve, 5000));
                attempts++;
            } catch (error) {
                console.error('Anlık durum kontrolü hatası:', error);
                attempts++;
            }
        }

        return {
            success: false,
            error: 'Zaman aşımı: Video üretimi çok uzun sürdü.',
            requestId
        };
    }

    isConfigured(): boolean {
        return !!this.getApiKey();
    }
}

export const higgsfieldService = new HiggsfieldService();
