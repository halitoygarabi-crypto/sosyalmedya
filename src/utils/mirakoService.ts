/**
 * Mirako AI Video Generation Service
 * Supports text-to-video and image-to-video using Mirako AI
 */

export interface MirakoGenerationRequest {
    prompt: string;
    imageUrl?: string;
    aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
    duration?: number;
    negativePrompt?: string;
}

export interface MirakoGenerationResponse {
    success: boolean;
    videoUrl?: string;
    error?: string;
    requestId?: string;
}

class MirakoService {
    private baseUrl: string = 'https://mirako.co';

    getApiKey(): string {
        try {
            const savedSettings = localStorage.getItem('ai_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                if (settings.mirakoKey) return settings.mirakoKey.trim();
            }
        } catch {}

        const localKey = localStorage.getItem('mirako_api_key');
        if (localKey && localKey.trim()) {
            return localKey.trim();
        }

        const envKey = import.meta.env.VITE_MIRAKO_API_KEY;
        if (envKey && envKey !== 'your_mirako_key') return envKey.trim();
        
        // Provided by user
        return 'mi_FWR0uI66nLD5yiSt-KjlJvP7PyADve-ewc-i4qXfYJg';
    }

    setApiKey(key: string) {
        localStorage.setItem('mirako_api_key', key);
    }

