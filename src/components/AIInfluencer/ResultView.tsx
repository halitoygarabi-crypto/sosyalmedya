import React from 'react';
import { Camera, Download, Play, Sparkles, Loader2, Video, Send } from 'lucide-react';
import type { InfluencerGenerationResponse } from '../../utils/aiInfluencerService';

interface ResultViewProps {
    result: InfluencerGenerationResponse | null;
    isGenerating: boolean;
    isAnimating: boolean;
    animatedVideo: string | null;
    script: string;
    setScript: (script: string) => void;
    isGeneratingScript: boolean;
    handleGenerateScript: () => void;
    handleAnimate: () => void;
    talkingProvider: 'sadtalker' | 'mirako';
    setTalkingProvider: (provider: 'sadtalker' | 'mirako') => void;
    handleSaveToSheet: () => void;
    isSavingToSheet: boolean;
}

export const ResultView: React.FC<ResultViewProps> = ({
    result,
    isGenerating,
    isAnimating,
    animatedVideo,
    script,
    setScript,
    isGeneratingScript,
    handleGenerateScript,
    handleAnimate,
    talkingProvider,
    setTalkingProvider,
    handleSaveToSheet,
    isSavingToSheet
}) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div className="card" style={{ padding: '0', overflow: 'hidden', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)' }}>
                {isGenerating ? (
                    <div style={{ margin: 'auto', textAlign: 'center' }}>
                        <Loader2 size={48} className="animate-spin" color="var(--accent-primary)" style={{ marginBottom: 'var(--spacing-md)' }} />
                        <p className="text-muted">AI Karakter Üretiliyor...</p>
                    </div>
                ) : result?.imageUrl ? (
                    <div style={{ width: '100%', position: 'relative' }}>
                        {animatedVideo ? (
                            <video 
                                src={animatedVideo} 
                                controls 
                                autoPlay 
                                style={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }}
                            />
                        ) : (
                            <img 
                                src={result.imageUrl} 
                                alt="Generated Influencer" 
                                style={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }}
                            />
                        )}
                        <div style={{ position: 'absolute', bottom: 'var(--spacing-md)', right: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button className="btn btn-secondary btn-icon" onClick={() => window.open(animatedVideo || result.imageUrl, '_blank')}>
                                <Download size={18} />
                            </button>
                            <button 
                                className="btn btn-secondary btn-icon" 
                                onClick={handleSaveToSheet}
                                disabled={isSavingToSheet}
                            >
                                {isSavingToSheet ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ margin: 'auto', textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                        <Camera size={64} style={{ opacity: 0.1, marginBottom: 'var(--spacing-md)' }} />
                        <p className="text-muted">Yandaki ayarlarla bir karakter oluşturun veya bir fotoğraf yükleyin.</p>
                    </div>
                )}
            </div>

            {/* Animation & Script Controls */}
            {result?.imageUrl && (
                <div className="card animate-slideUp" style={{ padding: 'var(--spacing-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Play size={18} color="var(--success)" />
                            <h3 className="card-title" style={{ margin: 0 }}>Karakteri Konuştur</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                            <button 
                                className={`btn btn-sm ${talkingProvider === 'sadtalker' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setTalkingProvider('sadtalker')}
                                style={{ fontSize: '10px' }}
                            >SadTalker</button>
                            <button 
                                className={`btn btn-sm ${talkingProvider === 'mirako' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setTalkingProvider('mirako')}
                                style={{ fontSize: '10px' }}
                            >Mirako</button>
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <label className="input-label" style={{ margin: 0 }}>Konuşma Metni</label>
                            <button 
                                className="btn btn-ghost btn-sm" 
                                onClick={handleGenerateScript}
                                disabled={isGeneratingScript}
                                style={{ color: 'var(--accent-primary)', padding: '2px 8px' }}
                            >
                                {isGeneratingScript ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                <span style={{ marginLeft: '4px' }}>AI ile Yaz</span>
                            </button>
                        </div>
                        <textarea 
                            className="input"
                            rows={3}
                            placeholder="Karakterin söylemesini istediğiniz metni yazın..."
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            style={{ fontSize: '0.9rem' }}
                        />
                    </div>

                    <button 
                        className="btn btn-primary btn-full btn-lg"
                        onClick={handleAnimate}
                        disabled={isAnimating || !script}
                        style={{ background: 'var(--success)' }}
                    >
                        {isAnimating ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>Video Hazırlanıyor...</span>
                            </>
                        ) : (
                            <>
                                <Video size={20} />
                                <span>Konuşan Video Üret</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};
