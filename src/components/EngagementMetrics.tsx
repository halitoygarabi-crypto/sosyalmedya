import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { mockSentiment, mockHashtags } from '../data/mockData';
import { TrendingUp, Hash, MessageCircle, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { formatNumber } from '../utils/helpers';
import { useDashboard } from '../context/DashboardContext';

// Sentiment Analysis Card
export const SentimentAnalysis: React.FC = () => {
    const data = [
        { name: 'Pozitif', value: mockSentiment.positive, color: '#10b981' },
        { name: 'Nötr', value: mockSentiment.neutral, color: '#6b7280' },
        { name: 'Negatif', value: mockSentiment.negative, color: '#ef4444' },
    ];

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3 className="chart-title">Duygu Analizi</h3>
                <MessageCircle size={18} className="text-muted" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={55}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`%${value ?? 0}`, '']} />
                    </PieChart>
                </ResponsiveContainer>

                <div style={{ flex: 1 }}>
                    {data.map((item) => (
                        <div
                            key={item.name}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 'var(--spacing-sm)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                {item.name === 'Pozitif' && <ThumbsUp size={14} style={{ color: item.color }} />}
                                {item.name === 'Nötr' && <Minus size={14} style={{ color: item.color }} />}
                                {item.name === 'Negatif' && <ThumbsDown size={14} style={{ color: item.color }} />}
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.name}</span>
                            </div>
                            <span style={{ fontWeight: 600, color: item.color }}>%{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div
                style={{
                    marginTop: 'var(--spacing-md)',
                    padding: 'var(--spacing-md)',
                    background: 'var(--success-bg)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                }}
            >
                <p style={{ fontSize: '0.875rem', color: 'var(--success)' }}>
                    Yorumların çoğunluğu pozitif! 🎉
                </p>
            </div>
        </div>
    );
};

// Hashtag Performance
export const HashtagPerformance: React.FC = () => {
    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3 className="chart-title">Hashtag Performansı</h3>
                <Hash size={18} className="text-muted" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {mockHashtags.slice(0, 6).map((hashtag, index) => (
                    <div
                        key={hashtag.hashtag}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-md)',
                            padding: 'var(--spacing-sm)',
                            background: index === 0 ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            color: index === 0 ? 'white' : 'inherit',
                        }}
                    >
                        <span
                            style={{
                                width: '20px',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                opacity: index === 0 ? 1 : 0.5,
                            }}
                        >
                            #{index + 1}
                        </span>
                        <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{hashtag.hashtag}</span>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 'var(--spacing-md)',
                                    marginTop: '2px',
                                    fontSize: '0.75rem',
                                    opacity: 0.8,
                                }}
                            >
                                <span>{hashtag.usageCount}x kullanıldı</span>
                                <span>%{hashtag.avgEngagement} ER</span>
                            </div>
                        </div>
                        <span style={{ fontSize: '0.75rem' }}>{formatNumber(hashtag.reach)} erişim</span>
                    </div>
                ))}
            </div>

            <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
            >
                Tümünü Gör
            </button>
        </div>
    );
};

// Top Performing Posts
export const TopPerformingPosts: React.FC<{ posts: any[] }> = ({ posts }) => {
    const topPosts = [...posts]
        .filter((p) => p.status === 'posted')
        .sort((a, b) => {
            const aEngagement = a.metrics.likes + a.metrics.comments + a.metrics.shares;
            const bEngagement = b.metrics.likes + b.metrics.comments + b.metrics.shares;
            return bEngagement - aEngagement;
        })
        .slice(0, 5);

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3 className="chart-title">En İyi Performans</h3>
                <TrendingUp size={18} className="text-muted" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {topPosts.map((post, index) => {
                    const totalEngagement = post.metrics.likes + post.metrics.comments + post.metrics.shares;
                    const engagementRate =
                        post.metrics.reach > 0
                            ? ((totalEngagement / post.metrics.reach) * 100).toFixed(1)
                            : 0;

                    return (
                        <div
                            key={post.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-md)',
                                padding: 'var(--spacing-sm)',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        >
                            <div
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: 'var(--radius-full)',
                                    background:
                                        index === 0
                                            ? 'linear-gradient(135deg, #ffd700, #ffed4a)'
                                            : index === 1
                                                ? 'linear-gradient(135deg, #c0c0c0, #e8e8e8)'
                                                : index === 2
                                                    ? 'linear-gradient(135deg, #cd7f32, #daa520)'
                                                    : 'var(--bg-hover)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: index < 3 ? '#1a1a1a' : 'var(--text-muted)',
                                }}
                            >
                                {index + 1}
                            </div>
                            <img
                                src={post.imageUrls[0] || 'https://picsum.photos/40/40?random=' + post.id}
                                alt={post.title}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: 'var(--radius-sm)',
                                    objectFit: 'cover',
                                }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p
                                    style={{
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {post.title}
                                </p>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 'var(--spacing-sm)',
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                    }}
                                >
                                    <span>❤️ {formatNumber(post.metrics.likes)}</span>
                                    <span>💬 {formatNumber(post.metrics.comments)}</span>
                                    <span>🔄 {formatNumber(post.metrics.shares)}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--success)' }}>
                                    %{engagementRate}
                                </p>
                                <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>ER</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Automation Controls
export const AutomationControls: React.FC = () => {
    const { automationEnabled, automationSettings, toggleAutomationSetting } = useDashboard();

    const automations = [
        { id: 'autoPost', label: 'Otomatik Paylaşım', enabled: automationSettings.autoPost },
        { id: 'autoReply', label: 'Otomatik Yanıt', enabled: automationSettings.autoReply },
        { id: 'smartSchedule', label: 'Akıllı Zamanlama', enabled: automationSettings.smartSchedule },
        { id: 'aiSentiment', label: 'AI Duygu Analizi', enabled: automationSettings.aiSentiment },
    ];

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3 className="chart-title">Otomasyon Kontrolleri</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {automations.map((automation) => (
                    <div
                        key={automation.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 'var(--spacing-md)',
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                        }}
                    >
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{automation.label}</p>
                            <p style={{ fontSize: '0.75rem', color: automation.enabled ? 'var(--success)' : 'var(--text-muted)' }}>
                                {automation.enabled ? 'Aktif' : 'Pasif'}
                            </p>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={automation.enabled}
                                onChange={() => toggleAutomationSetting(automation.id as any)}
                            />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                ))}
            </div>

            <div
                style={{
                    marginTop: 'var(--spacing-md)',
                    padding: 'var(--spacing-md)',
                    background: automationEnabled ? 'var(--success-bg)' : 'var(--warning-bg)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                }}
            >
                <p
                    style={{
                        fontSize: '0.875rem',
                        color: automationEnabled ? 'var(--success)' : 'var(--warning)',
                    }}
                >
                    {automationEnabled
                        ? '✓ N8n Workflow Aktif'
                        : '⚠ Otomasyon devre dışı'}
                </p>
            </div>
        </div>
    );
};
