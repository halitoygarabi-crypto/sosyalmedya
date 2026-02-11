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
     * Generate a talking video using fal.ai
     * 1. Generate audio from text using f5-tts
     * 2. Generate video using SadTalker with the generated audio
     */
    async generateTalkingVideo(request: TalkingInfluencerRequest): Promise<TalkingInfluencerResponse> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            return { success: false, error: 'API anahtarı bulunamadı. Ayarlardan fal.ai API anahtarınızı girin.' };
        }

        try {
            console.log('🗣️ AI Influencer konuşturuluyor (2 aşamalı işlem)...');
            console.log('📝 Script:', request.script.substring(0, 50) + '...');

            // AŞAMA 1: Metinden Ses Üretimi (TTS)
            console.log('🔊 Ses üretiliyor (fal-ai/f5-tts)...');
            const ttsResponse = await fetch('https://fal.run/fal-ai/f5-tts', {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gen_text: request.script,
                }),
            });

            if (!ttsResponse.ok) {
                const errorData = await ttsResponse.json().catch(() => ({}));
                throw new Error(`TTS Hatası: ${errorData.detail || ttsResponse.status}`);
            }

            const ttsData = await ttsResponse.json();
            const audioUrl = ttsData.media?.url || ttsData.url;

            if (!audioUrl) {
                throw new Error('Ses dosyası üretilemedi.');
            }

            console.log('✅ Ses üretildi:', audioUrl);

            // AŞAMA 2: Video Üretimi (SadTalker)
            console.log('🎬 Dudak senkronizasyonu yapılıyor (fal-ai/sadtalker)...');
            const submitResponse = await fetch('https://queue.fal.run/fal-ai/sadtalker', {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source_image_url: request.imageUrl,
                    driven_audio_url: audioUrl,
                    face_model_resolution: '512',
                    expression_scale: 1.0,
                    preprocess: 'crop',
                    still: true, // Movement is more stable
                }),
            });

            if (!submitResponse.ok) {
                const errorData = await submitResponse.json().catch(() => ({}));
                throw new Error(`Video Hatası: ${errorData.detail || submitResponse.status}`);
            }

            const submitData = await submitResponse.json();
            const requestId = submitData.request_id;

            if (!requestId) {
                return {
                    success: true,
                    videoUrl: submitData.video?.url || submitData.url,
                    requestId: 'sync'
                };
            }

            console.log('⏳ İşlem kuyruğa alındı, Request ID:', requestId);

            // Poll for result
            let attempts = 0;
            const maxAttempts = 120; // Video can take longer
            
            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 3000)); // Poll every 3 seconds
                
                try {
                    const statusResponse = await fetch(`https://queue.fal.run/fal-ai/sadtalker/requests/${requestId}/status`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Key ${apiKey}`,
                        },
                    });

                    if (statusResponse.ok) {
                        const statusData = await statusResponse.json();
                        
                        if (statusData.status === 'COMPLETED') {
                            const resultResponse = await fetch(`https://queue.fal.run/fal-ai/sadtalker/requests/${requestId}`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Key ${apiKey}`,
                                },
                            });

                            if (resultResponse.ok) {
                                const resultData = await resultResponse.json();
                                return {
                                    success: true,
                                    videoUrl: resultData.video?.url || resultData.url,
                                    requestId: requestId
                                };
                            }
                        } else if (statusData.status === 'FAILED') {
                            throw new Error(statusData.error || 'Video üretimi başarısız oldu');
                        }
                    }
                } catch (pollError) {
                    console.warn('Poll status error (retrying):', pollError);
                }
                
                attempts++;
            }

            throw new Error('Video üretimi zaman aşımına uğradı.');

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
