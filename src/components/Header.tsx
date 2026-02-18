import React, { useState, useRef, useEffect } from 'react';
import {
    Menu,
    Search,
    Bell,
    Moon,
    Sun,
    User,
    Settings,
    LogOut,
    ChevronDown,
    Plus,
    Building2,

} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime } from '../utils/helpers';
import { supabase } from '../utils/supabaseService';

interface HeaderProps {
    onMenuClick: () => void;
    onNewPost: () => void;
    companyName?: string;
    onLogout?: () => void;
    onSectionChange?: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onNewPost, companyName, onSectionChange }) => {
    const {
        isDarkMode,
        toggleDarkMode,
        notifications,
        markNotificationRead,
        clearNotifications,
        searchQuery,
        setSearchQuery,
        activeClient,
        clients,
        setActiveClientId,
        limeSocialSettings,
    } = useDashboard();
    const { isAdmin } = useAuth();

    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showClientSelector, setShowClientSelector] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const clientSelectorRef = useRef<HTMLDivElement>(null);

    const unreadNotifications = notifications.filter((n) => !n.read);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfile(false);
            }
            if (clientSelectorRef.current && !clientSelectorRef.current.contains(event.target as Node)) {
                setShowClientSelector(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            default:
                return 'ℹ';
        }
    };

    const displayName = companyName || activeClient?.name || 'SocialHub Dashboard';

    return (
        <header className="header">
            <div className="header-left">
                <button className="btn btn-ghost btn-icon" onClick={onMenuClick}>
                    <Menu size={20} />
                </button>
                <div>
                    <h1 className="greeting">
                        {displayName}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <p className="date-display">
                            {new Date().toLocaleDateString('tr-TR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                        <div className={`badge ${limeSocialSettings?.apiKey ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.65rem', padding: '1px 8px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', marginRight: '4px' }}></div>
                            LimeSocial API: {limeSocialSettings?.apiKey ? 'Bağlı' : 'Bağlı Değil'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="header-right">
                {/* Admin Client Selector */}
                {isAdmin && clients.length > 1 && (
                    <div ref={clientSelectorRef} style={{ position: 'relative' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowClientSelector(!showClientSelector)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Building2 size={16} />
                            <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {activeClient?.name || 'Firma Seç'}
                            </span>
                            <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: showClientSelector ? 'rotate(180deg)' : 'none' }} />
                        </button>
                        {showClientSelector && (
                            <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', minWidth: '200px', zIndex: 1000 }}>
                                <div style={{ padding: '8px 12px', fontSize: '0.7rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                                    Firma Seç
                                </div>
                                {clients.map((client) => (
                                    <div
                                        key={client.id}
                                        className="dropdown-item"
                                        onClick={() => {
                                            setActiveClientId(client.id);
                                            setShowClientSelector(false);
                                        }}
                                        style={{
                                            padding: '10px 12px',
                                            cursor: 'pointer',
                                            background: activeClient?.id === client.id ? 'var(--bg-hover)' : 'transparent',
                                            borderLeft: activeClient?.id === client.id ? '3px solid var(--accent-primary)' : '3px solid transparent'
                                        }}
                                    >
                                        <div style={{ fontWeight: 500 }}>{client.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{client.industry}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}


                {/* Search */}
                <div className="search-input">
                    <Search size={16} className="search-input-icon" />
                    <input
                        type="text"
                        className="input"
                        placeholder="Ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '250px' }}
                    />
                </div>

                {/* New Post Button */}
                <button className="btn btn-primary" onClick={onNewPost}>
                    <Plus size={18} />
                    <span>Yeni İçerik</span>
                </button>

                {/* Dark Mode Toggle */}
                <button className="btn btn-ghost btn-icon" onClick={toggleDarkMode}>
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <div className="dropdown" ref={notificationRef}>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{ position: 'relative' }}
                    >
                        <Bell size={20} />
                        {unreadNotifications.length > 0 && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    width: '8px',
                                    height: '8px',
                                    background: 'var(--error)',
                                    borderRadius: '50%',
                                }}
                            />
                        )}
                    </button>

                    {showNotifications && (
                        <div className="dropdown-menu" style={{ width: '350px', right: 0 }}>
                            <div style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600 }}>Bildirimler</span>
                                    <span className="badge badge-info">{unreadNotifications.length} yeni</span>
                                </div>
                            </div>
                            <div className="notification-list" style={{ maxHeight: '300px' }}>
                                {notifications.slice(0, 5).map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`notification-item ${notification.type} ${!notification.read ? 'unread' : ''}`}
                                        onClick={() => markNotificationRead(notification.id)}
                                    >
                                        <div
                                            className="notification-icon"
                                            style={{
                                                background:
                                                    notification.type === 'success'
                                                        ? 'var(--success-bg)'
                                                        : notification.type === 'error'
                                                            ? 'var(--error-bg)'
                                                            : notification.type === 'warning'
                                                                ? 'var(--warning-bg)'
                                                                : 'var(--info-bg)',
                                                color:
                                                    notification.type === 'success'
                                                        ? 'var(--success)'
                                                        : notification.type === 'error'
                                                            ? 'var(--error)'
                                                            : notification.type === 'warning'
                                                                ? 'var(--warning)'
                                                                : 'var(--info)',
                                            }}
                                        >
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="notification-content">
                                            <p className="notification-message">{notification.message}</p>
                                            <span className="notification-time">
                                                {formatRelativeTime(notification.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div
                                style={{
                                    padding: 'var(--spacing-md)',
                                    borderTop: '1px solid var(--border-color)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => {
                                        setShowNotifications(false);
                                        onSectionChange?.('notifications');
                                    }}
                                >Tümünü Gör</button>
                                {notifications.length > 0 && (
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        style={{ color: 'var(--error)', fontSize: '0.75rem' }}
                                        onClick={() => {
                                            clearNotifications();
                                            setShowNotifications(false);
                                        }}
                                    >Temizle</button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="dropdown" ref={profileRef}>
                    <button
                        className="btn btn-ghost"
                        onClick={() => setShowProfile(!showProfile)}
                        style={{ padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                    >
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--accent-gradient)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                            }}
                        >
                            A
                        </div>
                        <ChevronDown size={14} />
                    </button>

                    {showProfile && (
                        <div className="dropdown-menu">
                            <div className="dropdown-item" onClick={() => { setShowProfile(false); onSectionChange?.('settings'); }}>
                                <User size={16} />
                                <span>Profil</span>
                            </div>
                            <div className="dropdown-item" onClick={() => { setShowProfile(false); onSectionChange?.('settings'); }}>
                                <Settings size={16} />
                                <span>Ayarlar</span>
                            </div>
                            <div className="dropdown-divider" />
                            <div
                                className="dropdown-item"
                                style={{ color: 'var(--error)', cursor: 'pointer' }}
                                onClick={() => {
                                    setShowProfile(false);
                                    console.log('Header logout clicked - redirecting immediately');
                                    supabase.auth.signOut().catch(err => console.error('SignOut error:', err));
                                    window.location.href = '/login';
                                }}
                            >
                                <LogOut size={16} />
                                <span>Çıkış Yap</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
