import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface AISettings {
    falKey: string;
    mirakoKey: string;
    ltxKey: string;
    openaiKey: string;
}

interface SettingsContextType {
    // Theme & UI
    darkMode: boolean;
    setDarkMode: (val: boolean) => void;
    
    // Filters & Client Management
    activeClientId: string | null;
    setActiveClientId: (id: string | null) => void;
    viewFilter: 'all' | 'scheduled' | 'published' | 'failed';
    setViewFilter: (filter: 'all' | 'scheduled' | 'published' | 'failed') => void;
    
    // API Keys & Configs
    aiSettings: AISettings;
    updateAISettings: (settings: Partial<AISettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
    const [activeClientId, setActiveClientId] = useState<string | null>(localStorage.getItem('active_client_id'));
    const [viewFilter, setViewFilter] = useState<'all' | 'scheduled' | 'published' | 'failed'>('all');
    
    const [aiSettings, setAiSettings] = useState<AISettings>(() => {
        const saved = localStorage.getItem('ai_settings');
        return saved ? JSON.parse(saved) : { falKey: '', mirakoKey: '', ltxKey: '', openaiKey: '' };
    });

    const updateAISettings = useCallback((newSettings: Partial<AISettings>) => {
        setAiSettings(prev => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem('ai_settings', JSON.stringify(updated));
            return updated;
        });
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark-mode', darkMode);
    }, [darkMode]);

    useEffect(() => {
        if (activeClientId) localStorage.setItem('active_client_id', activeClientId);
        else localStorage.removeItem('active_client_id');
    }, [activeClientId]);

    return (
        <SettingsContext.Provider value={{ 
            darkMode, setDarkMode, 
            activeClientId, setActiveClientId, 
            viewFilter, setViewFilter,
            aiSettings, updateAISettings 
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within a SettingsProvider');
    return context;
};
