import React, { useState, useEffect } from 'react';
import { X, Instagram, Twitter, Linkedin, Play, Calendar, Clock, Image as ImageIcon, Send, Sparkles, Upload, FileVideo, Database } from 'lucide-react';
import { n99Service } from '../utils/n99Service';
// LimeSocial does not need a separate import here — media is handled via URL
import { useDashboard } from '../context/DashboardContext';
import type { Platform, Post } from '../types';
import { generateId, getOptimalPostingTime, getPlatformName } from '../utils/helpers';
import { mockPlatformStats } from '../data/mockData';

interface NewPostModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NewPostModal: React.FC<NewPostModalProps> = ({ isOpen, onClose }) => {
    const { addPost, addNotification, activeClient, limeSocialSettings } = useDashboard();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
    const [postType, setPostType] = useState<'post' | 'reel' | 'story'>('post');
    const [isSavingToSheet, setIsSavingToSheet] = useState(false);
    const [hasGeneratedAI, setHasGeneratedAI] = useState(false);
    const [manualSaved, setManualSaved] = useState(false);

    // Handle prefill from ContentHistory
    useEffect(() => {
        if (isOpen) {
            const prefill = sessionStorage.getItem('prefill_content');
            if (prefill) {
                try {
                    const data = JSON.parse(prefill);
                    if (data.prompt) setTitle(data.prompt);
                    if (data.imageUrl) setImageUrl(data.imageUrl);
                    if (data.type) {
                        setPostType(data.type === 'video' ? 'reel' : 'post');
                    }
                    // Clear after use
                    sessionStorage.removeItem('prefill_content');
                } catch (e) {
                    console.error('Prefill parse error:', e);
                }
            }
        }
    }, [isOpen]);

