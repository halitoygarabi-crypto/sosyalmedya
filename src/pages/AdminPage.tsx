import React, { useState, useEffect, useCallback } from 'react';
import {
    Users,
    UserPlus,
    Search,
    Building2,
    Briefcase,
    Shield,
    ShieldAlert,
    AlertCircle,
    X,
    Save,
    Key,
    Settings,
    Instagram,
    Twitter,
    Image,
    Linkedin,
    Globe,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit3,
    Eye
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseService';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

import { influencerService } from '../utils/influencerService';
import type { Influencer } from '../types';

interface Customer {
    id: string;
    company_name: string;
    industry: string | null;
    ai_prompt_prefix: string;
    is_admin: boolean;
    role?: 'admin' | 'client' | 'content_creator';
    created_at: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    logo_url?: string;
    brand_guidelines?: string;
    assigned_clients?: string[];
    instagram_token?: string;
    twitter_token?: string;
    linkedin_token?: string;
    tiktok_token?: string;
    metricool_api_key?: string;
    limesocial_api_key?: string;
}

interface CustomerDetailModalProps {
    customer: Customer | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedCustomer: Customer) => Promise<void>;
}

// Customer Detail Modal Component
const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ customer, isOpen, onClose, onSave }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'api' | 'influencers' | 'settings'>('info');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editData, setEditData] = useState<Partial<Customer>>({});
    const [allInfluencers, setAllInfluencers] = useState<Influencer[]>([]);
    const [assignedInfluencers, setAssignedInfluencers] = useState<Influencer[]>([]);
    const [loadingInfluencers, setLoadingInfluencers] = useState(false);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        if (customer) {
            setEditData({ ...customer });
        }
    }, [customer]);

    // Fetch influencers when the influencers tab is active
    useEffect(() => {
        if (activeTab === 'influencers' && customer) {
            setLoadingInfluencers(true);
            Promise.all([
                influencerService.list(),
                influencerService.getByClient(customer.id),
            ]).then(([all, assigned]) => {
                setAllInfluencers(all);
                setAssignedInfluencers(assigned);
                setLoadingInfluencers(false);
            });
        }
    }, [activeTab, customer]);

    // Fetch all customers for content_creator assignment
    useEffect(() => {
        if (activeTab === 'settings' && editData.role === 'content_creator') {
            supabase.from('customer_profiles').select('id, company_name, industry, role')
                .neq('role', 'content_creator')
                .then(({ data }) => {
                    if (data) setAllCustomers(data as Customer[]);
                });
        }
    }, [activeTab, editData.role]);

    if (!isOpen || !customer) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({ ...customer, ...editData } as Customer);
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAssignInfluencer = async (influencerId: string) => {
        const ok = await influencerService.assignToClient(customer.id, influencerId);
        if (ok) {
            const inf = allInfluencers.find(i => i.id === influencerId);
            if (inf) setAssignedInfluencers(prev => [...prev, inf]);
        }
    };

    const handleRemoveInfluencer = async (influencerId: string) => {
        const ok = await influencerService.removeFromClient(customer.id, influencerId);
        if (ok) {
            setAssignedInfluencers(prev => prev.filter(i => i.id !== influencerId));
        }
    };

    const tabs = [
        { id: 'info', label: 'Firma Bilgileri', icon: <Building2 size={16} /> },
        { id: 'api', label: 'API Bağlantıları', icon: <Key size={16} /> },
        { id: 'influencers', label: 'AI Influencer', icon: <Image size={16} /> },
        { id: 'settings', label: 'Rol & Ayarlar', icon: <Settings size={16} /> },
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
                {/* Modal Header */}
                <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: 'var(--radius-lg)',
                            background: 'var(--accent-gradient)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: 'white',
                            fontSize: '1rem', fontWeight: 700
                        }}>
                            {customer.company_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="modal-title" style={{ marginBottom: '4px' }}>{customer.company_name}</h2>
                            <div className="badge badge-secondary">
                                <Briefcase size={12} />
                                <span>{customer.industry || 'Sektör belirtilmemiş'}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        {!isEditing ? (
                            <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                                <Edit3 size={16} />
                                <span>Düzenle</span>
                            </button>
                        ) : (
                            <>
                                <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>İptal</button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <div className="spinner-sm" /> : <Save size={16} />}
                                    <span>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</span>
                                </button>
                            </>
                        )}
                        <button className="btn btn-ghost btn-icon" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--border-color)',
                    padding: '0 var(--spacing-lg)'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-xs)',
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab.id ? 600 : 400,
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Modal Body */}
                <div className="modal-body" style={{ flex: 1, overflow: 'auto', padding: 'var(--spacing-lg)' }}>
                    {activeTab === 'info' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-lg)' }}>
                            <div className="input-group">
                                <label className="input-label">
                                    <Building2 size={14} style={{ marginRight: '6px' }} />
                                    Şirket Adı
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={editData.company_name || ''}
                                    onChange={e => setEditData({ ...editData, company_name: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">
                                    <Briefcase size={14} style={{ marginRight: '6px' }} />
                                    Sektör
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={editData.industry || ''}
                                    onChange={e => setEditData({ ...editData, industry: e.target.value })}
                                    disabled={!isEditing}
                                    placeholder="Örn: Teknoloji, Mobilya"
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">
                                    <Mail size={14} style={{ marginRight: '6px' }} />
                                    E-posta
                                </label>
                                <input
                                    type="email"
                                    className="input"
                                    value={editData.email || ''}
                                    onChange={e => setEditData({ ...editData, email: e.target.value })}
                                    disabled={!isEditing}
                                    placeholder="info@sirket.com"
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">
                                    <Phone size={14} style={{ marginRight: '6px' }} />
                                    Telefon
                                </label>
                                <input
                                    type="tel"
                                    className="input"
                                    value={editData.phone || ''}
                                    onChange={e => setEditData({ ...editData, phone: e.target.value })}
                                    disabled={!isEditing}
                                    placeholder="+90 5XX XXX XX XX"
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">
                                    <Globe size={14} style={{ marginRight: '6px' }} />
                                    Web Sitesi
                                </label>
                                <input
                                    type="url"
                                    className="input"
                                    value={editData.website || ''}
                                    onChange={e => setEditData({ ...editData, website: e.target.value })}
                                    disabled={!isEditing}
                                    placeholder="https://www.sirket.com"
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">
                                    <Calendar size={14} style={{ marginRight: '6px' }} />
                                    Kayıt Tarihi
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={new Date(customer.created_at).toLocaleDateString('tr-TR')}
                                    disabled
                                />
                            </div>
                            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                <label className="input-label">
                                    <MapPin size={14} style={{ marginRight: '6px' }} />
                                    Adres
                                </label>
                                <textarea
                                    className="input"
                                    value={editData.address || ''}
                                    onChange={e => setEditData({ ...editData, address: e.target.value })}
                                    disabled={!isEditing}
                                    placeholder="Şirket adresi"
                                    rows={2}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'api' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                            <div style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--info-bg)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)'
                            }}>
                                <AlertCircle size={18} color="var(--info)" />
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    API anahtarları güvenlik amacıyla maskelenmiştir. Düzenlemek için "Düzenle" butonuna tıklayın.
                                </p>
                            </div>

                            {/* Social Media APIs */}
                            <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    Sosyal Medya Bağlantıları
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
                                    <div className="input-group">
                                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Instagram size={14} color="#E4405F" />
                                            Instagram Token
                                        </label>
                                        <input
                                            type={isEditing ? "text" : "password"}
                                            className="input"
                                            value={editData.instagram_token || ''}
                                            onChange={e => setEditData({ ...editData, instagram_token: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="Instagram API Token"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Twitter size={14} color="#1DA1F2" />
                                            Twitter/X Token
                                        </label>
                                        <input
                                            type={isEditing ? "text" : "password"}
                                            className="input"
                                            value={editData.twitter_token || ''}
                                            onChange={e => setEditData({ ...editData, twitter_token: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="Twitter API Token"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Linkedin size={14} color="#0A66C2" />
                                            LinkedIn Token
                                        </label>
                                        <input
                                            type={isEditing ? "text" : "password"}
                                            className="input"
                                            value={editData.linkedin_token || ''}
                                            onChange={e => setEditData({ ...editData, linkedin_token: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="LinkedIn API Token"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#00f2ea">
                                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                                            </svg>
                                            TikTok Token
                                        </label>
                                        <input
                                            type={isEditing ? "text" : "password"}
                                            className="input"
                                            value={editData.tiktok_token || ''}
                                            onChange={e => setEditData({ ...editData, tiktok_token: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="TikTok API Token"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Third Party APIs */}
                            <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                                    Üçüncü Parti Entegrasyonlar
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
                                    <div className="input-group">
                                        <label className="input-label">Metricool API Key</label>
                                        <input
                                            type={isEditing ? "text" : "password"}
                                            className="input"
                                            value={editData.metricool_api_key || ''}
                                            onChange={e => setEditData({ ...editData, metricool_api_key: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="Metricool API Anahtarı"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">LimeSocial API Key</label>
                                        <input
                                            type={isEditing ? "text" : "password"}
                                            className="input"
                                            value={editData.limesocial_api_key || ''}
                                            onChange={e => setEditData({ ...editData, limesocial_api_key: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="LimeSocial API Anahtarı"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'influencers' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                            <div style={{ padding: 'var(--spacing-md)', background: 'var(--info-bg)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <AlertCircle size={18} color="var(--info)" />
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    Bu firmaya atanmış AI influencer'ları yönetin. Atanan influencer'lar içerik üretiminde kullanılabilir.
                                </p>
                            </div>

                            {loadingInfluencers ? (
                                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                                    <div className="spinner" style={{ margin: '0 auto' }} />
                                </div>
                            ) : (
                                <>
                                    {/* Assigned Influencers */}
                                    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                                            Atanmış Influencer'lar ({assignedInfluencers.length})
                                        </h4>
                                        {assignedInfluencers.length === 0 ? (
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Henüz influencer atanmamış.</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                                {assignedInfluencers.map(inf => (
                                                    <div key={inf.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-sm) var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.7rem' }}>
                                                                {inf.name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{inf.name}</div>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{inf.style || 'Stil belirtilmemiş'}</div>
                                                            </div>
                                                        </div>
                                                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => handleRemoveInfluencer(inf.id)}>
                                                            <X size={14} /> Kaldır
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Available Influencers to Assign */}
                                    {(() => {
                                        const unassigned = allInfluencers.filter(i => !assignedInfluencers.some(a => a.id === i.id));
                                        return unassigned.length > 0 ? (
                                            <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                                                    Atanabilecek Influencer'lar ({unassigned.length})
                                                </h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                                    {unassigned.map(inf => (
                                                        <div key={inf.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-sm) var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem' }}>
                                                                    {inf.name.substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{inf.name}</div>
                                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{inf.personality || 'Kişilik belirtilmemiş'}</div>
                                                                </div>
                                                            </div>
                                                            <button className="btn btn-primary btn-sm" onClick={() => handleAssignInfluencer(inf.id)}>
                                                                Ata
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null;
                                    })()}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                            {/* AI Prompt */}
                            <div className="input-group">
                                <label className="input-label">AI Prompt Prefix (İçerik Üretimi için)</label>
                                <textarea
                                    className="input"
                                    value={editData.ai_prompt_prefix || ''}
                                    onChange={e => setEditData({ ...editData, ai_prompt_prefix: e.target.value })}
                                    disabled={!isEditing}
                                    placeholder="Örn: Profesyonel ve samimi bir dil kullan."
                                    rows={3}
                                    style={{ resize: 'vertical' }}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    Bu metin, AI içerik üretirken prompt'un başına eklenir.
                                </p>
                            </div>

                            {/* Brand Guidelines */}
                            <div className="input-group">
                                <label className="input-label">Marka Kılavuzu</label>
                                <textarea
                                    className="input"
                                    value={editData.brand_guidelines || ''}
                                    onChange={e => setEditData({ ...editData, brand_guidelines: e.target.value })}
                                    disabled={!isEditing}
                                    placeholder="Marka renkleri, ton, stil kuralları..."
                                    rows={3}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            {/* Role Selector */}
                            <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>Kullanıcı Rolü</h4>
                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                                    {[
                                        { value: 'client', label: 'Müşteri', desc: 'Kendi paneline ve raporlara erişir', icon: <Building2 size={16} />, color: '#10b981' },
                                        { value: 'content_creator', label: 'İçerik Üretici', desc: 'Atanmış firmaların içeriklerini üretir', icon: <Users size={16} />, color: '#7C3AED' },
                                        { value: 'admin', label: 'Yönetici', desc: 'Tam erişim — tüm firmalar ve ayarlar', icon: <Shield size={16} />, color: '#ef4444' },
                                    ].map(r => (
                                        <div
                                            key={r.value}
                                            onClick={() => isEditing && setEditData({ ...editData, role: r.value as Customer['role'] })}
                                            style={{
                                                flex: '1 1 150px',
                                                padding: 'var(--spacing-md)',
                                                borderRadius: 'var(--radius-md)',
                                                border: `2px solid ${(editData.role || (customer.is_admin ? 'admin' : 'client')) === r.value ? r.color : 'var(--border-color)'}`,
                                                background: (editData.role || (customer.is_admin ? 'admin' : 'client')) === r.value ? `${r.color}10` : 'var(--bg-tertiary)',
                                                cursor: isEditing ? 'pointer' : 'default',
                                                transition: 'all 0.2s',
                                                opacity: isEditing ? 1 : 0.7,
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: r.color }}>
                                                {r.icon}
                                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.label}</span>
                                            </div>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Content Creator → Client assignment */}
                            {(editData.role === 'content_creator') && (
                                <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                                        Atanacak Firmalar
                                    </h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)' }}>
                                        Bu içerik üreticinin hangi firmaların içeriklerini oluşturabileceğini seçin.
                                    </p>
                                    {allCustomers.filter(c => c.role !== 'content_creator').map(c => {
                                        const isChecked = (editData.assigned_clients || []).includes(c.id);
                                        return (
                                            <label key={c.id} style={{
                                                display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
                                                padding: 'var(--spacing-xs) var(--spacing-sm)',
                                                cursor: isEditing ? 'pointer' : 'default',
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    disabled={!isEditing}
                                                    onChange={() => {
                                                        const current = editData.assigned_clients || [];
                                                        setEditData({
                                                            ...editData,
                                                            assigned_clients: isChecked
                                                                ? current.filter(id => id !== c.id)
                                                                : [...current, c.id]
                                                        });
                                                    }}
                                                />
                                                <span style={{ fontWeight: 500 }}>{c.company_name}</span>
                                                <span className="badge badge-secondary" style={{ fontSize: '0.6rem' }}>{c.industry || 'Genel'}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminPage: React.FC = () => {
    const { isAdmin, user: currentUser } = useAuth();
    const { addNotification } = useDashboard();

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // New Customer Form State
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newCompany, setNewCompany] = useState('');
    const [newIndustry, setNewIndustry] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCustomers = useCallback(async () => {
        console.log('fetchCustomers triggered, isAdmin:', isAdmin);
        if (!isAdmin) return;

        setIsLoading(true);
        try {
            console.log('Querying supabase for customer_profiles...');
            const { data: profiles, error: profileError } = await supabase
                .from('customer_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profileError) {
                console.error('Supabase profile error:', profileError);
                throw profileError;
            }

            console.log('Fetched profiles count:', profiles?.length || 0);
            setCustomers(profiles || []);
        } catch (error: any) {
            console.error('Error in fetchCustomers:', error);
            addNotification({
                type: 'error',
                message: 'Müşteriler yüklenemedi: ' + (error.message || 'Bilinmeyen hata'),
                read: false
            });
        } finally {
            setIsLoading(false);
            console.log('fetchCustomers finished, isLoading set to false');
        }
    }, [isAdmin, addNotification]);

    useEffect(() => {
        console.log('AdminPage mounted or isAdmin changed:', isAdmin);
        fetchCustomers();

        // 10 saniye sonra loading state'i zorla kapat (güvenlik için)
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 10000);

        return () => clearTimeout(timeout);
    }, [fetchCustomers]);

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            });

            const { data: authData, error: authError } = await tempSupabase.auth.signUp({
                email: newEmail,
                password: newPassword,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Kullanıcı oluşturulurken bir hata oluştu.');

            const { error: profileError } = await supabase
                .from('customer_profiles')
                .insert({
                    id: authData.user.id,
                    company_name: newCompany,
                    industry: newIndustry || null,
                    ai_prompt_prefix: 'Profesyonel bir dil kullan.',
                    email: newEmail
                });

            if (profileError) {
                throw profileError;
            }

            addNotification({
                type: 'success',
                message: `${newCompany} başarıyla kaydedildi! Müşteri artık giriş yapabilir.`,
                read: false
            });

            setNewEmail('');
            setNewPassword('');
            setNewCompany('');
            setNewIndustry('');
            setShowAddModal(false);

            fetchCustomers();
        } catch (error: any) {
            console.error('Add customer error:', error);
            addNotification({
                type: 'error',
                message: 'Hata: ' + (error.message || 'Müşteri oluşturulamadı.'),
                read: false
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateCustomer = async (updatedCustomer: Customer) => {
        try {
            const updatePayload: Record<string, unknown> = {
                company_name: updatedCustomer.company_name,
                industry: updatedCustomer.industry,
                email: updatedCustomer.email,
                phone: updatedCustomer.phone,
                website: updatedCustomer.website,
                address: updatedCustomer.address,
                ai_prompt_prefix: updatedCustomer.ai_prompt_prefix,
                brand_guidelines: updatedCustomer.brand_guidelines,
                instagram_token: updatedCustomer.instagram_token,
                twitter_token: updatedCustomer.twitter_token,
                linkedin_token: updatedCustomer.linkedin_token,
                tiktok_token: updatedCustomer.tiktok_token,
                metricool_api_key: updatedCustomer.metricool_api_key,
                limesocial_api_key: updatedCustomer.limesocial_api_key,
            };

            // Update role if changed
            if (updatedCustomer.role) {
                updatePayload.role = updatedCustomer.role;
                updatePayload.is_admin = updatedCustomer.role === 'admin';
            }

            // Update assigned_clients for content creators
            if (updatedCustomer.role === 'content_creator' && updatedCustomer.assigned_clients) {
                updatePayload.assigned_clients = updatedCustomer.assigned_clients;
            }

            const { error } = await supabase
                .from('customer_profiles')
                .update(updatePayload)
                .eq('id', updatedCustomer.id);

            if (error) throw error;

            addNotification({
                type: 'success',
                message: `${updatedCustomer.company_name} bilgileri güncellendi.`,
                read: false
            });

            fetchCustomers();
        } catch (error: any) {
            addNotification({
                type: 'error',
                message: 'Güncelleme hatası: ' + error.message,
                read: false
            });
            throw error;
        }
    };

    const toggleAdminStatus = async (customer: Customer) => {
        if (customer.id === currentUser?.id) {
            addNotification({ type: 'warning', message: 'Kendi admin yetkinizi kaldıramazsınız.', read: false });
            return;
        }

        try {
            const { error } = await supabase
                .from('customer_profiles')
                .update({ is_admin: !customer.is_admin })
                .eq('id', customer.id);

            if (error) throw error;

            addNotification({
                type: 'success',
                message: `${customer.company_name} için admin yetkisi ${!customer.is_admin ? 'verildi' : 'kaldırıldı'}.`,
                read: false
            });
            fetchCustomers();
        } catch (error: any) {
            addNotification({ type: 'error', message: 'Hata: ' + error.message, read: false });
        }
    };

    const openCustomerDetail = (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowDetailModal(true);
    };

    const filteredCustomers = customers.filter(c =>
        c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.industry && c.industry.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!isAdmin) {
        return (
            <div className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                <ShieldAlert size={64} color="var(--error)" />
                <h1 style={{ marginTop: '1rem' }}>Erişim Engellendi</h1>
                <p>Bu sayfayı görüntülemek için yönetici yetkisine sahip olmanız gerekmektedir.</p>
                <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => window.location.href = '/'}>Ana Sayfaya Dön</button>
            </div>
        );
    }

    return (
        <div className="section animate-fadeIn" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
            <div className="section-header" style={{ flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                <div>
                    <h2 className="section-title">Müşteri Yönetimi</h2>
                    <p className="text-muted text-sm">Sisteme kayıtlı tüm müşterileri yönetin ve yeni girişler yapın.</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button className="btn btn-secondary" onClick={() => fetchCustomers()} disabled={isLoading}>
                        <span>{isLoading ? 'Yükleniyor...' : 'Yenile'}</span>
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <UserPlus size={18} />
                        <span>Yeni Müşteri Ekle</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="kpi-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
                        <Users size={24} />
                    </div>
                    <div className="kpi-value">{customers.length}</div>
                    <div className="kpi-label">Toplam Müşteri</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: 'var(--accent-gradient)', color: 'white' }}>
                        <Shield size={24} />
                    </div>
                    <div className="kpi-value">{customers.filter(c => c.is_admin).length}</div>
                    <div className="kpi-label">Yöneticiler</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                        <Building2 size={24} />
                    </div>
                    <div className="kpi-value">
                        {[...new Set(customers.map(c => c.industry).filter(Boolean))].length}
                    </div>
                    <div className="kpi-label">Farklı Sektör</div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)' }}>
                <div className="input-with-icon">
                    <Search size={18} className="input-icon" />
                    <input
                        type="text"
                        className="input"
                        placeholder="Müşteri adı veya sektör ile ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Customers Table/List */}
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: 'var(--spacing-md)', fontWeight: 600 }}>Şirket / Müşteri</th>
                            <th style={{ padding: 'var(--spacing-md)', fontWeight: 600 }}>Sektör</th>
                            <th style={{ padding: 'var(--spacing-md)', fontWeight: 600 }}>Kayıt Tarihi</th>
                            <th style={{ padding: 'var(--spacing-md)', fontWeight: 600 }}>Yetki</th>
                            <th style={{ padding: 'var(--spacing-md)', fontWeight: 600 }}>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
                                    <div className="spinner" style={{ margin: '0 auto' }} />
                                    <p style={{ marginTop: '1rem' }}>Müşteriler yükleniyor...</p>
                                </td>
                            </tr>
                        ) : filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
                                    <AlertCircle size={40} className="text-muted" style={{ margin: '0 auto', display: 'block' }} />
                                    <p style={{ marginTop: '1rem' }}>Müşteri bulunamadı.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map(customer => (
                                <tr
                                    key={customer.id}
                                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s', cursor: 'pointer' }}
                                    className="table-row-hover"
                                    onClick={() => openCustomerDetail(customer)}
                                >
                                    <td style={{ padding: 'var(--spacing-md)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
                                                background: 'var(--accent-gradient)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', color: 'white',
                                                fontSize: '0.75rem', fontWeight: 700
                                            }}>
                                                {customer.company_name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{customer.company_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {customer.email || `ID: ${customer.id.substring(0, 8)}...`}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: 'var(--spacing-md)' }}>
                                        <div className="badge badge-secondary">
                                            <Briefcase size={12} />
                                            <span>{customer.industry || 'Belirtilmemiş'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: 'var(--spacing-md)', fontSize: '0.875rem' }}>
                                        {new Date(customer.created_at).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td style={{ padding: 'var(--spacing-md)' }}>
                                        {(() => {
                                            const role = customer.role || (customer.is_admin ? 'admin' : 'client');
                                            const roleConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
                                                admin: { label: 'Yönetici', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', icon: <Shield size={12} /> },
                                                client: { label: 'Müşteri', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: <Building2 size={12} /> },
                                                content_creator: { label: 'İçerik Üretici', color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.1)', icon: <Users size={12} /> },
                                            };
                                            const cfg = roleConfig[role] || roleConfig.client;
                                            return (
                                                <div className="badge" style={{ color: cfg.color, background: cfg.bg }}>
                                                    {cfg.icon}
                                                    <span>{cfg.label}</span>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td style={{ padding: 'var(--spacing-md)' }} onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                title="Detay Görüntüle"
                                                onClick={() => openCustomerDetail(customer)}
                                            >
                                                <Eye size={14} />
                                                <span>Detay</span>
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                title={customer.is_admin ? "Admin Yetkisini Kaldır" : "Admin Yap"}
                                                onClick={() => toggleAdminStatus(customer)}
                                            >
                                                {customer.is_admin ? <ShieldAlert size={16} /> : <Shield size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Customer Detail Modal */}
            <CustomerDetailModal
                customer={selectedCustomer}
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                onSave={handleUpdateCustomer}
            />

            {/* Add Customer Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Yeni Müşteri Kaydı</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddCustomer}>
                            <div className="modal-body">
                                <div className="input-group">
                                    <label className="input-label">Şirket Adı</label>
                                    <input
                                        type="text"
                                        className="input"
                                        required
                                        value={newCompany}
                                        onChange={e => setNewCompany(e.target.value)}
                                        placeholder="Örn: Polmark AI"
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">E-posta Adresi</label>
                                    <input
                                        type="email"
                                        className="input"
                                        required
                                        value={newEmail}
                                        onChange={e => setNewEmail(e.target.value)}
                                        placeholder="musteri@sirket.com"
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Sektör</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={newIndustry}
                                        onChange={e => setNewIndustry(e.target.value)}
                                        placeholder="Örn: Teknoloji"
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Geçici Şifre</label>
                                    <input
                                        type="password"
                                        className="input"
                                        required
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>

                                <div style={{
                                    padding: 'var(--spacing-md)',
                                    background: 'var(--warning-bg)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    gap: 'var(--spacing-sm)',
                                    marginTop: 'var(--spacing-md)'
                                }}>
                                    <AlertCircle size={20} color="var(--warning)" style={{ flexShrink: 0 }} />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        Not: Sistemde bireysel kayıt kapalıdır. Müşterileriniz için burada belirlediğiniz e-posta ve şifre ile giriş yapabilirler.
                                    </p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? <div className="spinner-sm" /> : <UserPlus size={16} />}
                                    <span>{isSubmitting ? 'Oluşturuluyor...' : 'Müşteri Oluştur'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .table-row-hover:hover {
                    background: var(--bg-hover) !important;
                }
                th {
                    text-transform: uppercase;
                    font-size: 0.7rem;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
};

export default AdminPage;
