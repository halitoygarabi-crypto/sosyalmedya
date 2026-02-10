import React, { useState, useEffect, useCallback } from 'react';
import {
    LayoutDashboard,
    FileText,
    Video,
    Users,
    LogOut,
    Moon,
    Sun,
    Menu,
    Building2,
    Plus,
    ChevronRight,
    Calendar,
    BookOpen,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    Eye,
    Heart,
    BarChart3,
    Palette,
    Image,
    Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { supabase } from '../utils/supabaseService';
import { influencerService } from '../utils/influencerService';
import PostList from '../components/PostList';
import NewPostModal from '../components/NewPostModal';
import VideoGenerator from '../components/VideoGenerator';
import AIInfluencerGenerator from '../components/AIInfluencerGenerator';
import type { Influencer, Post } from '../types';

interface AssignedClient {
    id: string;
    company_name: string;
    industry: string | null;
    logo_url: string | null;
    ai_prompt_prefix?: string;
    brand_guidelines?: string;
}

// ─── Creator Sidebar ────────────────────────────────────────────
const CreatorSidebar: React.FC<{
    isOpen: boolean;
    activeSection: string;
    onSectionChange: (section: string) => void;
    assignedClients: AssignedClient[];
    selectedClient: AssignedClient | null;
    onClientChange: (client: AssignedClient) => void;
}> = ({ isOpen, activeSection, onSectionChange, assignedClients, selectedClient, onClientChange }) => {
    const { isDarkMode, toggleDarkMode } = useDashboard();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'content', label: 'İçerik Oluştur', icon: <FileText size={18} /> },
        { id: 'calendar', label: 'İçerik Takvimi', icon: <Calendar size={18} /> },
        { id: 'brand-guide', label: 'Marka Rehberi', icon: <BookOpen size={18} /> },
        { id: 'video-generator', label: 'Video Üretici', icon: <Video size={18} /> },
        { id: 'ai-influencer', label: 'AI Influencer', icon: <Users size={18} /> },
    ];

    return (
        <aside className={`sidebar ${isOpen ? '' : 'sidebar-collapsed'}`}>
            <div className="sidebar-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.1rem'
                    }}>
                        C
                    </div>
                    {isOpen && <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Creator Panel</span>}
                </div>
            </div>

            {/* Client Selector */}
            {isOpen && assignedClients.length > 0 && (
                <div style={{ padding: '0 var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Aktif Firma
                    </label>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                    }}>
                        {assignedClients.map(client => (
                            <button
                                key={client.id}
                                onClick={() => onClientChange(client)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 12px',
                                    borderRadius: 'var(--radius-md)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: selectedClient?.id === client.id
                                        ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(168,85,247,0.1))'
                                        : 'transparent',
                                    color: selectedClient?.id === client.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                    fontWeight: selectedClient?.id === client.id ? 600 : 400,
                                    fontSize: '0.8rem',
                                    transition: 'all 0.2s',
                                    textAlign: 'left',
                                }}
                            >
                                <div style={{
                                    width: '24px', height: '24px', borderRadius: '6px',
                                    background: selectedClient?.id === client.id
                                        ? 'linear-gradient(135deg, #7C3AED, #A855F7)'
                                        : 'var(--bg-hover)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: selectedClient?.id === client.id ? 'white' : 'var(--text-muted)',
                                    fontSize: '0.6rem', fontWeight: 700,
                                    flexShrink: 0,
                                }}>
                                    {client.company_name.substring(0, 2).toUpperCase()}
                                </div>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {client.company_name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        className={`sidebar-nav-item ${activeSection === item.id ? 'active' : ''}`}
                        onClick={() => onSectionChange(item.id)}
                    >
                        {item.icon}
                        {isOpen && <span>{item.label}</span>}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="sidebar-nav-item" onClick={toggleDarkMode}>
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    {isOpen && <span>{isDarkMode ? 'Açık Mod' : 'Koyu Mod'}</span>}
                </button>
                <button
                    className="sidebar-nav-item"
                    onClick={() => {
                        supabase.auth.signOut();
                        window.location.href = '/login';
                    }}
                    style={{ color: 'var(--error)' }}
                >
                    <LogOut size={18} />
                    {isOpen && <span>Çıkış Yap</span>}
                </button>
            </div>
        </aside>
    );
};

// ─── Content Calendar ────────────────────────────────────────────
const ContentCalendar: React.FC<{ posts: Post[]; clientName: string }> = ({ posts, clientName }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1; // Monday first

    const getPostsForDay = (day: number) => {
        return posts.filter(p => {
            const d = new Date(p.scheduledTime || p.createdAt);
            return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
        });
    };

    const statusColor: Record<string, string> = {
        posted: '#10b981',
        scheduled: '#6366f1',
        draft: '#f59e0b',
        failed: '#ef4444',
    };

    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    return (
        <>
            <div className="section-header">
                <h2 className="section-title">
                    <Calendar size={20} style={{ marginRight: '8px' }} />
                    İçerik Takvimi — {clientName}
                </h2>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                {/* Month Navigator */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    borderBottom: '1px solid var(--border-color)',
                }}>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setCurrentMonth(new Date(year, month - 1))}
                    >
                        ← Önceki
                    </button>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        {monthNames[month]} {year}
                    </h3>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setCurrentMonth(new Date(year, month + 1))}
                    >
                        Sonraki →
                    </button>
                </div>

                {/* Day Headers */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                    borderBottom: '1px solid var(--border-color)',
                }}>
                    {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(d => (
                        <div key={d} style={{
                            textAlign: 'center', padding: 'var(--spacing-sm)',
                            fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                    minHeight: '400px',
                }}>
                    {/* Empty cells before month start */}
                    {Array.from({ length: adjustedFirst }).map((_, i) => (
                        <div key={`empty-${i}`} style={{
                            borderRight: '1px solid var(--border-color)',
                            borderBottom: '1px solid var(--border-color)',
                            background: 'var(--bg-tertiary)',
                            opacity: 0.4,
                        }} />
                    ))}

                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayPosts = getPostsForDay(day);
                        const isToday = new Date().getDate() === day &&
                            new Date().getMonth() === month &&
                            new Date().getFullYear() === year;

                        return (
                            <div
                                key={day}
                                style={{
                                    padding: '4px',
                                    minHeight: '72px',
                                    borderRight: '1px solid var(--border-color)',
                                    borderBottom: '1px solid var(--border-color)',
                                    background: isToday ? 'rgba(124, 58, 237, 0.05)' : 'transparent',
                                    position: 'relative',
                                }}
                            >
                                <div style={{
                                    fontSize: '0.75rem',
                                    fontWeight: isToday ? 700 : 500,
                                    color: isToday ? '#7C3AED' : 'var(--text-secondary)',
                                    marginBottom: '2px',
                                    padding: '2px 4px',
                                }}>
                                    {day}
                                </div>
                                {dayPosts.slice(0, 3).map(post => (
                                    <div
                                        key={post.id}
                                        style={{
                                            fontSize: '0.6rem',
                                            padding: '2px 4px',
                                            borderRadius: '3px',
                                            marginBottom: '1px',
                                            background: `${statusColor[post.status] || '#6366f1'}15`,
                                            borderLeft: `2px solid ${statusColor[post.status] || '#6366f1'}`,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            color: 'var(--text-primary)',
                                        }}
                                        title={post.title}
                                    >
                                        {post.title}
                                    </div>
                                ))}
                                {dayPosts.length > 3 && (
                                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', padding: '0 4px' }}>
                                        +{dayPosts.length - 3} daha
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div style={{
                    display: 'flex', gap: 'var(--spacing-lg)', padding: 'var(--spacing-sm) var(--spacing-lg)',
                    borderTop: '1px solid var(--border-color)', flexWrap: 'wrap',
                }}>
                    {Object.entries({ 'Gönderildi': '#10b981', 'Planlandı': '#6366f1', 'Taslak': '#f59e0b', 'Başarısız': '#ef4444' })
                        .map(([label, color]) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
                                <span className="text-muted">{label}</span>
                            </div>
                        ))}
                </div>
            </div>
        </>
    );
};

// ─── Brand Guide Section ─────────────────────────────────────────
const BrandGuide: React.FC<{ client: AssignedClient }> = ({ client }) => {
    const [influencers, setInfluencers] = useState<Influencer[]>([]);

    useEffect(() => {
        influencerService.getByClient(client.id).then(setInfluencers);
    }, [client.id]);

    return (
        <>
            <div className="section-header">
                <h2 className="section-title">
                    <Palette size={20} style={{ marginRight: '8px' }} />
                    Marka Rehberi — {client.company_name}
                </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--spacing-lg)' }}>
                {/* Company Info */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title"><Building2 size={16} /> Firma Bilgileri</h3>
                    </div>
                    <div style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 700, fontSize: '1rem',
                            }}>
                                {client.company_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{client.company_name}</div>
                                <div className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                                    {client.industry || 'Sektör belirtilmemiş'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Prompt */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title"><Sparkles size={16} /> AI Prompt Prefix</h3>
                    </div>
                    <div style={{ padding: 'var(--spacing-md)' }}>
                        {client.ai_prompt_prefix ? (
                            <div style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                fontFamily: 'monospace',
                                fontSize: '0.85rem',
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap',
                                borderLeft: '3px solid #7C3AED',
                            }}>
                                {client.ai_prompt_prefix}
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>
                                Henüz AI prompt prefix tanımlanmamış. Admin panelinden düzenlenebilir.
                            </div>
                        )}
                    </div>
                </div>

                {/* Brand Guidelines */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title"><BookOpen size={16} /> Marka Kılavuzu</h3>
                    </div>
                    <div style={{ padding: 'var(--spacing-md)' }}>
                        {client.brand_guidelines ? (
                            <div style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.875rem',
                                lineHeight: 1.7,
                                whiteSpace: 'pre-wrap',
                            }}>
                                {client.brand_guidelines}
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>
                                Henüz marka kılavuzu tanımlanmamış. Admin panelinden düzenlenebilir.
                            </div>
                        )}
                    </div>
                </div>

                {/* Assigned Influencers */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title"><Image size={16} /> AI Influencer'lar ({influencers.length})</h3>
                    </div>
                    <div style={{ padding: 'var(--spacing-md)' }}>
                        {influencers.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>
                                Bu firmaya atanmış AI influencer bulunmuyor.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {influencers.map(inf => (
                                    <div key={inf.id} style={{
                                        display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
                                        padding: 'var(--spacing-sm) var(--spacing-md)',
                                        background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                                    }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontWeight: 700, fontSize: '0.7rem',
                                        }}>
                                            {inf.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{inf.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                                                {inf.style && <span>🎨 {inf.style}</span>}
                                                {inf.personality && <span>💭 {inf.personality}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

// ─── Main Creator Dashboard ──────────────────────────────────────
const CreatorDashboard: React.FC = () => {
    const { customerProfile } = useAuth();
    const { isDarkMode, posts } = useDashboard();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [showNewPostModal, setShowNewPostModal] = useState(false);
    const [assignedClients, setAssignedClients] = useState<AssignedClient[]>([]);
    const [selectedClient, setSelectedClient] = useState<AssignedClient | null>(null);

    // Apply dark/light mode
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    // Responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            setSidebarOpen(window.innerWidth >= 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch assigned clients
    const fetchClients = useCallback(async () => {
        if (!customerProfile?.assigned_clients || customerProfile.assigned_clients.length === 0) {
            return;
        }

        const { data, error } = await supabase
            .from('customer_profiles')
            .select('id, company_name, industry, logo_url, ai_prompt_prefix, brand_guidelines')
            .in('id', customerProfile.assigned_clients);

        if (!error && data) {
            setAssignedClients(data);
            if (data.length > 0 && !selectedClient) {
                setSelectedClient(data[0]);
            }
        }
    }, [customerProfile?.assigned_clients, selectedClient]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const clientPosts = posts.filter(p => selectedClient && p.clientId === selectedClient.id);

    // Compute stats
    const totalLikes = clientPosts.reduce((s, p) => s + (p.metrics?.likes || 0), 0);
    const totalReach = clientPosts.reduce((s, p) => s + (p.metrics?.reach || 0), 0);
    const postedCount = clientPosts.filter(p => p.status === 'posted').length;
    const scheduledCount = clientPosts.filter(p => p.status === 'scheduled').length;
    const draftCount = clientPosts.filter(p => p.status === 'draft').length;

    // Platform distribution
    const platformCounts: Record<string, number> = {};
    clientPosts.forEach(p => {
        (p.platforms || []).forEach(pl => {
            platformCounts[pl] = (platformCounts[pl] || 0) + 1;
        });
    });

    return (
        <div className="dashboard">
            <CreatorSidebar
                isOpen={sidebarOpen}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                assignedClients={assignedClients}
                selectedClient={selectedClient}
                onClientChange={setSelectedClient}
            />

            <main className={`main-content ${!sidebarOpen ? 'main-content-expanded' : ''}`}>
                {/* Header */}
                <header className="header">
                    <div className="header-left">
                        <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="greeting">
                                İçerik Üretici Paneli
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                {selectedClient && (
                                    <div className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                                        <Building2 size={12} />
                                        <span>{selectedClient.company_name}</span>
                                    </div>
                                )}
                                <p className="date-display">
                                    {new Date().toLocaleDateString('tr-TR', {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="header-right">
                        <button className="btn btn-primary" onClick={() => setShowNewPostModal(true)}>
                            <Plus size={18} />
                            <span>Yeni Post</span>
                        </button>
                    </div>
                </header>

                <div className="section-content animate-fadeIn">
                    {/* No assigned clients warning */}
                    {assignedClients.length === 0 && (
                        <div className="card" style={{
                            textAlign: 'center',
                            padding: 'var(--spacing-2xl)',
                            background: 'var(--warning-bg)',
                            border: '1px solid var(--warning)'
                        }}>
                            <Users size={48} style={{ color: 'var(--warning)', marginBottom: 'var(--spacing-md)' }} />
                            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Henüz firma atanmamış</h3>
                            <p className="text-muted">Admin tarafından size firma atandığında burada görüntülenecektir.</p>
                        </div>
                    )}

                    {/* ── Dashboard Overview ── */}
                    {activeSection === 'dashboard' && selectedClient && (
                        <>
                            <div className="section-header">
                                <h2 className="section-title">{selectedClient.company_name} — Genel Bakış</h2>
                            </div>

                            {/* KPI Cards */}
                            <div className="grid-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
                                {[
                                    { label: 'Toplam Post', value: clientPosts.length, icon: <FileText size={20} />, color: '#7C3AED' },
                                    { label: 'Gönderildi', value: postedCount, icon: <CheckCircle2 size={20} />, color: '#10b981' },
                                    { label: 'Planlandı', value: scheduledCount, icon: <Clock size={20} />, color: '#6366f1' },
                                    { label: 'Taslak', value: draftCount, icon: <AlertCircle size={20} />, color: '#f59e0b' },
                                ].map(kpi => (
                                    <div className="card" key={kpi.label} style={{ position: 'relative', overflow: 'hidden' }}>
                                        <div style={{
                                            position: 'absolute', top: '-10px', right: '-10px',
                                            width: '60px', height: '60px', borderRadius: '50%',
                                            background: `${kpi.color}10`,
                                        }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>{kpi.label}</div>
                                                <div style={{ fontSize: '2rem', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                                            </div>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                                                background: `${kpi.color}15`, color: kpi.color,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {kpi.icon}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Engagement & Platform stats */}
                            <div className="grid-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
                                {/* Engagement Summary */}
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title"><TrendingUp size={16} /> Etkileşim Özeti</h3>
                                    </div>
                                    <div style={{ padding: 'var(--spacing-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                        <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                            <Heart size={20} style={{ color: '#ec4899', marginBottom: '4px' }} />
                                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ec4899' }}>{totalLikes.toLocaleString('tr-TR')}</div>
                                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>Toplam Beğeni</div>
                                        </div>
                                        <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                            <Eye size={20} style={{ color: '#3b82f6', marginBottom: '4px' }} />
                                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#3b82f6' }}>{totalReach.toLocaleString('tr-TR')}</div>
                                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>Toplam Erişim</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Platform Distribution */}
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title"><BarChart3 size={16} /> Platform Dağılımı</h3>
                                    </div>
                                    <div style={{ padding: 'var(--spacing-md)' }}>
                                        {Object.keys(platformCounts).length === 0 ? (
                                            <p className="text-muted" style={{ fontSize: '0.875rem', fontStyle: 'italic' }}>Henüz post yok.</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                                {Object.entries(platformCounts)
                                                    .sort(([, a], [, b]) => b - a)
                                                    .map(([platform, count]) => {
                                                        const pctg = clientPosts.length > 0 ? (count / clientPosts.length * 100) : 0;
                                                        const platformColors: Record<string, string> = {
                                                            instagram: '#E4405F', twitter: '#1DA1F2', linkedin: '#0A66C2',
                                                            tiktok: '#00f2ea', facebook: '#1877F2', youtube: '#FF0000',
                                                        };
                                                        const color = platformColors[platform] || '#6366f1';
                                                        return (
                                                            <div key={platform}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                                                                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{platform}</span>
                                                                    <span className="text-muted">{count} post ({pctg.toFixed(0)}%)</span>
                                                                </div>
                                                                <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                                                                    <div style={{
                                                                        width: `${pctg}%`, height: '100%',
                                                                        background: color, borderRadius: '3px',
                                                                        transition: 'width 0.5s ease',
                                                                    }} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Posts */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Son Paylaşımlar</h3>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveSection('content')}>
                                        Tümünü Gör <ChevronRight size={14} />
                                    </button>
                                </div>
                                <PostList filter="all" limit={5} />
                            </div>
                        </>
                    )}

                    {/* ── Content Creation ── */}
                    {activeSection === 'content' && selectedClient && (
                        <>
                            <div className="section-header">
                                <h2 className="section-title">İçerik Oluştur — {selectedClient.company_name}</h2>
                                <button className="btn btn-primary" onClick={() => setShowNewPostModal(true)}>
                                    <Plus size={16} />
                                    Yeni İçerik
                                </button>
                            </div>
                            <div className="card">
                                <PostList filter="all" limit={20} />
                            </div>
                        </>
                    )}

                    {/* ── Content Calendar ── */}
                    {activeSection === 'calendar' && selectedClient && (
                        <ContentCalendar posts={clientPosts} clientName={selectedClient.company_name} />
                    )}

                    {/* ── Brand Guide ── */}
                    {activeSection === 'brand-guide' && selectedClient && (
                        <BrandGuide client={selectedClient} />
                    )}

                    {/* ── Video Generator ── */}
                    {activeSection === 'video-generator' && selectedClient && (
                        <VideoGenerator selectedClient={selectedClient} />
                    )}

                    {/* ── AI Influencer ── */}
                    {activeSection === 'ai-influencer' && selectedClient && (
                        <AIInfluencerGenerator selectedClient={selectedClient} />
                    )}
                </div>
            </main>

            <NewPostModal isOpen={showNewPostModal} onClose={() => setShowNewPostModal(false)} />
        </div>
    );
};

export default CreatorDashboard;
