import React from 'react';
import { X, Megaphone, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import type { AdCampaignRequest, AdCampaignResponse } from './types';

interface AdCampaignModalProps {
    show: boolean;
    onClose: () => void;
    isCreating: boolean;
    adCampaign: AdCampaignRequest;
    setAdCampaign: (campaign: AdCampaignRequest) => void;
    onSubmit: () => void;
    campaignResult: AdCampaignResponse | null;
    generatingVideos: Record<string, boolean>;
    handleGenerateCampaignVideo: (type: 'talking_head' | 'product' | 'lifestyle') => Promise<void>;
}

export const AdCampaignModal: React.FC<AdCampaignModalProps> = ({
    show,
    onClose,
    isCreating,
    adCampaign,
    setAdCampaign,
    onSubmit,
    campaignResult
}) => {
    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px', width: '95%', background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
                <div className="modal-header" style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="icon-box" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)', color: 'white', padding: '8px', borderRadius: '8px' }}>
                            <Megaphone size={20} />
                        </div>
                        <div>
                            <h2 className="modal-title" style={{ margin: 0, fontSize: '1.25rem' }}>AI Reklam Kampanyası Oluştur</h2>
                            <p className="text-muted text-xs" style={{ margin: 0 }}>Yapay zeka ile tüm kampanya materyallerini üretin</p>
                        </div>
                    </div>
                    <button className="btn-close" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div className="modal-body" style={{ padding: 'var(--spacing-xl)', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                    {!campaignResult ? (
                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
                            {/* Sol Kolon */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                                <div style={{ fontSize: '14px', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', fontWeight: 'bold' }}>
                                    📦 Ürün ve Marka Detayları
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Marka Adı</label>
                                    <input type="text" className="input" value={adCampaign.brand_name} onChange={e => setAdCampaign({...adCampaign, brand_name: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Ürün Adı</label>
                                    <input type="text" className="input" value={adCampaign.product_name} onChange={e => setAdCampaign({...adCampaign, product_name: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Ürün Açıklaması</label>
                                    <textarea className="input" rows={5} value={adCampaign.product_description} onChange={e => setAdCampaign({...adCampaign, product_description: e.target.value})} />
                                </div>
                            </div>

                            {/* Sağ Kolon */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                                <div style={{ fontSize: '14px', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', fontWeight: 'bold' }}>
                                    🎯 Hedefleme ve Stil
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Hedef Kitle</label>
                                    <input type="text" className="input" value={adCampaign.target_audience} onChange={e => setAdCampaign({...adCampaign, target_audience: e.target.value})} />
                                </div>
                                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                    <div className="input-group">
                                        <label className="input-label">Kampanya Amacı</label>
                                        <select className="input select" value={adCampaign.ad_goal} onChange={e => setAdCampaign({...adCampaign, ad_goal: e.target.value as any})}>
                                            <option value="awareness">Marka Farkındalığı</option>
                                            <option value="conversion">Satış / Dönüşüm</option>
                                            <option value="engagement">Etkileşim</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Dil</label>
                                        <select className="input select" value={adCampaign.language} onChange={e => setAdCampaign({...adCampaign, language: e.target.value as 'tr' | 'en'})}>
                                            <option value="tr">Türkçe</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">CTA</label>
                                    <input type="text" className="input" value={adCampaign.cta} onChange={e => setAdCampaign({...adCampaign, cta: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                            <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '16px' }} />
                            <h3>Kampanya Materyalleri Hazır!</h3>
                            <p className="text-muted">Yapay zeka stratejiyi ve içerikleri oluşturdu.</p>
                        </div>
                    )}
                </div>

                <div className="modal-footer" style={{ padding: 'var(--spacing-lg)', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)' }}>
                    <button className="btn btn-ghost" onClick={onClose} disabled={isCreating}>Vazgeç</button>
                    {!campaignResult && (
                        <button className="btn btn-primary" onClick={onSubmit} disabled={isCreating} style={{ minWidth: '200px', background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)' }}>
                            {isCreating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                            <span>Üretimi Başlat</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
