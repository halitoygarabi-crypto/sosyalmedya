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
} from 'lucide-react';
import { aiInfluencerService } from '../utils/aiInfluencerService';
import { aiTalkingService } from '../utils/aiTalkingService';
import { ltxVideoService } from '../utils/ltxVideoService';
import { higgsfieldService } from '../utils/higgsfieldService';
import type { InfluencerGenerationRequest, InfluencerGenerationResponse } from '../utils/aiInfluencerService';
import { useDashboard } from '../context/DashboardContext';

// n8n Webhook URL for AI Influencer Ads
const N8N_AI_INFLUENCER_WEBHOOK = import.meta.env.VITE_N8N_AI_INFLUENCER_TEST_WEBHOOK_URL || 'https://n8n.polmarkai.pro/webhook-test/ai-influencer-ad';

interface SelectedClient {
    id: string;
    company_name: string;
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
    ad_goal: 'awareness' | 'conversion' | 'engagement';
    target_audience: string;
    tone: string;
    cta: string;
    video_duration: number;
    video_aspect_ratio: string;
}

interface AdCampaignResponse {
    success: boolean;
    influencer?: string;
    brand?: string;
    product?: string;
    ad_concept?: {
        theme: string;
        hook: string;
        unique_selling_point: string;
    };
    images?: {
        influencer_main: string;
        influencer_closeup: string;
        product_hero: string;
        lifestyle: string;
    };
    videos?: {
        talking_head: string;
        product_showcase: string;
        lifestyle: string;
    };
    instagram?: {
        reel: {
            caption: string;
            hashtags: string;
            best_posting_time: string;
        };
    };
    error?: string;
}

