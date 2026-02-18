import React, { useState, useEffect } from 'react';
import { 
    X, 
    Upload, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    Send, 
    Globe, 
    Instagram, 
    Twitter, 
    Linkedin, 
    Play,
    Loader2,
    Calendar,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { generateId } from '../utils/helpers';
import type { Platform, Post } from '../types';

interface DistributionStatus {
    platform: Platform;
    status: 'waiting' | 'uploading' | 'processing' | 'success' | 'failed';
    progress: number;
    error?: string;
}

interface DistributionPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialFile: File | null;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const DistributionPlannerModal: React.FC<DistributionPlannerModalProps> = ({ isOpen, onClose, initialFile }) => {
    const { addPost, addNotification, activeClient, limeSocialSettings } = useDashboard();
    
    const [step, setStep] = useState<'plan' | 'distribution'>('plan');
    const [file, setFile] = useState<File | null>(initialFile);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [platforms, setPlatforms] = useState<Platform[]>(['instagram', 'twitter']);
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    
    const [distributionStatuses, setDistributionStatuses] = useState<DistributionStatus[]>([]);

    useEffect(() => {
        if (initialFile) {
            setFile(initialFile);
            const url = URL.createObjectURL(initialFile);
            setPreviewUrl(url);
            setTitle(initialFile.name.split('.')[0]);
        }
    }, [initialFile]);

    useEffect(() => {
        if (!isOpen) {
            setStep('plan');
            setDistributionStatuses([]);
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
            setTitle(selectedFile.name.split('.')[0]);
        }
    };

    const togglePlatform = (p: Platform) => {
        setPlatforms(prev => 
            prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
        );
    };

    const startDistribution = async () => {
        if (!file || platforms.length === 0) return;

        setStep('distribution');
        
        // Initialize statuses
        const initialStatuses: DistributionStatus[] = platforms.map(p => ({
            platform: p,
            status: 'waiting',
            progress: 0
        }));
        setDistributionStatuses(initialStatuses);

        // Save to dashboard
        const scheduledDateTime = isScheduled && scheduledDate && scheduledTime
            ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
            : new Date().toISOString();

        const newPost: Post = {
            id: generateId(),
            clientId: activeClient?.id || 'client_1',
            title,
            content: caption,
            imageUrls: [previewUrl || ''],
            platforms,
            scheduledTime: scheduledDateTime,
            status: isScheduled ? 'scheduled' : 'draft', // Start as draft or scheduled
            metrics: { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0 },
            createdBy: 'admin',
            createdAt: new Date().toISOString()
        };
        
        addPost(newPost);

        // Publish to LimeSocial
        let publicationSuccess = false;
        let publicationError = '';

        if (limeSocialSettings?.apiKey) {
            const { n99Service } = await import('../utils/n99Service');
            try {
                // If it's a local file URL (blob:), warn that LimeSocial might fail
                if (previewUrl?.startsWith('blob:')) {
                    addNotification({ 
                        type: 'warning', 
                        message: '⚠️ Yerel dosyalar henüz buluta yüklenmediği için LimeSocial üzerinden paylaşımda sorun çıkabilir. Lütfen AI üretimi veya public URL kullanın.', 
                        read: false 
                    });
                }

                const result = await n99Service.publishToLimeSocial(newPost, limeSocialSettings);
                publicationSuccess = result.success;

                if (publicationSuccess) {
                    const { updatePost } = await import('../utils/supabaseService').then(m => m.supabaseService);
                    await updatePost(newPost.id, { status: isScheduled ? 'scheduled' : 'posted' });
                    
                    const msg = isScheduled ? '📅 İçerik başarıyla planlandı!' : '✅ İçerik platformlara servis edildi!';
                    addNotification({ type: 'success', message: msg, read: false });
                } else {
                    const { updatePost } = await import('../utils/supabaseService').then(m => m.supabaseService);
                    await updatePost(newPost.id, { status: 'failed', errorMessage: result.error || 'LimeSocial API reddetti.' });
                    
                    publicationError = result.error || 'API servisi isteği kabul etmedi. Ayarlarınızı kontrol edin.';
                    addNotification({ type: 'error', message: `❌ LimeSocial: ${publicationError}`, read: false });
                }
            } catch (err) {
                publicationError = 'Bağlantı hatası oluştu.';
                console.error(err);
            }
        } else {
            publicationError = 'LimeSocial API anahtarı ayarlanmamış.';
        }

        // Update platform statuses based on the actual publication result
        for (const p of platforms) {
            updateStatus(p, 'uploading', 20);
            await delay(800);
            
            updateStatus(p, 'processing', 60);
            await delay(1000);
            
            if (publicationSuccess) {
                updateStatus(p, 'success', 100);
            } else {
                updateStatus(p, 'failed', 60, publicationError || 'Dağıtım hatası');
            }
        }

        if (publicationSuccess) {
            addNotification({
                type: 'success',
                message: 'İçerik dağıtımı tamamlandı.',
                read: false
            });
        }
    };

    const updateStatus = (platform: Platform, status: DistributionStatus['status'], progress: number, error?: string) => {
        setDistributionStatuses(prev => prev.map(s => 
            s.platform === platform ? { ...s, status, progress, error } : s
        ));
    };

    const getPlatformIcon = (p: Platform) => {
        switch(p) {
            case 'instagram': return <Instagram size={18} />;
            case 'twitter': return <Twitter size={18} />;
            case 'linkedin': return <Linkedin size={18} />;
            case 'tiktok': return <Play size={18} />;
            default: return <Globe size={18} />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal card-glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%', padding: 0, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Upload size={20} className="text-primary" />
                            {step === 'plan' ? 'Lokal İçerik Dağıtım Planı' : 'İçerik Dağıtım Durumu'}
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {step === 'plan' ? 'Yüklediğiniz içeriği platformlara göre optimize edin ve planlayın.' : 'İçeriğiniz seçilen platformlara aktarılıyor...'}
                        </p>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', height: '500px' }}>
                    {step === 'plan' ? (
                        <>
                            {/* Left: Preview & File Info */}
                            <div style={{ flex: 1, padding: 'var(--spacing-lg)', borderRight: '1px solid var(--border-color)', background: 'var(--bg-secondary)', overflowY: 'auto' }}>
                                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                    <label className="input-label">Medya Önizleme</label>
                                    {previewUrl ? (
                                        <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#000', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {file?.type.startsWith('video') ? (
                                                <video src={previewUrl} controls style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                            ) : (
                                                <img src={previewUrl} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                            )}
                                        </div>
                                    ) : (
                                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', gap: '10px' }}>
                                            <Upload size={32} className="text-muted" />
                                            <span className="text-muted">Dosya seçin</span>
                                            <input type="file" hidden onChange={handleFileChange} accept="image/*,video/*" />
                                        </label>
                                    )}
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Dosya Adı</label>
                                    <input type="text" className="input" value={title} onChange={e => setTitle(e.target.value)} />
                                </div>

                                <div style={{ marginTop: 'var(--spacing-md)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <p>Boyut: {file ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : '-'}</p>
                                    <p>Tür: {file?.type || '-'}</p>
                                </div>
                            </div>

                            {/* Right: Planning Options */}
                            <div style={{ flex: 1, padding: 'var(--spacing-lg)', overflowY: 'auto' }}>
                                <div className="input-group">
                                    <label className="input-label">Açıklama / Caption</label>
                                    <textarea 
                                        className="input" 
                                        rows={4} 
                                        placeholder="Harika bir açıklama yazın..."
                                        value={caption}
                                        onChange={e => setCaption(e.target.value)}
                                        style={{ resize: 'none' }}
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Dağıtım Platformları</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {(['instagram', 'twitter', 'linkedin', 'tiktok'] as Platform[]).map(p => (
                                            <button 
                                                key={p} 
                                                onClick={() => togglePlatform(p)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '8px 12px',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: '1px solid',
                                                    borderColor: platforms.includes(p) ? 'var(--accent-primary)' : 'var(--border-color)',
                                                    background: platforms.includes(p) ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                                                    color: platforms.includes(p) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {getPlatformIcon(p)}
                                                <span style={{ textTransform: 'capitalize' }}>{p}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="input-group" style={{ 
                                    padding: 'var(--spacing-md)', 
                                    background: 'var(--bg-tertiary)', 
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Calendar size={18} className="text-muted" />
                                        <span style={{ fontSize: '0.85rem' }}>Gönderimi Zamanla</span>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked={isScheduled} onChange={e => setIsScheduled(e.target.checked)} />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>

                                {isScheduled && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                        <input type="date" className="input" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
                                        <input type="time" className="input" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, padding: 'var(--spacing-xl)', background: 'var(--bg-secondary)', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                                {distributionStatuses.map(status => (
                                    <div key={status.platform} className="card" style={{ padding: 'var(--spacing-md)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ 
                                                    width: '32px', 
                                                    height: '32px', 
                                                    borderRadius: '8px', 
                                                    background: 'var(--bg-tertiary)', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    color: 'var(--accent-primary)'
                                                }}>
                                                    {getPlatformIcon(status.platform)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: '0.9rem' }}>{status.platform}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {status.status === 'success' ? 'Başarıyla tamamlandı' : 
                                                         status.status === 'failed' ? 'Hata: ' + status.error :
                                                         status.status === 'processing' ? 'İşleniyor...' :
                                                         status.status === 'uploading' ? 'Yükleniyor...' : 'Bekleniyor...'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                {status.status === 'success' && <CheckCircle2 size={20} className="text-success" />}
                                                {status.status === 'failed' && <AlertCircle size={20} className="text-error" />}
                                                {(status.status === 'uploading' || status.status === 'processing') && <Loader2 size={20} className="spin text-primary" />}
                                                {status.status === 'waiting' && <Clock size={20} className="text-muted" />}
                                            </div>
                                        </div>
                                        <div style={{ width: '100%', height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                width: `${status.progress}%`, 
                                                height: '100%', 
                                                background: status.status === 'failed' ? 'var(--error)' : 'var(--accent-gradient)',
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: 'var(--spacing-lg)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)' }}>
                    {step === 'plan' ? (
                        <>
                            <button className="btn btn-secondary" onClick={onClose}>Vazgeç</button>
                            <button 
                                className="btn btn-primary" 
                                disabled={!file || platforms.length === 0}
                                onClick={startDistribution}
                            >
                                <Send size={16} />
                                {isScheduled ? 'Dağıtımı Planla' : 'Hemen Dağıt'}
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-primary" onClick={onClose}>Tamam</button>
                    )}
                </div>
            </div>
            
            <style>{`
                .spin { animation: spin 1.5s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes modalSlideIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default DistributionPlannerModal;
