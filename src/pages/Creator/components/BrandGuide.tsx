import React, { useState, useEffect } from 'react';
import { 
    Palette, 
    Building2, 
    Sparkles, 
    BookOpen, 
    Image,
} from 'lucide-react';
import { influencerService } from '../../../utils/influencerService';
import type { Influencer } from '../../../types';

interface AssignedClient {
    id: string;
    company_name: string;
    industry: string | null;
    logo_url: string | null;
    ai_prompt_prefix?: string;
    brand_guidelines?: string;
}

interface BrandGuideProps {
    client: AssignedClient;
}

const BrandGuide: React.FC<BrandGuideProps> = ({ client }) => {
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

export default BrandGuide;
