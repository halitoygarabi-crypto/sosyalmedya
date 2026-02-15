import React, { useState, useCallback, useEffect } from 'react';
import {
    Users,
    Sparkles,
    Wand2,
    Download,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Loader2,
    UserPlus,
    Camera,
    Hash,
    Heart,
    MessageSquare,
    Play,
    Video,
    Settings,
    Megaphone,
    Target,
    Image,
    Film,
    Send,
    X,
    FileText,
} from 'lucide-react';
import { googleSheetsService } from '../utils/googleSheetsService';
import type { SheetEntry } from '../utils/googleSheetsService';
import { aiInfluencerService } from '../utils/aiInfluencerService';
import { aiTalkingService } from '../utils/aiTalkingService';
import { ltxVideoService } from '../utils/ltxVideoService';
import { mirakoService } from '../utils/mirakoService';
import type { InfluencerGenerationRequest, InfluencerGenerationResponse } from '../utils/aiInfluencerService';
import { useDashboard } from '../context/DashboardContext';

import { campaignService } from '../utils/campaignService';

interface SelectedClient {
    id: string;
    name: string;
    industry: string | null;
    logo_url: string | null;
    ai_prompt_prefix?: string;
    brand_guidelines?: string;
}

interface AIInfluencerGeneratorProps {
    selectedClient?: SelectedClient | null;
}

interface AdCampaignRequest {
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

interface AdCampaignResponse {
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

const AIInfluencerGenerator: React.FC<AIInfluencerGeneratorProps> = ({ selectedClient }) => {
    const { addNotification } = useDashboard();

    const [provider, setProvider] = useState<'fal' | 'mirako'>('fal');
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
    const [model, setModel] = useState<'flux-pro' | 'flux-schnell'>('flux-schnell');
    
    // Character Settings
    const [persona, setPersona] = useState({
        age: '25',
        gender: 'woman',
        ethnicity: 'European',
        style: 'fashion influencer',
        location: 'Paris cafe',
        activity: 'looking at camera with a smile'
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [result, setResult] = useState<InfluencerGenerationResponse | null>(null);
    const [animatedVideo, setAnimatedVideo] = useState<string | null>(null);
    const [script, setScript] = useState('');
    const [history, setHistory] = useState<InfluencerGenerationResponse[]>(() => {
        try {
            const savedHistory = localStorage.getItem('ai_influencer_history');
            return savedHistory ? JSON.parse(savedHistory) : [];
        } catch (e) {
            console.error('Failed to parse history from localStorage:', e);
            return [];
        }
    });

    // Persist history to localStorage
    useEffect(() => {
        localStorage.setItem('ai_influencer_history', JSON.stringify(history));
    }, [history]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                const newResponse: InfluencerGenerationResponse = {
                    success: true,
                    imageUrl,
                    requestId: `local_${Date.now()}`
                };
                setResult(newResponse);
                setHistory(prev => [newResponse, ...prev].slice(0, 20));
                addNotification({ type: 'success', message: '✅ Görsel başarıyla yüklendi!', read: false });
            };
            reader.readAsDataURL(file);
        }
    };

    const [talkingProvider, setTalkingProvider] = useState<'sadtalker' | 'mirako'>('sadtalker');
    
    // API Key state
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [apiKey, setApiKey] = useState(aiInfluencerService.getApiKey());

    // n99 AI Influencer Ads Campaign State
    const [showAdCampaignModal, setShowAdCampaignModal] = useState(false);
    const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
    const [campaignResult, setCampaignResult] = useState<AdCampaignResponse | null>(null);
    const [generatingVideos, setGeneratingVideos] = useState<Record<string, boolean>>({});
    const [adCampaign, setAdCampaign] = useState<AdCampaignRequest>({
        influencer_name: 'Luna AI',
        influencer_gender: 'female',
        influencer_look: 'Young Turkish woman, mid-20s, long dark hair, brown eyes, natural glowing makeup, warm confident smile',
        product_name: '',
        product_description: '',
        brand_name: selectedClient?.name || '',
        ad_type: 'both',
        ad_goal: 'conversion',
        target_audience: '25-40 yaş arası, dijital ürünlere ilgi duyan',
        language: 'tr',
        tone: 'samimi, güvenilir, bilgilendirici',
        cta: 'Hemen dene! 💫',
        influencer_image_url: undefined,
        video_duration: '5',
        video_model: 'kling-2.1-standard',
        video_aspect_ratio: '9:16',
        product_image_url: undefined,
        location_image_url: undefined,
        talking_script: ''
    });

    const [isSavingToSheet, setIsSavingToSheet] = useState(false);
    const [isLoadingFromSheet, setIsLoadingFromSheet] = useState(false);
    const [sheetWebhookUrl, setSheetWebhookUrl] = useState(googleSheetsService.getWebhookUrl());
    const [cloudHistory, setCloudHistory] = useState<SheetEntry[]>([]);
    const [activeTab, setActiveTab] = useState<'local' | 'cloud'>('local');

    // Update brand name and product description when selected client or influencer prompt changes
    useEffect(() => {
        if (selectedClient) {
            setAdCampaign(prev => {
                const industryInfo = selectedClient.industry ? `Sektör: ${selectedClient.industry}\n` : '';
                const guidelinesInfo = selectedClient.brand_guidelines ? `Marka Yönergeleri: ${selectedClient.brand_guidelines}\n` : '';
                const logoInfo = selectedClient.logo_url ? `Marka Logosu / Dosyası: ${selectedClient.logo_url}\n` : '';
                
                // Only populate if current description is empty or only contains previous brand info
                const brandInfo = `${industryInfo}${guidelinesInfo}${logoInfo}`;
                
                return { 
                    ...prev, 
                    brand_name: selectedClient.name,
                    product_description: prev.product_description || brandInfo,
                    target_audience: prev.target_audience || (selectedClient.industry ? `${selectedClient.industry} ürünleriyle ilgilenen kitle` : prev.target_audience),
                    // influencer_look auto-updates from the current influencer generation prompt
                    influencer_look: prompt || prev.influencer_look
                };
            });
        }
    }, [selectedClient, prompt]);

    const updatePromptFromPersona = useCallback(() => {
        const fullPrompt = `High-quality professional photo of a ${persona.age} year old ${persona.ethnicity} ${persona.gender}, ${persona.style}, ${persona.activity}, at a ${persona.location}, detailed features, realistic skin texture, 8k resolution, cinematic lighting, shot on 35mm lens.`;
        setPrompt(fullPrompt);
    }, [persona]);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            addNotification({ type: 'warning', message: 'Lütfen bir açıklama girin veya persona ayarlarını kullanın', read: false });
            return;
        }

        const isConfigured = provider === 'fal' 
            ? aiInfluencerService.isConfigured() 
            : mirakoService.isConfigured();

        if (!isConfigured) {
            setShowApiKeyModal(true);
            return;
        }

        setIsGenerating(true);
        setResult(null);
        addNotification({ type: 'info', message: '📸 AI Influencer görseli üretiliyor...', read: false });

        // Build augmented prompt with client context
        let augmentedPrompt = '';
        if (selectedClient?.ai_prompt_prefix) {
            augmentedPrompt += `${selectedClient.ai_prompt_prefix} `;
        }
        augmentedPrompt += prompt;

        let response: InfluencerGenerationResponse;

