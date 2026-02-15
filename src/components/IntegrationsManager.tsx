import React, { useState, useEffect } from 'react';
import {
    Key,
    Save,
    RefreshCw,
    UserCheck,
    Settings,
    Globe,
    ExternalLink,
    Zap,
    CheckCircle2,
    Table,
    Sparkles,
    Instagram,
    Twitter,
    Linkedin,
    Play,
    ShieldCheck,
    XCircle,
    Building2,
    Trash2
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import type { Platform, PlatformConnection } from '../types';
import type { SheetConfig } from '../utils/googleSheetsService';
import { replicateService } from '../utils/replicateService';
import { aiInfluencerService } from '../utils/aiInfluencerService';

// Default platform connections
const getDefaultConnections = (): Record<Platform, PlatformConnection> => ({
    instagram: {
        platform: 'instagram',
        isConnected: false,
        accountName: '',
        accessToken: '',
        pageId: '',
    },
    twitter: {
        platform: 'twitter',
        isConnected: false,
        accountName: '',
        apiKey: '',
        apiSecret: '',
        accessToken: '',
    },
    linkedin: {
        platform: 'linkedin',
        isConnected: false,
        accountName: '',
        accessToken: '',
        accountId: '',
    },
    tiktok: {
        platform: 'tiktok',
        isConnected: false,
        accountName: '',
        accessToken: '',
        accountId: '',
    }
});

const IntegrationsManager: React.FC = () => {
    const { addNotification } = useDashboard();
    const [isSyncing, setIsSyncing] = useState(false);
    const [connections, setConnections] = useState<Record<Platform, PlatformConnection>>(() => {
        const saved = localStorage.getItem('platform_connections');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return getDefaultConnections();
            }
        }
        return getDefaultConnections();
    });
    const [expandedPlatform, setExpandedPlatform] = useState<Platform | null>(null);
    const [useLimeSocial, setUseLimeSocial] = useState(() => {
        const saved = localStorage.getItem('use_limesocial');
        return saved === null ? true : saved === 'true';
    });

    // Clear the effect since we handle it in initial state
    useEffect(() => {}, []);

    // Save connections to localStorage
    const saveConnections = () => {
        localStorage.setItem('platform_connections', JSON.stringify(connections));
        localStorage.setItem('use_limesocial', String(useLimeSocial));
        addNotification({ type: 'success', message: 'Bağlantı ayarları kaydedildi!', read: false });
    };

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            addNotification({ type: 'info', message: 'Bağlantı durumları güncellendi.', read: false });
        }, 2000);
    };

    const updateConnection = (platform: Platform, updates: Partial<PlatformConnection>) => {
        setConnections(prev => ({
            ...prev,
            [platform]: { ...prev[platform], ...updates }
        }));
    };

    const testConnection = async (platform: Platform) => {
        const conn = connections[platform];
        addNotification({ type: 'info', message: `${platform} bağlantısı test ediliyor...`, read: false });

        // Simulate connection test - in real scenario, call respective API
        setTimeout(() => {
            if (conn.accessToken || conn.apiKey) {
                updateConnection(platform, { isConnected: true });
                addNotification({ type: 'success', message: `${platform} bağlantısı başarılı!`, read: false });
            } else {
                addNotification({ type: 'error', message: `${platform} için geçerli kimlik bilgileri gerekli.`, read: false });
            }
        }, 1500);
    };

    const platforms: { id: Platform; name: string; icon: React.ReactNode; color: string; description: string }[] = [
        {
            id: 'instagram',
            name: 'Instagram',
            icon: <Instagram size={20} />,
            color: '#E4405F',
            description: 'Post, Reels ve Hikaye paylaşımı.'
        },
        {
            id: 'twitter',
            name: 'Twitter / X',
            icon: <Twitter size={20} />,
            color: '#1DA1F2',
            description: 'Tweet ve Media paylaşımları.'
        },
        {
            id: 'linkedin',
            name: 'LinkedIn',
            icon: <Linkedin size={20} />,
            color: '#0077B5',
            description: 'Profesyonel ağ paylaşımları.'
        },
        {
            id: 'tiktok',
            name: 'TikTok',
            icon: <Play size={20} />,
            color: '#000000',
            description: 'Kısa video içerikleri.'
        }
    ];

    const systemIntegrations = [
        {
            id: 'n99',
            name: 'n99 Orchestration',
            description: 'İçerik akışı ve iş akışı otomasyonu.',
            status: 'connected',
            url: 'https://n99.polmarkai.pro',
            icon: <Zap size={20} />,
            color: '#FF6D5A'
        },
        {
            id: 'openai',
            name: 'OpenAI (GPT-4o)',
            description: 'AI içerik üretimi ve polishing.',
            status: 'connected',
            url: 'https://openai.com',
            icon: <ShieldCheck size={20} />,
            color: '#10A37F'
        }
    ];

    return (
        <div className="section">
            {/* Mode Toggle */}
            <div className="card" style={{ marginBottom: 'var(--spacing-xl)', padding: 'var(--spacing-lg)', background: 'var(--bg-tertiary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Entegrasyon Modu</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {useLimeSocial
                                ? 'LimeSocial üzerinden tüm platformlara tek API ile bağlan'
                                : 'Her platforma doğrudan API ile ayrı ayrı bağlan'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <button
                            className={`btn ${useLimeSocial ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                            onClick={() => setUseLimeSocial(true)}
                        >
                            LimeSocial (Kolay)
                        </button>
                        <button
                            className={`btn ${!useLimeSocial ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                            onClick={() => setUseLimeSocial(false)}
                        >
                            Doğrudan API (Gelişmiş)
                        </button>
                    </div>
                </div>
            </div>

            {useLimeSocial ? (
                /* LimeSocial Mode */
                <>
                    <div className="section-header">
                        <h2 className="section-title">LimeSocial Entegrasyonu</h2>
                    </div>
                    <LimeSocialSettingsCard />
                </>
            ) : (
                /* Direct API Mode */
                <>
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Platform Bağlantıları</h2>
                            <p className="text-muted text-sm">Her platform için ayrı API kimlik bilgileri girin.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={handleSync}
                                disabled={isSyncing}
                            >
                                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                                <span>Durumu Güncelle</span>
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={saveConnections}>
                                <Save size={14} />
                                <span>Kaydet</span>
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {platforms.map((platform) => {
                            const conn = connections[platform.id];
                            const isExpanded = expandedPlatform === platform.id;

                            return (
                                <div key={platform.id} className="card" style={{ overflow: 'hidden' }}>
                                    {/* Header */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: 'var(--spacing-lg)',
                                            cursor: 'pointer',
                                            background: isExpanded ? 'var(--bg-tertiary)' : 'transparent'
                                        }}
                                        onClick={() => setExpandedPlatform(isExpanded ? null : platform.id)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                            <div
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: 'var(--radius-md)',
                                                    background: `${platform.color}15`,
                                                    color: platform.color,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {platform.icon}
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{platform.name}</h3>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {conn.accountName || platform.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                            {conn.isConnected ? (
                                                <div className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <CheckCircle2 size={12} />
                                                    BAĞLI
                                                </div>
                                            ) : (
                                                <div className="badge badge-neutral" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <XCircle size={12} />
                                                    BAĞLI DEĞİL
                                                </div>
                                            )}
                                            <Settings size={16} style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                    </div>

                                    {/* Expanded Settings */}
                                    {isExpanded && (
                                        <div style={{ padding: 'var(--spacing-lg)', borderTop: '1px solid var(--border-color)' }}>
                                            <PlatformSettingsForm
                                                platform={platform.id}
                                                connection={conn}
                                                onUpdate={(updates) => updateConnection(platform.id, updates)}
                                                onTest={() => testConnection(platform.id)}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* System Services */}
            <div className="section-header" style={{ marginTop: 'var(--spacing-xl)' }}>
                <h2 className="section-title">Sistem Servisleri</h2>
            </div>
            <div className="grid-2">
                {systemIntegrations.map((integration) => (
                    <div key={integration.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-lg)',
                                background: `${integration.color}15`,
                                color: integration.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {integration.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{integration.name}</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{integration.description}</p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', opacity: 0.7 }}>
                                {integration.url}
                            </span>
                        </div>
                        <div className="badge badge-success">AKTİF</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Platform-specific settings form
interface PlatformSettingsFormProps {
    platform: Platform;
    connection: PlatformConnection;
    onUpdate: (updates: Partial<PlatformConnection>) => void;
    onTest: () => void;
}

const PlatformSettingsForm: React.FC<PlatformSettingsFormProps> = ({ platform, connection, onUpdate, onTest }) => {
    const getOAuthUrl = (platform: Platform) => {
        switch (platform) {
            case 'instagram':
                return `https://api.instagram.com/oauth/authorize?client_id=${import.meta.env.VITE_INSTAGRAM_APP_ID || 'YOUR_APP_ID'}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/instagram/callback')}&scope=instagram_basic,instagram_content_publish&response_type=code`;
            case 'twitter':
                return 'https://twitter.com/i/oauth2/authorize'; // Requires setup
            case 'linkedin':
                return 'https://www.linkedin.com/oauth/v2/authorization'; // Requires setup
            case 'tiktok':
                return 'https://www.tiktok.com/v2/auth/authorize/'; // Requires setup
            default:
                return '#';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {/* Account Name */}
            <div className="input-group">
                <label className="input-label">
                    <UserCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Hesap Adı
                </label>
                <input
                    type="text"
                    className="input"
                    placeholder="@kullanici_adi"
                    value={connection.accountName || ''}
                    onChange={(e) => onUpdate({ accountName: e.target.value })}
                />
            </div>

            {/* Platform-specific fields */}
            {platform === 'instagram' && (
                <>
                    <div className="input-group">
                        <label className="input-label">
                            <Key size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Access Token
                        </label>
                        <input
                            type="password"
                            className="input"
                            placeholder="Instagram Graph API Access Token"
                            value={connection.accessToken || ''}
                            onChange={(e) => onUpdate({ accessToken: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">
                            <Globe size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Page/Business Account ID
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="17841405793..."
                            value={connection.pageId || ''}
                            onChange={(e) => onUpdate({ pageId: e.target.value })}
                        />
                    </div>
                </>
            )}

            {platform === 'twitter' && (
                <>
                    <div className="grid-2" style={{ gap: 'var(--spacing-md)' }}>
                        <div className="input-group">
                            <label className="input-label">API Key</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="Consumer Key"
                                value={connection.apiKey || ''}
                                onChange={(e) => onUpdate({ apiKey: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">API Secret</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="Consumer Secret"
                                value={connection.apiSecret || ''}
                                onChange={(e) => onUpdate({ apiSecret: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Access Token</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="OAuth Access Token"
                            value={connection.accessToken || ''}
                            onChange={(e) => onUpdate({ accessToken: e.target.value })}
                        />
                    </div>
                </>
            )}

            {platform === 'linkedin' && (
                <>
                    <div className="input-group">
                        <label className="input-label">Access Token</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="LinkedIn OAuth Token"
                            value={connection.accessToken || ''}
                            onChange={(e) => onUpdate({ accessToken: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Organization/Person ID</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="urn:li:organization:12345"
                            value={connection.accountId || ''}
                            onChange={(e) => onUpdate({ accountId: e.target.value })}
                        />
                    </div>
                </>
            )}

            {platform === 'tiktok' && (
                <>
                    <div className="input-group">
                        <label className="input-label">Access Token</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="TikTok API Access Token"
                            value={connection.accessToken || ''}
                            onChange={(e) => onUpdate({ accessToken: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Open ID (Hesap ID)</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="TikTok Open ID"
                            value={connection.accountId || ''}
                            onChange={(e) => onUpdate({ accountId: e.target.value })}
                        />
                    </div>
                </>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
                <button className="btn btn-primary btn-sm" onClick={onTest}>
                    <CheckCircle2 size={14} />
                    <span>Bağlantıyı Test Et</span>
                </button>
                <a
                    href={getOAuthUrl(platform)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                >
                    <ExternalLink size={14} />
                    <span>OAuth ile Bağlan</span>
                </a>
                {connection.isConnected && (
                    <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--error)' }}
                        onClick={() => onUpdate({ isConnected: false, accessToken: '', accountName: '' })}
                    >
                        Bağlantıyı Kes
                    </button>
                )}
            </div>

            {/* Help Text */}
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-sm)' }}>
                {platform === 'instagram' && 'Instagram Graph API için Facebook Developer hesabı ve Business Account gereklidir.'}
                {platform === 'twitter' && 'Twitter API v2 için Developer Portal\'dan uygulama oluşturmanız gerekir.'}
                {platform === 'linkedin' && 'LinkedIn API için Developer Portal\'dan uygulama oluşturmanız gerekir.'}
                {platform === 'tiktok' && 'TikTok for Developers portalından uygulama oluşturmanız gerekir.'}
            </p>
        </div>
    );
};

// Integrations Manager Sub-components...
const LimeSocialSettingsCard: React.FC = () => {
    const { 
        limeSocialSettings, updateLimeSocialSettings, 
        aiSettings, updateAiSettings,
        n99Settings, updateN99Settings,
        addNotification 
    } = useDashboard();
    
    const [localLimeSettings, setLocalLimeSettings] = useState(limeSocialSettings);
    const [localAiSettings, setLocalAiSettings] = useState(aiSettings);
    const [localN99Settings, setLocalN99Settings] = useState(n99Settings);
    const [testResult, setTestResult] = useState<{ credits?: number; success?: boolean } | null>(null);
    const [replicateTest, setReplicateTest] = useState<{ success?: boolean; error?: string; loading?: boolean }>({});
    const [falTest, setFalTest] = useState<{ success?: boolean; error?: string; loading?: boolean }>({});

    const handleSaveLime = () => {
        updateLimeSocialSettings(localLimeSettings);
    };

    const handleSaveAi = () => {
        updateAiSettings(localAiSettings);
    };

    const handleSaveN99 = () => {
        updateN99Settings(localN99Settings);
    };

    const testReplicate = async () => {
        setReplicateTest({ loading: true });
        const res = await replicateService.testConnection(localAiSettings.replicateKey);
        setReplicateTest({ ...res, loading: false });
        if (res.success) addNotification({ type: 'success', message: 'Replicate bağlantısı başarılı!', read: false });
        else addNotification({ type: 'error', message: `Replicate hatası: ${res.error}`, read: false });
    };

    const testFal = async () => {
        setFalTest({ loading: true });
        // Simulating a simple model check for fal.ai
        const res = await aiInfluencerService.generateInfluencer({
            prompt: 'test',
            model: 'flux-schnell'
        });
        setFalTest({ success: res.success, error: res.error, loading: false });
        if (res.success) addNotification({ type: 'success', message: 'Fal.ai bağlantısı başarılı!', read: false });
        else addNotification({ type: 'error', message: `Fal.ai hatası: ${res.error}`, read: false });
    };

    const testConnection = async () => {
        addNotification({ type: 'info', message: 'LimeSocial bağlantısı test ediliyor...', read: false });
        try {
            const response = await fetch('https://api.limesocial.io/api/v1/me', {
                headers: {
                    'Authorization': localLimeSettings.apiKey
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTestResult({ credits: data.credits || data.creditsRemaining, success: true });
                addNotification({ type: 'success', message: `Bağlantı başarılı! ${data.credits || data.creditsRemaining || 0} kredi mevcut.`, read: false });
            } else {
                setTestResult({ success: false });
                throw new Error('API hatası');
            }
        } catch {
            setTestResult({ success: false });
            addNotification({ type: 'error', message: 'LimeSocial bağlantısı başarısız!', read: false });
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
            {/* AI & Content APIs */}
            <div className="section-header">
                <h2 className="section-title">
                    <Sparkles size={20} style={{ marginRight: '8px', color: 'var(--accent-primary)' }} />
                    AI & İçerik Üretim Servisleri
                </h2>
            </div>
            <div className="card" style={{ padding: 'var(--spacing-xl)', borderLeft: '4px solid var(--accent-primary)' }}>
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    Dashboard üzerindeki içerik üretim araçlarının ve video servislerinin API anahtarlarını buradan yönetebilirsiniz.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <div className="grid-2" style={{ gap: 'var(--spacing-lg)' }}>
                        <div className="input-group">
                            <label className="input-label" style={{ fontWeight: 600 }}>
                                <Key size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                Replicate API Token
                            </label>
                            <input
                                type="password"
                                className="input"
                                placeholder="r8_..."
                                value={localAiSettings.replicateKey}
                                onChange={(e) => setLocalAiSettings({ ...localAiSettings, replicateKey: e.target.value })}
                            />
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                "Yeni İçerik Oluştur" ve genel post üretimi için kullanılır.
                            </p>
                        </div>
                        <div className="input-group">
                            <label className="input-label" style={{ fontWeight: 600 }}>
                                <Key size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                Fal.ai API Key
                            </label>
                            <input
                                type="password"
                                className="input"
                                placeholder="key_..."
                                value={localAiSettings.falKey}
                                onChange={(e) => setLocalAiSettings({ ...localAiSettings, falKey: e.target.value })}
                            />
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                AI Influencer görsel/video üretimi ve konuşturma için kullanılır.
                            </p>
                        </div>
                    </div>

                    {/* AI Test Status Indicators */}
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
                        {replicateTest.loading || replicateTest.success !== undefined ? (
                            <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', color: replicateTest.success ? 'var(--success)' : (replicateTest.loading ? 'var(--text-muted)' : 'var(--error)') }}>
                                {replicateTest.loading ? <RefreshCw size={12} className="animate-spin" /> : (replicateTest.success ? <CheckCircle2 size={12} /> : <XCircle size={12} />)}
                                <span>Replicate: {replicateTest.loading ? 'Test ediliyor...' : (replicateTest.success ? 'Çalışıyor' : replicateTest.error)}</span>
                            </div>
                        ) : null}
                        {falTest.loading || falTest.success !== undefined ? (
                            <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', color: falTest.success ? 'var(--success)' : (falTest.loading ? 'var(--text-muted)' : 'var(--error)') }}>
                                {falTest.loading ? <RefreshCw size={12} className="animate-spin" /> : (falTest.success ? <CheckCircle2 size={12} /> : <XCircle size={12} />)}
                                <span>Fal.ai: {falTest.loading ? 'Test ediliyor...' : (falTest.success ? 'Çalışıyor' : falTest.error)}</span>
                            </div>
                        ) : null}
                    </div>
                </div>
                <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-md)' }}>
                    <button className="btn btn-secondary" onClick={testReplicate} disabled={replicateTest.loading}>
                        <RefreshCw size={14} className={replicateTest.loading ? 'animate-spin' : ''} />
                        <span>Replicate Test</span>
                    </button>
                    <button className="btn btn-secondary" onClick={testFal} disabled={falTest.loading}>
                        <RefreshCw size={14} className={falTest.loading ? 'animate-spin' : ''} />
                        <span>Fal.ai Test</span>
                    </button>
                    <button className="btn btn-primary" onClick={handleSaveAi} style={{ gap: '8px' }}>
                        <Save size={16} />
                        <span>AI Anahtarlarını Güvenle Kaydet</span>
                    </button>
                </div>
            </div>

            {/* n99 Orchestration Settings */}
            <div className="section-header">
                <h2 className="section-title">
                    <Zap size={20} style={{ marginRight: '8px', color: '#FF6D5A' }} />
                    Sistem Bağlantı Ayarları (n99/n8n)
                </h2>
            </div>
            <div className="card" style={{ padding: 'var(--spacing-xl)', borderLeft: '4px solid #FF6D5A' }}>
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    AI içerik üretim akışlarını yöneten ana server (n8n) bağlantı adresini buradan güncelleyebilirsiniz.
                </p>
                <div className="input-group">
                    <label className="input-label" style={{ fontWeight: 600 }}>
                        n99 Orchestration Webhook URL
                    </label>
                    <input
                        type="text"
                        className="input"
                        placeholder="https://n99.polmarkai.pro/webhook/..."
                        value={localN99Settings.webhookUrl}
                        onChange={(e) => setLocalN99Settings({ ...localN99Settings, webhookUrl: e.target.value })}
                    />
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Bu adres, AI "Sihirbazı" butonuna basıldığında içeriğin üretileceği noktadır.
                    </p>
                </div>
                <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-md)' }}>
                    <button className="btn btn-primary" onClick={handleSaveN99} style={{ background: '#FF6D5A', borderColor: '#FF6D5A', gap: '8px' }}>
                        <Save size={16} />
                        <span>Sistem Bağlantısını Kaydet</span>
                    </button>
                </div>
            </div>

            {/* LimeSocial Settings */}
            <div className="section-header">
                <h2 className="section-title">
                    <Building2 size={20} style={{ marginRight: '8px', color: 'var(--primary)' }} />
                    LimeSocial Ayarları
                </h2>
            </div>
            <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <div className="input-group">
                        <label className="input-label">
                            <Key size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            LimeSocial API Key
                        </label>
                        <input
                            type="password"
                            className="input"
                            placeholder="API anahtarınız..."
                            value={localLimeSettings.apiKey}
                            onChange={(e) => setLocalLimeSettings({ ...localLimeSettings, apiKey: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">
                            <UserCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Bağlı Hesaplar (JSON formatında)
                        </label>
                        <textarea
                            className="input textarea"
                            placeholder='[{"platform": "tiktok", "username": "kullanici"}, {"platform": "instagram", "username": "igkullanici"}]'
                            value={localLimeSettings.accounts}
                            onChange={(e) => setLocalLimeSettings({ ...localLimeSettings, accounts: e.target.value })}
                            rows={3}
                            style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                        />
                    </div>
                    {testResult && (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            background: testResult.success ? 'var(--success-bg)' : 'var(--error-bg)',
                            border: `1px solid ${testResult.success ? 'var(--success)' : 'var(--error)'}`,
                            fontSize: '0.8rem'
                        }}>
                            {testResult.success
                                ? `✅ Bağlantı başarılı! Kalan Kredi: ${testResult.credits || 'Bilinmiyor'}`
                                : '❌ Bağlantı başarısız. API anahtarını kontrol edin.'}
                        </div>
                    )}
                </div>
                <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <a
                        href="https://limesocial.io/billing"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}
                    >
                        LimeSocial Paneli →
                    </a>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <button className="btn btn-secondary" onClick={testConnection} style={{ gap: '8px' }}>
                            <RefreshCw size={16} />
                            <span>Test Et</span>
                        </button>
                        <button className="btn btn-primary" onClick={handleSaveLime} style={{ gap: '8px' }}>
                            <Save size={16} />
                            <span>LimeSocial Kaydet</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Google Sheets Integration */}
            <div className="section-header" style={{ marginTop: 'var(--spacing-xl)' }}>
                <h2 className="section-title">
                    <Table size={20} style={{ marginRight: '8px', color: '#1d804e' }} />
                    Google Sheets Bağlantısı (Loglama)
                </h2>
            </div>
            <div className="card" style={{ padding: 'var(--spacing-xl)', borderLeft: '4px solid #1d804e' }}>
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    Üretilen içeriklerin kaydedileceği hedef tabloları buradan yönetebilirsiniz. Birden fazla tablo ekleyebilir ve "Aktif" olarak işaretlediğiniz <strong>tüm tablolara</strong> aynı anda kayıt yapılmasını sağlayabilirsiniz.
                </p>
                <GoogleSheetsManager />
            </div>
        </div>
    );
};

const GoogleSheetsManager: React.FC = () => {
    const { addNotification } = useDashboard();
    // Use import type for config
    const [configs, setConfigs] = useState<SheetConfig[]>([]);
    const [newSheetName, setNewSheetName] = useState('');
    const [newSheetUrl, setNewSheetUrl] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        const { googleSheetsService } = await import('../utils/googleSheetsService');
        setConfigs(googleSheetsService.getConfigs());
    };

    const handleAdd = async () => {
        if (!newSheetName.trim() || !newSheetUrl.trim()) {
            addNotification({ type: 'warning', message: 'Lütfen isim ve URL girin.', read: false });
            return;
        }

        const { googleSheetsService } = await import('../utils/googleSheetsService');
        googleSheetsService.addConfig(newSheetName, newSheetUrl);
        setConfigs(googleSheetsService.getConfigs());
        setNewSheetName('');
        setNewSheetUrl('');
        setIsAdding(false);
        addNotification({ type: 'success', message: 'Tablo eklendi!', read: false });
    };

    const handleRemove = async (id: string) => {
        if (window.confirm('Bu tabloyu silmek istediğinize emin misiniz?')) {
            const { googleSheetsService } = await import('../utils/googleSheetsService');
            googleSheetsService.removeConfig(id);
            setConfigs(googleSheetsService.getConfigs());
            addNotification({ type: 'info', message: 'Tablo silindi.', read: false });
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const { googleSheetsService } = await import('../utils/googleSheetsService');
        googleSheetsService.updateConfig(id, { isActive: !currentStatus });
        setConfigs(googleSheetsService.getConfigs());
    };

    const handleTest = async (id: string) => {
        const { googleSheetsService } = await import('../utils/googleSheetsService');
        addNotification({ type: 'info', message: 'Bağlantı test ediliyor...', read: false });
        // Test specific config 
        const res = await googleSheetsService.saveToSheet({
            date: new Date().toLocaleString('tr-TR'),
            prompt: 'BAĞLANTI TESTİ',
            imageUrl: 'https://picsum.photos/200',
            type: 'image',
            clientName: 'Sistem Testi',
            metadata: { status: 'test-check' }
        }, id);

        if (res.success) {
            addNotification({ type: 'success', message: '✅ Başarılı! Test satırı eklendi.', read: false });
        } else {
            addNotification({ type: 'error', message: `❌ Hata: ${res.error}`, read: false });
        }
    };

    return (
        <div>
            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                {configs.map(config => (
                    <div key={config.id} className="card" style={{ 
                        padding: 'var(--spacing-md)', 
                        background: 'var(--bg-secondary)', 
                        border: config.isActive ? '1px solid #1d804e' : '1px solid var(--border-color)',
                        opacity: config.isActive ? 1 : 0.7
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ overflow: 'hidden', flex: 1, marginRight: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{config.name}</h4>
                                    {config.isActive && <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>AKTİF</span>}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '4px' }}>
                                    {config.url}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                <button className="btn btn-sm btn-secondary" onClick={() => handleTest(config.id)} title="Test Et">
                                    <RefreshCw size={14} />
                                </button>
                                <button 
                                    className={`btn btn-sm ${config.isActive ? 'btn-secondary' : 'btn-primary'}`} 
                                    onClick={() => handleToggle(config.id, config.isActive)}
                                    title={config.isActive ? 'Devre Dışı Bırak' : 'Aktifleştir'}
                                >
                                    {config.isActive ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                                </button>
                                <button className="btn btn-sm btn-ghost" onClick={() => handleRemove(config.id)} title="Sil" style={{ color: 'var(--error)' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {configs.length === 0 && !isAdding && (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        Henüz kayıtlı tablo yok. Varsayılan tabloyu eklemek için "+ Yeni Tablo Bağla" diyebilirsiniz.
                    </div>
                )}
            </div>

            {/* Add New */}
            {isAdding ? (
                <div className="card" style={{ padding: 'var(--spacing-md)', border: '1px dashed var(--border-color)', background: 'var(--bg-tertiary)' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem' }}>Yeni Tablo Ekle</h4>
                    <div className="input-group">
                        <label className="input-label">Tablo Adı (Örn: Pazarlama Ekibi)</label>
                        <input className="input" value={newSheetName} onChange={e => setNewSheetName(e.target.value)} placeholder="Tablo Adı" />
                    </div>
                    <div className="input-group" style={{ marginTop: '8px' }}>
                        <label className="input-label">Webhook URL</label>
                        <input className="input" value={newSheetUrl} onChange={e => setNewSheetUrl(e.target.value)} placeholder="https://script.google.com/..." />
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Google Apps Script {'->'} Web App URL (doPost destekli)
                        </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setIsAdding(false)}>İptal</button>
                        <button className="btn btn-sm btn-primary" onClick={handleAdd}>Ekle</button>
                    </div>
                </div>
            ) : (
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setIsAdding(true)}>
                    + Yeni Tablo Bağla
                </button>
            )}
        </div>
    );
};

export default IntegrationsManager;
