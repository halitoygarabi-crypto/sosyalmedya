import React from 'react';
import {
    LayoutDashboard,
    BarChart3,
    Calendar,
    FileText,
    Settings,
    Bell,
    HelpCircle,
    LogOut,
    Instagram,
    Twitter,
    Linkedin,
    Play,
    Users,
    TrendingUp,
    Zap,
    ChevronDown,
    Shield,
    Video,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseService';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
}

const mainNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { id: 'video-generator', label: 'Video Üretici', icon: <Video size={18} /> },
    { id: 'ai-influencer', label: 'AI Influencer', icon: <Users size={18} /> },
    { id: 'schedule', label: 'Zamanlama', icon: <Calendar size={18} /> },
    { id: 'content', label: 'İçerikler', icon: <FileText size={18} />, badge: 3 },
    { id: 'audience', label: 'Kitle', icon: <Users size={18} /> },
    { id: 'performance', label: 'Performans', icon: <TrendingUp size={18} /> },
    { id: 'automation', label: 'Otomasyon', icon: <Zap size={18} /> },
];

const platformNavItems: NavItem[] = [
    { id: 'instagram', label: 'Instagram', icon: <Instagram size={18} /> },
    { id: 'twitter', label: 'Twitter/X', icon: <Twitter size={18} /> },
    { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={18} /> },
    { id: 'tiktok', label: 'TikTok', icon: <Play size={18} /> },
    { id: 'metricool', label: 'Metricool', icon: <TrendingUp size={18} /> },
];

interface SidebarProps {
    isOpen: boolean;
    activeSection: string;
    onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeSection, onSectionChange }) => {
    const { notifications, clients, activeClient, setActiveClientId } = useDashboard();
    const { isAdmin } = useAuth();
    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            {/* Logo */}
            <div className="nav-logo">
                <div className="nav-logo-icon">N99</div>
                <span className="nav-logo-text">SocialHub</span>
            </div>

            {/* Client Selector (Admin Only) or Company Title (Standard) */}
            <div style={{ padding: '0 var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                <div className="nav-section-title" style={{ marginBottom: 'var(--spacing-xs)' }}>
                    {isAdmin ? 'Müşteri Seçimi' : 'Firma Paneli'}
                </div>
                {isAdmin ? (
                    <div style={{ position: 'relative' }}>
                        <select
                            className="input select"
                            value={activeClient?.id}
                            onChange={(e) => setActiveClientId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-sm)',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-main)',
                                borderRadius: 'var(--radius-md)',
                                appearance: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                        <div style={{
                            position: 'absolute',
                            right: 'var(--spacing-sm)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            color: 'var(--text-muted)'
                        }}>
                            <ChevronDown size={14} />
                        </div>
                    </div>
                ) : (
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
                        {activeClient?.name}
                    </div>
                )}
            </div>

            {/* Main Navigation */}
            <nav className="nav-section">
                <div className="nav-section-title">Genel</div>
                {mainNavItems.map((item) => (
                    <div
                        key={item.id}
                        className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                        onClick={() => onSectionChange(item.id)}
                    >
                        <span className="nav-item-icon">{item.icon}</span>
                        <span className="nav-item-text">{item.label}</span>
                        {item.badge && <span className="nav-item-badge">{item.badge}</span>}
                    </div>
                ))}
            </nav>

            {/* Platform Navigation */}
            <nav className="nav-section">
                <div className="nav-section-title">Platformlar</div>
                {platformNavItems.map((item) => (
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

            {/* Settings Navigation */}
            <nav className="nav-section" style={{ marginTop: 'auto' }}>
                {isAdmin && (
                    <div
                        className={`nav-item ${activeSection === 'admin' ? 'active' : ''}`}
                        onClick={() => onSectionChange('admin')}
                        style={{ color: 'var(--accent-primary)', background: 'rgba(99, 102, 241, 0.05)' }}
                    >
                        <span className="nav-item-icon"><Shield size={18} /></span>
                        <span className="nav-item-text">Yönetim Paneli</span>
                    </div>
                )}
                <div
                    className={`nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
                    onClick={() => onSectionChange('notifications')}
                >
                    <span className="nav-item-icon"><Bell size={18} /></span>
                    <span className="nav-item-text">Bildirimler</span>
                    {unreadCount > 0 && <span className="nav-item-badge">{unreadCount}</span>}
                </div>
                <div
                    className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
                    onClick={() => onSectionChange('settings')}
                >
                    <span className="nav-item-icon"><Settings size={18} /></span>
                    <span className="nav-item-text">Ayarlar</span>
                </div>
                <div
                    className={`nav-item ${activeSection === 'help' ? 'active' : ''}`}
                    onClick={() => onSectionChange('help')}
                >
                    <span className="nav-item-icon"><HelpCircle size={18} /></span>
                    <span className="nav-item-text">Yardım</span>
                </div>
                <div
                    className="nav-item"
                    onClick={() => {
                        console.log('Logout button clicked - redirecting immediately');
                        // Don't await - just fire and redirect
                        supabase.auth.signOut().catch(err => console.error('SignOut error:', err));
                        // Immediate redirect
                        window.location.href = '/login';
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    <span className="nav-item-icon"><LogOut size={18} /></span>
                    <span className="nav-item-text">Çıkış</span>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
