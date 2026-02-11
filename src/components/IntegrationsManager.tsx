import React, { useState, useEffect } from 'react';
import { Zap, RefreshCw, ShieldCheck, Instagram, Twitter, Linkedin, Play, Key, Globe, UserCheck, Save, ExternalLink, CheckCircle, XCircle, Settings } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import type { Platform, PlatformConnection } from '../types';

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
    const [connections, setConnections] = useState<Record<Platform, PlatformConnection>>(getDefaultConnections());
    const [expandedPlatform, setExpandedPlatform] = useState<Platform | null>(null);
    const [useLimeSocial, setUseLimeSocial] = useState(true); // Toggle between direct API and LimeSocial

    // Load saved connections from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('platform_connections');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setConnections(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error('Failed to parse saved connections');
            }
        }

        const limeSocialMode = localStorage.getItem('use_limesocial');
        if (limeSocialMode !== null) {
            setUseLimeSocial(limeSocialMode === 'true');
        }
    }, []);

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
                                                    <CheckCircle size={12} />
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
                    <CheckCircle size={14} />
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

// LimeSocial Settings Card
const LimeSocialSettingsCard: React.FC = () => {
    const { limeSocialSettings, updateLimeSocialSettings, addNotification } = useDashboard();
    const [localSettings, setLocalSettings] = useState(limeSocialSettings);
    const [testResult, setTestResult] = useState<{ credits?: number; success?: boolean } | null>(null);

    const handleSave = () => {
        updateLimeSocialSettings(localSettings);
        addNotification({ type: 'success', message: 'LimeSocial ayarları kaydedildi!', read: false });
    };

    const testConnection = async () => {
        addNotification({ type: 'info', message: 'LimeSocial bağlantısı test ediliyor...', read: false });
        try {
            const response = await fetch('https://api.limesocial.io/api/v1/me', {
                headers: {
                    'Authorization': localSettings.apiKey
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
        } catch (error) {
            setTestResult({ success: false });
            addNotification({ type: 'error', message: 'LimeSocial bağlantısı başarısız!', read: false });
        }
    };

    return (
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
                        value={localSettings.apiKey}
                        onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
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
                        value={localSettings.accounts}
                        onChange={(e) => setLocalSettings({ ...localSettings, accounts: e.target.value })}
                        rows={3}
                        style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                    />
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        LimeSocial panelinden bağladığınız hesapların platform ve kullanıcı adlarını girin.
                    </p>
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
                    <button className="btn btn-primary" onClick={handleSave} style={{ gap: '8px' }}>
                        <Save size={16} />
                        <span>Ayarları Kaydet</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IntegrationsManager;
