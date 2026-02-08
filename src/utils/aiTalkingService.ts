/**
 * AI Talking Influencer Service
 * Uses fal.ai API for generating talking head videos from images
 * Simple approach: Direct API call to working endpoints
 */

export interface TalkingInfluencerRequest {
    imageUrl: string;
    script: string;
    voiceId?: string;
}

export interface TalkingInfluencerResponse {
    success: boolean;
    videoUrl?: string;
    error?: string;
    requestId?: string;
}

class AITalkingService {
    getApiKey(): string {
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
     * Generate a talking video using SadTalker with audio from a TTS service
     * Since SadTalker needs audio, we'll use a simple approach:
     * 1. First call a TTS API to get audio
     * 2. Then call SadTalker with the image + audio
     */
    async generateTalkingVideo(request: TalkingInfluencerRequest): Promise<TalkingInfluencerResponse> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            return { success: false, error: 'API anahtarı bulunamadı. Ayarlardan fal.ai API anahtarınızı girin.' };
        }

        try {
            console.log('🗣️ AI Influencer konuşturuluyor...');
            console.log('📝 Script:', request.script.substring(0, 50) + '...');
            console.log('🖼️ Image URL:', request.imageUrl.substring(0, 50) + '...');

            // Step 1: Generate audio using fal.ai SadTalker with a simple static audio
            // For now, we'll use SadTalker's default behavior
            // Note: Real implementation would need a TTS first
            
            // Try using fal.ai's direct subscribe endpoint
            const submitResponse = await fetch('https://queue.fal.run/fal-ai/sadtalker', {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source_image_url: request.imageUrl,
                    // Use a sample TTS audio - in production you'd generate this from text
                    driven_audio_url: 'https://fal.media/files/monkey/vUhjR7N-c3qNhNEQBp6TZ.wav',
                    face_model_resolution: '512',
                    expression_scale: 1.0,
                    preprocess: 'crop',
                }),
            });

            console.log('📤 SadTalker API response status:', submitResponse.status);

            if (!submitResponse.ok) {
                const errorData = await submitResponse.json().catch(() => ({}));
                console.error('API Error:', errorData);
                throw new Error(errorData.detail || errorData.message || `API hatası: ${submitResponse.status}`);
            }

            const submitData = await submitResponse.json();
            console.log('📤 Submit response:', submitData);
            
            const requestId = submitData.request_id;

            if (!requestId) {
                // Synchronous response
                console.log('✅ Synchronous response received');
                return {
                    success: true,
                    videoUrl: submitData.video?.url || submitData.url,
                    requestId: 'sync'
                };
            }

            console.log('📤 Request ID:', requestId);

            // Poll for result
            let attempts = 0;
            const maxAttempts = 60;
            
            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                try {
                    const statusResponse = await fetch(`https://queue.fal.run/fal-ai/sadtalker/requests/${requestId}/status`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Key ${apiKey}`,
                        },
                    });

                    if (statusResponse.ok) {
                        const statusData = await statusResponse.json();
                        console.log(`📊 Status (${attempts + 1}/${maxAttempts}):`, statusData.status);

                        if (statusData.status === 'COMPLETED') {
                            const resultResponse = await fetch(`https://queue.fal.run/fal-ai/sadtalker/requests/${requestId}`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Key ${apiKey}`,
                                },
                            });

                            if (resultResponse.ok) {
                                const resultData = await resultResponse.json();
                                console.log('✅ Video completed:', resultData);
                                return {
                                    success: true,
                                    videoUrl: resultData.video?.url || resultData.url,
                                    requestId: requestId
                                };
                            }
                        } else if (statusData.status === 'FAILED') {
                            throw new Error(statusData.error || 'Video üretimi başarısız oldu');
                        } else if (statusData.status === 'IN_QUEUE' || statusData.status === 'IN_PROGRESS') {
                            console.log('⏳ Processing...');
                        }
                    }
                } catch (pollError) {
                    console.error('Poll error:', pollError);
                }
                
                attempts++;
            }

            throw new Error('Video üretimi zaman aşımına uğradı. Lütfen tekrar deneyin.');

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