        if (provider === 'fal') {
            const request: InfluencerGenerationRequest = {
                prompt: augmentedPrompt,
                aspectRatio,
                model,
            };
            response = await aiInfluencerService.generateInfluencer(request);
        } else {
            // Mirako AI
            const mirakoResponse = await mirakoService.generateImage({
                prompt,
                aspectRatio,
            });
            
            response = {
                success: mirakoResponse.success,
                imageUrl: mirakoResponse.videoUrl, // Mirako returns URL in videoUrl field for both images and videos in our response wrapper
                error: mirakoResponse.error,
                requestId: mirakoResponse.requestId
            };
        }

        setIsGenerating(false);
        setResult(response);

        if (response.success) {
            addNotification({ type: 'success', message: '✅ Görsel başarıyla oluşturuldu!', read: false });
            setHistory(prev => [response, ...prev].slice(0, 10));
        } else {
            addNotification({ type: 'error', message: `❌ ${response.error}`, read: false });
        }
    }, [prompt, aspectRatio, model, addNotification, provider, selectedClient]);

    const handleGenerateScript = useCallback(async () => {
        setIsGeneratingScript(true);
        addNotification({ type: 'info', message: '✍️ Konuşma metni hazırlanıyor...', read: false });
        
        try {
            const context = selectedClient ? `${selectedClient.company_name} - ${selectedClient.industry}` : '';
            const generatedScript = await llmService.generateTalkingScript(prompt, context);
            setScript(generatedScript);
            addNotification({ type: 'success', message: '✨ Video betiği başarıyla üretildi!', read: false });
        } catch (error) {
            addNotification({ type: 'error', message: '❌ Metin üretilemedi', read: false });
        } finally {
            setIsGeneratingScript(false);
        }
    }, [prompt, selectedClient, addNotification]);

    const handleAnimate = useCallback(async () => {
        if (!result?.imageUrl) return;
        if (!script.trim()) {
            addNotification({ type: 'warning', message: 'Lütfen influencer\'ın söyleyeceği bir metin girin', read: false });
            return;
        }

        setIsAnimating(true);
        setAnimatedVideo(null);
        addNotification({ type: 'info', message: '🎬 AI Influencer konuşturuluyor...', read: false });

        let videoResponse;
        
        if (talkingProvider === 'sadtalker') {
            videoResponse = await aiTalkingService.generateTalkingVideo({
                imageUrl: result.imageUrl,
                script: script
            });
        } else {
            // Use Mirako for image-to-video
            videoResponse = await mirakoService.generateVideo({
                prompt: script,
                imageUrl: result.imageUrl,
                aspectRatio: aspectRatio,
            });
        }

        setIsAnimating(false);
        if (videoResponse.success && videoResponse.videoUrl) {
            setAnimatedVideo(videoResponse.videoUrl);
            addNotification({ type: 'success', message: '✅ Video başarıyla oluşturuldu!', read: false });
            
            // Add to history
            const videoEntry: InfluencerGenerationResponse = {
                success: true,
                imageUrl: result.imageUrl, // Use the base image as thumbnail
                videoUrl: videoResponse.videoUrl,
                type: 'video',
                requestId: videoResponse.requestId || `video_${Date.now()}`
            };
            setHistory(prev => [videoEntry, ...prev].slice(0, 15));

            // Buluta Kaydet (Otomatik)
            googleSheetsService.saveToNamedSheet('influencer', {
                date: new Date().toLocaleString('tr-TR'),
                influencerName: adCampaign.influencer_name,
                prompt: `Video Scripti: ${script}`,
                imageUrl: videoResponse.videoUrl,
                clientName: selectedClient?.name || 'Genel',
                type: 'video',
                metadata: {
                    model: talkingProvider,
                    aspectRatio,
                    campaign: 'Talking Avatar'
                }
            }).then(resp => {
                if (resp.success) addNotification({ type: 'success', message: '📊 Video Google Sheet\'e başarıyla yedeklendi!', read: false });
            });
        } else {
            addNotification({ type: 'error', message: `❌ ${videoResponse.error}`, read: false });
        }
    }, [result, script, addNotification, talkingProvider, aspectRatio]);

    const handleGenerateCampaignVideo = async (type: 'talking_head' | 'product' | 'lifestyle') => {
        if (!campaignResult) return;

        setGeneratingVideos(prev => ({ ...prev, [type]: true }));
        addNotification({ type: 'info', message: `🎬 Kling AI ile ${type.replace('_', ' ')} videosu üretiliyor...`, read: false });

        try {
            let prompt = '';
            let imageUrl = '';
            let mode: 'text-to-video' | 'image-to-video' = 'text-to-video';

            if (type === 'talking_head' && campaignResult.talking_head_ad) {
                prompt = campaignResult.talking_head_ad.script.full_script;
                imageUrl = campaignResult.talking_head_ad.source_image;
                mode = 'image-to-video';
            } else if (type === 'product' && campaignResult.product_ad) {
                prompt = campaignResult.product_ad.info.scene;
                imageUrl = campaignResult.product_ad.source_image;
                mode = 'image-to-video';
            } else if (type === 'lifestyle' && campaignResult.lifestyle_ad) {
                prompt = `Beautiful cinematic lifestyle shot for ${campaignResult.brand}'s ${campaignResult.product}`;
                imageUrl = campaignResult.lifestyle_ad.source_image;
                mode = 'image-to-video';
            }

            const request = {
                prompt,
                imageUrl,
                aspectRatio: adCampaign.video_aspect_ratio as '16:9' | '9:16' | '1:1' | '4:3',
                duration: parseInt(adCampaign.video_duration) || 5
            };

            let response;
            if (mode === 'image-to-video') {
                response = await ltxVideoService.generateFromImage(request);
            } else {
                response = await ltxVideoService.generateFromText(request);
            }

            if (response.success && response.videoUrl) {
                // Update campaign result
                setCampaignResult(prev => {
                    if (!prev) return null;
                    const newAllVideos = { 
                        ...prev.all_videos, 
                        [type]: (response.videoUrl as string) || null 
                    };
                    return { ...prev, all_videos: newAllVideos } as AdCampaignResponse;
                });
                addNotification({ type: 'success', message: `✅ ${type.replace('_', ' ')} videosu hazır!`, read: false });
            } else {
                throw new Error(response.error || 'Video üretilemedi');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addNotification({ type: 'error', message: `❌ Video hatası: ${errorMessage}`, read: false });
        } finally {
            setGeneratingVideos(prev => ({ ...prev, [type]: false }));
        }
    };

    // n99 AI Influencer Ads Campaign Handler
    const handleCreateAdCampaign = useCallback(async () => {
        if (!adCampaign.product_name.trim() || !adCampaign.product_description.trim()) {
            addNotification({ type: 'warning', message: 'Lütfen ürün adı ve açıklamasını girin', read: false });
            return;
        }

        setIsCreatingCampaign(true);
        setCampaignResult(null);
        
        // Ensure the current result image is passed if not explicitly set
        const selectedImageUrl = adCampaign.influencer_image_url || result?.imageUrl;

        addNotification({ type: 'info', message: '🎬 AI Influencer reklam kampanyası oluşturuluyor... Bu işlem 2-5 dakika sürebilir.', read: false });

        try {
            const data = (await campaignService.createCampaign({
                brand_name: adCampaign.brand_name,
                product_name: adCampaign.product_name,
                product_description: adCampaign.product_description,
                influencer_name: adCampaign.influencer_name,
                target_audience: adCampaign.target_audience,
                tone: adCampaign.tone,
                cta: adCampaign.cta,
                influencer_look: adCampaign.influencer_look,
                influencer_image_url: selectedImageUrl
            })) as AdCampaignResponse;
            
            setIsCreatingCampaign(false);
            setCampaignResult(data);

            if (data.success) {
                addNotification({ 
                    type: 'success', 
                    message: `✅ Reklam kampanyası başarıyla oluşturuldu! ${data.all_images ? '4 görsel' : ''} ${data.all_videos ? '+ 3 video' : ''} hazır.`, 
                    read: false 
                });

                // Buluta Kaydet (Otomatik)
                if (data.talking_head_ad?.script?.full_script) {
                    googleSheetsService.saveToNamedSheet('influencer', {
                        date: new Date().toLocaleString('tr-TR'),
                        influencerName: data.influencer || adCampaign.influencer_name,
                        prompt: `Video Senaryosu: ${data.talking_head_ad.script.full_script}`,
                        imageUrl: data.talking_head_ad.video_url || result?.imageUrl || '',
                        clientName: selectedClient?.name || 'Genel',
                        type: 'video',
                        metadata: {
                            model: adCampaign.video_model,
                            aspectRatio: adCampaign.video_aspect_ratio,
                            campaign: 'Reklam Kampanyası'
                        }
                    });
                }
            } else {
                addNotification({ type: 'error', message: `❌ ${data.error || 'Kampanya oluşturulamadı'}`, read: false });
            }
        } catch (error) {
            setIsCreatingCampaign(false);
            const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
            addNotification({ type: 'error', message: `❌ Kampanya hatası: ${errorMessage}`, read: false });
            setCampaignResult({ success: false, error: errorMessage });
        }
    }, [adCampaign, addNotification, result?.imageUrl, selectedClient?.name]);

    const handleSaveToSheet = useCallback(async () => {
        const urlToSave = animatedVideo || result?.imageUrl;
        if (!urlToSave) return;

        setIsSavingToSheet(true);
        const entry: SheetEntry = {
            date: new Date().toLocaleString('tr-TR'),
            influencerName: adCampaign.influencer_name,
            prompt: animatedVideo ? `Video Scripti: ${script}` : prompt,
            imageUrl: urlToSave,
            clientName: selectedClient?.name || 'Genel',
            type: animatedVideo ? 'video' : 'image',
            metadata: {
                model: animatedVideo ? talkingProvider : model,
                aspectRatio,
                provider
            }
        };

        const response = await googleSheetsService.saveToNamedSheet('influencer', entry);
        setIsSavingToSheet(false);

        if (response.success) {
            addNotification({ type: 'success', message: `📊 ${animatedVideo ? 'Video' : 'Görsel'} Google Sheet'e başarıyla kaydedildi!`, read: false });
        } else {
            addNotification({ type: 'error', message: `❌ Kayıt hatası: ${response.error}`, read: false });
            if (!googleSheetsService.isConfigured()) {
                setShowApiKeyModal(true);
            }
        }
    }, [result, animatedVideo, script, adCampaign.influencer_name, prompt, selectedClient, model, aspectRatio, provider, talkingProvider, addNotification]);

    const handleFetchFromSheet = useCallback(async () => {
        setIsLoadingFromSheet(true);
        try {
            const data = await googleSheetsService.fetchData('influencer');
            setCloudHistory(data);
            setActiveTab('cloud');
            addNotification({ type: 'success', message: '📊 Google Sheet verileri başarıyla çekildi!', read: false });
        } catch (error) {
            console.error('Fetch error:', error);
            addNotification({ type: 'error', message: '❌ Veriler çekilemedi. Webhook URL\'nizi kontrol edin.', read: false });
        } finally {
            setIsLoadingFromSheet(false);
        }
    }, [addNotification]);

    const personaTemplates = [
        { name: 'Moda İkonu', style: 'fashion influencer wearing elegant designer clothes', location: 'Milan street' },
        { name: 'Gezgin', style: 'travel blogger in outdoor gear', location: 'Swiss Alps' },
        { name: 'Teknoloji / Gaming', style: 'streamer with gaming headphones', location: 'cyberpunk style room' },
        { name: 'Fitness', style: 'fitness model in gym wear', location: 'modern gym' },
        { name: 'Mobilya', style: 'interior designer showcasing modern luxury furniture', location: 'minimalist sunlit living room' },
        { name: 'Butik', style: 'stylish boutique owner presenting new collection', location: 'chic upscale fashion boutique' },
        { name: 'İnşaat', style: 'professional civil engineer in hard hat and safety vest', location: 'modern skyscraper construction site' }
    ];

    return (
        <div className="section animate-fadeIn">
            {/* Header */}
            <div className="section-header" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div>
                    <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <Users size={24} style={{ color: 'var(--accent-primary)' }} />
                        AI Influencer Oluşturucu
                    </h2>
                    <p className="text-muted text-sm">Hayali karakterler ve profesyonel sosyal medya içerikleri üretin</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowAdCampaignModal(true)}
                        style={{ 
                            background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
                            boxShadow: '0 4px 15px rgba(244, 63, 94, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Megaphone size={18} />
                        <span>AI Reklam Kampanyası</span>
                    </button>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => {
                            setApiKey(provider === 'fal' ? aiInfluencerService.getApiKey() : mirakoService.getApiKey());
                            setShowApiKeyModal(true);
                        }}
                        title="API Ayarları"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr 320px', gap: 'var(--spacing-xl)', alignItems: 'start' }}>
                {/* Column 1: Configuration & Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    {/* Provider Toggle */}
                    <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button
                                className={`btn ${provider === 'fal' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setProvider('fal')}
                                style={{ flex: 1, fontSize: '0.8rem' }}
                            >
                                <span>fal.ai (Flux)</span>
                            </button>
                            <button
                                className={`btn ${provider === 'mirako' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setProvider('mirako')}
                                style={{ flex: 1, fontSize: '0.8rem' }}
                            >
                                <span>Mirako AI</span>
                            </button>
                        </div>
                    </div>

                    {/* Persona Settings */}
                    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                        <h3 className="card-title" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <UserPlus size={18} color="var(--accent-primary)" />
                            Karakter Özellikleri
                        </h3>
                        
                        <div className="grid-2" style={{ gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                            <div className="input-group">
                                <label className="input-label">Yaş</label>
                                <select 
                                    className="input select" 
                                    value={persona.age}
                                    onChange={(e) => setPersona({...persona, age: e.target.value})}
                                >
                                    <option value="18">18</option>
                                    <option value="25">25</option>
                                    <option value="30">30</option>
                                    <option value="40">40</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Cinsiyet</label>
                                <select 
                                    className="input select"
                                    value={persona.gender}
                                    onChange={(e) => setPersona({...persona, gender: e.target.value})}
                                >
                                    <option value="woman">Kadın</option>
                                    <option value="man">Erkek</option>
                                    <option value="non-binary">Non-binary</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label className="input-label">Tarz / Meslek</label>
                            <input 
                                type="text" 
                                className="input" 
                                placeholder="Örn: fitness model, tech expert..."
                                value={persona.style}
                                onChange={(e) => setPersona({...persona, style: e.target.value})}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label className="input-label">Mekan</label>
                            <input 
                                type="text" 
                                className="input" 
                                placeholder="Örn: futuristic studio, beach, penthouse..."
                                value={persona.location}
                                onChange={(e) => setPersona({...persona, location: e.target.value})}
                            />
                        </div>

                        <button 
                            className="btn btn-secondary btn-full btn-sm"
                            onClick={updatePromptFromPersona}
                            style={{ marginTop: 'var(--spacing-sm)' }}
                        >
                            <Wand2 size={14} />
                            <span>Persona ile Prompt Oluştur</span>
                        </button>

                        <div style={{ marginTop: 'var(--spacing-lg)' }}>
                            <p className="text-xs text-muted mb-sm">Hazır Şablonlar veya Yerel Yükleme:</p>
                            <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap', marginBottom: 'var(--spacing-md)' }}>
                                {personaTemplates.map((t, i) => (
                                    <button 
                                        key={i} 
                                        className="btn btn-ghost"
                                        style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                                        onClick={() => {
                                            setPersona({...persona, style: t.style, location: t.location});
                                            const p = `High-quality professional photo of a ${persona.age} year old ${persona.ethnicity} ${persona.gender}, ${t.style}, at a ${t.location}, detailed realistic features, 8k resolution.`;
                                            setPrompt(p);
                                        }}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                            
                            <label className="btn btn-secondary btn-full btn-sm" style={{ cursor: 'pointer' }}>
                                <Download size={14} style={{ transform: 'rotate(180deg)' }} />
                                <span>Bilgisayardan Dosya Seç</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    style={{ display: 'none' }} 
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Final Prompt */}
                    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                        <h3 className="card-title" style={{ marginBottom: 'var(--spacing-md)' }}>
                            <Sparkles size={18} color="gold" />
                            Prompt (Açıklama)
                        </h3>
                        <textarea 
                            className="input"
                            rows={4}
                            placeholder="Karakterinizi ve yapacağı aktiviteyi detaylıca anlatın..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            style={{ resize: 'vertical', minHeight: '120px', marginBottom: 'var(--spacing-lg)' }}
                        />

                        <div className="grid-2" style={{ gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                            <div className="input-group">
                                <label className="input-label">Oran</label>
                                <select 
                                    className="input select" 
                                    value={aspectRatio}
                                    onChange={(e) => setAspectRatio(e.target.value as '1:1' | '16:9' | '9:16' | '4:3')}
                                >
                                    <option value="1:1">1:1 Kare (Instagram)</option>
                                    <option value="9:16">9:16 Dikey (Story/Reels)</option>
                                    <option value="16:9">16:9 Yatay</option>
                                    <option value="4:3">4:3 Klasik</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Kalite Modu</label>
                                <select 
                                    className="input select"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value as 'flux-pro' | 'flux-schnell')}
                                    disabled={provider === 'mirako'}
                                >
                                    {provider === 'fal' ? (
                                        <>
                                            <option value="flux-schnell">Hızlı (Schnell)</option>
                                            <option value="flux-pro">Ultra Kalite (Pro)</option>
                                        </>
                                    ) : (
                                        <option value="flux-pro">Mirako AI Soul</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        <button 
                            className="btn btn-primary btn-lg btn-full"
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim()}
                            style={{ 
                                background: 'var(--accent-gradient)',
                                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                                height: '56px',
                                fontSize: '1rem'
                            }}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={24} className="spin" />
                                    <span>Görsel Üretiliyor...</span>
                                </>
                            ) : (
                                <>
                                    <Camera size={24} />
                                    <span>Influencer Oluştur</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                        <h3 className="card-title mb-md">Tahmini Etkileşim</h3>
                        <div style={{ display: 'flex', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>
                            <div style={{ flex: 1, background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                <Heart size={16} color="#f43f5e" />
                                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>24.5K</div>
                                <div className="text-xs text-muted">Beğeni</div>
                            </div>
                            <div style={{ flex: 1, background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                <Hash size={16} color="var(--accent-primary)" />
                                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>4.8%</div>
                                <div className="text-xs text-muted">Etkileşim</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Main Stage (Result & Video) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <div className="card" style={{ padding: 'var(--spacing-xl)', minHeight: '500px', display: 'flex', flexDirection: 'column', border: '1px solid var(--accent-primary)', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {animatedVideo ? <Video size={20} color="var(--accent-primary)" /> : <Camera size={20} color="var(--accent-primary)" />}
                                {animatedVideo ? 'Canlı Influencer (Video)' : 'Influencer Önizleme'}
                            </h3>
                            {(result?.success || animatedVideo) && (
                                <div className="badge badge-success">
                                    <CheckCircle size={12} />
                                    <span>{animatedVideo ? 'Video Hazır' : 'Görsel Hazır'}</span>
                                </div>
                            )}
                        </div>

                        {isGenerating || isAnimating ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                                <div className="spinner" style={{ width: '50px', height: '50px', marginBottom: 'var(--spacing-lg)' }} />
                                <p className="text-muted" style={{ fontWeight: 500 }}>
                                    {isGenerating ? 'AI karakteri hayal ediyor...' : 'Karakter konuşturuluyor, lütfen bekleyin...'}
                                </p>
                                <p className="text-xs text-muted mt-sm">Mirako AI sunucuları meşgul olabilir (30-60 sn sürebilir)</p>
                            </div>
                        ) : animatedVideo ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <video 
                                    src={animatedVideo} 
                                    controls 
                                    autoPlay 
                                    loop 
                                    style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                                />
                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}>
                                    <a href={animatedVideo} target="_blank" download className="btn btn-secondary" style={{ flex: 1 }}>
                                        <Download size={18} /> İndir
                                    </a>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={() => {
                                            setAdCampaign(prev => ({ ...prev, influencer_image_url: animatedVideo }));
                                            setShowAdCampaignModal(true);
                                        }}
                                        style={{ 
                                            flex: 2,
                                            background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
                                        }}
                                    >
                                        <Megaphone size={18} /> Bu Videoyla Reklam Yap
                                    </button>
                                    <button 
                                        className="btn btn-secondary" 
                                        onClick={handleSaveToSheet}
                                        disabled={isSavingToSheet}
                                        title="Google Sheets'e Kaydet"
                                        style={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px',
                                            padding: '8px'
                                        }}
                                    >
                                        {isSavingToSheet ? <Loader2 size={18} className="spin" /> : <FileText size={18} />}
                                        <span className="text-xs">Sheet</span>
                                    </button>
                                    <button 
                                        className="btn btn-ghost btn-icon" 
                                        onClick={() => setAnimatedVideo(null)}
                                        title="Görsele Dön"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : result?.success ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                    <img src={result.imageUrl} alt="AI Influencer" style={{ width: '100%', display: 'block' }} />
                                    <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: 'var(--spacing-lg)', color: 'white' }}>
                                        <span style={{ fontWeight: 600 }}>C1 Character Model</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}>
                                    <a href={result.imageUrl} target="_blank" className="btn btn-secondary" rel="noopener noreferrer" style={{ flex: 1 }}>
                                        <Download size={18} /> İndir
                                    </a>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={() => {
                                            setAdCampaign(prev => ({ ...prev, influencer_image_url: result.imageUrl }));
                                            setShowAdCampaignModal(true);
                                        }}
                                        style={{ 
                                            flex: 2,
                                            background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
                                        }}
                                    >
                                        <Megaphone size={18} /> Bu Görselle Reklam Yap
                                    </button>
                                    <button 
                                        className="btn btn-secondary" 
                                        onClick={handleSaveToSheet}
                                        disabled={isSavingToSheet}
                                        title="Google Sheets'e Kaydet"
                                        style={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px',
                                            padding: '8px'
                                        }}
                                    >
                                        {isSavingToSheet ? <Loader2 size={18} className="spin" /> : <FileText size={18} />}
                                        <span className="text-xs">Sheet</span>
                                    </button>
                                </div>
                            </div>
                        ) : result?.error ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                                <AlertCircle size={48} color="var(--error)" style={{ marginBottom: 'var(--spacing-md)' }} />
                                <p style={{ color: 'var(--error)', fontWeight: 600 }}>İşlem Hatası</p>
                                <p className="text-sm text-muted">{result.error}</p>
                            </div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                                <Users size={48} className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }} />
                                <p className="text-muted text-sm px-xl text-center">Henüz bir içerik üretilmedi. Sol taraftan özellikleri belirleyip "Oluştur" butonuna basın.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 3: History & Tools */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    {/* History Tabs */}
                    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-sm)' }}>
                            <button 
                                onClick={() => setActiveTab('local')}
                                style={{ 
                                    padding: '4px 8px', 
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    background: activeTab === 'local' ? 'var(--accent-primary)' : 'transparent',
                                    color: activeTab === 'local' ? 'white' : 'var(--text-muted)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    flex: 1
                                }}
                            >
                                Yerel
                            </button>
                            <button 
                                onClick={() => {
                                    setActiveTab('cloud');
                                    if (cloudHistory.length === 0) handleFetchFromSheet();
                                }}
                                style={{ 
                                    padding: '4px 8px', 
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    background: activeTab === 'cloud' ? 'var(--accent-primary)' : 'transparent',
                                    color: activeTab === 'cloud' ? 'white' : 'var(--text-muted)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    flex: 1
                                }}
                            >
                                Bulut {isLoadingFromSheet && <Loader2 size={10} className="spin" />}
                            </button>
                            <button 
                                onClick={handleFetchFromSheet}
                                disabled={isLoadingFromSheet}
                                style={{ 
                                    padding: '0 4px',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer'
                                }}
                                title="Yenile"
                            >
                                <RefreshCw size={12} className={isLoadingFromSheet ? 'spin' : ''} />
                            </button>
                        </div>

                        {activeTab === 'local' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-sm)' }}>
                                {history.length > 0 ? history.map((h, i) => (
                                    <div 
                                        key={i} 
                                        style={{ 
                                            aspectRatio: '1', 
                                            borderRadius: 'var(--radius-sm)', 
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: result?.imageUrl === h.imageUrl ? '2px solid var(--accent-primary)' : 'none',
                                            position: 'relative',
                                        }}
                                        onClick={() => {
                                            if (h.type === 'video' || h.videoUrl) {
                                                setResult({ success: true, imageUrl: h.imageUrl });
                                                setAnimatedVideo(h.videoUrl || null);
                                            } else {
                                                setResult(h);
                                                setAnimatedVideo(null);
                                            }
                                        }}
                                    >
                                        <img src={h.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        {(h.type === 'video' || h.videoUrl) && (
                                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(99, 102, 241, 0.8)', borderRadius: '50%', padding: '4px' }}>
                                                <Play size={16} color="white" fill="white" />
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: 'var(--spacing-md)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                                        Yerel geçmiş yok.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-sm)' }}>
                                {cloudHistory.length > 0 ? cloudHistory.map((h, i) => (
                                    <div 
                                        key={i} 
                                        style={{ 
                                            aspectRatio: '1', 
                                            borderRadius: 'var(--radius-sm)', 
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: result?.imageUrl === h.imageUrl ? '2px solid var(--accent-primary)' : 'none',
                                            position: 'relative',
                                        }}
                                        onClick={() => {
                                            if (h.imageUrl) {
                                                setResult({ success: true, imageUrl: h.imageUrl });
                                                if (h.prompt) setPrompt(h.prompt);
                                                if (h.influencerName) setAdCampaign(prev => ({ ...prev, influencer_name: h.influencerName || prev.influencer_name }));
                                                setAnimatedVideo(null);
                                            }
                                        }}
                                        title={`${h.influencerName}\n${h.prompt}`}
                                    >
                                        <img src={h.imageUrl} alt={`Cloud ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )) : (
                                    <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: 'var(--spacing-md)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                                        {isLoadingFromSheet ? 'Yükleniyor...' : 'Bulutta görsel yok.'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Animation Section */}
                    {result?.success && (
                        <div className="card" style={{ padding: 'var(--spacing-xl)', border: '1px solid var(--accent-primary)', background: 'rgba(99, 102, 241, 0.02)' }}>
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-md)' }}>
                                <Video size={18} color="var(--accent-primary)" />
                                Karakteri Konuştur (AI Video)
                            </h3>
                            <p className="text-xs text-muted mb-md">Seçili influencer görselini videoya dönüştürün ve konuşturun.</p>
                            
                            {/* Video Provider Selector */}
                            <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)' }}>
                                <button
                                    className={`btn btn-sm ${talkingProvider === 'sadtalker' ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => setTalkingProvider('sadtalker')}
                                    style={{ flex: 1, fontSize: '0.7rem' }}
                                >
                                    SadTalker
                                </button>
                                <button
                                    className={`btn btn-sm ${talkingProvider === 'mirako' ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => setTalkingProvider('mirako')}
                                    style={{ flex: 1, fontSize: '0.7rem' }}
                                >
                                    Mirako AI
                                </button>
                            </div>
                            
                            <div className="input-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
                                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 0 }}>
                                        <MessageSquare size={14} />
                                        Konuşma Metni (Script)
                                    </label>
                                    <button 
                                        className="btn btn-ghost btn-sm"
                                        onClick={handleGenerateScript}
                                        disabled={isGeneratingScript || !prompt}
                                        style={{ 
                                            fontSize: '0.7rem', 
                                            height: '24px', 
                                            padding: '0 8px',
                                            color: 'var(--accent-primary)',
                                            background: 'var(--accent-soft)',
                                            border: '1px solid var(--accent-soft-border)',
                                            borderRadius: 'var(--radius-full)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        {isGeneratingScript ? (
                                            <Loader2 size={12} className="spin" />
                                        ) : (
                                            <Sparkles size={12} />
                                        )}
                                        <span>AI Yazsın</span>
                                    </button>
                                </div>
                                <textarea 
                                    className="input"
                                    rows={3}
                                    placeholder="Influencer ne söylesin? Örn: Merhaba arkadaşlar, bugün size harika bir üründen bahsedeceğim..."
                                    value={script}
                                    onChange={(e) => setScript(e.target.value)}
                                    style={{ fontSize: '0.875rem' }}
                                />
                            </div>

                            {animatedVideo ? (
                                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                    <video 
                                        src={animatedVideo} 
                                        controls 
                                        style={{ width: '100%', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        autoPlay
                                    />
                                    <button 
                                        className="btn btn-secondary btn-full btn-sm" 
                                        style={{ marginTop: 'var(--spacing-sm)' }}
                                        onClick={() => setAnimatedVideo(null)}
                                    >
                                        Yeni Video Üret
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    className="btn btn-primary btn-full"
                                    onClick={handleAnimate}
                                    disabled={isAnimating || !script.trim()}
                                    style={{ 
                                        height: '48px',
                                        background: 'var(--accent-primary)',
                                    }}
                                >
                                    {isAnimating ? (
                                        <>
                                            <Loader2 size={18} className="spin" />
                                            <span>Video İşleniyor...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play size={18} />
                                            <span>Videoyu Oluştur ve Konuştur</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* AI Reklam Kampanyası Modal */}
            {showAdCampaignModal && (
                <div className="modal-overlay" onClick={() => !isCreatingCampaign && setShowAdCampaignModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <div style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '12px', 
                                    background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Megaphone size={20} color="white" />
                                </div>
                                <div>
                                    <h2 className="modal-title" style={{ marginBottom: '4px' }}>AI Influencer Reklam Kampanyası</h2>
                                    <p className="text-xs text-muted">GPT-4o + Mirako AI + Kling 2.1 ile otomatik reklam üretimi</p>
                                </div>
                            </div>
                            <button 
                                className="btn btn-ghost btn-icon" 
                                onClick={() => setShowAdCampaignModal(false)}
                                disabled={isCreatingCampaign}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="modal-body" style={{ padding: 'var(--spacing-xl)' }}>
                            {!campaignResult ? (
                                <>
                                    {/* Ürün Bilgileri */}
                                    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-md)', fontSize: '1rem', fontWeight: 600 }}>
                                            <Target size={18} color="var(--accent-primary)" />
                                            Ürün Bilgileri
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                            <div className="input-group">
                                                <label className="input-label">Ürün Adı *</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    placeholder="Örn: GlowSkin Hyaluronik Serum"
                                                    value={adCampaign.product_name}
                                                    onChange={(e) => setAdCampaign({...adCampaign, product_name: e.target.value})}
                                                    disabled={isCreatingCampaign}
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Marka Adı</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    placeholder="Örn: GlowSkin Beauty"
                                                    value={adCampaign.brand_name}
                                                    onChange={(e) => setAdCampaign({...adCampaign, brand_name: e.target.value})}
                                                    disabled={isCreatingCampaign}
                                                />
                                            </div>
                                        </div>
                                        <div className="input-group" style={{ marginTop: 'var(--spacing-md)' }}>
                                            <label className="input-label">Ürün Açıklaması / Kampanya Promptu *</label>
                                            <textarea
                                                className="input"
                                                rows={5}
                                                placeholder="Ürünün özelliklerini, faydalarını ve kampanya detaylarını yazın..."
                                                value={adCampaign.product_description}
                                                onChange={(e) => setAdCampaign({...adCampaign, product_description: e.target.value})}
                                                disabled={isCreatingCampaign}
                                            />
                                        </div>
                                    </div>

                                    {/* Influencer & Hedef Kitle */}
                                    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-md)', fontSize: '1rem', fontWeight: 600 }}>
                                            <Users size={18} color="var(--accent-primary)" />
                                            Influencer & Hedef Kitle
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                            <div className="input-group">
                                                <label className="input-label">Influencer Adı</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    placeholder="Örn: Luna AI"
                                                    value={adCampaign.influencer_name}
                                                    onChange={(e) => setAdCampaign({...adCampaign, influencer_name: e.target.value})}
                                                    disabled={isCreatingCampaign}
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Cinsiyet</label>
                                                <select
                                                    className="input select"
                                                    value={adCampaign.influencer_gender}
                                                    onChange={(e) => setAdCampaign({...adCampaign, influencer_gender: e.target.value})}
                                                    disabled={isCreatingCampaign}
                                                >
                                                    <option value="female">Kadın</option>
                                                    <option value="male">Erkek</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="input-group" style={{ marginTop: 'var(--spacing-md)' }}>
                                            <label className="input-label">Influencer Görünümü (İngilizce)</label>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="Young Turkish woman, mid-20s, long dark hair..."
                                                value={adCampaign.influencer_look}
                                                onChange={(e) => setAdCampaign({...adCampaign, influencer_look: e.target.value})}
                                                disabled={isCreatingCampaign}
                                            />
                                        </div>
                                        <div className="input-group" style={{ marginTop: 'var(--spacing-md)' }}>
                                            <label className="input-label">Hedef Kitle</label>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="25-40 yaş kadın, cilt bakımına önem veren..."
                                                value={adCampaign.target_audience}
                                                onChange={(e) => setAdCampaign({...adCampaign, target_audience: e.target.value})}
                                                disabled={isCreatingCampaign}
                                            />
                                        </div>

                                        <div className="input-group" style={{ marginTop: 'var(--spacing-md)' }}>
                                            <label className="input-label">Konuşma Metni / Video Scripti</label>
                                            <textarea
                                                className="input"
                                                rows={3}
                                                placeholder="Influencer ne söylesin? (Boş bırakılırsa AI üretir)"
                                                value={adCampaign.talking_script}
                                                onChange={(e) => setAdCampaign({...adCampaign, talking_script: e.target.value})}
                                                disabled={isCreatingCampaign}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                                            <div className="input-group">
                                                <label className="input-label">Ürün Fotoğrafı</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onload = (ev) => setAdCampaign(prev => ({ ...prev, product_image_url: ev.target?.result as string }));
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                        style={{ display: 'none' }}
                                                        id="product-img-upload"
                                                    />
                                                    <label 
                                                        htmlFor="product-img-upload"
                                                        style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '8px', 
                                                            padding: '8px 12px', 
                                                            background: 'var(--bg-secondary)', 
                                                            borderRadius: 'var(--radius-sm)', 
                                                            cursor: 'pointer',
                                                            border: adCampaign.product_image_url ? '1px solid var(--success)' : '1px solid var(--border-color)',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        <Image size={14} /> {adCampaign.product_image_url ? 'Değiştir (Yüklendi)' : 'Ürün Yükle'}
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Mekan Fotoğrafı</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onload = (ev) => setAdCampaign(prev => ({ ...prev, location_image_url: ev.target?.result as string }));
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                        style={{ display: 'none' }}
                                                        id="location-img-upload"
                                                    />
                                                    <label 
                                                        htmlFor="location-img-upload"
                                                        style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '8px', 
                                                            padding: '8px 12px', 
                                                            background: 'var(--bg-secondary)', 
                                                            borderRadius: 'var(--radius-sm)', 
                                                            cursor: 'pointer',
                                                            border: adCampaign.location_image_url ? '1px solid var(--success)' : '1px solid var(--border-color)',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        <Image size={14} /> {adCampaign.location_image_url ? 'Değiştir (Yüklendi)' : 'Mekan Yükle'}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {(adCampaign.influencer_image_url || result?.imageUrl) && (
                                            <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-primary)' }}>
                                                <img 
                                                    src={adCampaign.influencer_image_url || result?.imageUrl} 
                                                    alt="Selected source" 
                                                    style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                                                />
                                                <div>
                                                    <p className="text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>Seçili Karakter Görseli Kullanılacak</p>
                                                    <p className="text-xs text-muted">Bu görsel reklamın ana karakteri olacak.</p>
                                                </div>
                                                <button 
                                                    className="btn btn-ghost btn-xs" 
                                                    style={{ marginLeft: 'auto' }}
                                                    onClick={() => setAdCampaign(prev => ({ ...prev, influencer_image_url: undefined }))}
                                                >
                                                    Değiştir
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Reklam Ayarları */}
                                    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-md)', fontSize: '1rem', fontWeight: 600 }}>
                                            <Film size={18} color="var(--accent-primary)" />
                                            Reklam Ayarları
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
                                            <div className="input-group">
                                                <label className="input-label">Reklam Türü</label>
                                                <select
                                                    className="input select"
                                                    value={adCampaign.ad_type}
                                                    onChange={(e) => setAdCampaign({...adCampaign, ad_type: e.target.value as 'both' | 'talking_head' | 'product_showcase'})}
                                                    disabled={isCreatingCampaign}
                                                >
                                                    <option value="both">Her İkisi</option>
                                                    <option value="talking_head">Konuşma Videosu</option>
                                                    <option value="product_showcase">Ürün Tanıtım</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Reklam Amacı</label>
                                                <select
                                                    className="input select"
                                                    value={adCampaign.ad_goal}
                                                    onChange={(e) => setAdCampaign({...adCampaign, ad_goal: e.target.value as 'awareness' | 'conversion' | 'engagement'})}
                                                    disabled={isCreatingCampaign}
                                                >
                                                    <option value="conversion">Satış / Dönüşüm</option>
                                                    <option value="awareness">Marka Bilinirliği</option>
                                                    <option value="engagement">Etkileşim</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Dil</label>
                                                <select
                                                    className="input select"
                                                    value={adCampaign.language}
                                                    onChange={(e) => setAdCampaign({...adCampaign, language: e.target.value as 'tr' | 'en'})}
                                                    disabled={isCreatingCampaign}
                                                >
                                                    <option value="tr">Türkçe</option>
                                                    <option value="en">English</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                                            <div className="input-group">
                                                <label className="input-label">Video Modeli</label>
                                                <select
                                                    className="input select"
                                                    value={adCampaign.video_model}
                                                    onChange={(e) => setAdCampaign({...adCampaign, video_model: e.target.value})}
                                                    disabled={isCreatingCampaign}
                                                >
                                                    <option value="kling-2.1-standard">Kling 2.1 Standard</option>
                                                    <option value="kling-2.1-pro">Kling 2.1 Pro</option>
                                                    <option value="minimax-hailuo">Minimax Hailuo</option>
                                                    <option value="wan-2.1">Wan 2.1</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Video Süresi</label>
                                                <select
                                                    className="input select"
                                                    value={adCampaign.video_duration}
                                                    onChange={(e) => setAdCampaign({...adCampaign, video_duration: e.target.value})}
                                                    disabled={isCreatingCampaign}
                                                >
                                                    <option value="5">5 saniye</option>
                                                    <option value="10">10 saniye</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Video Oranı</label>
                                                <select
                                                    className="input select"
                                                    value={adCampaign.video_aspect_ratio}
                                                    onChange={(e) => setAdCampaign({...adCampaign, video_aspect_ratio: e.target.value})}
                                                    disabled={isCreatingCampaign}
                                                >
                                                    <option value="9:16">9:16 (Reels/TikTok)</option>
                                                    <option value="1:1">1:1 (Kare)</option>
                                                    <option value="16:9">16:9 (YouTube)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                                            <div className="input-group">
                                                <label className="input-label">Ses Tonu</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    placeholder="samimi, güvenilir, eğlenceli..."
                                                    value={adCampaign.tone}
                                                    onChange={(e) => setAdCampaign({...adCampaign, tone: e.target.value})}
                                                    disabled={isCreatingCampaign}
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Call-to-Action (CTA)</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    placeholder="Hemen dene! 💫"
                                                    value={adCampaign.cta}
                                                    onChange={(e) => setAdCampaign({...adCampaign, cta: e.target.value})}
                                                    disabled={isCreatingCampaign}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Maliyet Tahmini */}
                                    <div style={{ 
                                        background: 'var(--bg-tertiary)', 
                                        borderRadius: 'var(--radius-lg)', 
                                        padding: 'var(--spacing-lg)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <p className="text-sm" style={{ fontWeight: 600, marginBottom: '4px' }}>Tahmini Üretim</p>
                                            <p className="text-xs text-muted">4 görsel + 3 video • ~2-5 dakika</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p className="text-sm" style={{ fontWeight: 600, color: 'var(--success)' }}>~$0.45</p>
                                            <p className="text-xs text-muted">tahmini maliyet</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Kampanya Sonuçları */
                                <div>
                                    {campaignResult.success ? (
                                        <>
                                            <div style={{ 
                                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                                                borderRadius: 'var(--radius-lg)',
                                                padding: 'var(--spacing-lg)',
                                                marginBottom: 'var(--spacing-xl)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-md)'
                                            }}>
                                                <CheckCircle size={24} color="var(--success)" />
                                                <div>
                                                    <p style={{ fontWeight: 600, color: 'var(--success)' }}>Kampanya Başarıyla Oluşturuldu!</p>
                                                    <p className="text-sm text-muted">{campaignResult.influencer} için {campaignResult.product} reklamları hazır.</p>
                                                </div>
                                            </div>

                                            {/* Reklam Konsepti */}
                                            {campaignResult.ad_concept && (
                                                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                                    <h4 style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>🎯 Reklam Konsepti</h4>
                                                    <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)' }}>
                                                        <p><strong>Tema:</strong> {campaignResult.ad_concept.theme}</p>
                                                        <p><strong>Hook:</strong> {campaignResult.ad_concept.hook}</p>
                                                        <p><strong>USP:</strong> {campaignResult.ad_concept.usp}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Talking Head Script */}
                                            {campaignResult.talking_head_ad?.script && (
                                                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                                    <h4 style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>🎬 Reklam Senaryosu</h4>
                                                    <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)' }}>
                                                        <p className="text-sm" style={{ whiteSpace: 'pre-wrap', marginBottom: 'var(--spacing-md)' }}>{campaignResult.talking_head_ad.script.full_script}</p>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            {campaignResult.talking_head_ad.script.sections.map((s, i) => (
                                                                <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
                                                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 600, minWidth: '50px' }}>{s.time}</span>
                                                                    <span>{s.text}</span>
                                                                    <span className="text-muted" style={{ marginLeft: 'auto' }}>{s.emotion}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Görseller */}
                                            {campaignResult.all_images && (
                                                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                                    <h4 style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Image size={18} /> Üretilen Görseller
                                                    </h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-sm)' }}>
                                                        {Object.entries(campaignResult.all_images).filter(([, url]) => url).map(([key, url]) => (
                                                            <a key={key} href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                                                                <img 
                                                                    src={url} 
                                                                    alt={key} 
                                                                    style={{ 
                                                                        width: '100%', 
                                                                        aspectRatio: '1', 
                                                                        objectFit: 'cover', 
                                                                        borderRadius: 'var(--radius-md)' 
                                                                    }} 
                                                                />
                                                                <p className="text-xs text-muted text-center mt-xs">{key.replace(/_/g, ' ')}</p>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Videolar */}
                                            {campaignResult.all_videos && (
                                                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                                    <h4 style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Film size={18} /> Üretilen Videolar
                                                    </h4>
                                                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
                                                         {Object.entries(campaignResult.all_videos).map(([key, url]) => (
                                                             <div key={key}>
                                                                 {url && typeof url === 'string' ? (
                                                                     <video 
                                                                         src={url} 
                                                                         controls 
                                                                         style={{ 
                                                                             width: '100%', 
                                                                             borderRadius: 'var(--radius-md)' 
                                                                         }} 
                                                                     />
                                                                 ) : (
                                                                     <div style={{ 
                                                                         background: 'var(--bg-tertiary)', 
                                                                         borderRadius: 'var(--radius-md)', 
                                                                         padding: 'var(--spacing-lg)', 
                                                                         textAlign: 'center',
                                                                         aspectRatio: '9/16',
                                                                         display: 'flex',
                                                                         flexDirection: 'column',
                                                                         alignItems: 'center',
                                                                         justifyContent: 'center'
                                                                     }}>
                                                                         <Video size={24} className={generatingVideos[key] ? 'spin' : ''} color={generatingVideos[key] ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                                                                         <p className="text-xs text-muted mt-sm">{generatingVideos[key] ? 'Üretiliyor...' : 'Video üretilmedi'}</p>
                                                                         {!generatingVideos[key] && (
                                                                             <button 
                                                                                className="btn btn-primary btn-sm mt-md"
                                                                                onClick={() => handleGenerateCampaignVideo(key as 'talking_head' | 'product' | 'lifestyle')}
                                                                                style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                                                             >
                                                                                Video Üret
                                                                             </button>
                                                                         )}
                                                                     </div>
                                                                 )}
                                                                 <p className="text-xs text-muted text-center mt-xs">{key.replace(/_/g, ' ')}</p>
                                                             </div>
                                                         ))}
                                                     </div>
                                                </div>
                                            )}

                                            {/* Instagram İçeriği */}
                                            {campaignResult.instagram && (
                                                <div>
                                                    <h4 style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>📱 Instagram İçeriği</h4>
                                                    <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)' }}>
                                                        <p className="text-sm" style={{ marginBottom: 'var(--spacing-sm)' }}><strong>Caption:</strong></p>
                                                        <p className="text-sm" style={{ whiteSpace: 'pre-wrap', marginBottom: 'var(--spacing-md)' }}>{campaignResult.instagram.caption}</p>
                                                        <p className="text-xs" style={{ color: 'var(--accent-primary)' }}>{campaignResult.instagram.hashtags}</p>
                                                        {campaignResult.instagram.cover_text && (
                                                            <p className="text-xs text-muted mt-sm">📋 Kapak: {campaignResult.instagram.cover_text}</p>
                                                        )}
                                                        <p className="text-xs text-muted mt-sm">🕐 Önerilen Paylaşım: {campaignResult.instagram.posting_time}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* A/B Test Hooks */}
                                            {campaignResult.ab_test_hooks && campaignResult.ab_test_hooks.length > 0 && (
                                                <div style={{ marginTop: 'var(--spacing-xl)' }}>
                                                    <h4 style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>🧪 A/B Test Hook Alternatifleri</h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        {campaignResult.ab_test_hooks.map((hook, i) => (
                                                            <div key={i} style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-sm) var(--spacing-md)', fontSize: '0.875rem' }}>
                                                                <strong>Hook {String.fromCharCode(65 + i)}:</strong> {hook}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div style={{ 
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            borderRadius: 'var(--radius-lg)',
                                            padding: 'var(--spacing-xl)',
                                            textAlign: 'center'
                                        }}>
                                            <AlertCircle size={48} color="var(--error)" style={{ marginBottom: 'var(--spacing-md)' }} />
                                            <p style={{ fontWeight: 600, color: 'var(--error)', marginBottom: 'var(--spacing-sm)' }}>Kampanya Oluşturulamadı</p>
                                            <p className="text-sm text-muted">{campaignResult.error}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-md)' }}>
                            {!campaignResult ? (
                                <>
                                    <button 
                                        className="btn btn-secondary" 
                                        onClick={() => setShowAdCampaignModal(false)}
                                        disabled={isCreatingCampaign}
                                    >
                                        İptal
                                    </button>
                                    <button 
                                        className="btn btn-primary"
                                        onClick={handleCreateAdCampaign}
                                        disabled={isCreatingCampaign || !adCampaign.product_name.trim() || !adCampaign.product_description.trim()}
                                        style={{ 
                                            background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
                                            minWidth: '180px'
                                        }}
                                    >
                                        {isCreatingCampaign ? (
                                            <>
                                                <Loader2 size={18} className="spin" />
                                                <span>Oluşturuluyor...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                <span>Kampanya Oluştur</span>
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        className="btn btn-secondary" 
                                        onClick={() => {
                                            setCampaignResult(null);
                                        }}
                                    >
                                        Yeni Kampanya
                                    </button>
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => setShowAdCampaignModal(false)}
                                    >
                                        Kapat
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* API Key Modal */}
            {showApiKeyModal && (
                <div className="modal-overlay" onClick={() => setShowApiKeyModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {provider === 'fal' ? 'fal.ai' : 'Mirako AI'} API Ayarları
                            </h2>
                        </div>
                        <div className="modal-body">
                            <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
                                {provider === 'fal' ? (
                                    <>
                                        Üretim için fal.ai API anahtarı gereklidir.
                                        <a href="https://fal.ai/dashboard/keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>
                                            {' '}Buradan{' '}
                                        </a>
                                        API anahtarı alabilirsiniz.
                                    </>
                                ) : (
                                    <>
                                        Mirako AI üretimi için API anahtarı gereklidir.
                                        <a href="https://mirako.co/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>
                                            {' '}Buradan{' '}
                                        </a>
                                        API anahtarı alabilirsiniz.
                                    </>
                                )}
                            </p>
                            <div className="input-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <label className="input-label">API Anahtarı</label>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder={provider === 'fal' ? 'fal-xxxx...' : 'mi_xxxx...'}
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                />
                            </div>

                            <div style={{ marginTop: 'var(--spacing-xl)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border-color)' }}>
                                <h3 className="card-title" style={{ fontSize: '0.9rem', marginBottom: 'var(--spacing-sm)' }}>
                                    📊 Google Sheets Entegrasyonu
                                </h3>
                                <p className="text-xs text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
                                    Görselleri doğrudan Google Sheet'e kaydetmek için Google Apps Script Web App URL'inizi buraya yapıştırın.
                                </p>
                                <div className="input-group">
                                    <label className="input-label">Google Sheet Webhook URL</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="https://script.google.com/macros/s/.../exec"
                                        value={sheetWebhookUrl}
                                        onChange={(e) => setSheetWebhookUrl(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowApiKeyModal(false)}>
                                İptal
                            </button>
                            <button className="btn btn-primary" onClick={() => {
                                if (provider === 'fal') {
                                    ltxVideoService.setApiKey(apiKey);
                                } else {
                                    mirakoService.setApiKey(apiKey);
                                }
                                googleSheetsService.setWebhookUrl(sheetWebhookUrl);
                                setShowApiKeyModal(false);
                                addNotification({ type: 'success', message: 'Ayarlar başarıyla kaydedildi', read: false });
                            }}>
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AIInfluencerGenerator;
