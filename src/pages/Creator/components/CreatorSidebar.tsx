import React from 'react';
import {
    LayoutDashboard,
    FileText,
    LogOut,
    Moon,
    Sun,
    Calendar,
    BookOpen,
    Sparkles,
} from 'lucide-react';
import { useDashboard } from '../../../context/DashboardContext';
import { supabase } from '../../../utils/supabaseService';
import type { AssignedClient } from '../../../types';

interface CreatorSidebarProps {
    isOpen: boolean;
    activeSection: string;
    onSectionChange: (section: string) => void;
    assignedClients: AssignedClient[];
    selectedClient: AssignedClient | null;
    onClientChange: (client: AssignedClient) => void;
}

const CreatorSidebar: React.FC<CreatorSidebarProps> = ({ 
    isOpen, 
    activeSection, 
    onSectionChange, 
    assignedClients, 
    selectedClient, 
    onClientChange 
}) => {
    const { isDarkMode, toggleDarkMode } = useDashboard();

    const navItems = [
        { id: 'dashboard', label: 'Genel Bakış', icon: <LayoutDashboard size={18} /> },
        { id: 'creative-studio', label: 'Yaratıcı Stüdyo', icon: <Sparkles size={18} /> },
        { id: 'calendar', label: 'Takvim', icon: <Calendar size={18} /> },
        { id: 'content', label: 'İçerik Arşivi', icon: <FileText size={18} /> },
        { id: 'brand-guide', label: 'Marka', icon: <BookOpen size={18} /> },
    ];

    return (
        <aside className={`sidebar ${isOpen ? '' : 'sidebar-collapsed'}`}>
            {/* Logo */}
            <div className="nav-logo">
                <div className="nav-logo-icon">C</div>
                {isOpen && <span className="nav-logo-text">Creator Panel</span>}
            </div>

            {/* Client Selector */}
            {isOpen && assignedClients.length > 0 && (
                <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', paddingLeft: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Aktif Firma
                    </label>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                    }}>
                        {assignedClients.map(client => (
                            <div
                                key={client.id}
                                className={`nav-item ${selectedClient?.id === client.id ? 'active' : ''}`}
                                onClick={() => onClientChange(client)}
                                style={{ padding: '0.5rem 0.75rem' }}
                            >
                                <div style={{
                                    width: '24px', height: '24px', borderRadius: '6px',
                                    background: selectedClient?.id === client.id
                                        ? 'var(--accent-primary)'
                                        : 'rgba(255, 255, 255, 0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: selectedClient?.id === client.id ? '#000' : 'var(--text-muted)',
                                    fontSize: '0.65rem', fontWeight: 800,
                                    flexShrink: 0,
                                    boxShadow: selectedClient?.id === client.id ? '0 0 10px rgba(204, 255, 0, 0.2)' : 'none'
                                }}>
                                    {client.company_name.substring(0, 2).toUpperCase()}
                                </div>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                                    {client.company_name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <nav className="nav-section">
                <div className="nav-section-title">Panel</div>
                {navItems.map(item => (
                    <div
                        key={item.id}
                        className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                        onClick={() => onSectionChange(item.id)}
                    >
                        <span className="nav-item-icon">{item.icon}</span>
                        {isOpen && <span className="nav-item-text">{item.label}</span>}
                    </div>
                ))}
            </nav>

            <nav className="nav-section" style={{ marginTop: 'auto' }}>
                <div className="nav-item" onClick={toggleDarkMode}>
                    <span className="nav-item-icon">
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </span>
                    {isOpen && <span className="nav-item-text">{isDarkMode ? 'Açık Mod' : 'Koyu Mod'}</span>}
                </div>
                <div
                    className="nav-item"
                    onClick={() => {
                        supabase.auth.signOut();
                        window.location.href = '/login';
                    }}
                    style={{ color: 'var(--error)' }}
                >
                    <span className="nav-item-icon"><LogOut size={18} /></span>
                    {isOpen && <span className="nav-item-text">Çıkış Yap</span>}
                </div>
            </nav>
        </aside>
    );
};

export default CreatorSidebar;
