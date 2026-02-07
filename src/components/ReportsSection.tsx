import React, { useState } from 'react';
import {
    FileText,
    Download,
    Calendar,
    TrendingUp,
    Users,
    BarChart3,
    Share2,
    FileSpreadsheet,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { mockPlatformStats } from '../data/mockData';
import { formatNumber, getPlatformName } from '../utils/helpers';

type ReportType = 'weekly' | 'monthly' | 'platform' | 'roi';

const ReportsSection: React.FC = () => {
    const { posts, addNotification } = useDashboard();
    const [selectedReport, setSelectedReport] = useState<ReportType>('weekly');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Calculate report data
    const postedPosts = posts.filter((p) => p.status === 'posted');
    const totalEngagement = postedPosts.reduce(
        (acc, p) => acc + p.metrics.likes + p.metrics.comments + p.metrics.shares,
        0
    );
    const totalReach = postedPosts.reduce((acc, p) => acc + p.metrics.reach, 0);
    const avgEngagementRate = totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(2) : 0;

    const totalFollowerGrowth = mockPlatformStats.reduce((acc, p) => acc + p.followerGrowth, 0);

    const reportTypes = [
        { id: 'weekly', label: 'Haftalık Özet', icon: <Calendar size={16} /> },
        { id: 'monthly', label: 'Aylık Rapor', icon: <FileText size={16} /> },
        { id: 'platform', label: 'Platform Karşılaştırma', icon: <BarChart3 size={16} /> },
        { id: 'roi', label: 'ROI Metrikleri', icon: <TrendingUp size={16} /> },
    ];

    const handleExport = (format: 'pdf' | 'csv') => {
        addNotification({
            type: 'success',
            message: `Rapor ${format.toUpperCase()} formatında indirildi.`,
            read: false,
        });
    };

    return (
        <div className="section">
            <div className="section-header">
                <h2 className="section-title">Raporlar</h2>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleExport('csv')}>
                        <FileSpreadsheet size={14} />
                        <span>CSV</span>
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => handleExport('pdf')}>
                        <Download size={14} />
                        <span>PDF</span>
                    </button>
                </div>
            </div>

            {/* Report Type Tabs */}
            <div className="tabs">
                {reportTypes.map((report) => (
                    <button
                        key={report.id}
                        className={`tab ${selectedReport === report.id ? 'active' : ''}`}
                        onClick={() => setSelectedReport(report.id as ReportType)}
                    >
                        {report.icon}
                        <span>{report.label}</span>
                    </button>
                ))}
            </div>

            {/* Date Range Picker */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-lg)',
                    padding: 'var(--spacing-md)',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                }}
            >
                <Calendar size={18} className="text-muted" />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tarih Aralığı:</span>
                <input
                    type="date"
                    className="input"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    style={{ width: 'auto' }}
                />
                <span>-</span>
                <input
                    type="date"
                    className="input"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    style={{ width: 'auto' }}
                />
            </div>

            {/* Report Content */}
            {selectedReport === 'weekly' && (
                <div className="grid-3">
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--accent-gradient)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                }}
                            >
                                <Share2 size={20} />
                            </div>
                            <div>
                                <p className="text-muted text-sm">Toplam Paylaşım</p>
                                <p className="text-xl font-bold">{postedPosts.length}</p>
                            </div>
                        </div>
                        <div className="progress">
                            <div className="progress-bar" style={{ width: '75%' }} />
                        </div>
                        <p className="text-xs text-muted mt-sm">Hedefin %75'i tamamlandı</p>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                }}
                            >
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <p className="text-muted text-sm">Engagement Rate</p>
                                <p className="text-xl font-bold">%{avgEngagementRate}</p>
                            </div>
                        </div>
                        <div className="progress">
                            <div className="progress-bar" style={{ width: `${Number(avgEngagementRate) * 10}%`, background: 'linear-gradient(90deg, #10b981, #059669)' }} />
                        </div>
                        <p className="text-xs text-muted mt-sm">Sektör ortalaması: %3.2</p>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                            <div
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                }}
                            >
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-muted text-sm">Takipçi Büyümesi</p>
                                <p className="text-xl font-bold">+{formatNumber(totalFollowerGrowth)}</p>
                            </div>
                        </div>
                        <div className="progress">
                            <div className="progress-bar" style={{ width: '60%', background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)' }} />
                        </div>
                        <p className="text-xs text-muted mt-sm">Geçen haftaya göre +12%</p>
                    </div>
                </div>
            )}

            {selectedReport === 'platform' && (
                <div className="grid-2">
                    {mockPlatformStats.map((platform) => (
                        <div key={platform.platform} className={`platform-card ${platform.platform}`}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{getPlatformName(platform.platform)}</h3>
                                <span className="badge badge-success">+{formatNumber(platform.followerGrowth)}</span>
                            </div>

                            <div className="grid-2" style={{ gap: 'var(--spacing-md)' }}>
                                <div>
                                    <p className="text-muted text-xs">Takipçi</p>
                                    <p className="font-bold">{formatNumber(platform.followers)}</p>
                                </div>
                                <div>
                                    <p className="text-muted text-xs">Post Sayısı</p>
                                    <p className="font-bold">{platform.postsCount}</p>
                                </div>
                                <div>
                                    <p className="text-muted text-xs">Engagement</p>
                                    <p className="font-bold">%{platform.avgEngagementRate}</p>
                                </div>
                                <div>
                                    <p className="text-muted text-xs">Erişim</p>
                                    <p className="font-bold">{formatNumber(platform.reach)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedReport === 'monthly' && (
                <div className="card">
                    <h3 className="card-title mb-lg">Aylık Performans Özeti</h3>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Metrik</th>
                                    <th>Bu Ay</th>
                                    <th>Geçen Ay</th>
                                    <th>Değişim</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Toplam Post</td>
                                    <td>{postedPosts.length}</td>
                                    <td>{Math.floor(postedPosts.length * 0.85)}</td>
                                    <td className="text-success">+{Math.floor(postedPosts.length * 0.15)}</td>
                                </tr>
                                <tr>
                                    <td>Toplam Etkileşim</td>
                                    <td>{formatNumber(totalEngagement)}</td>
                                    <td>{formatNumber(Math.floor(totalEngagement * 0.9))}</td>
                                    <td className="text-success">+10%</td>
                                </tr>
                                <tr>
                                    <td>Toplam Erişim</td>
                                    <td>{formatNumber(totalReach)}</td>
                                    <td>{formatNumber(Math.floor(totalReach * 0.88))}</td>
                                    <td className="text-success">+12%</td>
                                </tr>
                                <tr>
                                    <td>Yeni Takipçi</td>
                                    <td>{formatNumber(totalFollowerGrowth)}</td>
                                    <td>{formatNumber(Math.floor(totalFollowerGrowth * 0.75))}</td>
                                    <td className="text-success">+25%</td>
                                </tr>
                                <tr>
                                    <td>Engagement Rate</td>
                                    <td>%{avgEngagementRate}</td>
                                    <td>%{(Number(avgEngagementRate) * 0.95).toFixed(2)}</td>
                                    <td className="text-success">+5%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedReport === 'roi' && (
                <div className="grid-2">
                    <div className="card">
                        <h3 className="card-title mb-lg">Erişim Başına Metrikler</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--spacing-md)',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                <span>Etkileşim / 1K Erişim</span>
                                <span className="font-bold">{totalReach > 0 ? ((totalEngagement / (totalReach / 1000))).toFixed(1) : 0}</span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--spacing-md)',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                <span>Erişim / Post</span>
                                <span className="font-bold">{postedPosts.length > 0 ? formatNumber(Math.floor(totalReach / postedPosts.length)) : 0}</span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--spacing-md)',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                <span>Takipçi Dönüşüm</span>
                                <span className="font-bold">%{totalReach > 0 ? ((totalFollowerGrowth / totalReach) * 100).toFixed(2) : 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="card-title mb-lg">Platform ROI Sıralaması</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                            {[...mockPlatformStats]
                                .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)
                                .map((platform, index) => (
                                    <div
                                        key={platform.platform}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--spacing-md)',
                                            padding: 'var(--spacing-md)',
                                            background: index === 0 ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                                            borderRadius: 'var(--radius-md)',
                                            border: index === 0 ? '1px solid var(--success)' : 'none',
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: 'var(--radius-full)',
                                                background: index === 0 ? 'var(--success)' : 'var(--bg-hover)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                color: index === 0 ? 'white' : 'var(--text-muted)',
                                            }}
                                        >
                                            {index + 1}
                                        </span>
                                        <span style={{ flex: 1 }}>{getPlatformName(platform.platform)}</span>
                                        <span className="font-bold" style={{ color: index === 0 ? 'var(--success)' : 'inherit' }}>
                                            %{platform.avgEngagementRate}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsSection;
