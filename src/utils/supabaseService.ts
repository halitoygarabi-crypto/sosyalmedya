import { createClient } from '@supabase/supabase-js';
import type { Post, PlatformStats, Notification, Client } from '../types';

// Supabase client primarily for AUTH (client-side auth is standard)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper for fetching from our local backend
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API Hatası');
    }
    return response.json();
};

// Helper: Backend row'u Post tipine dönüştür
const rowToPost = (row: any): Post => ({
    id: row.id,
    clientId: row.customer_id || 'default',
    title: row.title,
    content: row.content,
    imageUrls: row.image_urls || [],
    platforms: row.platforms || [],
    scheduledTime: row.scheduled_time,
    status: row.status,
    metrics: {
        likes: row.likes || 0,
        comments: row.comments || 0,
        shares: row.shares || 0,
        reach: row.reach || 0,
        impressions: row.impressions || 0,
    },
    createdBy: row.created_by,
    createdAt: row.created_at,
    errorMessage: row.error_message,
});

// Helper: Post'u Backend row'a dönüştür
const postToRow = (post: Post) => ({
    id: post.id,
    customer_id: post.clientId,
    title: post.title,
    content: post.content,
    image_urls: post.imageUrls,
    platforms: post.platforms,
    scheduled_time: post.scheduledTime,
    status: post.status,
    likes: post.metrics.likes,
    comments: post.metrics.comments,
    shares: post.metrics.shares,
    reach: post.metrics.reach,
    impressions: post.metrics.impressions,
    created_by: post.createdBy,
    created_at: post.createdAt,
    error_message: post.errorMessage,
});

export const supabaseService = {
    // --- Client / Customer Management ---
    fetchClients: async (): Promise<Client[]> => {
        try {
            return await apiFetch('/api/clients');
        } catch (error) {
            console.error('Error fetching clients:', error);
            return [];
        }
    },

    createClient: async (client: Omit<Client, 'id' | 'created_at'>): Promise<Client | null> => {
        try {
            return await apiFetch('/api/clients', {
                method: 'POST',
                body: JSON.stringify(client)
            });
        } catch (error) {
            console.error('Error creating client:', error);
            return null;
        }
    },

    updateClient: async (id: string, updates: Partial<Client>): Promise<boolean> => {
        try {
            await apiFetch(`/api/clients/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
            return true;
        } catch (error) {
            console.error('Error updating client:', error);
            return false;
        }
    },

    // --- Original Services ---
    fetchPosts: async (): Promise<Post[]> => {
        try {
            const data = await apiFetch('/api/posts');
            return (data || []).map(rowToPost);
        } catch (error) {
            console.error('API fetchPosts error:', error);
            return [];
        }
    },

    createPost: async (post: Post): Promise<boolean> => {
        try {
            await apiFetch('/api/posts', {
                method: 'POST',
                body: JSON.stringify(postToRow(post))
            });
            return true;
        } catch (error) {
            console.error('API createPost error:', error);
            return false;
        }
    },

    updatePost: async (id: string, updates: Partial<Post>): Promise<boolean> => {
        try {
            const updateData: Record<string, any> = {};
            if (updates.title) updateData.title = updates.title;
            if (updates.content) updateData.content = updates.content;
            if (updates.imageUrls) updateData.image_urls = updates.imageUrls;
            if (updates.platforms) updateData.platforms = updates.platforms;
            if (updates.scheduledTime) updateData.scheduled_time = updates.scheduledTime;
            if (updates.status) updateData.status = updates.status;
            if (updates.metrics) {
                updateData.likes = updates.metrics.likes;
                updateData.comments = updates.metrics.comments;
                updateData.shares = updates.metrics.shares;
                updateData.reach = updates.metrics.reach;
                updateData.impressions = updates.metrics.impressions;
            }
            if (updates.errorMessage) updateData.error_message = updates.errorMessage;

            await apiFetch(`/api/posts/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
            return true;
        } catch (error) {
            console.error('API updatePost error:', error);
            return false;
        }
    },

    deletePost: async (id: string): Promise<boolean> => {
        try {
            await apiFetch(`/api/posts/${id}`, {
                method: 'DELETE'
            });
            return true;
        } catch (error) {
            console.error('API deletePost error:', error);
            return false;
        }
    },

    fetchStats: async (): Promise<PlatformStats[]> => {
        try {
            const data = await apiFetch('/api/stats');
            return (data || []).map((row: any) => ({
                clientId: row.client_id || 'default',
                platform: row.platform,
                followers: row.followers || 0,
                followerGrowth: row.follower_growth || 0,
                avgEngagementRate: parseFloat(row.avg_engagement_rate) || 0,
                postsCount: row.posts_count || 0,
                reach: row.reach || 0,
                impressions: row.impressions || 0,
            }));
        } catch (error) {
            console.error('API fetchStats error:', error);
            return [];
        }
    },

    fetchNotifications: async (): Promise<Notification[]> => {
        try {
            const data = await apiFetch('/api/notifications');
            return (data || []).map((row: any) => ({
                id: row.id,
                type: row.type,
                message: row.message,
                timestamp: row.timestamp,
                read: row.read,
            }));
        } catch (error) {
            console.error('API fetchNotifications error:', error);
            return [];
        }
    },

    addNotification: async (notification: Notification): Promise<boolean> => {
        try {
            await apiFetch('/api/notifications', {
                method: 'POST',
                body: JSON.stringify({
                    id: notification.id,
                    type: notification.type,
                    message: notification.message,
                    timestamp: notification.timestamp,
                    read: notification.read,
                })
            });
            return true;
        } catch (error) {
            console.error('API addNotification error:', error);
            return false;
        }
    },

    markNotificationRead: async (id: string): Promise<boolean> => {
        try {
            await apiFetch(`/api/notifications/${id}`, {
                method: 'PATCH'
            });
            return true;
        } catch (error) {
            console.error('API markNotificationRead error:', error);
            return false;
        }
    },
};
