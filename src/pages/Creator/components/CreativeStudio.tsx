import React, { useState } from 'react';
import { 
    Sparkles, 
    Image, 
    Video, 
    FileText, 
    Plus,
} from 'lucide-react';
import AIInfluencerGenerator from '../../../components/AIInfluencerGenerator';
import VideoGenerator from '../../../components/VideoGenerator';

interface AssignedClient {
    id: string;
    company_name: string;
    industry: string | null;
    logo_url: string | null;
    ai_prompt_prefix?: string;
    brand_guidelines?: string;
}

interface CreativeStudioProps {
    client: AssignedClient;
    onNewPost: () => void;
}

const CreativeStudio: React.FC<CreativeStudioProps> = ({ client, onNewPost }) => {
    const [activeTab, setActiveTab] = useState<'image' | 'video' | 'text'>('image');

    return (
        <>
            <div className="section-header">
                <h2 className="section-title">
                    <Sparkles size={20} style={{ marginRight: '8px' }} />
                    Yaratıcı Stüdyo — {client.company_name}
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className={`btn btn-sm ${activeTab === 'image' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('image')}
                    >
                        <Image size={16} /> AI Görsel
                    </button>
                    <button
                        className={`btn btn-sm ${activeTab === 'video' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('video')}
                    >
                        <Video size={16} /> AI Video
                    </button>
                    <button
                        className={`btn btn-sm ${activeTab === 'text' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('text')}
                    >
                        <FileText size={16} /> Metin / Post
                    </button>
                </div>
            </div>

            <div className="animate-fadeIn">
                {activeTab === 'image' && <AIInfluencerGenerator selectedClient={client} />}
                {activeTab === 'video' && <VideoGenerator selectedClient={client} />}
                {activeTab === 'text' && (
                    <div className="card">
                         <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                            <div style={{ 
                                width: '64px', height: '64px', borderRadius: '50%', 
                                background: 'var(--bg-tertiary)', color: 'var(--text-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto var(--spacing-lg)'
                            }}>
                                <FileText size={32} />
                            </div>
                            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Yeni İçerik Oluştur</h3>
                            <p className="text-muted" style={{ marginBottom: 'var(--spacing-xl)', maxWidth: '400px', margin: '0 auto var(--spacing-xl)' }}>
                                Markanız için metin tabanlı veya görsel içerikli yeni bir gönderi hazırlayın.
                            </p>
                            <button className="btn btn-primary" onClick={onNewPost}>
                                <Plus size={18} /> Yeni İçerik Oluştur
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CreativeStudio;
