import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Post, Notification, Platform, PostStatus, Client, PlatformStats, DailyEngagement } from '../types';
import { mockClients } from '../data/mockData';
import { n99Service } from '../utils/n99Service';
import { supabaseService } from '../utils/supabaseService';
import { limeSocialService } from '../utils/limeSocialService';
import type { LimeSocialSettings } from '../utils/limeSocialService';
import { useAuth } from './AuthContext';

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
    publishPost: (post: Post) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { customerProfile, isAdmin } = useAuth();

    const [posts, setPosts] = useState<Post[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isDarkMode, setIsDarkMode] = useState(false);
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
    const [isLoading, setIsLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [activeClientId, setActiveClientId] = useState<string>('');
    const [limeSocialSettings, setLimeSocialSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('limesocial_settings');
            return saved ? JSON.parse(saved) : {
                apiKey: import.meta.env.VITE_LIMESOCIAL_API_KEY || '',
                accounts: ''
            };
        } catch (e) {
            console.error('Failed to parse limesocial_settings:', e);
            return {
                apiKey: import.meta.env.VITE_LIMESOCIAL_API_KEY || '',
                accounts: ''
            };
        }
    });

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
        };
        setNotifications((prev) => [newNotification, ...prev]);
    }, []);

    // Handle Client Visibility & Availability
    useEffect(() => {
        if (!customerProfile) return;

        if (isAdmin) {
            // Admin her müşteriyi görür (Şu an mock datadan, veritabanından da çekilebilir)
            setClients(mockClients);
            if (mockClients.length > 0) {
                setActiveClientId(mockClients[0].id);
            }
        } else {
            // Normal firma sadece kendini görür
            const ownClient: Client = {
                id: customerProfile.id,
                name: customerProfile.company_name,
                industry: customerProfile.industry || 'Genel',
                status: 'active',
                integrations: [],
                configSource: 'manual'
            };
            setClients([ownClient]);
            setActiveClientId(ownClient.id);
        }
    }, [customerProfile, isAdmin]);

    const activeClient = clients.find(c => c.id === activeClientId) || null;

    // Initial data fetch - Filtered by active client
    useEffect(() => {
        const loadInitialData = async () => {
            if (!activeClientId) return;

            setIsLoading(true);
            try {
                const supabasePosts = await supabaseService.fetchPosts();
                // RLS sayesinde zaten sadece kendi postları gelecek
                setPosts(supabasePosts);
            } catch (error) {
                console.warn('⚠️ Veri yüklenemedi:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [activeClientId]);

    // Compute platformStats from posts
    const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);

    useEffect(() => {
        const loadStats = async () => {
            // Try Supabase platform_stats table first
            const stats = await supabaseService.fetchStats();
            if (stats.length > 0) {
                setPlatformStats(stats);
                return;
            }
            // Fallback: compute from posts
            const platforms: Platform[] = ['instagram', 'twitter', 'linkedin', 'tiktok'];
            const computed: PlatformStats[] = platforms.map(platform => {
                const platformPosts = posts.filter(p => p.platforms.includes(platform));
                const postedPosts = platformPosts.filter(p => p.status === 'posted');
                const totalLikes = postedPosts.reduce((s, p) => s + p.metrics.likes, 0);
                const totalComments = postedPosts.reduce((s, p) => s + p.metrics.comments, 0);
                const totalShares = postedPosts.reduce((s, p) => s + p.metrics.shares, 0);
                const totalReach = postedPosts.reduce((s, p) => s + p.metrics.reach, 0);
                const totalImpressions = postedPosts.reduce((s, p) => s + p.metrics.impressions, 0);
                const totalEng = totalLikes + totalComments + totalShares;
                const avgRate = totalReach > 0 ? (totalEng / totalReach) * 100 : 0;
                return {
                    clientId: activeClientId || 'default',
                    platform,
                    followers: 0,
                    followerGrowth: 0,
                    avgEngagementRate: parseFloat(avgRate.toFixed(2)),
                    postsCount: platformPosts.length,
                    bestPostingTime: '',
                    reach: totalReach,
                    impressions: totalImpressions,
                };
            }).filter(s => s.postsCount > 0);
            setPlatformStats(computed);
        };
        loadStats();
    }, [posts, activeClientId]);

    // Compute daily engagement from posts (last 30 days)
    const dailyEngagement = React.useMemo<DailyEngagement[]>(() => {
        const days: Record<string, DailyEngagement> = {};
        const today = new Date();
        // Initialize 30 days
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            days[key] = { date: key, likes: 0, comments: 0, shares: 0, reach: 0 };
        }
        // Aggregate post metrics by date
        const postedPosts = posts.filter(p => p.status === 'posted');
        postedPosts.forEach(p => {
            const dateKey = new Date(p.createdAt).toISOString().split('T')[0];
            if (days[dateKey]) {
                days[dateKey].likes += p.metrics.likes;
                days[dateKey].comments += p.metrics.comments;
                days[dateKey].shares += p.metrics.shares;
                days[dateKey].reach += p.metrics.reach;
            }
        });
        return Object.values(days);
    }, [posts]);

    const addPost = useCallback(async (post: Post) => {
        setIsLoading(true);
        const n99Success = await n99Service.createPost(post, limeSocialSettings);
        const supabaseSuccess = await supabaseService.createPost(post);

        if (supabaseSuccess || n99Success) {
            setPosts((prev) => [post, ...prev]);
            addNotification({
                type: 'success',
                message: post.status === 'draft'
                    ? `Taslak oluşturuldu: ${post.title}`
                    : `Post planlandı: ${post.title}`,
                read: false
            });
        } else {
            setPosts((prev) => [post, ...prev]);
            addNotification({ type: 'warning', message: 'Post yerel kaydedildi ama senkronize edilemedi.', read: false });
        }
        setIsLoading(false);
    }, [limeSocialSettings, addNotification]);

    const updatePost = useCallback(async (id: string, updates: Partial<Post>) => {
        setPosts((prev) =>
            prev.map((post) => (post.id === id ? { ...post, ...updates } : post))
        );
        await supabaseService.updatePost(id, updates);
    }, []);

    const deletePost = useCallback(async (id: string) => {
        setPosts((prev) => prev.filter((post) => post.id !== id));
        await supabaseService.deletePost(id);
        addNotification({ type: 'info', message: 'Post silindi.', read: false });
    }, [addNotification]);

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode((prev) => !prev);
    }, []);

    const toggleAutomation = useCallback(() => {
        setAutomationEnabled((prev) => {
            const newState = !prev;
            addNotification({
                type: newState ? 'success' : 'warning',
                message: newState ? 'Otomasyon aktif edildi.' : 'Otomasyon devre dışı bırakıldı.',
                read: false,
            });
            return newState;
        });
    }, [addNotification]);

    const toggleAutomationSetting = useCallback((key: keyof typeof automationSettings) => {
        setAutomationSettings(prev => ({ ...prev, [key]: !prev[key] }));
        addNotification({
            type: 'info',
            message: `Otomasyon ayarı güncellendi: ${key}`,
            read: false
        });
    }, [addNotification]);

    const markNotificationRead = useCallback((id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const updateLimeSocialSettings = useCallback((newSettings: Partial<LimeSocialSettings>) => {
        setLimeSocialSettings((prev: LimeSocialSettings) => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem('limesocial_settings', JSON.stringify(updated));
            return updated;
        });
        addNotification({ type: 'success', message: 'LimeSocial ayarları güncellendi.', read: false });
    }, [addNotification]);

    const publishPost = useCallback(async (post: Post) => {
        setIsLoading(true);
        addNotification({ type: 'info', message: 'LimeSocial\'a gönderiliyor...', read: false });
        const result = await limeSocialService.publishPost(post, limeSocialSettings);

        if (result.success) {
            await updatePost(post.id, { status: 'posted' });
            addNotification({ type: 'success', message: 'İçerik başarıyla LimeSocial üzerinden paylaşıldı!', read: false });
        } else {
            addNotification({
                type: 'error',
                message: `LimeSocial hatası: ${result.error || 'Bilinmeyen hata'}`,
                read: false
            });
        }
        setIsLoading(false);
    }, [limeSocialSettings, updatePost, addNotification]);

    const value: DashboardContextType = {
        posts,
        notifications,
        isDarkMode,
        selectedPlatform,
        selectedStatus,
        automationEnabled,
        searchQuery,
        isLoading,
        setPosts,
        addPost,
        updatePost,
        deletePost,
        toggleDarkMode,
        setSelectedPlatform,
        setSelectedStatus,
        toggleAutomation,
        setSearchQuery,
        addNotification,
        markNotificationRead,
        clearNotifications,
        toggleAutomationSetting,
        automationSettings,
        clients,
        activeClient,
        platformStats,
        dailyEngagement,
        setActiveClientId,
        limeSocialSettings,
        updateLimeSocialSettings,
        publishPost,
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
