import React, { useState, useCallback } from 'react';
import {
    Video,
    Wand2,
    Image,
    Type,
    Play,
    Download,
    Settings,
    Clock,
    Ratio,
    Zap,
    Sparkles,
    AlertCircle,
    CheckCircle,
    Loader2,
    RefreshCw,
    Upload,
    Film,
    Table,
} from 'lucide-react';
import { ltxVideoService } from '../utils/ltxVideoService';
import { mirakoService } from '../utils/mirakoService';
import { polmarkService } from '../utils/polmarkService';
import { googleSheetsService } from '../utils/googleSheetsService';
import { llmService } from '../utils/llmService';
import type { SheetEntry } from '../utils/googleSheetsService';
import type { VideoGenerationRequest, VideoGenerationResponse } from '../utils/ltxVideoService';
import { useDashboard } from '../context/DashboardContext';

interface SelectedClient {
    id: string;
    company_name: string;
    industry: string | null;
    logo_url: string | null;
    ai_prompt_prefix?: string;
    brand_guidelines?: string;
}

interface VideoGeneratorProps {
    selectedClient?: SelectedClient | null;
}

type GenerationMode = 'text-to-video' | 'image-to-video';
type VideoProvider = 'kling' | 'mirako' | 'polmark';

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ selectedClient }) => {
    const { addNotification } = useDashboard();

    const [provider, setProvider] = useState<VideoProvider>('kling');
    const [mode, setMode] = useState<GenerationMode>('text-to-video');
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [duration, setDuration] = useState(5);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3'>('16:9');
    const [quality, setQuality] = useState<'fast' | 'quality'>('fast');

    const [isGenerating, setIsGenerating] = useState(false);
    const [isSavingToSheet, setIsSavingToSheet] = useState(false);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [result, setResult] = useState<VideoGenerationResponse | null>(null);
    const [generationHistory, setGenerationHistory] = useState<VideoGenerationResponse[]>([]);

    // API Key state
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [apiKey, setApiKey] = useState(ltxVideoService.getApiKey());
    const [isUploading, setIsUploading] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Timer for generation elapsed time
    React.useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isGenerating) {
            setElapsedSeconds(0);
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        } else {
            setElapsedSeconds(0);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isGenerating]);

    const handleGeneratePrompt = useCallback(async () => {
        if (!prompt.trim()) {
            addNotification({ type: 'warning', message: 'Lütfen önce basit bir ana fikir girin', read: false });
            return;
        }

        setIsGeneratingPrompt(true);
        addNotification({ type: 'info', message: '🪄 AI Prompt sihirbazı çalışıyor...', read: false });

        try {
            const context = selectedClient ? `${selectedClient.company_name} - ${selectedClient.industry}` : '';
            const optimizedPrompt = await llmService.generateVideoPrompt(prompt, context);
            setPrompt(optimizedPrompt);
            addNotification({ type: 'success', message: '✨ Prompt başarıyla geliştirildi!', read: false });
        } catch {
            addNotification({ type: 'error', message: '❌ Prompt geliştirilemedi', read: false });
        } finally {
            setIsGeneratingPrompt(false);
        }
    }, [prompt, selectedClient, addNotification]);

    const handleSaveToSheet = useCallback(async () => {
        if (!result?.videoUrl) return;

        setIsSavingToSheet(true);
        const entry: SheetEntry = {
            date: new Date().toLocaleString('tr-TR'),
            prompt: prompt,
            imageUrl: result.videoUrl, // Save video URL in the visual column
            clientName: selectedClient?.company_name || 'Genel',
            type: 'video',
            metadata: {
                provider,
                duration,
                aspectRatio,
                mode: quality
            }
        };

        const response = await googleSheetsService.saveToNamedSheet('içerik', entry);
        setIsSavingToSheet(false);

        if (response.success) {
            addNotification({ type: 'success', message: '📊 Video başarıyla "İçerik N99" tablosuna kaydedildi!', read: false });
        } else {
            addNotification({ type: 'error', message: `❌ Kayıt hatası: ${response.error}`, read: false });
            if (!googleSheetsService.isConfigured()) {
                setShowApiKeyModal(true);
            }
        }
    }, [result, prompt, selectedClient, provider, duration, aspectRatio, quality, addNotification]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            addNotification({ type: 'error', message: 'Lütfen geçerli bir görsel dosyası seçin', read: false });
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setImageUrl(base64String);
            setIsUploading(false);
        };
        reader.onerror = () => {
            addNotification({ type: 'error', message: 'Dosya okunurken bir hata oluştu', read: false });
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            addNotification({ type: 'warning', message: 'Lütfen bir prompt girin', read: false });
            return;
        }

        const isConfigured = provider === 'kling' 
            ? ltxVideoService.isConfigured() 
            : provider === 'mirako'
                ? mirakoService.isConfigured()
                : polmarkService.isConfigured();

        if (!isConfigured) {
            setShowApiKeyModal(true);
            return;
        }

        setIsGenerating(true);
        setResult(null);
        addNotification({ type: 'info', message: '🎬 Video üretimi başlatıldı...', read: false });

        // Build augmented prompt with client context
        let augmentedPrompt = '';
        if (selectedClient?.ai_prompt_prefix) {
            augmentedPrompt += `${selectedClient.ai_prompt_prefix} `;
        }
        if (selectedClient?.brand_guidelines) {
            augmentedPrompt += `[Brand Guidelines: ${selectedClient.brand_guidelines.substring(0, 200)}] `;
        }
        augmentedPrompt += prompt;

        const request: VideoGenerationRequest = {
            prompt: augmentedPrompt,
            negativePrompt,
            duration,
            aspectRatio,
            mode: quality,
            imageUrl: mode === 'image-to-video' ? imageUrl : undefined,
        };

        let response: VideoGenerationResponse;

        if (provider === 'kling') {
            if (mode === 'text-to-video') {
                response = await ltxVideoService.generateFromText(request);
            } else {
                if (!imageUrl) {
                    addNotification({ type: 'error', message: 'Görsel URL\'si gerekli', read: false });
                    setIsGenerating(false);
                    return;
                }
                response = await ltxVideoService.generateFromImage(request);
            }
        } else if (provider === 'mirako') {
            // Mirako AI
            response = await mirakoService.generateVideo({
                prompt: request.prompt,
                imageUrl: request.imageUrl,
                aspectRatio: request.aspectRatio,
                duration: request.duration,
                negativePrompt: request.negativePrompt
            });
        } else {
            // Polmark AI
            response = await polmarkService.generateVideo({
                prompt: request.prompt,
                imageUrl: request.imageUrl,
                aspectRatio: request.aspectRatio,
                duration: request.duration,
                mode: mode
            });
        }

        setIsGenerating(false);
        setResult(response);

        if (response.success) {
            addNotification({ type: 'success', message: '✅ Video başarıyla oluşturuldu!', read: false });
            setGenerationHistory(prev => [response, ...prev].slice(0, 10));
        } else {
            addNotification({ type: 'error', message: `❌ ${response.error}`, read: false });
        }
    }, [prompt, negativePrompt, duration, aspectRatio, quality, mode, imageUrl, addNotification, provider, selectedClient]);

    const saveApiKey = () => {
        if (provider === 'kling') {
            ltxVideoService.setApiKey(apiKey);
        } else {
            mirakoService.setApiKey(apiKey);
        }
        setShowApiKeyModal(false);
        addNotification({ type: 'success', message: 'API anahtarı kaydedildi', read: false });
    };

    const promptExamples = [
        'A serene lake at sunset with gentle ripples',
        'A futuristic city with flying cars and neon lights',
        'A cute cat playing with a ball of yarn',
        'Product showcase rotating slowly on white background',
        'Motivational quote animation with dynamic text',
    ];

    return (
        <div className="section animate-fadeIn">
            {/* Header */}
            <div className="section-header" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div>
                    <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <Video size={24} style={{ color: 'var(--accent-primary)' }} />
                        {provider === 'kling' ? 'Kling AI Video Üretici' : provider === 'mirako' ? 'Mirako AI Video Üretici' : 'Polmark AI Video Üretici'}
                    </h2>
                    <p className="text-muted text-sm">
                        {provider === 'kling' 
                            ? 'Fal.ai Kling modelleri ile sinematik AI videolar oluşturun' 
                            : provider === 'mirako'
                                ? 'Mirako AI modelleri ile yüksek estetikli AI videolar oluşturun'
                                : 'Polmark n99 Orchestration ile optimize edilmiş AI videolar oluşturun'}
                    </p>
                </div>
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setShowApiKeyModal(true)}
                    title="API Ayarları"
                >
                    <Settings size={20} />
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 'var(--spacing-xl)' }}>
                {/* Main Generation Panel */}
                <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
                    {/* Provider Toggle */}
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-md)' }}>
                        <button
                            className={`btn ${provider === 'kling' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setProvider('kling')}
                            style={{ flex: 1 }}
                        >
                            <span>Kling AI</span>
                        </button>
                        <button
                            className={`btn ${provider === 'mirako' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setProvider('mirako')}
                            style={{ flex: 1 }}
                        >
                            <span>Mirako AI</span>
                        </button>
                        <button
                            className={`btn ${provider === 'polmark' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setProvider('polmark')}
                            style={{ flex: 1 }}
                        >
                            <span>Polmark AI</span>
                        </button>
                    </div>

                    {/* Mode Tabs */}
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
                        <button
                            className={`btn ${mode === 'text-to-video' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setMode('text-to-video')}
                        >
                            <Type size={16} />
                            <span>Metinden Video</span>
                        </button>
                        <button
                            className={`btn ${mode === 'image-to-video' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setMode('image-to-video')}
                        >
                            <Image size={16} />
                            <span>Görselden Video</span>
                        </button>
                    </div>

                    {/* Prompt Input */}
                    <div className="input-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-xs)' }}>
                            <label className="input-label" style={{ marginBottom: 0 }}>
                                <Wand2 size={14} style={{ marginRight: '4px' }} />
                                Video Açıklaması (Prompt)
                            </label>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={handleGeneratePrompt}
                                disabled={isGeneratingPrompt || !prompt.trim()}
                                style={{ 
                                    fontSize: '0.75rem', 
                                    color: 'var(--accent-primary)',
                                    background: 'var(--accent-soft)',
                                    border: '1px solid var(--accent-soft-border)',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-full)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                {isGeneratingPrompt ? (
                                    <>
                                        <Loader2 size={12} className="spin" />
                                        <span>Geliştiriliyor...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={12} />
                                        <span>AI ile Zenginleştir</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <textarea
                            className="input"
                            rows={4}
                            placeholder="Videonuzu detaylı bir şekilde tanımlayın... Örn: 'Gün batımında sakin bir göl, hafif dalgalanmalar ve uçan kuşlar'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            style={{ resize: 'vertical', minHeight: '100px' }}
                        />
                        <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                            {promptExamples.slice(0, 3).map((example, i) => (
                                <button
                                    key={i}
                                    className="btn btn-ghost"
                                    style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                                    onClick={() => setPrompt(example)}
                                >
                                    {example.substring(0, 30)}...
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Image Upload for Image-to-Video */}
                    {mode === 'image-to-video' && (
                        <div className="input-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <label className="input-label">
                                <Upload size={14} style={{ marginRight: '4px' }} />
                                Görsel Yükle
                            </label>

                            <div
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                style={{
                                    border: '2px dashed var(--border-color)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: 'var(--spacing-xl)',
                                    textAlign: 'center',
                                    background: 'var(--bg-tertiary)',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                                onClick={() => document.getElementById('image-upload-input')?.click()}
                                className="upload-zone"
                            >
                                <input
                                    id="image-upload-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />

                                {imageUrl ? (
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <img
                                            src={imageUrl}
                                            alt="Preview"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '200px',
                                                borderRadius: 'var(--radius-md)',
                                                display: 'block'
                                            }}
                                        />
                                        <button
                                            className="btn btn-ghost btn-icon btn-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setImageUrl('');
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '-10px',
                                                right: '-10px',
                                                background: 'var(--error)',
                                                color: 'white',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px'
                                            }}
                                        >
                                            <AlertCircle size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                        <Upload size={32} className="text-muted" />
                                        <div>
                                            <p style={{ fontWeight: 600 }}>Tıklayın veya sürükleyip bırakın</p>
                                            <p className="text-xs text-muted">PNG, JPG veya WEBP (Max 10MB)</p>
                                        </div>
                                    </div>
                                )}

                                {isUploading && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        background: 'rgba(0,0,0,0.5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 'var(--radius-lg)',
                                        zIndex: 10
                                    }}>
                                        <Loader2 className="spin" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Settings Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 'var(--spacing-md)',
                        marginBottom: 'var(--spacing-xl)'
                    }}>
                        {/* Duration */}
                        <div className="input-group">
                            <label className="input-label" style={{ fontSize: '0.75rem' }}>
                                <Clock size={12} /> Süre
                            </label>
                            <select
                                className="input select"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                            >
                                <option value={3}>3 sn</option>
                                <option value={5}>5 sn</option>
                                <option value={10}>10 sn</option>
                                <option value={15}>15 sn</option>
                                <option value={20}>20 sn</option>
                            </select>
                        </div>

                        {/* Aspect Ratio */}
                        <div className="input-group">
                            <label className="input-label" style={{ fontSize: '0.75rem' }}>
                                <Ratio size={12} /> Oran
                            </label>
                            <select
                                className="input select"
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16' | '1:1' | '4:3')}
                            >
                                <option value="16:9">16:9 (Yatay)</option>
                                <option value="9:16">9:16 (Dikey)</option>
                                <option value="1:1">1:1 (Kare)</option>
                                <option value="4:3">4:3</option>
                            </select>
                        </div>

                        {/* FPS (Kling uses standard 30fps) */}
                        <div className="input-group">
                            <label className="input-label" style={{ fontSize: '0.75rem' }}>
                                <Film size={12} /> Mod / FPS
                            </label>
                            <select
                                className="input select"
                                value={30}
                                disabled
                            >
                                <option value={30}>30 fps (Standart)</option>
                            </select>
                        </div>

                        {/* Quality */}
                        <div className="input-group">
                            <label className="input-label" style={{ fontSize: '0.75rem' }}>
                                <Zap size={12} /> Kalite
                            </label>
                            <select
                                className="input select"
                                value={quality}
                                onChange={(e) => setQuality(e.target.value as 'fast' | 'quality')}
                            >
                                <option value="fast">Hızlı</option>
                                <option value="quality">Yüksek Kalite</option>
                            </select>
                        </div>
                    </div>

                    {/* Negative Prompt (Collapsible) */}
                    <details style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Gelişmiş Ayarlar
                        </summary>
                        <div className="input-group" style={{ marginTop: 'var(--spacing-md)' }}>
                            <label className="input-label">Negatif Prompt (İstenmeyen öğeler)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="blurry, low quality, distorted..."
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                            />
                        </div>
                    </details>

                    {/* Generate Button */}
                    <button
                        className="btn btn-primary btn-lg btn-full"
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        style={{
                            background: 'var(--accent-gradient)',
                            gap: 'var(--spacing-sm)'
                        }}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 size={20} className="spin" />
                                <span>Video Üretiliyor... ({Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, '0')})</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                <span>Video Oluştur</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Result & History Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    {/* Result Preview */}
                    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                        <h3 className="card-title" style={{ marginBottom: 'var(--spacing-md)' }}>
                            <Play size={18} /> Sonuç
                        </h3>

                        {isGenerating && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 'var(--spacing-2xl)',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-lg)'
                            }}>
                                <div className="spinner" style={{ marginBottom: 'var(--spacing-md)' }} />
                                <p className="text-muted" style={{ marginBottom: '4px' }}>Video üretiliyor... ({Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, '0')})</p>
                                <p className="text-muted" style={{ fontSize: '0.75rem', opacity: 0.7 }}>AI video üretimi genellikle 1-3 dakika sürer. Lütfen bekleyin.</p>
                            </div>
                        )}

                        {!isGenerating && result?.success && result.videoUrl && (
                            <div>
                                <video
                                    src={result.videoUrl}
                                    controls
                                    autoPlay
                                    loop
                                    style={{
                                        width: '100%',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: 'var(--spacing-md)'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                    <a
                                        href={result.videoUrl}
                                        download
                                        className="btn btn-primary btn-sm"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Download size={14} />
                                        <span>İndir</span>
                                    </a>
                                    <button 
                                        className="btn btn-secondary btn-sm" 
                                        onClick={handleSaveToSheet}
                                        disabled={isSavingToSheet}
                                        style={{ color: '#107c10' }}
                                        title="Google Sheet'e Kaydet"
                                    >
                                        {isSavingToSheet ? <Loader2 size={14} className="spin" /> : <Table size={14} />}
                                        <span>Sheet</span>
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={handleGenerate}>
                                        <RefreshCw size={14} />
                                        <span>Yeniden Oluştur</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isGenerating && result && !result.success && (
                            <div style={{
                                padding: 'var(--spacing-lg)',
                                background: 'var(--error-bg)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)'
                            }}>
                                <AlertCircle size={20} color="var(--error)" />
                                <span style={{ color: 'var(--error)' }}>{result.error}</span>
                            </div>
                        )}

                        {!isGenerating && !result && (
                            <div style={{
                                padding: 'var(--spacing-2xl)',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-lg)',
                                textAlign: 'center'
                            }}>
                                <Video size={48} color="var(--text-muted)" style={{ marginBottom: 'var(--spacing-md)' }} />
                                <p className="text-muted">Videonuz burada görünecek</p>
                            </div>
                        )}
                    </div>

                    {/* History */}
                    {generationHistory.length > 0 && (
                        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                            <h3 className="card-title" style={{ marginBottom: 'var(--spacing-md)' }}>
                                Son Üretimler
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {generationHistory.filter(h => h.success).slice(0, 3).map((item, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--spacing-sm)',
                                            padding: 'var(--spacing-sm)',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            border: result?.videoUrl === item.videoUrl ? '1px solid var(--accent-primary)' : '1px solid transparent'
                                        }}
                                        onClick={() => setResult(item)}
                                    >
                                        <CheckCircle size={14} color="var(--success)" />
                                        <span style={{ fontSize: '0.75rem', flex: 1 }}>
                                            Video #{generationHistory.length - index}
                                        </span>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <a
                                                href={item.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-ghost btn-icon"
                                                style={{ padding: '4px' }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Download size={12} />
                                            </a>
                                            <div className="btn btn-ghost btn-icon" style={{ padding: '4px' }}>
                                                <Play size={12} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                                {provider === 'kling' ? 'fal.ai' : 'Mirako AI'} API Ayarları
                            </h2>
                        </div>
                        <div className="modal-body">
                            <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
                                {provider === 'kling' ? (
                                    <>
                                        Kling AI video üretimi için fal.ai API anahtarı gereklidir.
                                        <a href="https://fal.ai/dashboard/keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>
                                            {' '}Buradan{' '}
                                        </a>
                                        API anahtarı alabilirsiniz.
                                    </>
                                ) : (
                                    <>
                                        Mirako AI video üretimi için API anahtarı gereklidir.
                                        <a href="https://mirako.co/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>
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
                                    placeholder={provider === 'kling' ? 'fal-xxxx...' : 'mi_xxxx...'}
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowApiKeyModal(false)}>
                                İptal
                            </button>
                            <button className="btn btn-primary" onClick={saveApiKey}>
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .upload-zone:hover {
                    border-color: var(--accent-primary) !important;
                    background: var(--bg-hover) !important;
                }
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

export default VideoGenerator;
