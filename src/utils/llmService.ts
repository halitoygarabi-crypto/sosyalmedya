/**
 * LLM Service for generating text content (captions, scripts, etc.)
 * Supports OpenAI GPT-4o directly.
 */

export const llmService = {
    generateCaption: async (
        title: string, 
        clientContext: string = '', 
        platform: string = 'instagram'
    ): Promise<string> => {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        
        if (!apiKey || apiKey === 'your_openai_api_key_here') {
            // Fallback mock if no key
            return `[MOCK AI] ${title} için harika bir ${platform} içeriği! 🚀\n\nBu içerik markanızın hikayesini en iyi şekilde anlatıyor. #AI #SocialMedia`;
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `Sen uzman bir sosyal medya içerik üreticisisin. Verilen başlık ve müşteri bağlamına göre ilgi çekici, etkileşimi yüksek ve profesyonel bir ${platform} açıklaması yaz. Emojiler kullan ve en alakalı 3-5 hashtag ekle. Dil: Türkçe.`
                        },
                        {
                            role: 'user',
                            content: `Başlık: ${title}\nBağlam: ${clientContext}`
                        }
                    ],
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                const errBody = await response.json().catch(() => ({}));
                const errMsg = errBody.error?.message || `OpenAI API ${response.status}`;
                console.error('OpenAI API Error:', errMsg);
                throw new Error(errMsg);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            
            if (!content) {
                throw new Error('OpenAI returned empty response');
            }

            return content;
        } catch (error) {
            console.error('LLM Generation Error:', error);
            // Return a meaningful fallback instead of breaking the flow
            return `${title} için yeni bir heyecan! 🚀 Bizi takipte kalın. #YeniIcerik`;
        }
    },

    generateVideoPrompt: async (
        concept: string, 
        clientContext: string = ''
    ): Promise<string> => {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        
        if (!apiKey || apiKey === 'your_openai_api_key_here') {
            return `Cinematic high-quality video of ${concept}, stunning visuals, 8k, photorealistic, professional lighting.`;
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an expert AI Video Prompt Engineer. Your task is to transform a simple user concept into a highly detailed, cinematic, and effective prompt for AI video generators like Kling, Sora, or Runway. 

The prompts should include:
- Visual details (texture, lighting, colors)
- Camera movement (pan, tilt, zoom, drone shot, etc.)
- Style (hyper-realistic, cinematic, macro, etc.)
- Atmospheric details (fog, sunbeams, motion blur)

CRITICAL: Output ONLY the final English prompt. No explanations.`
                        },
                        {
                            role: 'user',
                            content: `Concept: ${concept}\nContext: ${clientContext}`
                        }
                    ],
                    temperature: 0.8,
                }),
            });

            if (!response.ok) throw new Error('OpenAI Error');
            const data = await response.json();
            return data.choices?.[0]?.message?.content || `Cinematic ${concept}`;
        } catch (error) {
            console.error('Video Prompt Generation Error:', error);
            return `Cinematic high-quality video of ${concept}, professional lighting, 8k resolution.`;
        }
    },
    
    generateTalkingScript: async (
        influencerPrompt: string, 
        clientContext: string = ''
    ): Promise<string> => {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        
        if (!apiKey || apiKey === 'your_openai_api_key_here') {
            return `Merhaba arkadaşlar! Bugün size harika bir yenilikten bahsedeceğim. Bu dijital dünyada fark yaratmak artık çok daha kolay. Hazırsanız başlayalım!`;
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a social media personality and influencer. Write a short, engaging, and natural speech script (20-40 words) for a talking avatar video. 
                            The script should match the persona described in the prompt and the brand context. 
                            The tone should be friendly, confident, and persuasive. 
                            Language: Turkish. 
                            Output ONLY the script text without any labels or quotes.`
                        },
                        {
                            role: 'user',
                            content: `Influencer Persona: ${influencerPrompt}\nBrand/Context: ${clientContext}`
                        }
                    ],
                    temperature: 0.8,
                }),
            });

            if (!response.ok) throw new Error('OpenAI Error');
            const data = await response.json();
            return data.choices?.[0]?.message?.content?.trim() || `Merhaba, bugün size çok özel bir sürprizim var!`;
        } catch (error) {
            console.error('Talking Script Generation Error:', error);
            return `Merhaba arkadaşlar! Bugün size harika bir yenilikten bahsedeceğim. Takipte kalın!`;
        }
    }
};