    const generateAIContent = async () => {
        if (!title.trim()) {
            addNotification({ type: 'warning', message: 'Lütfen önce bir konu veya başlık girin.', read: false });
            return;
        }

        setIsGenerating(true);
        try {
            const result = await n99Service.generateContent(
                title, 
                activeClient?.id || 'client_1',
                postType,
                platforms
            );
            if (result) {
                setContent(result.caption);
                if (result.videoUrl) {
                    setImageUrl(result.videoUrl);
                }
                setHasGeneratedAI(true);
                setManualSaved(false);
                addNotification({ type: 'success', message: 'AI içeriği ve videosu başarıyla üretildi.', read: false });
            } else {
                throw new Error('Cevap alınamadı');
            }
        } catch (error) {
            console.error('AI generation failed:', error);
            const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
            addNotification({ 
                type: 'error', 
                message: `AI içerik üretimi başarısız: ${msg}. API anahtarlarınızı (OpenAI / Fal.ai / Replicate) kontrol edin.`, 
                read: false 
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleManualSaveToSheet = async () => {
        if (!content && !imageUrl) {
            addNotification({ type: 'warning', message: 'Kaydedilecek içerik bulunamadı.', read: false });
            return;
        }

        setIsSavingToSheet(true);
        try {
            const { googleSheetsService } = await import('../utils/googleSheetsService');
            const res = await googleSheetsService.saveToNamedSheet('n99', {
                date: new Date().toISOString(),
                prompt: title,
                imageUrl: imageUrl,
                type: postType === 'post' ? 'image' : 'video',
                clientName: activeClient?.name || 'Genel',
                metadata: {
                    caption: content,
                    postType,
                    method: 'Manual Save'
                }
            });

            if (res.success) {
                setManualSaved(true);
                addNotification({ type: 'success', message: '📊 Google Sheet\'e başarıyla kaydedildi!', read: false });
            } else {
                addNotification({ type: 'error', message: `❌ Kayıt hatası: ${res.error}`, read: false });
            }
        } catch {
            addNotification({ type: 'error', message: 'Bağlantı hatası oluştu.', read: false });
        } finally {
            setIsSavingToSheet(false);
        }
    };

    const platformOptions: { id: Platform; name: string; icon: React.ReactNode }[] = [
        { id: 'instagram', name: 'Instagram', icon: <Instagram size={16} /> },
        { id: 'twitter', name: 'Twitter/X', icon: <Twitter size={16} /> },
        { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin size={16} /> },
        { id: 'tiktok', name: 'TikTok', icon: <Play size={16} /> },
    ];

    const togglePlatform = (platform: Platform) => {
        setPlatforms((prev) =>
            prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (platforms.length === 0) {
            addNotification({
                type: 'error',
                message: 'Lütfen en az bir platform seçin.',
                read: false,
            });
            return;
        }

        if (!content.trim()) {
            addNotification({
                type: 'error',
                message: 'Lütfen içerik girin.',
                read: false,
            });
            return;
        }

        if ((postType === 'reel' || postType === 'story') && !imageUrl) {
            addNotification({
                type: 'error',
                message: `${postType === 'reel' ? 'Reel' : 'Story'} paylaşmak için görsel veya video yüklemeniz gerekmektedir.`,
                read: false,
            });
            return;
        }

        const scheduledDateTime = isScheduled && scheduledDate && scheduledTime
            ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
            : new Date().toISOString();

        // Determine status: scheduled → 'scheduled', immediate → 'posted'
        const postStatus = isScheduled ? 'scheduled' : 'posted';

        const newPost: Post = {
            id: generateId(),
            clientId: activeClient?.id || 'client_1',
            title: title.trim(),
            content: content.trim(),
            imageUrls: imageUrl ? [imageUrl] : [],
            platforms,
            scheduledTime: scheduledDateTime,
            status: postStatus,
            metrics: { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0 },
            createdBy: 'admin',
            createdAt: new Date().toISOString(),
            postType,
        };

        addPost(newPost);

        // Publish to LimeSocial (immediately if 'posted', or scheduled if status is 'scheduled')
        if ((postStatus === 'posted' || postStatus === 'scheduled') && limeSocialSettings?.apiKey) {
            const actionType = postStatus === 'posted' ? 'yayınlanıyor' : 'planlanıyor';
            addNotification({ type: 'info', message: `LimeSocial üzerinden ${actionType}...`, read: false });
            
            n99Service.publishToLimeSocial(newPost, limeSocialSettings).then(success => {
                if (success) {
                    const successMsg = postStatus === 'posted' 
                        ? `✅ ${platforms.join(', ')} platformlarına yayınlandı!` 
                        : `📅 ${platforms.join(', ')} için planlama başarılı!`;
                    addNotification({ type: 'success', message: successMsg, read: false });
                } else {
                    addNotification({ type: 'warning', message: '⚠️ LimeSocial işlemi başarısız. İçerik sadece yerel kaydedildi.', read: false });
                }
            }).catch(() => {
                addNotification({ type: 'warning', message: '⚠️ LimeSocial bağlantı hatası. İçerik sadece yerel kaydedildi.', read: false });
            });
        }

        // Reset form
        setTitle('');
        setContent('');
        setPlatforms([]);
        setScheduledDate('');
        setScheduledTime('');
        setImageUrl('');
        setIsScheduled(false);
        setPostType('post');
        setHasGeneratedAI(false);
        setManualSaved(false);

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">Yeni İçerik Oluştur</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* Title */}
                        <div className="input-group">
                            <label className="input-label">Başlık *</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Post başlığı..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Content */}
                        <div className="input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
                                <label className="input-label" style={{ marginBottom: 0 }}>İçerik *</label>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={generateAIContent}
                                    disabled={isGenerating}
                                    style={{ color: 'var(--primary)', gap: '4px' }}
                                >
                                    {isGenerating ? (
                                        <div className="spinner-sm" />
                                    ) : (
                                        <Sparkles size={14} />
                                    )}
                                    <span>AI Sihirbazı</span>
                                </button>
                                {hasGeneratedAI && (
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-sm"
                                        onClick={handleManualSaveToSheet}
                                        disabled={isSavingToSheet || manualSaved}
                                        style={{ color: manualSaved ? 'var(--success)' : '#1d804e', gap: '4px', marginLeft: 'auto' }}
                                    >
                                        {isSavingToSheet ? (
                                            <div className="spinner-sm" />
                                        ) : (
                                            <Database size={14} />
                                        )}
                                        <span>{manualSaved ? 'Kaydedildi ✓' : 'Tabloya Kaydet'}</span>
                                    </button>
                                )}
                            </div>
                            <textarea
                                className="input textarea"
                                placeholder="Post içeriği..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={4}
                            />
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginTop: '4px',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                <span>{content.length} karakter</span>
                                <span>Twitter limiti: 280</span>
                            </div>
                        </div>

                        {/* Platforms */}
                        <div className="input-group">
                            <label className="input-label">Platform Seçin *</label>
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                                {platformOptions.map((platform) => (
                                    <button
                                        key={platform.id}
                                        type="button"
                                        className={`btn ${platforms.includes(platform.id) ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => togglePlatform(platform.id)}
                                        style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}
                                    >
                                        {platform.icon}
                                        <span>{platform.name}</span>
                                    </button>
                                ))}
                            </div>
                            {platforms.length === 0 && (
                                <p style={{ fontSize: '0.7rem', color: 'var(--error)', marginTop: '4px' }}>
                                    Lütfen en az bir platform seçin.
                                </p>
                            )}
                        </div>
                        
                        {/* Post Type */}
                        <div className="input-group">
                            <label className="input-label">Gönderi Türü</label>
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                <button
                                    type="button"
                                    className={`btn btn-sm ${postType === 'post' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setPostType('post')}
                                >
                                    Normal Post
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm ${postType === 'reel' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setPostType('reel')}
                                >
                                    Reel / Video
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm ${postType === 'story' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setPostType('story')}
                                >
                                    Hikaye (Story)
                                </button>
                            </div>
                        </div>



                        {/* File Upload */}
                        <div className="input-group">
                            <label className="input-label">
                                <FileVideo size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                Video/Görsel Yükle (Bilgisayardan)
                            </label>
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                                <input
                                    type="file"
                                    accept="video/*,image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setSelectedFile(e.target.files[0]);
                                            setUploadedMediaId(null);
                                        }
                                    }}
                                    style={{ flex: 1 }}
                                    className="input"
                                />
                                {selectedFile && !uploadedMediaId && (
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={async () => {
                                            if (!selectedFile) return;
                                            setIsUploading(true);
                                            // LimeSocial uses mediaUrl, so we create a local preview URL
                                            // For production, upload to a CDN/storage first
                                            const objectUrl = URL.createObjectURL(selectedFile);
                                            setImageUrl(objectUrl);
                                            setUploadedMediaId('local_' + Date.now());
                                            setIsUploading(false);
                                            addNotification({ type: 'success', message: 'Dosya hazırlandı!', read: false });
                                        }}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? <div className="spinner-sm" /> : <Upload size={14} />}
                                        <span>{isUploading ? 'Yükleniyor...' : 'Yükle'}</span>
                                    </button>
                                )}
                                {uploadedMediaId && (
                                    <span style={{ color: 'var(--success)', fontSize: '0.75rem' }}>✓ Yüklendi</span>
                                )}
                            </div>
                            {selectedFile && (
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    Seçilen: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                            )}
                        </div>

                        {/* Image URL (manual) */}
                        <div className="input-group">
                            <label className="input-label">
                                <ImageIcon size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                Veya Görsel URL (Opsiyonel)
                            </label>
                            <input
                                type="url"
                                className="input"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                disabled={!!uploadedMediaId}
                            />
                        </div>

                        {/* Schedule Toggle */}
                        <div
                            className="input-group"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 'var(--spacing-md)',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <Calendar size={18} />
                                <span>Gönderim Zamanla</span>
                            </div>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={isScheduled}
                                    onChange={(e) => setIsScheduled(e.target.checked)}
                                />
                                <span className="toggle-slider" />
                            </label>
                        </div>

                        {/* Schedule Date and Time */}
                        {isScheduled && (
                            <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                <div>
                                    <label className="input-label">Tarih</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <label className="input-label">Saat</label>
                                    <input
                                        type="time"
                                        className="input"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Optimal Time Suggestion */}
                        <div
                            style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--info-bg)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--info)' }}>
                                <Clock size={16} />
                                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Optimal Paylaşım Zamanı</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Instagram için 19:00, Twitter için 12:00, LinkedIn için 09:00 önerilmektedir.
                                {platforms.length > 0 && (
                                    <div style={{ marginTop: 'var(--spacing-xs)', fontWeight: 600 }}>
                                        {platforms.map(p => (
                                            <div key={p}>
                                                • {getPlatformName(p)} için en iyi saat: {getOptimalPostingTime(p, mockPlatformStats)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            İptal
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Send size={16} />
                            <span>{isScheduled ? 'Planla' : 'Şimdi Gönder'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewPostModal;