const AIInfluencerGenerator: React.FC<AIInfluencerGeneratorProps> = ({ selectedClient }) => {
    const { addNotification } = useDashboard();

    const [provider, setProvider] = useState<'fal' | 'higgsfield'>('fal');
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
    const [isAnimating, setIsAnimating] = useState(false);
    const [result, setResult] = useState<InfluencerGenerationResponse | null>(null);
    const [animatedVideo, setAnimatedVideo] = useState<string | null>(null);
    const [script, setScript] = useState('');
    const [history, setHistory] = useState<InfluencerGenerationResponse[]>([]);
    const [talkingProvider, setTalkingProvider] = useState<'sadtalker' | 'higgsfield'>('sadtalker');
    
    // API Key state
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [apiKey, setApiKey] = useState(aiInfluencerService.getApiKey());

    // n8n AI Influencer Ads Campaign State
    const [showAdCampaignModal, setShowAdCampaignModal] = useState(false);
    const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
    const [campaignResult, setCampaignResult] = useState<AdCampaignResponse | null>(null);
    const [adCampaign, setAdCampaign] = useState<AdCampaignRequest>({
        influencer_name: 'Luna AI',
        influencer_gender: 'female',
        influencer_look: 'Young Turkish woman, mid-20s, long dark hair, brown eyes, natural glowing makeup, warm confident smile',
        product_name: '',
        product_description: '',
        brand_name: selectedClient?.company_name || '',
        ad_goal: 'conversion',
        target_audience: '25-40 yaş arası, dijital ürünlere ilgi duyan',
        tone: 'samimi, güvenilir, bilgilendirici',
        cta: 'Hemen dene! 💫',
        video_duration: 15,
        video_aspect_ratio: '9:16'
    });

    // Update brand name when selected client changes
    useEffect(() => {
        if (selectedClient) {
            setAdCampaign(prev => ({ ...prev, brand_name: selectedClient.company_name }));
        }
    }, [selectedClient]);

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
            : higgsfieldService.isConfigured();

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
            // Higgsfield
            const higgsResponse = await higgsfieldService.generateImage({
                prompt,
                aspectRatio,
            });
            
            response = {
                success: higgsResponse.success,
                imageUrl: higgsResponse.videoUrl, // In Higgsfield response, the URL is in videoUrl even for images
                error: higgsResponse.error,
                requestId: higgsResponse.requestId
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
            // Use Higgsfield for image-to-video with the script as motion prompt
            videoResponse = await higgsfieldService.generateVideo({
                prompt: script,
                imageUrl: result.imageUrl,
            });
        }

        setIsAnimating(false);
        if (videoResponse.success && videoResponse.videoUrl) {
            setAnimatedVideo(videoResponse.videoUrl);
            addNotification({ type: 'success', message: '✅ Video başarıyla oluşturuldu!', read: false });
        } else {
            addNotification({ type: 'error', message: `❌ ${videoResponse.error}`, read: false });
        }
    }, [result, script, addNotification, talkingProvider]);

    // n8n AI Influencer Ads Campaign Handler
    const handleCreateAdCampaign = useCallback(async () => {
        if (!adCampaign.product_name.trim() || !adCampaign.product_description.trim()) {
            addNotification({ type: 'warning', message: 'Lütfen ürün adı ve açıklamasını girin', read: false });
            return;
        }

        setIsCreatingCampaign(true);
        setCampaignResult(null);
        addNotification({ type: 'info', message: '🎬 AI Influencer reklam kampanyası oluşturuluyor... Bu işlem 2-5 dakika sürebilir.', read: false });

        try {
            const response = await fetch(N8N_AI_INFLUENCER_WEBHOOK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(adCampaign),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: AdCampaignResponse = await response.json();
            
            setIsCreatingCampaign(false);
            setCampaignResult(data);

            if (data.success) {
                addNotification({ 
                    type: 'success', 
                    message: `✅ Reklam kampanyası başarıyla oluşturuldu! ${data.images ? '4 görsel' : ''} ${data.videos ? '+ 3 video' : ''} hazır.`, 
                    read: false 
                });
            } else {
                addNotification({ type: 'error', message: `❌ ${data.error || 'Kampanya oluşturulamadı'}`, read: false });
            }
        } catch (error) {
            setIsCreatingCampaign(false);
            const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
            addNotification({ type: 'error', message: `❌ Kampanya hatası: ${errorMessage}`, read: false });
            setCampaignResult({ success: false, error: errorMessage });
        }
    }, [adCampaign, addNotification]);

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
                            setApiKey(provider === 'fal' ? aiInfluencerService.getApiKey() : higgsfieldService.getApiKey());
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
                                className={`btn ${provider === 'higgsfield' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setProvider('higgsfield')}
                                style={{ flex: 1, fontSize: '0.8rem' }}
                            >
                                <span>Higgsfield</span>
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
                            <p className="text-xs text-muted mb-sm">Hazır Şablonlar:</p>
                            <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
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
                                    disabled={provider === 'higgsfield'}
                                >
                                    {provider === 'fal' ? (
                                        <>
                                            <option value="flux-schnell">Hızlı (Schnell)</option>
                                            <option value="flux-pro">Ultra Kalite (Pro)</option>
                                        </>
                                    ) : (
                                        <option value="flux-pro">Higgsfield Soul</option>
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
                                <p className="text-xs text-muted mt-sm">Fal.ai sunucuları meşgul olabilir (30-60 sn sürebilir)</p>
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
                                    <a href={animatedVideo} download className="btn btn-primary btn-full">
                                        <Download size={18} /> Videoyu İndir
                                    </a>
                                    <button className="btn btn-secondary" onClick={() => setAnimatedVideo(null)}>
                                        <RefreshCw size={18} /> Görsele Dön
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
                                    <a href={result.imageUrl} target="_blank" className="btn btn-primary btn-full" rel="noopener noreferrer">
                                        <Download size={18} /> Görseli İndir
                                    </a>
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
                        {/* History */}
                    {history.length > 0 && (
                        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                            <h3 className="card-title mb-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Hash size={16} /> Kütüphane
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-sm)' }}>
                                {history.map((h, i) => (
                                    <div 
                                        key={i} 
                                        style={{ 
                                            aspectRatio: '1', 
                                            borderRadius: 'var(--radius-sm)', 
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: result?.imageUrl === h.imageUrl ? '2px solid var(--accent-primary)' : 'none'
                                        }}
                                        onClick={() => {
                                            setResult(h);
                                            setAnimatedVideo(null);
                                        }}
                                    >
                                        <img src={h.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                                    className={`btn btn-sm ${talkingProvider === 'higgsfield' ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => setTalkingProvider('higgsfield')}
                                    style={{ flex: 1, fontSize: '0.7rem' }}
                                >
                                    Higgsfield
                                </button>
                            </div>
                            
                            <div className="input-group" style={{ marginBottom: 'var(--spacing-lg)' }}>

                                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <MessageSquare size={14} />
                                    Konuşma Metni (Script)
                                </label>
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
                                    <p className="text-xs text-muted">GPT-4o + Fal.ai + Higgsfield ile otomatik reklam üretimi</p>
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
                                            <label className="input-label">Ürün Açıklaması *</label>
                                            <textarea
                                                className="input"
                                                rows={2}
                                                placeholder="Ürünün özelliklerini ve faydalarını detaylı yazın..."
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
                                    </div>

                                    {/* Reklam Ayarları */}
                                    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-md)', fontSize: '1rem', fontWeight: 600 }}>
                                            <Film size={18} color="var(--accent-primary)" />
                                            Reklam Ayarları
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
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
                                                <label className="input-label">Video Süresi</label>
                                                <select
                                                    className="input select"
                                                    value={adCampaign.video_duration}
                                                    onChange={(e) => setAdCampaign({...adCampaign, video_duration: parseInt(e.target.value)})}
                                                    disabled={isCreatingCampaign}
                                                >
                                                    <option value={10}>10 saniye</option>
                                                    <option value={15}>15 saniye</option>
                                                    <option value={30}>30 saniye</option>
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
                                                        <p><strong>USP:</strong> {campaignResult.ad_concept.unique_selling_point}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Görseller */}
                                            {campaignResult.images && (
                                                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                                    <h4 style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Image size={18} /> Üretilen Görseller
                                                    </h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-sm)' }}>
                                                        {Object.entries(campaignResult.images).map(([key, url]) => (
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
                                            {campaignResult.videos && (
                                                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                                    <h4 style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Film size={18} /> Üretilen Videolar
                                                    </h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
                                                        {Object.entries(campaignResult.videos).map(([key, url]) => (
                                                            <div key={key}>
                                                                {typeof url === 'string' ? (
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
                                                                        textAlign: 'center' 
                                                                    }}>
                                                                        <Loader2 size={24} className="spin" />
                                                                        <p className="text-xs text-muted mt-sm">İşleniyor...</p>
                                                                    </div>
                                                                )}
                                                                <p className="text-xs text-muted text-center mt-xs">{key.replace(/_/g, ' ')}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Instagram İçeriği */}
                                            {campaignResult.instagram?.reel && (
                                                <div>
                                                    <h4 style={{ marginBottom: 'var(--spacing-md)', fontWeight: 600 }}>📱 Instagram İçeriği</h4>
                                                    <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)' }}>
                                                        <p className="text-sm" style={{ marginBottom: 'var(--spacing-sm)' }}><strong>Caption:</strong></p>
                                                        <p className="text-sm" style={{ whiteSpace: 'pre-wrap', marginBottom: 'var(--spacing-md)' }}>{campaignResult.instagram.reel.caption}</p>
                                                        <p className="text-xs text-muted">{campaignResult.instagram.reel.hashtags}</p>
                                                        <p className="text-xs text-muted mt-sm">🕐 {campaignResult.instagram.reel.best_posting_time}</p>
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
                                {provider === 'fal' ? 'fal.ai' : 'Higgsfield'} API Ayarları
                            </h2>
                        </div>
                        <div className="modal-body">
                            <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
                                {provider === 'fal' ? (
                                    <>
                                        AI Influencer ve Video üretimi için fal.ai API anahtarı gereklidir.
                                        <a href="https://fal.ai/dashboard/keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>
                                            {' '}Buradan{' '}
                                        </a>
                                        yeni bir API anahtarı alabilirsiniz.
                                    </>
                                ) : (
                                    <>
                                        Higgsfield görsel üretimi için API anahtarı gereklidir.
                                        <a href="https://platform.higgsfield.ai/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>
                                            {' '}Buradan{' '}
                                        </a>
                                        API anahtarı alabilirsiniz.
                                    </>
                                )}
                            </p>
                            <div className="input-group">
                                <label className="input-label">API Anahtarı</label>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder={provider === 'fal' ? 'Key ID:Key Secret formatında' : 'ID:SECRET formatında'}
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                />
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
                                    higgsfieldService.setApiKey(apiKey);
                                }
                                setShowApiKeyModal(false);
                                addNotification({ type: 'success', message: 'API anahtarı kaydedildi', read: false });
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
