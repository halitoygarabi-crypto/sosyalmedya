import React from 'react';
import { UserPlus, Wand2, Download } from 'lucide-react';
import type { Persona } from './types';

interface CharacterSettingsProps {
    persona: Persona;
    setPersona: (persona: Persona) => void;
    updatePromptFromPersona: () => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setPrompt: (prompt: string) => void;
}

export const CharacterSettings: React.FC<CharacterSettingsProps> = ({
    persona,
    setPersona,
    updatePromptFromPersona,
    handleFileUpload,
    setPrompt
}) => {
    const personaTemplates = [
        { name: 'Moda İkonu', style: 'fashion influencer wearing elegant designer clothes', location: 'Milan street' },
        { name: 'Gezgin', style: 'travel blogger in outdoor gear', location: 'Swiss Alps' },
        { name: 'Teknoloji / Gaming', style: 'streamer with gaming headphones', location: 'cyberpunk style room' },
        { name: 'Fitness', style: 'fitness model in gym wear', location: 'modern gym' },
        { name: 'Mobilya', style: 'interior designer showcasing modern luxury furniture', location: 'minimalist sunlit living room' },
        { name: 'Butik', style: 'stylish boutique owner presenting new collection', location: 'chic upscale fashion boutique' },
        { name: 'İnşaat', style: 'professional civil engineer in hard hat and safety vest', location: 'modern skyscraper construction site' }
    ];

    return (
        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={18} color="var(--accent-primary)" />
                Karakter Özellikleri
            </h3>
            
            <div className="grid-2" style={{ gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                <div className="input-group">
                    <label className="input-label">Yaş</label>
                    <select 
                        className="input select" 
                        value={persona.age}
                        onChange={(e) => setPersona({...persona, age: e.target.value})}
                    >
                        <option value="18">18</option>
                        <option value="25">25</option>
                        <option value="30">30</option>
                        <option value="40">40</option>
                    </select>
                </div>
                <div className="input-group">
                    <label className="input-label">Cinsiyet</label>
                    <select 
                        className="input select"
                        value={persona.gender}
                        onChange={(e) => setPersona({...persona, gender: e.target.value})}
                    >
                        <option value="woman">Kadın</option>
                        <option value="man">Erkek</option>
                        <option value="non-binary">Non-binary</option>
                    </select>
                </div>
            </div>

            <div className="input-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="input-label">Tarz / Meslek</label>
                <input 
                    type="text" 
                    className="input" 
                    placeholder="Örn: fitness model, tech expert..."
                    value={persona.style}
                    onChange={(e) => setPersona({...persona, style: e.target.value})}
                />
            </div>

            <div className="input-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="input-label">Mekan</label>
                <input 
                    type="text" 
                    className="input" 
                    placeholder="Örn: futuristic studio, beach, penthouse..."
                    value={persona.location}
                    onChange={(e) => setPersona({...persona, location: e.target.value})}
                />
            </div>

            <button 
                className="btn btn-secondary btn-full btn-sm"
                onClick={updatePromptFromPersona}
                style={{ marginTop: 'var(--spacing-sm)' }}
            >
                <Wand2 size={14} />
                <span>Persona ile Prompt Oluştur</span>
            </button>

            <div style={{ marginTop: 'var(--spacing-lg)' }}>
                <p className="text-xs text-muted mb-sm">Hazır Şablonlar veya Yerel Yükleme:</p>
                <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap', marginBottom: 'var(--spacing-md)' }}>
                    {personaTemplates.map((t, i) => (
                        <button 
                            key={i} 
                            className="btn btn-ghost"
                            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                            onClick={() => {
                                setPersona({...persona, style: t.style, location: t.location});
                                const p = `High-quality professional photo of a ${persona.age} year old ${persona.ethnicity} ${persona.gender}, ${t.style}, at a ${t.location}, detailed realistic features, 8k resolution.`;
                                setPrompt(p);
                            }}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>
                
                <label className="btn btn-secondary btn-full btn-sm" style={{ cursor: 'pointer' }}>
                    <Download size={14} style={{ transform: 'rotate(180deg)' }} />
                    <span>Bilgisayardan Dosya Seç</span>
                    <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={handleFileUpload}
                    />
                </label>
            </div>
        </div>
    );
};
