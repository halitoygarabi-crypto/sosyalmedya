import { createClient } from '@supabase/supabase-js';
import type { Post, PlatformStats, Notification } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper: DB row'u Post tipine dönüştür
const rowToPost = (row: Record<string, unknown>): Post => ({
    id: row.id as string,
    clientId: (row.client_id as string) || 'default',
    title: row.title as string,
    content: row.content as string,
    imageUrls: (row.image_urls as string[]) || [],
    platforms: (row.platforms as Post['platforms']) || [],
    scheduledTime: row.scheduled_time as string,
    status: row.status as Post['status'],
    metrics: {
        likes: (row.likes as number) || 0,
        comments: (row.comments as number) || 0,
        shares: (row.shares as number) || 0,
        reach: (row.reach as number) || 0,
        impressions: (row.impressions as number) || 0,
    },
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
    errorMessage: row.error_message as string | undefined,
});

// Helper: Post'u DB row'a dönüştür
const postToRow = (post: Post) => ({
    id: post.id,
    client_id: post.clientId,
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
    // Postları getir
    fetchPosts: async (): Promise<Post[]> => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []).map(rowToPost);
        } catch (error) {
            console.error('Supabase fetchPosts error:', error);
            return [];
        }
    },

    // Yeni içerik oluştur
    createPost: async (post: Post): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('posts')
                .insert([postToRow(post)]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Supabase createPost error:', error);
            return false;
        }
    },

    // Post güncelle
    updatePost: async (id: string, updates: Partial<Post>): Promise<boolean> => {
        try {
            const updateData: Record<string, unknown> = {};

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

            const { error } = await supabase
                .from('posts')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Supabase updatePost error:', error);
            return false;
        }
    },

    // Post sil
    deletePost: async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Supabase deletePost error:', error);
            return false;
        }
    },

    // Platform istatistiklerini getir
    fetchStats: async (): Promise<PlatformStats[]> => {
        try {
            const { data, error } = await supabase
                .from('platform_stats')
                .select('*');

            if (error) throw error;

            return (data || []).map((row) => ({
                clientId: (row.client_id as string) || 'default',
                platform: row.platform as PlatformStats['platform'],
                followers: row.followers || 0,
                followerGrowth: row.follower_growth || 0,
                avgEngagementRate: parseFloat(row.avg_engagement_rate) || 0,
                postsCount: row.posts_count || 0,
                bestPostingTime: row.best_posting_time || '',
                reach: row.reach || 0,
                impressions: row.impressions || 0,
            }));
        } catch (error) {
            console.error('Supabase fetchStats error:', error);
            return [];
        }
    },

    // Bildirimleri getir
    fetchNotifications: async (): Promise<Notification[]> => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(20);

            if (error) throw error;

            return (data || []).map((row) => ({
                id: row.id,
                type: row.type as Notification['type'],
                message: row.message,
                timestamp: row.timestamp,
                read: row.read,
            }));
        } catch (error) {
            console.error('Supabase fetchNotifications error:', error);
            return [];
        }
    },

    // Bildirim ekle
    addNotification: async (notification: Notification): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert([{
                    id: notification.id,
                    type: notification.type,
                    message: notification.message,
                    timestamp: notification.timestamp,
                    read: notification.read,
                }]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Supabase addNotification error:', error);
            return false;
        }
    },

    // Bildirimi okundu işaretle
    markNotificationRead: async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Supabase markNotificationRead error:', error);
            return false;
        }
    },
};
