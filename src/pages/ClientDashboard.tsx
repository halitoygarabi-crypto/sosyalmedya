import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Eye,
    Heart,
    Download,
    RefreshCw,
    BarChart3,
    LayoutDashboard,
    FileText,
    LogOut,
    Moon,
    Sun,
    Bell,
    Menu,
    Calendar,
    Settings,
    Building2,
    Briefcase
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell
} from 'recharts';
import {
    AIInfluencerGenerator,
} from '../components';
import ReportDownloader from '../components/ReportDownloader';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { formatNumber } from '../utils/helpers';

// Analytics data - will be replaced with Metricool API
const mockAnalytics = {
    followers: 0,
    followerGrowth: 0,
    engagement: 0,
    engagementChange: 0,
    reach: 0,
    reachChange: 0,
    impressions: 0,
    impressionsChange: 0
};

const weeklyData = [
    { day: 'Pzt', followers: 0, engagement: 0, reach: 0 },
    { day: 'Sal', followers: 0, engagement: 0, reach: 0 },
    { day: 'Çar', followers: 0, engagement: 0, reach: 0 },
    { day: 'Per', followers: 0, engagement: 0, reach: 0 },
    { day: 'Cum', followers: 0, engagement: 0, reach: 0 },
    { day: 'Cmt', followers: 0, engagement: 0, reach: 0 },
    { day: 'Paz', followers: 0, engagement: 0, reach: 0 }
];

const platformDistribution: { name: string; value: number; color: string }[] = [];

const topPosts: { id: number; title: string; platform: string; engagement: number; reach: number }[] = [];

// KPI Card Component
const KPICard: React.FC<{
    title: string;
    value: string | number;
    change: number;
    icon: React.ReactNode;
    color: string;
}> = ({ title, value, change, icon }) => (
    <div className="kpi-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div>
                <p className="kpi-label">{title}</p>
                <p className="kpi-value" style={{ margin: '0.25rem 0' }}>{value}</p>
                
                <div className="kpi-change-container" style={{ margin: 0 }}>
                    <div className={`kpi-change-badge ${change >= 0 ? 'positive' : 'negative'}`}>
                        {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span>{Math.abs(change)}%</span>
                    </div>
                </div>
            </div>
            <div className="kpi-icon">
                {icon}
            </div>
        </div>
        
        {/* Mock Sparkline UI */}
        <div className="kpi-sparkline" style={{ marginTop: '1.5rem', opacity: 0.6 }}>
            <div style={{ 
                height: '40px', 
                width: '100%', 
                background: `linear-gradient(90deg, transparent 0%, var(--accent-primary) 50%, transparent 100%)`, 
                maskImage: 'linear-gradient(to bottom, black, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
                borderRadius: '4px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'var(--accent-primary)',
                    boxShadow: '0 0 10px var(--accent-primary)'
                }}></div>
            </div>
        </div>
    </div>
);

// Weekly Report Card
const WeeklyReportCard: React.FC = () => {
    const currentWeek = {
        posts: 0,
        totalEngagement: 0,
        avgReach: 0,
        topPlatform: '-',
        growth: '0%'
    };

    return (
        <div className="card">
            <div className="card-header">
                <div>
                    <h3 className="card-title">Haftalık Özet</h3>
                    <p className="card-subtitle">27 Ocak - 2 Şubat 2026</p>
                </div>
                <button className="btn btn-secondary btn-sm">
                    <Download size={14} />
                    <span>PDF İndir</span>
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Toplam Post</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentWeek.posts}</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Toplam Etkileşim</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatNumber(currentWeek.totalEngagement)}</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Ort. Erişim</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatNumber(currentWeek.avgReach)}</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>En İyi Platform</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentWeek.topPlatform}</p>
                </div>
            </div>

            <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(204, 255, 0, 0.05)',
                border: '1px solid rgba(204, 255, 0, 0.1)',
                borderRadius: '12px',
                textAlign: 'center'
            }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                    📈 Bu hafta geçen haftaya göre <strong>{currentWeek.growth}</strong> büyüme sağladınız!
                </p>
            </div>
        </div>
    );
};

// Follower Growth Chart
const FollowerGrowthChart: React.FC = () => (
    <div className="card">
        <div className="card-header">
            <h3 className="card-title">Takipçi Büyümesi</h3>
            <select className="input" style={{ width: 'auto', padding: '4px 12px', fontSize: '0.75rem' }}>
                <option>Son 7 Gün</option>
                <option>Son 30 Gün</option>
                <option>Son 90 Gün</option>
            </select>
        </div>
        <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyData}>
                <defs>
                    <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis 
                    dataKey="day" 
                    stroke="var(--text-muted)" 
                    fontSize={12} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                />
                <YAxis 
                    stroke="var(--text-muted)" 
                    fontSize={12} 
                    axisLine={false}
                    tickLine={false}
                    domain={['dataMin - 100', 'dataMax + 100']} 
                />
                <Tooltip
                    contentStyle={{
                        background: 'rgba(5, 6, 10, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-xl)'
                    }}
                    itemStyle={{ color: 'var(--accent-primary)' }}
                />
                <Area
                    type="monotone"
                    dataKey="followers"
                    stroke="var(--accent-primary)"
                    strokeWidth={3}
                    fill="url(#followerGradient)"
                    animationDuration={1500}
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

