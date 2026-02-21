import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Post, Notification, Platform, PostStatus, Client, PlatformStats, DailyEngagement } from '../types';
import { useNotifications } from './NotificationContext';
import { useSettings } from './SettingsContext';
import { usePosts } from './PostContext';

interface DashboardContextType {
    // State
    posts: Post[];
    notifications: Notification[];
    isDarkMode: boolean;
    selectedPlatform: Platform | 'all';
    selectedStatus: PostStatus | 'all';
    automationEnabled: boolean;
    automationSettings: {
        autoPost: boolean;
        aiSentiment: boolean;
        smartSchedule: boolean;
        autoReply: boolean;
    };
    searchQuery: string;
    isLoading: boolean;
    clients: Client[];
    activeClient: Client | null;
    platformStats: PlatformStats[];
    dailyEngagement: DailyEngagement[];
    limeSocialSettings: {
        apiKey: string;
        accounts: string;
    };
    aiSettings: {
        replicateKey: string;
        falKey: string;
    };
    googleSheetsSettings: {
        webhookUrl: string;
    };
    n99Settings: {
        webhookUrl: string;
    };

    // Actions
    setPosts: (posts: Post[]) => void;
    addPost: (post: Post) => void;
    updatePost: (id: string, updates: Partial<Post>) => void;
    deletePost: (id: string) => void;
    toggleDarkMode: () => void;
    setSelectedPlatform: (platform: Platform | 'all') => void;
    setSelectedStatus: (status: PostStatus | 'all') => void;
    toggleAutomation: () => void;
    toggleAutomationSetting: (key: keyof DashboardContextType['automationSettings']) => void;
    setSearchQuery: (query: string) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    markNotificationRead: (id: string) => void;
    clearNotifications: () => void;
    setActiveClientId: (id: string) => void;
    updateLimeSocialSettings: (settings: Partial<DashboardContextType['limeSocialSettings']>) => void;
    updateAiSettings: (settings: Partial<DashboardContextType['aiSettings'] | { falKey: string }>) => void;
    updateGoogleSheetsSettings: (settings: Partial<DashboardContextType['googleSheetsSettings']>) => void;
    updateN99Settings: (settings: Partial<DashboardContextType['n99Settings']>) => void;
    publishPost: (post: Post) => Promise<void>;
    syncLimeSocialHistory: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { posts, setPosts, addPost, updatePost, deletePost, platformStats: postStats, isLoading: postsLoading } = usePosts();
    const { notifications, addNotification, markAsRead, clearNotifications } = useNotifications();
    const { darkMode, setDarkMode, activeClientId, setActiveClientId, aiSettings: sharedAiSettings, updateAISettings } = useSettings();

    const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
    const [selectedStatus, setSelectedStatus] = useState<PostStatus | 'all'>('all');
    const [automationEnabled, setAutomationEnabled] = useState(true);
    const [automationSettings, setAutomationSettings] = useState({
        autoPost: true,
        aiSentiment: true,
        smartSchedule: false,
        autoReply: false
    });
    const [searchQuery, setSearchQuery] = useState('');
    
    // Default settings from ENV
    const [limeSocialSettings, setLimeSocialSettings] = useState({ 
        apiKey: import.meta.env.VITE_LIMESOCIAL_API_KEY || '', 
        accounts: '' 
    });
    const [googleSheetsSettings, setGoogleSheetsSettings] = useState({ 
        webhookUrl: import.meta.env.VITE_GOOGLE_SHEETS_CONTENT_URL || '' 
    });
    const [n99Settings, setN99Settings] = useState({ 
        webhookUrl: import.meta.env.VITE_N99_WEBHOOK_URL || '' 
    });

    const [clients] = useState<Client[]>([]);
    const [dailyEngagement] = useState<DailyEngagement[]>([]);
    
    const activeClient = clients.find(c => c.id === activeClientId) || null;
    
    const platformStatsArray: PlatformStats[] = [
        { clientId: activeClientId || 'default', platform: 'instagram', postsCount: postStats.instagram, avgEngagementRate: 4.2, followers: 1200, followerGrowth: 12, bestPostingTime: '18:00', reach: 5000, impressions: 8000 },
        { clientId: activeClientId || 'default', platform: 'twitter', postsCount: postStats.youtube, avgEngagementRate: 2.8, followers: 850, followerGrowth: -3, bestPostingTime: '12:00', reach: 3200, impressions: 4500 },
        { clientId: activeClientId || 'default', platform: 'linkedin', postsCount: 0, avgEngagementRate: 3.5, followers: 450, followerGrowth: 5, bestPostingTime: '09:00', reach: 1200, impressions: 2100 },
        { clientId: activeClientId || 'default', platform: 'tiktok', postsCount: postStats.tiktok, avgEngagementRate: 6.8, followers: 2400, followerGrowth: 24, bestPostingTime: '21:00', reach: 15000, impressions: 25000 },
    ];

    const toggleDarkMode = useCallback(() => setDarkMode(!darkMode), [darkMode, setDarkMode]);
    const toggleAutomation = useCallback(() => setAutomationEnabled(prev => !prev), []);
    const toggleAutomationSetting = useCallback((key: keyof DashboardContextType['automationSettings']) => {
        setAutomationSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);

    const publishPost = async (post: Post) => { console.log('Publishing...', post); };
    const syncLimeSocialHistory = async () => { console.log('Syncing...'); };

    const value: DashboardContextType = {
        posts, notifications, isDarkMode: darkMode,
        selectedPlatform, selectedStatus, automationEnabled, automationSettings,
        searchQuery, isLoading: postsLoading, clients, activeClient,
        platformStats: platformStatsArray,
        dailyEngagement,
        limeSocialSettings,
        aiSettings: { 
            replicateKey: import.meta.env.VITE_REPLICATE_API_KEY || '', 
            falKey: sharedAiSettings.falKey || import.meta.env.VITE_FAL_API_KEY || '' 
        },
        googleSheetsSettings,
        n99Settings,
        
        setPosts, addPost, updatePost, deletePost,
        toggleDarkMode, setSelectedPlatform, setSelectedStatus,
        toggleAutomation, toggleAutomationSetting, setSearchQuery,
        addNotification, markNotificationRead: markAsRead, clearNotifications,
        setActiveClientId: (id: string) => setActiveClientId(id),
        updateLimeSocialSettings: (s) => setLimeSocialSettings(prev => ({ ...prev, ...s })),
        updateAiSettings: (s) => updateAISettings(s),
        updateGoogleSheetsSettings: (s) => setGoogleSheetsSettings(prev => ({ ...prev, ...s })),
        updateN99Settings: (s) => setN99Settings(prev => ({ ...prev, ...s })),
        publishPost, syncLimeSocialHistory
    };

    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
    return context;
};
