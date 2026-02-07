import React from 'react';
import { Instagram, Twitter, Linkedin, Play, TrendingUp, Users, Clock, BarChart3 } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { mockPlatformStats } from '../data/mockData';
import { formatNumber, getPlatformName } from '../utils/helpers';
import type { Platform } from '../types';

const platformIcons: Record<Platform, React.ReactNode> = {
    instagram: <Instagram size={20} />,
    twitter: <Twitter size={20} />,
    linkedin: <Linkedin size={20} />,
    tiktok: <Play size={20} />,
};

const PlatformStats: React.FC = () => {
    const { activeClient } = useDashboard();

    const clientStats = activeClient
        ? mockPlatformStats.filter(s => s.clientId === activeClient.id)
        : mockPlatformStats;
    return (
        <div className="section">
            <div className="section-header">
                <h2 className="section-title">Platform İstatistikleri</h2>
            </div>
            <div className="grid-4">
                {clientStats.map((stat, index) => (
                    <div
                        key={stat.platform}
                        className={`platform-card ${stat.platform} animate-slideInUp`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className={`platform-icon ${stat.platform}`}>
                            {platformIcons[stat.platform]}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
                                {getPlatformName(stat.platform)}
                            </h3>
                            <div className="badge badge-success" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor', marginRight: '4px' }}></div>
                                BAĞLI
                            </div>
                        </div>

                        <div className="platform-stat">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <Users size={14} className="text-muted" />
                                <span className="platform-stat-label">Takipçiler</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <span className="platform-stat-value">{formatNumber(stat.followers)}</span>
                                <span
                                    className="badge badge-success"
                                    style={{ fontSize: '0.625rem' }}
                                >
                                    +{formatNumber(stat.followerGrowth)}
                                </span>
                            </div>
                        </div>

                        <div className="platform-stat">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <TrendingUp size={14} className="text-muted" />
                                <span className="platform-stat-label">Engagement Rate</span>
                            </div>
                            <span className="platform-stat-value">%{stat.avgEngagementRate}</span>
                        </div>

                        <div className="platform-stat">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <Clock size={14} className="text-muted" />
                                <span className="platform-stat-label">En İyi Zaman</span>
                            </div>
                            <span className="platform-stat-value">{stat.bestPostingTime}</span>
                        </div>

                        <div className="platform-stat" style={{ marginBottom: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <BarChart3 size={14} className="text-muted" />
                                <span className="platform-stat-label">Erişim</span>
                            </div>
                            <span className="platform-stat-value">{formatNumber(stat.reach)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlatformStats;
