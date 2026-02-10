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
    CartesianGrid,
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
}> = ({ title, value, change, icon, color }) => (
    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{title}</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>{value}</p>
            </div>
            <div
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: `${color}15`,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {icon}
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'var(--spacing-sm)' }}>
            {change >= 0 ? (
                <TrendingUp size={14} style={{ color: 'var(--success)' }} />
            ) : (
                <TrendingDown size={14} style={{ color: 'var(--error)' }} />
            )}
            <span style={{ fontSize: '0.75rem', color: change >= 0 ? 'var(--success)' : 'var(--error)' }}>
                {change >= 0 ? '+' : ''}{change}%
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>geçen haftaya göre</span>
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
        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Haftalık Özet</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>27 Ocak - 2 Şubat 2026</p>
                </div>
                <button className="btn btn-secondary btn-sm">
                    <Download size={14} />
                    <span>PDF İndir</span>
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
                <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Toplam Post</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{currentWeek.posts}</p>
                </div>
                <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Toplam Etkileşim</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{formatNumber(currentWeek.totalEngagement)}</p>
                </div>
                <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ort. Erişim</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{formatNumber(currentWeek.avgReach)}</p>
                </div>
                <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>En İyi Platform</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{currentWeek.topPlatform}</p>
                </div>
            </div>

            <div style={{
                marginTop: 'var(--spacing-lg)',
                padding: 'var(--spacing-md)',
                background: 'var(--success-bg)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
            }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--success)' }}>
                    📈 Bu hafta geçen haftaya göre <strong>{currentWeek.growth}</strong> büyüme sağladınız!
                </p>
            </div>
        </div>
    );
};

// Follower Growth Chart
const FollowerGrowthChart: React.FC = () => (
    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Takipçi Büyümesi</h3>
            <select className="input" style={{ width: 'auto', padding: '4px 12px', fontSize: '0.75rem' }}>
                <option>Son 7 Gün</option>
                <option>Son 30 Gün</option>
                <option>Son 90 Gün</option>
            </select>
        </div>
        <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
                <defs>
                    <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip
                    contentStyle={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)'
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="followers"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#followerGradient)"
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

// Platform Distribution Chart
const PlatformDistributionChart: React.FC = () => (
    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>Platform Dağılımı</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
            <ResponsiveContainer width={120} height={120}>
                <RechartsPieChart>
                    <Pie
                        data={platformDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {platformDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </RechartsPieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
                {platformDistribution.map((item) => (
                    <div
                        key={item.name}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 'var(--spacing-xs)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <span
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: item.color
                                }}
                            />
                            <span style={{ fontSize: '0.875rem' }}>{item.name}</span>
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>%{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// Top Posts List
const TopPostsList: React.FC = () => {
    const getPlatformColor = (platform: string) => {
        const colors: Record<string, string> = {
            instagram: '#E4405F',
            twitter: '#1DA1F2',
            linkedin: '#0A66C2',
            tiktok: '#00f2ea'
        };
        return colors[platform] || '#6366f1';
    };

    return (
        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
                En İyi Performans Gösteren Postlar
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {topPosts.map((post, index) => (
                    <div
                        key={post.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-md)',
                            padding: 'var(--spacing-sm)',
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)'
                        }}
                    >
                        <div
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: 'var(--radius-full)',
                                background: index < 3 ? 'var(--accent-gradient)' : 'var(--bg-hover)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: index < 3 ? 'white' : 'var(--text-muted)'
                            }}
                        >
                            {index + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{post.title}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginTop: '2px' }}>
                                <span
                                    style={{
                                        fontSize: '0.65rem',
                                        padding: '1px 6px',
                                        borderRadius: 'var(--radius-sm)',
                                        background: `${getPlatformColor(post.platform)}20`,
                                        color: getPlatformColor(post.platform)
                                    }}
                                >
                                    {post.platform}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    <Heart size={10} style={{ display: 'inline', marginRight: '2px' }} />
                                    {post.engagement}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    <Eye size={10} style={{ display: 'inline', marginRight: '2px' }} />
                                    {formatNumber(post.reach)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
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
        { id: 'settings', label: 'Firma Ayarları', icon: <Settings size={18} /> },
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            {/* Logo */}
            <div className="nav-logo">
                <div className="nav-logo-icon">N8</div>
                <span className="nav-logo-text">SocialHub</span>
            </div>

            {/* Company Name */}
            <div style={{ padding: '0 var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                <div style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    background: 'var(--accent-gradient)',
                    borderRadius: 'var(--radius-md)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)'
                }}>
                    <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', boxShadow: '0 0 8px white' }}></div>
                    {customerProfile?.company_name || 'Firma'}
                </div>
            </div>

            {/* Navigation */}
            <nav className="nav-section">
                <div className="nav-section-title">Menü</div>
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
                {/* Simple Header */}
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--spacing-xl)',
                    padding: 'var(--spacing-md) 0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{ padding: '8px' }}
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                Hoş geldiniz, {customerProfile?.company_name || 'Müşteri'}
                            </h1>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                Sosyal medya performansınızın özeti
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <button className="btn btn-secondary" style={{ padding: '8px' }}>
                            <Bell size={18} />
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                            <span>Güncelle</span>
                        </button>
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
                    © 2026 N8n SocialHub Dashboard. Tüm hakları saklıdır.
                </footer>
            </main>
        </div>
    );
};

export default ClientDashboard;

