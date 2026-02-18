/**
 * Higgsfield AI Video Generation Service
 * Uses fal.ai API for Flux and video generation
 * Note: Uses fal.ai as the backend provider
 */

export interface HiggsfieldGenerationRequest {
    prompt: string;
    imageUrl?: string;
    model?: string;
    aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
    negativePrompt?: string;
}

export interface HiggsfieldGenerationResponse {
    success: boolean;
    videoUrl?: string;
    error?: string;
    requestId?: string;
}

class HiggsfieldService {
    // Use fal.ai as the backend
    private baseUrl: string = 'https://fal.run';
    private queueUrl: string = 'https://queue.fal.run';

    setApiKey(key: string) {
        localStorage.setItem('higgsfield_api_key', key);
    }

    getApiKey(): string {
        // Priority 1: direct higgsfield_api_key (fal.ai)
        const localHKey = localStorage.getItem('higgsfield_api_key');
        if (localHKey && localHKey.trim().length > 10) {
            return localHKey.trim();
        }

        // Priority 2: direct ltx_api_key (fal.ai)
        const falKey = localStorage.getItem('ltx_api_key');
        if (falKey && falKey.trim().length > 10) {
            return falKey.trim();
        }

        // Priority 3: Working FAL Environment Variable
        const envKey = import.meta.env.VITE_FAL_API_KEY;
        if (envKey && envKey.length > 10) return envKey.trim();

        // Last resort: Legacy Higgsfield key
        return import.meta.env.VITE_HIGGSFIELD_API_KEY || '';
    }

    /**
     * Generate video using fal.ai Kling Video model (image-to-video)
     */
    async generateVideo(request: HiggsfieldGenerationRequest): Promise<HiggsfieldGenerationResponse> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            return { success: false, error: 'API anahtarı bulunamadı. Lütfen fal.ai API anahtarınızı girin.' };
        }

        try {
            console.log('🎬 Video üretimi başlatılıyor (Kling i2v)...');
            
            // Use Kling image-to-video for video generation
            const response = await fetch(`${this.queueUrl}/fal-ai/kling-video/v1.6/standard/image-to-video`, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: request.prompt,
                    image_url: request.imageUrl,
                    duration: '5',
                    aspect_ratio: request.aspectRatio || '16:9',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Video API Error:', errorData);
                throw new Error(errorData.detail || errorData.message || `API hatası: ${response.status}`);
            }

            const data = await response.json();
            const requestId = data.request_id;

            if (!requestId) {
                // Synchronous response
                return {
                    success: true,
                    videoUrl: data.video?.url || data.url,
                };
            }

            // Poll for result
            return await this.pollStatus(requestId, 'fal-ai/kling-video/v1.6/standard/image-to-video');
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
     * Poll the status of a request until it's completed or fails
     */
    private async pollStatus(requestId: string, endpoint: string, maxAttempts = 60): Promise<HiggsfieldGenerationResponse> {
        const apiKey = this.getApiKey();
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const response = await fetch(`${this.queueUrl}/${endpoint}/requests/${requestId}/status`, {
                    headers: {
                        'Authorization': `Key ${apiKey}`,
                    }
                });

                if (!response.ok) {
                    console.log(`Status check failed: ${response.status}`);
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    continue;
                }

                const data = await response.json();
                const status = data.status;
                console.log(`📊 Status (${attempts + 1}/${maxAttempts}):`, status);

                if (status === 'COMPLETED') {
                    // Get the result
                    const resultResponse = await fetch(`${this.queueUrl}/${endpoint}/requests/${requestId}`, {
                        headers: {
                            'Authorization': `Key ${apiKey}`,
                        }
                    });
                    
                    if (resultResponse.ok) {
                        const resultData = await resultResponse.json();
                        return {
                            success: true,
                            videoUrl: resultData.video?.url || resultData.url,
                            requestId
                        };
                    }
                }

                if (status === 'FAILED') {
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
                console.error('Status check error:', error);
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        return {
            success: false,
            error: 'Zaman aşımı: Video üretimi çok uzun sürdü.',
            requestId
        };
    }

    /**
     * Generate image using fal.ai Flux Pro model
     */
    async generateImage(request: HiggsfieldGenerationRequest): Promise<HiggsfieldGenerationResponse> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            return { success: false, error: 'API anahtarı bulunamadı. Lütfen fal.ai API anahtarınızı girin.' };
        }

        try {
            console.log('🎨 Görsel üretimi başlatılıyor (Flux Pro)...');
            
            // Use Flux Pro for image generation
            const response = await fetch(`${this.baseUrl}/fal-ai/flux-pro`, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: request.prompt,
                    image_size: this.mapAspectRatio(request.aspectRatio || '1:1'),
                    num_inference_steps: 28,
                    seed: Math.floor(Math.random() * 1000000),
                    enable_safety_checker: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Image API Error:', errorData);
                throw new Error(errorData.detail || errorData.message || `API hatası: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Image generated:', data);
            
            return {
                success: true,
                videoUrl: data.images?.[0]?.url || data.url, // Using videoUrl field for consistency
                requestId: data.request_id
            };
        } catch (error: unknown) {
            console.error('❌ Görsel üretim hatası:', error);
            const errorMessage = error instanceof Error ? error.message : 'Görsel üretilemedi';
            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    private mapAspectRatio(ratio: string): string {
        const ratioMap: Record<string, string> = {
            '1:1': 'square_hd',
            '16:9': 'landscape_16_9',
            '9:16': 'portrait_16_9',
            '4:3': 'landscape_4_3'
        };
        return ratioMap[ratio] || 'square_hd';
    }

    isConfigured(): boolean {
        return !!this.getApiKey();
    }
}

export const higgsfieldService = new HiggsfieldService();
