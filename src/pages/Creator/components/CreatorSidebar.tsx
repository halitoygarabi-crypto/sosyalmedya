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
            <div className="sidebar-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'var(--accent-primary)',
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
                                        ? 'var(--bg-secondary)'
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
                                        ? 'var(--accent-primary)'
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

export default CreatorSidebar;
