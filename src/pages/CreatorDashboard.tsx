import React, { useState, useEffect, useCallback } from 'react';
import {
    Menu,
    Building2,
    Plus,
    ChevronRight,
    Clock,
    CheckCircle2,
    Heart,
    Upload,
    RefreshCw,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { supabase } from '../utils/supabaseService';
import PostList from '../components/PostList';
import NewPostModal from '../components/NewPostModal';
import DistributionPlannerModal from '../components/DistributionPlannerModal';

// Shared Components
import CreatorSidebar from './Creator/components/CreatorSidebar';
import ContentCalendar from './Creator/components/ContentCalendar';
import BrandGuide from './Creator/components/BrandGuide';
import CreativeStudio from './Creator/components/CreativeStudio';

import type { AssignedClient } from '../types';

const CreatorDashboard: React.FC = () => {
    const { customerProfile } = useAuth();
    const { isDarkMode, posts, activeClient, setActiveClientId, isLoading, syncLimeSocialHistory } = useDashboard();


    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [showNewPostModal, setShowNewPostModal] = useState(false);
    const [showDistributionModal, setShowDistributionModal] = useState(false);
    const [selectedLocalFile, setSelectedLocalFile] = useState<File | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleLocalUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedLocalFile(e.target.files[0]);
            setShowDistributionModal(true);
        }
    };

    const [assignedClients, setAssignedClients] = useState<AssignedClient[]>([]);
    const selectedClient = activeClient as AssignedClient | null;

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

    const { isAdmin: isSystemAdmin } = useAuth();

    // Fetch assigned clients
    const fetchClients = useCallback(async () => {
        if (isSystemAdmin) {
            // Admins get "All Clients" + all profiles
            const { data, error } = await supabase
                .from('customer_profiles')
                .select('id, company_name, industry, logo_url, ai_prompt_prefix, brand_guidelines');
            
            if (!error && data) {
                const adminAssigned: AssignedClient[] = [
                    { id: 'all_clients', company_name: 'Tüm Müşteriler', industry: 'Genel', logo_url: null },
                    ...(data as AssignedClient[])
                ];

                setAssignedClients(adminAssigned);
                if (!activeClient) setActiveClientId('all_clients');
            }
            return;
        }

        if (!customerProfile?.assigned_clients || customerProfile.assigned_clients.length === 0) {
            return;
        }

        const { data, error } = await supabase
            .from('customer_profiles')
            .select('id, company_name, industry, logo_url, ai_prompt_prefix, brand_guidelines')
            .in('id', customerProfile.assigned_clients);

        if (!error && data) {
            setAssignedClients(data as AssignedClient[]);
            if (!activeClient && data.length > 0) setActiveClientId(data[0].id);
        }
    }, [customerProfile?.assigned_clients, isSystemAdmin, activeClient, setActiveClientId]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const clientPosts = posts.filter(p => {
        if (!selectedClient) return false;
        if (selectedClient.id === 'all_clients') return true;
        return p.clientId === selectedClient.id;
    });

    // Compute stats
    const totalLikes = clientPosts.reduce((s, p) => s + (p.metrics?.likes || 0), 0);
    const postedCount = clientPosts.filter(p => p.status === 'posted').length;
    const scheduledCount = clientPosts.filter(p => p.status === 'scheduled').length;

    return (
        <div className="dashboard">
            <CreatorSidebar
                isOpen={sidebarOpen}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                assignedClients={assignedClients}
                selectedClient={selectedClient}
                onClientChange={(client) => setActiveClientId(client.id)}
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
                    <div className="header-right" style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            className={`btn btn-secondary ${isLoading ? 'btn-loading' : ''}`} 
                            onClick={syncLimeSocialHistory}
                            disabled={isLoading}
                        >
                            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                            <span>Senkronize Et</span>
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowNewPostModal(true)}>
                            <Plus size={18} />
                            <span>Yeni İçerik</span>
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
                            <Building2 size={48} style={{ color: 'var(--warning)', marginBottom: 'var(--spacing-md)' }} />
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

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                                <div className="card" style={{ padding: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                    <div style={{ padding: '12px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{postedCount}</div>
                                        <div className="text-muted">Yayınlanan</div>
                                    </div>
                                </div>
                                <div className="card" style={{ padding: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                    <div style={{ padding: '12px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{scheduledCount}</div>
                                        <div className="text-muted">Bekleyen</div>
                                    </div>
                                </div>
                                <div className="card" style={{ padding: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                    <div style={{ padding: '12px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                                        <Heart size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{totalLikes.toLocaleString('tr-TR')}</div>
                                        <div className="text-muted">Etkileşim</div>
                                    </div>
                                </div>
                            </div>

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

                    {/* ── Content Archive ── */}
                    {activeSection === 'content' && selectedClient && (
                        <>
                            <div className="section-header">
                                <h2 className="section-title">İçerik Arşivi — {selectedClient.company_name}</h2>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-primary" onClick={() => setShowNewPostModal(true)}>
                                        <Plus size={16} />
                                        Yeni İçerik
                                    </button>
                                    <button className="btn btn-secondary" onClick={handleLocalUploadClick}>
                                        <Upload size={16} />
                                        Lokalden Yükle
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        style={{ display: 'none' }} 
                                        onChange={handleFileChange}
                                        accept="image/*,video/*"
                                    />
                                </div>
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

                    {/* ── Creative Studio ── */}
                    {activeSection === 'creative-studio' && selectedClient && (
                        <CreativeStudio client={selectedClient} onNewPost={() => setShowNewPostModal(true)} />
                    )}
                </div>
            </main>

            <NewPostModal isOpen={showNewPostModal} onClose={() => setShowNewPostModal(false)} />
            
            <DistributionPlannerModal 
                isOpen={showDistributionModal} 
                onClose={() => setShowDistributionModal(false)} 
                initialFile={selectedLocalFile}
            />
        </div>
    );
};

export default CreatorDashboard;
