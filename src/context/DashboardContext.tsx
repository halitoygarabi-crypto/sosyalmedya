import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Post, Notification, Platform, PostStatus, Client } from '../types';
import { mockClients } from '../data/mockData';
import { n8nService } from '../utils/n8nService';
import { supabaseService } from '../utils/supabaseService';
import { publerService } from '../utils/publerService';
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
    publerSettings: {
        apiKey: string;
        workspaceId: string;
        accountIds: string;
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
    updatePublerSettings: (settings: Partial<DashboardContextType['publerSettings']>) => void;
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
    const [publerSettings, setPublerSettings] = useState(() => {
        const saved = localStorage.getItem('publer_settings');
        return saved ? JSON.parse(saved) : {
            apiKey: '',
            workspaceId: '',
            accountIds: ''
        };
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
            setActiveClientId(mockClients[0].id);
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

    const addPost = useCallback(async (post: Post) => {
        setIsLoading(true);
        const n8nSuccess = await n8nService.createPost(post, publerSettings);
        const supabaseSuccess = await supabaseService.createPost(post);

        if (supabaseSuccess || n8nSuccess) {
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
    }, [publerSettings, addNotification]);

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

    const updatePublerSettings = useCallback((newSettings: Partial<typeof publerSettings>) => {
        setPublerSettings((prev: any) => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem('publer_settings', JSON.stringify(updated));
            return updated;
        });
        addNotification({ type: 'success', message: 'Publer ayarları güncellendi.', read: false });
    }, [addNotification]);

    const publishPost = useCallback(async (post: Post) => {
        setIsLoading(true);
        addNotification({ type: 'info', message: 'Doğrudan Publer\'a gönderiliyor...', read: false });
        const result = await publerService.publishPost(post, publerSettings);

        if (result.success) {
            await updatePost(post.id, { status: 'posted' });
            addNotification({ type: 'success', message: 'İçerik başarıyla Publer\'a iletildi!', read: false });
        } else {
            addNotification({
                type: 'error',
                message: `Publer hatası: ${result.error || 'Bilinmeyen hata'}`,
                read: false
            });
        }
        setIsLoading(false);
    }, [publerSettings, updatePost, addNotification]);

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
        setActiveClientId,
        publerSettings,
        updatePublerSettings,
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