// Platform Distribution Chart
const PlatformDistributionChart: React.FC = () => (
    <div className="card">
        <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Platform Dağılımı</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <ResponsiveContainer width={140} height={140}>
                <RechartsPieChart>
                    <Pie
                        data={platformDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1500}
                    >
                        {platformDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                </RechartsPieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {platformDistribution.map((item) => (
                    <div
                        key={item.name}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: item.color,
                                    boxShadow: `0 0 10px ${item.color}`
                                }}
                            />
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{item.name}</span>
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>%{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// Top Posts List
const TopPostsList: React.FC = () => {
    const platformColors: Record<string, string> = {
        instagram: '#ccff00',
        twitter: '#00ffff',
        linkedin: '#0A66C2',
        tiktok: '#00f2ea'
    };

    return (
        <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>
                En İyi Performans Gösteren Postlar
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {topPosts.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem' }}>
                        <Eye size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Henüz veri bulunmuyor</p>
                    </div>
                ) : (
                    topPosts.map((post, index) => (
                        <div
                            key={post.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.875rem',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    background: index < 3 ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8125rem',
                                    fontWeight: 700,
                                    color: index < 3 ? '#000' : 'var(--text-muted)',
                                    boxShadow: index < 3 ? '0 0 10px rgba(204, 255, 0, 0.2)' : 'none'
                                }}
                            >
                                {index + 1}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {post.title}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '4px' }}>
                                    <span
                                        style={{
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.02em',
                                            color: platformColors[post.platform.toLowerCase()] || 'var(--accent-primary)'
                                        }}
                                    >
                                        {post.platform}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <Heart size={12} /> {post.engagement}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <Eye size={12} /> {formatNumber(post.reach)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Client Sidebar Component
const ClientSidebar: React.FC<{
    isOpen: boolean;
    activeSection: string;
    onSectionChange: (section: string) => void;
}> = ({ isOpen, activeSection, onSectionChange }) => {
    const { customerProfile, logout } = useAuth();
    const { isDarkMode, toggleDarkMode } = useDashboard();

    const menuItems = [
        { id: 'overview', label: 'Özet', icon: <LayoutDashboard size={18} /> },
        { id: 'analytics', label: 'Analitik', icon: <BarChart3 size={18} /> },
        { id: 'weekly-report', label: 'Haftalık Rapor', icon: <Calendar size={18} /> },
        { id: 'monthly-report', label: 'Aylık Rapor', icon: <FileText size={18} /> },
        { id: 'ai-influencer', label: 'AI Influencer', icon: <Users size={18} /> },
        { id: 'settings', label: 'Firma Ayarlar', icon: <Settings size={18} /> },
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            {/* Logo */}
            <div className="nav-logo">
                <div className="nav-logo-icon">N99</div>
                <span className="nav-logo-text">SocialHub</span>
            </div>

            {/* Company Name Badge */}
            <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
                <div style={{
                    padding: '0.875rem 1rem',
                    background: 'rgba(204, 255, 0, 0.05)',
                    border: '1px solid rgba(204, 255, 0, 0.1)',
                    borderRadius: '12px',
                    color: 'var(--accent-primary)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <div style={{ width: '8px', height: '8px', background: 'var(--accent-primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-primary)' }}></div>
                    {customerProfile?.company_name || 'Firma'}
                </div>
            </div>

            {/* Navigation */}
            <nav className="nav-section">
                <div className="nav-section-title">Panel</div>
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                        onClick={() => onSectionChange(item.id)}
                    >
                        <span className="nav-item-icon">{item.icon}</span>
                        <span className="nav-item-text">{item.label}</span>
                    </div>
                ))}
            </nav>

            {/* Bottom Navigation */}
            <nav className="nav-section" style={{ marginTop: 'auto' }}>
                <div
                    className="nav-item"
                    onClick={toggleDarkMode}
                >
                    <span className="nav-item-icon">
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </span>
                    <span className="nav-item-text">{isDarkMode ? 'Açık Mod' : 'Koyu Mod'}</span>
                </div>
                <div
                    className="nav-item"
                    onClick={logout}
                    style={{ cursor: 'pointer' }}
                >
                    <span className="nav-item-icon"><LogOut size={18} /></span>
                    <span className="nav-item-text">Çıkış</span>
                </div>
            </nav>
        </aside>
    );
};

// Main Client Dashboard Component
const ClientDashboard: React.FC = () => {
    const { customerProfile } = useAuth();
    const { isDarkMode } = useDashboard();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeSection, setActiveSection] = useState('overview');

    // Apply dark/light mode
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    // Handle responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 2000);
    };

    return (
        <div className="dashboard">
            <ClientSidebar
                isOpen={sidebarOpen}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
            />

            <main className={`main-content ${!sidebarOpen ? 'main-content-expanded' : ''}`}>
                <header className="header">
                    <div className="header-left">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{ padding: '10px', minWidth: 'auto' }}
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="greeting">
                                Hoş geldin, {customerProfile?.company_name || 'Müşteri'}
                            </h1>
                            <p className="date-display">
                                Sosyal medya performansınızın özeti • Bugüne Odaklan
                            </p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <button className="btn btn-secondary" style={{ padding: '10px', minWidth: 'auto' }}>
                                <Bell size={18} />
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                style={{ padding: '0.625rem 1.25rem' }}
                            >
                                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                                <span>{isRefreshing ? 'Güncelleniyor...' : 'Verileri Güncelle'}</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content based on activeSection */}
                {activeSection === 'overview' && (
                    <div className="section">
                        {/* KPI Cards */}
                        <div className="grid-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
                            <KPICard
                                title="Toplam Takipçi"
                                value={formatNumber(mockAnalytics.followers)}
                                change={mockAnalytics.followerGrowth}
                                icon={<Users size={20} />}
                                color="#6366f1"
                            />
                            <KPICard
                                title="Etkileşim Oranı"
                                value={`%${mockAnalytics.engagement}`}
                                change={mockAnalytics.engagementChange}
                                icon={<Heart size={20} />}
                                color="#10b981"
                            />
                            <KPICard
                                title="Erişim"
                                value={formatNumber(mockAnalytics.reach)}
                                change={mockAnalytics.reachChange}
                                icon={<Eye size={20} />}
                                color="#f59e0b"
                            />
                            <KPICard
                                title="Gösterim"
                                value={formatNumber(mockAnalytics.impressions)}
                                change={mockAnalytics.impressionsChange}
                                icon={<BarChart3 size={20} />}
                                color="#ec4899"
                            />
                        </div>

                        {/* Charts Row */}
                        <div className="grid-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
                            <FollowerGrowthChart />
                            <WeeklyReportCard />
                        </div>

                        {/* Bottom Row */}
                        <div className="grid-2">
                            <PlatformDistributionChart />
                            <TopPostsList />
                        </div>
                    </div>
                )}

                {activeSection === 'analytics' && (
                    <div className="section">
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
                            Detaylı Analitik
                        </h2>
                        <div className="grid-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
                            <FollowerGrowthChart />
                            <PlatformDistributionChart />
                        </div>
                        <TopPostsList />
                    </div>
                )}

                {activeSection === 'weekly-report' && customerProfile && (
                    <div className="section">
                        <ReportDownloader
                            clientId={customerProfile.id}
                            clientName={customerProfile.company_name}
                        />
                    </div>
                )}

                {activeSection === 'monthly-report' && customerProfile && (
                    <div className="section">
                        <ReportDownloader
                            clientId={customerProfile.id}
                            clientName={customerProfile.company_name}
                        />
                    </div>
                )}

                {activeSection === 'ai-influencer' && (
                    <AIInfluencerGenerator />
                )}

                {activeSection === 'settings' && (
                    <div className="section">
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
                            Firma Ayarları
                        </h2>

                        {/* Firma Bilgileri Kartı */}
                        <div className="card" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-lg)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: 'var(--radius-lg)',
                                    background: 'var(--accent-gradient)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', color: 'white',
                                    fontSize: '1.5rem', fontWeight: 700
                                }}>
                                    {customerProfile?.company_name?.substring(0, 2).toUpperCase() || 'FI'}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{customerProfile?.company_name || 'Firma Adı'}</h3>
                                    <div className="badge badge-secondary" style={{ marginTop: '4px' }}>
                                        <Briefcase size={12} />
                                        <span>{customerProfile?.industry || 'Sektör belirtilmemiş'}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)' }}>
                                <div className="input-group">
                                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Building2 size={14} />
                                        Şirket Adı
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={customerProfile?.company_name || ''}
                                        disabled
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Briefcase size={14} />
                                        Sektör
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={customerProfile?.industry || 'Belirtilmemiş'}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bilgi Notu */}
                        <div className="card" style={{
                            padding: 'var(--spacing-lg)',
                            background: 'var(--info-bg)',
                            border: '1px solid var(--info)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-md)'
                        }}>
                            <Settings size={24} color="var(--info)" />
                            <div>
                                <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>Bilgi Güncelleme</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    Firma bilgilerinizi, API bağlantılarınızı ve diğer ayarlarınızı güncellemek için lütfen yönetici ile iletişime geçin.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer
                    style={{
                        marginTop: 'var(--spacing-2xl)',
                        paddingTop: 'var(--spacing-lg)',
                        borderTop: '1px solid var(--border-color)',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                    }}
                >
                    © 2026 N99 SocialHub Dashboard. Tüm hakları saklıdır.
                </footer>
            </main>
        </div>
    );
};

export default ClientDashboard;

