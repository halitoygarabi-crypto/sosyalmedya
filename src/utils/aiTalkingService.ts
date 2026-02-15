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

    getMirakoKey(): string {
        try {
            const savedSettings = localStorage.getItem('ai_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                if (settings.mirakoKey) return settings.mirakoKey.trim();
            }
        } catch {
            // Settings not found or parse error, proceed to fallback
        }

        const envKey = import.meta.env.VITE_MIRAKO_API_KEY;
        if (envKey && envKey !== 'your_mirako_key') return envKey.trim();
        
        // Provided by user: mi_FWR0uI66nLD5yiSt-KjlJvP7PyADve-ewc-i4qXfYJg
        return 'mi_FWR0uI66nLD5yiSt-KjlJvP7PyADve-ewc-i4qXfYJg';
    }

    /**
     * Generate a talking video.
     * Priority: Mirako AI (if key exists) -> fal.ai (SadTalker)
     * HeyGen disabled per user request.
     */
    async generateTalkingVideo(request: TalkingInfluencerRequest): Promise<TalkingInfluencerResponse> {
        const mirakoKey = this.getMirakoKey();
        
        if (mirakoKey) {
            return this.generateWithMirako(request, mirakoKey);
        }

        return this.generateWithFal(request);
    }

    private async generateWithMirako(request: TalkingInfluencerRequest, apiKey: string): Promise<TalkingInfluencerResponse> {
        try {
            console.log('🗣️ Mirako AI kullanılarak konuşturuluyor...');
            
            // Mirako usually accepts image and text
            const response = await fetch('https://mirako.co/v1/video/async_generate_talking_avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: request.imageUrl,
                    audio: request.script,
                    voice_id: request.voiceId || "female_01",
                    negative_prompt: "nsfw, low quality, blurry"
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                const status = response.status;
                console.error(`❌ Mirako AI Error (${status}):`, errorText);
                throw new Error(`Mirako Hatası: ${status} - ${errorText}`);
            }

            const data = await response.json();
            const taskId = data.task_id || data.id;

            if (!taskId) throw new Error('Mirako task ID alınamadı.');

            console.log('⏳ Mirako videosu üretiliyor, Task ID:', taskId);

            // Poll for Mirako result
            let attempts = 0;
            const maxAttempts = 60;
            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                const statusRes = await fetch(`https://mirako.co/v1/video/task/${taskId}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });

                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    const status = statusData.status?.toLowerCase();

                    if (status === 'completed' || status === 'succeeded') {
                        const videoUrl = statusData.video_url || 
                                       statusData.result?.video_url ||
                                       (statusData.results && statusData.results[0]?.url) ||
                                       (statusData.results && statusData.results[0]?.video_url);

                        if (videoUrl) {
                            console.log('✅ Mirako Talking Video Ready:', videoUrl);
                        }

                        return {
                            success: !!videoUrl,
                            videoUrl: videoUrl,
                            error: videoUrl ? undefined : 'Video tamamlandı ancak adresi alınamadı.',
                            requestId: taskId
                        };
                    } else if (status === 'failed' || status === 'error') {
                        throw new Error(`Mirako üretimi başarısız: ${statusData.error_message || 'Bilinmeyen hata'}`);
                    }
                }
                attempts++;
            }
            throw new Error('Mirako zaman aşımı.');
        } catch (error) {
            console.warn('Mirako hatası, fal.ai denenecek:', error);
            return this.generateWithFal(request);
        }
    }

    private async generateWithFal(request: TalkingInfluencerRequest): Promise<TalkingInfluencerResponse> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            return { success: false, error: 'API anahtarı bulunamadı.' };
        }

        try {
            console.log('🗣️ fal.ai (SadTalker) kullanılarak konuşturuluyor...');
            
            // AŞAMA 1: Kling TTS (Bypass cache with timestamp)
            const ttsUrl = `https://fal.run/fal-ai/kling-video/v1/tts?v=${Date.now()}`;
            const ttsResponse = await fetch(ttsUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    text: request.script,
                    voice_id: "genshin_vindi2"
                }),
            });

            if (!ttsResponse.ok) {
                const errText = await ttsResponse.text();
                console.error('❌ fal.ai TTS Error:', errText);
                throw new Error(`TTS Hatası: ${ttsResponse.status}`);
            }
            const ttsData = await ttsResponse.json();
            const audioUrl = ttsData.audio?.url || ttsData.url;

            // AŞAMA 2: SadTalker
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
                    still: true,
                }),
            });

            if (!submitResponse.ok) throw new Error('SadTalker Hatası');
            const submitData = await submitResponse.json();
            const requestId = submitData.request_id;

            // Polling (simplified for length)
            let attempts = 0;
            while (attempts < 30) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                const res = await fetch(`https://queue.fal.run/fal-ai/sadtalker/requests/${requestId}`, {
                    headers: { 'Authorization': `Key ${apiKey}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'COMPLETED') {
                        return { success: true, videoUrl: data.video?.url || data.url, requestId };
                    }
                }
                attempts++;
            }
            throw new Error('fal.ai zaman aşımı.');
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Üretim hatası' };
        }
    }

    isConfigured(): boolean {
        return !!this.getApiKey() || !!this.getMirakoKey();
    }
}

export const aiTalkingService = new AITalkingService();
