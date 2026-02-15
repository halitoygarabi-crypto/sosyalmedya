const MAX_POLL_ATTEMPTS = 30; // Max ~60 seconds of polling
const POLL_INTERVAL_MS = 2000;

// Use a CORS proxy to bypass browser security restrictions for Replicate
const CORS_PROXY = "https://corsproxy.io/?";

function getReplicateKey(): string {
    try {
        const saved = localStorage.getItem('ai_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            if (settings.replicateKey) return settings.replicateKey;
        }
    } catch {
        // Silently fall through to env var
    }
    return import.meta.env.VITE_REPLICATE_API_KEY || '';
}

export const replicateService = {
    generateImage: async (prompt: string, aspectRatio: string = '1:1'): Promise<string | null> => {
        const apiKey = getReplicateKey();

        if (!apiKey) {
            console.warn('⚠️ Replicate API key not found — skipping Replicate.');
            return null;
        }

        try {
            console.log('🎨 Replicate ile görsel üretiliyor (CORS Proxy üzerinden):', prompt);

            const targetUrl = 'https://api.replicate.com/v1/predictions';
            const response = await fetch(CORS_PROXY + encodeURIComponent(targetUrl), {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${apiKey}`,
                    'Content-Type': 'application/json',
                    'x-replicate-proxy': 'true' // Some proxies require this or similar
                },
                body: JSON.stringify({
                    version: "ac732df83cea7fff18b84ebd7730c39917719974546ff33535e3aae633250ed2", // Flux.1 [schnell]
                    input: {
                        prompt: prompt,
                        aspect_ratio: aspectRatio === '9:16' ? '9:16' : aspectRatio === '16:9' ? '16:9' : '1:1',
                        output_format: "webp",
                        num_outputs: 1
                    }
                }),
            });

            if (!response.ok) {
                const errBody = await response.json().catch(() => ({}));
                throw new Error(errBody.detail || `Replicate API ${response.status}`);
            }

            const prediction = await response.json();
            const pollUrl = prediction.urls?.get;

            if (!pollUrl) {
                throw new Error('Replicate did not return a polling URL');
            }

            // Bounded polling for result
            for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
                await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

                const pollResponse = await fetch(CORS_PROXY + encodeURIComponent(pollUrl), {
                    headers: { 'Authorization': `Token ${apiKey}` }
                });

                if (!pollResponse.ok) {
                    console.warn(`Replicate poll attempt ${attempt + 1} failed: ${pollResponse.status}`);
                    continue;
                }

                const status = await pollResponse.json();

                if (status.status === 'succeeded') {
                    return status.output?.[0] ?? null;
                } else if (status.status === 'failed' || status.status === 'canceled') {
                    throw new Error(`Replicate generation ${status.status}: ${status.error || 'Unknown error'}`);
                }
                // else: 'starting' or 'processing' — continue polling
            }

            console.error('Replicate polling timed out');
            return null;
        } catch (error) {
            console.error('Replicate Service Error:', error);
            return null;
        }
    },

    testConnection: async (key?: string): Promise<{ success: boolean; error?: string }> => {
        const apiKey = key || getReplicateKey();
        if (!apiKey) return { success: false, error: 'API anahtarı bulunamadı.' };

        try {
            const targetUrl = 'https://api.replicate.com/v1/predictions';
            const response = await fetch(CORS_PROXY + encodeURIComponent(targetUrl), {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: "ac732df83cea7fff18b84ebd7730c39917719974546ff33535e3aae633250ed2",
                    input: { prompt: "test", num_outputs: 1 }
                }),
            });

            if (response.status === 401) return { success: false, error: 'Geçersiz API anahtarı (Unauthorized).' };
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                return { success: false, error: err.detail || `Hata kodu: ${response.status}` };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Bağlantı hatası (CORS sorunu olabilir).' };
        }
    }
};
