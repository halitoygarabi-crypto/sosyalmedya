import React, { useState, useCallback, useEffect } from 'react';
import { Users, Megaphone, Settings, Sparkles, Loader2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

// Services
import { googleSheetsService } from '../../utils/googleSheetsService';
import { aiInfluencerService } from '../../utils/aiInfluencerService';
import { aiTalkingService } from '../../utils/aiTalkingService';
import { mirakoService } from '../../utils/mirakoService';
import { campaignService } from '../../utils/campaignService';
import { llmService } from '../../utils/llmService';

// Sub-components
import { CharacterSettings } from './CharacterSettings';
import { ResultView } from './ResultView';
import { AdCampaignModal } from './AdCampaignModal';
import { CloudHistory } from './CloudHistory';

// Types
import type { InfluencerGenerationResponse } from '../../utils/aiInfluencerService';
import type { SheetEntry } from '../../utils/googleSheetsService';
import type { Persona, AdCampaignRequest, AdCampaignResponse, AIInfluencerGeneratorProps } from './types';

const AIInfluencerGenerator: React.FC<AIInfluencerGeneratorProps> = ({ selectedClient }) => {
    const { addNotification } = useDashboard();

    // Core States
    const [provider, setProvider] = useState<'fal' | 'mirako'>('fal');
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
    const [model, setModel] = useState<'flux-pro' | 'flux-schnell'>('flux-schnell');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<InfluencerGenerationResponse | null>(null);

    // Persona Logic
    const [persona, setPersona] = useState<Persona>({
        age: '25',
        gender: 'woman',
        ethnicity: 'European',
        style: 'fashion influencer',
        location: 'Paris cafe',
        activity: 'looking at camera with a smile'
    });

    const updatePromptFromPersona = useCallback(() => {
        const fullPrompt = `High-quality professional photo of a ${persona.age} year old ${persona.ethnicity} ${persona.gender}, ${persona.style}, ${persona.activity}, at a ${persona.location}, detailed features, realistic skin texture, 8k resolution, cinematic lighting, shot on 35mm lens.`;
        setPrompt(fullPrompt);
    }, [persona]);

    // Animation & Script
    const [talkingProvider, setTalkingProvider] = useState<'sadtalker' | 'mirako'>('sadtalker');
    const [isAnimating, setIsAnimating] = useState(false);
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);
    const [script, setScript] = useState('');
    const [animatedVideo, setAnimatedVideo] = useState<string | null>(null);

    // History & Cloud
    const [history, setHistory] = useState<InfluencerGenerationResponse[]>(() => {
        try {
            const saved = localStorage.getItem('ai_influencer_history');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [cloudHistory, setCloudHistory] = useState<SheetEntry[]>([]);
    const [activeTab, setActiveTab] = useState<'local' | 'cloud'>('local');
    const [isLoadingFromSheet, setIsLoadingFromSheet] = useState(false);
    const [isSavingToSheet, setIsSavingToSheet] = useState(false);

    // Campaign Logic
    const [showAdCampaignModal, setShowAdCampaignModal] = useState(false);
    const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
    const [campaignResult, setCampaignResult] = useState<AdCampaignResponse | null>(null);
    const [generatingVideos, setGeneratingVideos] = useState<Record<string, boolean>>({});
    const [adCampaign, setAdCampaign] = useState<AdCampaignRequest>({
        influencer_name: 'Luna AI',
        influencer_gender: 'female',
        influencer_look: '',
        product_name: '',
        product_description: '',
        brand_name: selectedClient?.company_name || '',
        ad_type: 'both',
        ad_goal: 'conversion',
        target_audience: '',
        language: 'tr',
        tone: 'samimi, güvenilir, bilgilendirici',
        cta: 'Hemen dene! 💫',
        video_duration: '5',
        video_model: 'kling-2.1-standard',
        video_aspect_ratio: '9:16'
    });

    // Handlers
    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        setResult(null);
        setAnimatedVideo(null);

        const augmentedPrompt = selectedClient?.ai_prompt_prefix ? `${selectedClient.ai_prompt_prefix} ${prompt}` : prompt;
        let response: InfluencerGenerationResponse;

        if (provider === 'fal') {
            response = await aiInfluencerService.generateInfluencer({ prompt: augmentedPrompt, aspectRatio, model });
        } else {
            const mirakoResp = await mirakoService.generateImage({ prompt, aspectRatio });
            response = { success: mirakoResp.success, imageUrl: mirakoResp.videoUrl, requestId: mirakoResp.requestId, error: mirakoResp.error, type: 'image' };
        }

        setIsGenerating(false);
        setResult(response);
        if (response.success) {
            setHistory(prev => [response, ...prev].slice(0, 15));
            addNotification({ type: 'success', message: '✅ Karakter oluşturuldu!', read: false });
        } else {
            addNotification({ type: 'error', message: `❌ Hata: ${response.error}`, read: false });
        }
    }, [prompt, aspectRatio, model, provider, selectedClient, addNotification]);

    const handleGenerateScript = useCallback(async () => {
        setIsGeneratingScript(true);
        try {
            const ctx = selectedClient ? `${selectedClient.company_name} - ${selectedClient.industry}` : '';
            const genScript = await llmService.generateTalkingScript(prompt, ctx);
            setScript(genScript);
        } finally {
            setIsGeneratingScript(false);
        }
    }, [prompt, selectedClient]);

    const handleAnimate = useCallback(async () => {
        if (!result?.imageUrl || !script) return;
        setIsAnimating(true);
        const resp = talkingProvider === 'sadtalker' 
            ? await aiTalkingService.generateTalkingVideo({ imageUrl: result.imageUrl, script })
            : await mirakoService.generateVideo({ imageUrl: result.imageUrl, prompt: script, aspectRatio });
        
        setIsAnimating(false);
        if (resp.success && resp.videoUrl) {
            setAnimatedVideo(resp.videoUrl);
            const videoResult: InfluencerGenerationResponse = { 
                ...result, 
                videoUrl: resp.videoUrl, 
                type: 'video' 
            };
            setHistory(prev => [videoResult, ...prev].slice(0, 15));
        }
    }, [result, script, talkingProvider, aspectRatio]);

    const handleSaveToSheet = useCallback(async () => {
        const urlToSave = animatedVideo || result?.imageUrl;
        if (!urlToSave) return;
        setIsSavingToSheet(true);
        const entry: SheetEntry = {
            date: new Date().toLocaleString('tr-TR'),
            influencerName: adCampaign.influencer_name,
            prompt: animatedVideo ? `Video Scripti: ${script}` : prompt,
            imageUrl: urlToSave,
            clientName: selectedClient?.company_name || 'Genel',
            type: animatedVideo ? 'video' : 'image',
            metadata: { model: animatedVideo ? talkingProvider : model, aspectRatio }
        };
        const response = await googleSheetsService.saveToNamedSheet('influencer', entry);
        setIsSavingToSheet(false);
        if (response.success) addNotification({ type: 'success', message: '📊 Buluta kaydedildi!', read: false });
    }, [result, animatedVideo, script, adCampaign.influencer_name, prompt, selectedClient, model, aspectRatio, talkingProvider, addNotification]);

    const handleCreateAdCampaign = async () => {
        setIsCreatingCampaign(true);
        try {
            const data = await campaignService.createCampaign({ ...adCampaign, influencer_image_url: result?.imageUrl });
            setCampaignResult(data as AdCampaignResponse);
        } finally {
            setIsCreatingCampaign(false);
        }
    };

    const handleGenerateCampaignVideo = async (type: 'talking_head' | 'product' | 'lifestyle') => {
        if (!campaignResult) return;
        setGeneratingVideos(prev => ({ ...prev, [type]: true }));
        // Video üretme mantığı...
        setGeneratingVideos(prev => ({ ...prev, [type]: false }));
    };

    const handleFetchFromSheet = async () => {
        setIsLoadingFromSheet(true);
        try {
            const data = await googleSheetsService.fetchData('influencer');
            setCloudHistory(data);
        } finally {
            setIsLoadingFromSheet(false);
        }
    };

    // Auto-save history
    useEffect(() => { localStorage.setItem('ai_influencer_history', JSON.stringify(history)); }, [history]);

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
                    <button className="btn btn-primary" onClick={() => setShowAdCampaignModal(true)} style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)', boxShadow: '0 4px 15px rgba(244, 63, 94, 0.3)' }}>
                        <Megaphone size={18} />
                        <span>AI Reklam Kampanyası</span>
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => {}} title="API Ayarları"><Settings size={20} /></button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr 320px', gap: 'var(--spacing-xl)', alignItems: 'start' }}>
                {/* Column 1: Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button className={`btn ${provider === 'fal' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setProvider('fal')} style={{ flex: 1, fontSize: '0.8rem' }}>fal.ai</button>
                            <button className={`btn ${provider === 'mirako' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setProvider('mirako')} style={{ flex: 1, fontSize: '0.8rem' }}>Mirako</button>
                        </div>
                    </div>
                    
                    <CharacterSettings 
                        persona={persona} 
                        setPersona={setPersona} 
                        updatePromptFromPersona={updatePromptFromPersona}
                        handleFileUpload={(e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                                 const reader = new FileReader();
                                 reader.onloadend = () => {
                                     setResult({ success: true, imageUrl: reader.result as string, type: 'image' });
                                 };
                                 reader.readAsDataURL(file);
                             }
                        }}
                        setPrompt={setPrompt}
                    />

                    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                        <h3 className="card-title" style={{ marginBottom: 'var(--spacing-md)' }}>Prompt & Ayarlar</h3>
                        <textarea className="input" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ minHeight: '120px', marginBottom: 'var(--spacing-md)' }} />
                        <div className="grid-2">
                             <select className="input select" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)}>
                                 <option value="1:1">1:1 Kare</option>
                                 <option value="9:16">9:16 Dikey</option>
                                 <option value="16:9">16:9 Yatay</option>
                                 <option value="4:3">4:3 Klasik</option>
                             </select>
                             <select className="input select" value={model} onChange={e => setModel(e.target.value as any)} disabled={provider === 'mirako'}>
                                 <option value="flux-schnell">Schnell</option>
                                 <option value="flux-pro">Pro</option>
                             </select>
                        </div>
                        <button className="btn btn-primary btn-full btn-lg" onClick={handleGenerate} disabled={isGenerating} style={{ marginTop: 'var(--spacing-lg)' }}>
                            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                            <span>Karakter Üret</span>
                        </button>
                    </div>
                </div>

                {/* Column 2: Result & Animation */}
                <ResultView 
                    result={result}
                    isGenerating={isGenerating}
                    isAnimating={isAnimating}
                    animatedVideo={animatedVideo}
                    script={script}
                    setScript={setScript}
                    isGeneratingScript={isGeneratingScript}
                    handleGenerateScript={handleGenerateScript}
                    handleAnimate={handleAnimate}
                    talkingProvider={talkingProvider}
                    setTalkingProvider={setTalkingProvider}
                    handleSaveToSheet={handleSaveToSheet}
                    isSavingToSheet={isSavingToSheet}
                />

                {/* Column 3: History */}
                <CloudHistory 
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    history={history}
                    cloudHistory={cloudHistory}
                    isLoadingFromSheet={isLoadingFromSheet}
                    handleFetchFromSheet={handleFetchFromSheet}
                    onSelectHistoryItem={(item) => {
                        const img = item.imageUrl || '';
                        setResult({ success: true, imageUrl: img, requestId: 'hist', type: (item as any).type || 'image' });
                        if ('videoUrl' in item && item.videoUrl) setAnimatedVideo(item.videoUrl);
                        else setAnimatedVideo(null);
                    }}
                />
            </div>

            <AdCampaignModal 
                show={showAdCampaignModal}
                onClose={() => setShowAdCampaignModal(false)}
                isCreating={isCreatingCampaign}
                adCampaign={adCampaign}
                setAdCampaign={setAdCampaign}
                onSubmit={handleCreateAdCampaign}
                campaignResult={campaignResult}
                generatingVideos={generatingVideos}
                handleGenerateCampaignVideo={handleGenerateCampaignVideo}
            />
        </div>
    );
};

export default AIInfluencerGenerator;
