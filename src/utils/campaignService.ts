import { llmService } from './llmService';
import { aiInfluencerService } from './aiInfluencerService';
import { googleSheetsService } from './googleSheetsService';

/**
 * AI Influencer Campaign Service (Direct App Version)
 * Replaces the n8n campaign workflow.
 */

export interface CampaignRequest {
    brand_name: string;
    product_name: string;
    product_description: string;
    influencer_name: string;
    target_audience: string;
    tone: string;
    cta: string;
    influencer_look: string;
    influencer_image_url?: string;
}

export const campaignService = {
    createCampaign: async (request: CampaignRequest) => {
        console.log('🎬 Yerel Kampanya Oluşturuluyor...', request);

        try {
            // 1. Generate Script and Concept via LLM
            const promptContext = `
                Marka: ${request.brand_name}
                Ürün: ${request.product_name}
                Açıklama: ${request.product_description}
                Influencer: ${request.influencer_name} (${request.influencer_look})
                Hedef Kitle: ${request.target_audience}
                Ses Tonu: ${request.tone}
                CTA: ${request.cta}
            `;

            const scriptResponse = await llmService.generateCaption(
                `Reklam Kampanyası Senaryosu: ${request.product_name}`,
                promptContext,
                'instagram_reel'
            );

            // 2. Mock / Generate Additional Assets
            // In a real scenario, we'd fire off multiple AI generations here.
            // For now, we'll use the provided influencer image or generate a new one if missing.
            let mainImage = request.influencer_image_url;
            if (!mainImage) {
                const imgRes = await aiInfluencerService.generateInfluencer({
                    prompt: request.influencer_look,
                    model: 'flux-schnell'
                });
                if (imgRes.success && imgRes.imageUrl) {
                    mainImage = imgRes.imageUrl;
                } else {
                    console.warn('⚠️ Influencer image generation failed:', imgRes.error);
                    mainImage = '';
                }
            }

            // 3. Construct the response object matching the AdCampaignResponse interface
            const result = {
                success: true,
                date: new Date().toISOString(),
                influencer: request.influencer_name,
                brand: request.brand_name,
                product: request.product_name,
                ad_concept: {
                    theme: `${request.brand_name} ile gelecek`,
                    hook: `${request.product_name} ile tanışın`,
                    usp: request.product_description.slice(0, 100) || 'Eşsiz kalite'
                },
                talking_head_ad: {
                    script: {
                        full_script: scriptResponse,
                        sections: [
                            { time: "00:00", text: "Giriş", emotion: "Mutlu" },
                            { time: "00:10", text: "Satış", emotion: "Heyecanlı" }
                        ]
                    },
                    video_url: null,
                    video_status: "pending",
                    source_image: mainImage || ''
                },
                all_images: {
                    influencer_main: mainImage || '',
                    influencer_closeup: mainImage || '',
                    product_hero: mainImage || '',
                    lifestyle: mainImage || ''
                },
                all_videos: {
                    talking_head: null,
                    product: null,
                    lifestyle: null
                },
                instagram: {
                    caption: scriptResponse,
                    hashtags: "#marketing #ai #influencer",
                    cover_text: request.product_name,
                    posting_time: "19:00"
                },
                error: undefined
            };

            // 4. Log to Google Sheets
            if (googleSheetsService.isConfigured()) {
                await googleSheetsService.saveToNamedSheet('influencer', {
                    date: new Date().toLocaleString(),
                    influencerName: request.influencer_name,
                    prompt: `Kampanya Senaryosu: ${scriptResponse}`,
                    imageUrl: mainImage || '',
                    clientName: request.brand_name,
                    type: 'video',
                    metadata: {
                        campaign: 'Direct App Campaign',
                        product: request.product_name
                    }
                });
            }

            return result;
        } catch (error) {
            console.error('Campaign Service Error:', error);
            throw error;
        }
    }
};