    /**
     * Generate video using Mirako AI (Text-to-Video or Image-to-Video)
     */
    async generateVideo(request: MirakoGenerationRequest): Promise<MirakoGenerationResponse> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            return { success: false, error: 'Mirako API anahtarı bulunamadı.' };
        }

        try {
            console.log('🎬 Mirako AI video üretimi başlatılıyor...');
            
            // Official endpoints:
            // Talking Avatar: /v1/video/async_generate_talking_avatar
            // Avatar Motion: /v1/video/async_generate_avatar_motion
            const isMotion = !!request.imageUrl;
            const endpoint = isMotion ? '/v1/video/async_generate_avatar_motion' : '/v1/video/async_generate_talking_avatar';
            const fullUrl = `${this.baseUrl}${endpoint}`;
            
            console.log('DEBUG - Mirako URL:', fullUrl);
            
            const payload: any = {};

            if (isMotion) {
                // Avatar Motion schema: image (string URL), audio (string prompt), positive_prompt, negative_prompt
                // Truncate prompt to 512 characters for Mirako API limit
                const truncatedPrompt = request.prompt.length > 512 ? request.prompt.substring(0, 511) : request.prompt;
                
                payload.image = request.imageUrl;
                payload.audio = truncatedPrompt;
                payload.positive_prompt = truncatedPrompt;
                payload.negative_prompt = request.negativePrompt || 'nsfw, low quality, blurry, distorted, low resolution';
            } else {
                // Talking Avatar schema: image (string URL), audio (string prompt)
                const truncatedPrompt = request.prompt.length > 512 ? request.prompt.substring(0, 511) : request.prompt;
                
                payload.image = request.imageUrl;
                payload.audio = truncatedPrompt;
                payload.negative_prompt = request.negativePrompt || 'nsfw, low quality, blurry';
            }

            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Mirako AI Error:', errorText);
                throw new Error(`Mirako Hatası: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('DEBUG - Mirako Response Data:', data);
            
            // Try different possible ID keys
            const taskId = data.task_id || data.id || data.job_id || data.request_id || (data.data && data.data.task_id);

            if (!taskId) {
                console.error('❌ Mirako Yanıtı Geçersiz (Task ID Bulunamadı):', data);
                throw new Error('Mirako sunucusundan geçerli bir işlem numarası (Task ID) alınamadı.');
            }

            console.log('⏳ Mirako videosu üretiliyor, Task ID:', taskId);

            // Poll for result
            return await this.pollStatus(taskId, apiKey);
        } catch (error: unknown) {
            console.error('❌ Mirako video üretim hatası:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Mirako video üretilemedi',
            };
        }
    }

    /**
     * Generate image using Mirako AI
     */
    async generateImage(request: { prompt: string, aspectRatio?: string }): Promise<MirakoGenerationResponse> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            return { success: false, error: 'Mirako API anahtarı bulunamadı.' };
        }

        try {
            console.log('🎨 Mirako AI görsel üretimi başlatılıyor...');
            
            const response = await fetch(`${this.baseUrl}/v1/image/async_generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: request.prompt,
                    image_size: this.mapAspectRatio(request.aspectRatio || '1:1'),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Mirako Hatası: ${errorData.message || response.status}`);
            }

            const data = await response.json();
            const taskId = data.task_id || data.id;

            if (!taskId) throw new Error('Mirako task ID alınamadı.');

            console.log('⏳ Mirako görseli üretiliyor, Task ID:', taskId);

            // Poll for result
            return await this.pollStatus(taskId, apiKey, 'image');
        } catch (error: unknown) {
            console.error('❌ Mirako görsel üretim hatası:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Mirako görsel üretilemedi',
            };
        }
    }

    private async pollStatus(taskId: string, apiKey: string, type: 'video' | 'image' = 'video', maxAttempts = 120): Promise<MirakoGenerationResponse> {
        let attempts = 0;
        // Try both specific and generic endpoints
        const endpoints = [
            type === 'video' ? `/v1/video/task/${taskId}` : `/v1/image/task/${taskId}`,
            `/v1/task/${taskId}`
        ];
        
        // Initial wait to let the server register the task
        console.log(`⏳ Mirako ${type} işlemi başlatıldı, 3 saniye sonra durum kontrolü başlayacak...`);
        await new Promise(resolve => setTimeout(resolve, 3000));

        while (attempts < maxAttempts) {
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(`${this.baseUrl}${endpoint}`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${apiKey}` }
                    });

                    if (response.ok) {
                        const statusData = await response.json();
                        console.log(`📊 Mirako Status (${endpoint}):`, statusData);
                        const status = statusData.status?.toLowerCase();

                        if (status === 'completed' || status === 'succeeded' || status === 'success') {
                            const videoUrl = statusData.video_url || 
                                           statusData.image_url || 
                                           statusData.result?.url || 
                                           statusData.result?.video_url ||
                                           (statusData.results && statusData.results[0]?.url) ||
                                           (statusData.results && statusData.results[0]?.video_url);

                            return {
                                success: !!videoUrl,
                                videoUrl: videoUrl,
                                error: videoUrl ? undefined : 'Üretim tamamlandı ancak dosya adresi alınamadı.',
                                requestId: taskId
                            };
                        } else if (status === 'failed' || status === 'error') {
                            return {
                                success: false,
                                error: `Mirako üretimi başarısız: ${statusData.error_message || 'Bilinmeyen hata'}`,
                                requestId: taskId
                            };
                        }
                        // If pending/processing, break inner loop to wait and try again
                        break; 
                    } else if (response.status === 404) {
                        console.warn(`⚠️ Mirako endpoint 404 döndü: ${endpoint}. Alternatif deneniyor...`);
                        continue; // Try next endpoint in current attempt
                    }
                } catch (error) {
                    console.error('Mirako polling hatası:', error);
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 5000));
            attempts++;
            console.log(`📊 Mirako ${type} durumu sorgulanıyor (${attempts}/${maxAttempts})...`);
        }

        return { success: false, error: 'Mirako zaman aşımı.', requestId: taskId };
    }

    private mapAspectRatio(ratio: string): string {
        const ratioMap: Record<string, string> = {
            '1:1': 'square',
            '16:9': 'landscape',
            '9:16': 'portrait',
            '4:3': 'landscape_4_3'
        };
        return ratioMap[ratio] || 'square';
    }

    isConfigured(): boolean {
        return !!this.getApiKey();
    }
}

export const mirakoService = new MirakoService();
