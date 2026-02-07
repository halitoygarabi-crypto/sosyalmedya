import React from 'react';
import {
    Send,
    TrendingUp,
    Heart,
    AlertTriangle,
    Calendar,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { mockPlatformStats } from '../data/mockData';
import { formatNumber } from '../utils/helpers';

const KPICards: React.FC = () => {
    const { posts, activeClient } = useDashboard();

    const clientPosts = activeClient
        ? posts.filter(p => p.clientId === activeClient.id)
        : posts;

    // Calculate KPIs
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayPosts = clientPosts.filter((p) => {
        const postDate = new Date(p.createdAt);
        postDate.setHours(0, 0, 0, 0);
        return postDate.getTime() === today.getTime() && p.status === 'posted';
    }).length;

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);

    const weeklyPosts = clientPosts.filter((p) => {
        const postDate = new Date(p.createdAt);
        return postDate >= weekStart && p.status === 'posted';
    }).length;

    const postedPosts = clientPosts.filter((p) => p.status === 'posted');
    const totalEngagement = postedPosts.reduce(
        (acc, p) => acc + p.metrics.likes + p.metrics.comments + p.metrics.shares,
        0
    );
    const totalReach = postedPosts.reduce((acc, p) => acc + p.metrics.reach, 0);
    const avgEngagementRate = totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(2) : 0;

    // Best performing platform
    const clientStats = activeClient
        ? mockPlatformStats.filter(s => s.clientId === activeClient.id)
        : mockPlatformStats;

    const bestPlatform = clientStats.length > 0
        ? clientStats.reduce((prev, curr) => curr.avgEngagementRate > prev.avgEngagementRate ? curr : prev)
        : { platform: 'N/A', avgEngagementRate: 0 };

    const scheduledPosts = clientPosts.filter((p) => p.status === 'scheduled').length;
    const failedPosts = clientPosts.filter((p) => p.status === 'failed').length;
    const failureRate = clientPosts.length > 0 ? ((failedPosts / clientPosts.length) * 100).toFixed(1) : 0;

    const kpis = [
        {
            id: 'total-posts',
            label: 'Gönderilen Postlar',
            value: formatNumber(postedPosts.length),
            subValue: `Bugün: ${todayPosts} | Haftalık: ${weeklyPosts}`,
            icon: <Send size={24} />,
            change: 12.5,
            color: 'var(--accent-primary)',
        },
        {
            id: 'engagement-rate',
            label: 'Ort. Engagement Rate',
            value: `%${avgEngagementRate}`,
            subValue: `${formatNumber(totalEngagement)} etkileşim`,
            icon: <Heart size={24} />,
            change: 8.2,
            color: 'var(--instagram)',
        },
        {
            id: 'best-platform',
            label: 'En İyi Platform',
            value: bestPlatform.platform.charAt(0).toUpperCase() + bestPlatform.platform.slice(1),
            subValue: `%${bestPlatform.avgEngagementRate} engagement`,
            icon: <TrendingUp size={24} />,
            change: 15.3,
            color: 'var(--success)',
        },
        {
            id: 'scheduled',
            label: 'Planlanan Postlar',
            value: scheduledPosts.toString(),
            subValue: 'Sırada bekliyor',
            icon: <Calendar size={24} />,
            change: 0,
            color: 'var(--info)',
        },
        {
            id: 'failure-rate',
            label: 'Başarısızlık Oranı',
            value: `%${failureRate}`,
            subValue: `${failedPosts} başarısız gönderi`,
            icon: <AlertTriangle size={24} />,
            change: -2.1,
            color: 'var(--error)',
        },
    ];

    return (
        <div className="kpi-grid">
            {kpis.map((kpi, index) => (
                <div
                    key={kpi.id}
                    className="kpi-card animate-slideInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <div
                        className="kpi-icon"
                        style={{
                            background: kpi.color,
                        }}
                    >
                        {kpi.icon}
                    </div>
                    <div className="kpi-value">{kpi.value}</div>
                    <div className="kpi-label">{kpi.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {kpi.subValue}
                    </div>
                    {kpi.change !== 0 && (
                        <div className={`kpi-change ${kpi.change > 0 ? 'positive' : 'negative'}`}>
                            {kpi.change > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                            {Math.abs(kpi.change)}%
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default KPICards;
