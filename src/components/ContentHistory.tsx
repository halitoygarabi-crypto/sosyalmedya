import React, { useState, useEffect, useCallback } from 'react';
import {
    Sparkles,
    Copy,
    RefreshCw,
    Clock,
    Image as ImageIcon,
    Video,
    ExternalLink,
    Search,
    Download,
    ChevronDown,
    ChevronUp,
    Send,
    Loader2,
    Database,
    Trash2,
} from 'lucide-react';
import { googleSheetsService } from '../utils/googleSheetsService';
import type { SheetEntry } from '../utils/googleSheetsService';
import { useDashboard } from '../context/DashboardContext';

interface ContentHistoryProps {
    onUseContent?: (content: { prompt: string; imageUrl: string; type: string }) => void;
}

const ContentHistory: React.FC<ContentHistoryProps> = ({ onUseContent }) => {
    const { addNotification } = useDashboard();
    const [entries, setEntries] = useState<SheetEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [savedContents, setSavedContents] = useState<SheetEntry[]>([]);
    const [activeTab, setActiveTab] = useState<'generated' | 'saved'>('generated');

    // Load saved contents from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('saved_contents');
            if (saved) setSavedContents(JSON.parse(saved));
        } catch {
            // ignore
        }
    }, []);

    // Fetch from Google Sheets
    const fetchHistory = useCallback(async () => {
        if (!googleSheetsService.isConfigured()) {
            addNotification({ type: 'warning', message: 'Google Sheets bağlantısı yapılmamış. Ayarlardan Webhook URL girin.', read: false });
            return;
        }

        setIsLoading(true);
        try {
            const data = await googleSheetsService.fetchData('n99');
            setEntries(data);
            addNotification({ type: 'success', message: `${data.length} içerik geçmişi yüklendi.`, read: false });
        } catch (error) {
            console.error('Fetch history error:', error);
            addNotification({ type: 'error', message: 'İçerik geçmişi yüklenemedi.', read: false });
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    // Save content to local favorites
    const saveContent = (entry: SheetEntry) => {
        const updated = [...savedContents, { ...entry, date: new Date().toLocaleString('tr-TR') }];
        setSavedContents(updated);
        localStorage.setItem('saved_contents', JSON.stringify(updated));
        addNotification({ type: 'success', message: '💾 İçerik kaydedildi!', read: false });
    };

    // Remove saved content
    const removeSavedContent = (index: number) => {
        const updated = savedContents.filter((_, i) => i !== index);
        setSavedContents(updated);
        localStorage.setItem('saved_contents', JSON.stringify(updated));
        addNotification({ type: 'info', message: 'İçerik kaldırıldı.', read: false });
    };

    // Copy prompt to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        addNotification({ type: 'success', message: '📋 Panoya kopyalandı!', read: false });
    };

    // Use content (pass to parent for new post creation)
    const handleUseContent = (entry: SheetEntry) => {
        if (onUseContent) {
            onUseContent({
                prompt: entry.prompt,
                imageUrl: entry.imageUrl,
                type: entry.type,
            });
        }
        addNotification({ type: 'success', message: '✅ İçerik yeni post olarak yüklendi!', read: false });
    };

    // Filter logic
    const currentList = activeTab === 'generated' ? entries : savedContents;
    const filteredList = currentList.filter((entry) => {
        const matchesSearch = !searchQuery ||
            entry.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.influencerName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || entry.type === filterType;
        return matchesSearch && matchesType;
    });

    const cardStyle: React.CSSProperties = {
        background: 'var(--card-bg)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        padding: 'var(--spacing-lg)',
    };

    const entryCardStyle: React.CSSProperties = {
        background: 'var(--bg-secondary, rgba(255,255,255,0.03))',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        padding: 'var(--spacing-md)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
    };

    const badgeStyle = (color: string): React.CSSProperties => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.7rem',
        fontWeight: 600,
        background: `${color}20`,
        color: color,
    });

    const tabStyle = (isActive: boolean): React.CSSProperties => ({
        padding: '8px 16px',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 600,
        background: isActive ? 'var(--primary)' : 'transparent',
        color: isActive ? '#fff' : 'var(--text-secondary)',
        transition: 'all 0.2s ease',
    });

    return (
        <div style={cardStyle}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>AI Üretim Geçmişi</h3>
                </div>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={fetchHistory}
                    disabled={isLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    {isLoading ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
                    <span>{isLoading ? 'Yükleniyor...' : 'Geçmişi Yükle'}</span>
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: 'var(--spacing-md)', background: 'var(--bg-secondary, rgba(0,0,0,0.05))', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                <button style={tabStyle(activeTab === 'generated')} onClick={() => setActiveTab('generated')}>
                    <Database size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Üretilen ({entries.length})
                </button>
                <button style={tabStyle(activeTab === 'saved')} onClick={() => setActiveTab('saved')}>
                    <Download size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Kaydedilenler ({savedContents.length})
                </button>
            </div>

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        className="input"
                        placeholder="İçerik ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '34px', width: '100%' }}
                    />
                </div>
                <select
                    className="input select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as 'all' | 'image' | 'video')}
                    style={{ width: 'auto' }}
                >
                    <option value="all">Tümü</option>
                    <option value="image">Görsel</option>
                    <option value="video">Video</option>
                </select>
            </div>

            {/* Content List */}
            {filteredList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                    <Sparkles size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <p style={{ fontWeight: 600, marginBottom: '4px' }}>
                        {activeTab === 'generated'
                            ? 'Henüz üretim geçmişi yok'
                            : 'Henüz kaydedilmiş içerik yok'}
                    </p>
                    <p style={{ fontSize: '0.8rem' }}>
                        {activeTab === 'generated'
                            ? '"Geçmişi Yükle" butonuna tıklayarak Google Sheets\'ten verileri çekin.'
                            : 'Üretilen içerikleri kaydetmek için 💾 butonunu kullanın.'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', maxHeight: '500px', overflowY: 'auto' }}>
                    {filteredList.map((entry, index) => (
                        <div
                            key={index}
                            style={{
                                ...entryCardStyle,
                                borderColor: expandedId === index ? 'var(--primary)' : 'var(--border-color)',
                            }}
                            onClick={() => setExpandedId(expandedId === index ? null : index)}
                        >
                            {/* Entry Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: '4px', flexWrap: 'wrap' }}>
                                        <span style={badgeStyle(entry.type === 'video' ? '#8b5cf6' : '#3b82f6')}>
                                            {entry.type === 'video' ? <Video size={10} /> : <ImageIcon size={10} />}
                                            {entry.type === 'video' ? 'Video' : 'Görsel'}
                                        </span>
                                        {entry.clientName && (
                                            <span style={badgeStyle('#10b981')}>{entry.clientName}</span>
                                        )}
                                        {entry.influencerName && (
                                            <span style={badgeStyle('#f59e0b')}>{entry.influencerName}</span>
                                        )}
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <Clock size={10} />
                                            {entry.date}
                                        </span>
                                    </div>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.85rem',
                                        lineHeight: 1.4,
                                        color: 'var(--text-primary)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: expandedId === index ? 'normal' : 'nowrap',
                                    }}>
                                        {entry.prompt}
                                    </p>
                                </div>

                                {/* Thumbnail */}
                                {entry.imageUrl && entry.imageUrl.startsWith('http') && (
                                    <img
                                        src={entry.imageUrl}
                                        alt=""
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 'var(--radius-sm)',
                                            objectFit: 'cover',
                                            marginLeft: 'var(--spacing-sm)',
                                            flexShrink: 0,
                                        }}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                )}

                                <div style={{ marginLeft: '8px', flexShrink: 0 }}>
                                    {expandedId === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedId === index && (
                                <div
                                    style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Full prompt */}
                                    <div style={{
                                        background: 'var(--bg-primary, rgba(0,0,0,0.03))',
                                        borderRadius: 'var(--radius-sm)',
                                        padding: 'var(--spacing-sm)',
                                        marginBottom: 'var(--spacing-sm)',
                                        fontSize: '0.8rem',
                                        lineHeight: 1.5,
                                        maxHeight: '120px',
                                        overflowY: 'auto',
                                    }}>
                                        {entry.prompt}
                                    </div>

                                    {/* Image preview */}
                                    {entry.imageUrl && entry.imageUrl.startsWith('http') && (
                                        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                                            <img
                                                src={entry.imageUrl}
                                                alt="Üretilen içerik"
                                                style={{
                                                    width: '100%',
                                                    maxHeight: '200px',
                                                    objectFit: 'contain',
                                                    borderRadius: 'var(--radius-md)',
                                                    background: '#000',
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Action buttons */}
                                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                                        <button
                                            className="btn btn-sm"
                                            style={{ fontSize: '0.75rem', background: 'var(--primary)', color: '#fff' }}
                                            onClick={() => handleUseContent(entry)}
                                        >
                                            <Send size={12} />
                                            <span>Yeni Post Olarak Kullan</span>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            style={{ fontSize: '0.75rem' }}
                                            onClick={() => copyToClipboard(entry.prompt)}
                                        >
                                            <Copy size={12} />
                                            <span>Kopyala</span>
                                        </button>
                                        {activeTab === 'generated' && (
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                style={{ fontSize: '0.75rem' }}
                                                onClick={() => saveContent(entry)}
                                            >
                                                <Download size={12} />
                                                <span>Kaydet</span>
                                            </button>
                                        )}
                                        {activeTab === 'saved' && (
                                            <button
                                                className="btn btn-sm"
                                                style={{ fontSize: '0.75rem', background: '#ef4444', color: '#fff' }}
                                                onClick={() => removeSavedContent(index)}
                                            >
                                                <Trash2 size={12} />
                                                <span>Kaldır</span>
                                            </button>
                                        )}
                                        {entry.imageUrl && entry.imageUrl.startsWith('http') && (
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                style={{ fontSize: '0.75rem' }}
                                                onClick={() => window.open(entry.imageUrl, '_blank')}
                                            >
                                                <ExternalLink size={12} />
                                                <span>Görseli Aç</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContentHistory;
