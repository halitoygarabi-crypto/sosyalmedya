

export interface SelectedClient {
    id: string;
    company_name: string;
    industry: string | null;
    logo_url: string | null;
    ai_prompt_prefix?: string;
    brand_guidelines?: string;
}

export interface AdCampaignRequest {
    influencer_name: string;
    influencer_gender: string;
    influencer_look: string;
    product_name: string;
    product_description: string;
    brand_name: string;
    ad_type: 'both' | 'talking_head' | 'product_showcase';
    ad_goal: 'awareness' | 'conversion' | 'engagement';
    target_audience: string;
    language: 'tr' | 'en';
    tone: string;
    cta: string;
    influencer_image_url?: string;
    video_duration: string;
    video_model: string;
    video_aspect_ratio: string;
    product_image_url?: string;
    location_image_url?: string;
    talking_script?: string;
}

export interface AdCampaignResponse {
    success: boolean;
    influencer?: string;
    brand?: string;
    product?: string;
    ad_concept?: {
        theme: string;
        hook: string;
        usp: string;
    };
    talking_head_ad?: {
        script: {
            full_script: string;
            sections: Array<{ time: string; text: string; emotion: string }>;
        };
        video_url: string | null;
        video_status: string;
        source_image: string;
    };
    product_ad?: {
        info: {
            scene: string;
            overlay_texts: string[];
            music_mood: string;
        };
        video_url: string | null;
        video_status: string;
        source_image: string;
    };
    lifestyle_ad?: {
        video_url: string | null;
        video_status: string;
        source_image: string;
    };
    all_images?: {
        influencer_main: string;
        influencer_closeup: string;
        product_hero: string;
        lifestyle: string;
    };
    all_videos?: {
        talking_head: string | null;
        product: string | null;
        lifestyle: string | null;
    };
    instagram?: {
        caption: string;
        hashtags: string;
        cover_text: string;
        posting_time: string;
    };
    ab_test_hooks?: string[];
    error?: string;
}

export interface Persona {
    age: string;
    gender: string;
    ethnicity: string;
    style: string;
    location: string;
    activity: string;
}

export interface AIInfluencerGeneratorProps {
    selectedClient?: SelectedClient | null;
}
