import React, { useState, useCallback } from 'react';
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
} from 'lucide-react';
import { aiInfluencerService } from '../utils/aiInfluencerService';
import { aiTalkingService } from '../utils/aiTalkingService';
import { ltxVideoService } from '../utils/ltxVideoService';
import { higgsfieldService } from '../utils/higgsfieldService';
import type { InfluencerGenerationRequest, InfluencerGenerationResponse } from '../utils/aiInfluencerService';
import { useDashboard } from '../context/DashboardContext';

const AIInfluencerGenerator: React.FC = () => {
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

        let response: InfluencerGenerationResponse;

        if (provider === 'fal') {
            const request: InfluencerGenerationRequest = {
                prompt,
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
    }, [prompt, aspectRatio, model, addNotification, provider]);

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
