import type { Post, Platform } from '../types';

const LIMESOCIAL_API_URL = 'https://api.limesocial.io/api/v1';
const API_KEY = import.meta.env.VITE_LIMESOCIAL_API_KEY || '';

export interface LimeSocialAccount {
    platform: string;
    username: string;
}

export interface LimeSocialPostPayload {
    mediaUrl?: string;
    title: string;
    description?: string;
    accounts: LimeSocialAccount[];
    scheduleDate?: string;
}

export interface LimeSocialSettings {
    apiKey: string;
    accounts: string; // JSON string of LimeSocialAccount[]
}

const mapPlatformToLimeSocial = (platform: Platform): string => {
    const platformMap: Record<Platform, string> = {
        instagram: 'instagram',
        twitter: 'x',
        linkedin: 'linkedin',
        tiktok: 'tiktok',
    };
    return platformMap[platform] || platform;
};

export const limeSocialService = {
    /**
     * Publish a post to social media via LimeSocial API
     */
    publishPost: async (
        post: Post,
        settings: LimeSocialSettings
    ): Promise<{ success: boolean; data?: any; error?: string }> => {
        try {
            const apiKey = settings.apiKey || API_KEY;
            if (!apiKey) {
                throw new Error('LimeSocial API key bulunamadı');
            }

            // Parse connected accounts
            let connectedAccounts: LimeSocialAccount[] = [];
            try {
                connectedAccounts = settings.accounts ? JSON.parse(settings.accounts) : [];
            } catch {
                connectedAccounts = [];
            }

            // Filter accounts by post platforms
            const targetAccounts = connectedAccounts.filter(acc =>
                post.platforms.some(p => mapPlatformToLimeSocial(p) === acc.platform)
            );

            if (targetAccounts.length === 0) {
                // If no matching accounts found, create entries from post platforms
                // User will need to have accounts connected in LimeSocial dashboard
                throw new Error('Seçili platformlar için bağlı hesap bulunamadı. LimeSocial panelinden hesaplarınızı bağlayın.');
            }

            const payload: LimeSocialPostPayload = {
                title: post.content,
                accounts: targetAccounts,
            };

            // Add media if available
            if (post.imageUrls && post.imageUrls.length > 0) {
                payload.mediaUrl = post.imageUrls[0];
            }

            // Add schedule if applicable
            if (post.status === 'scheduled' && post.scheduledTime) {
                payload.scheduleDate = post.scheduledTime;
            }

            const response = await fetch(`${LIMESOCIAL_API_URL}/post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
                throw new Error(errorData.message || errorData.error || `LimeSocial API hatası: ${response.status}`);
            }

            const result = await response.json();
            return { success: true, data: result };
        } catch (error: any) {
            console.error('LimeSocial Service Error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get user info and connected accounts
     */
    getMe: async (apiKey?: string): Promise<{ success: boolean; data?: any; error?: string }> => {
        try {
            const key = apiKey || API_KEY;
            if (!key) {
                throw new Error('LimeSocial API key bulunamadı');
            }

            const response = await fetch(`${LIMESOCIAL_API_URL}/me`, {
                method: 'GET',
                headers: {
                    'Authorization': key,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
                throw new Error(errorData.message || `API hatası: ${response.status}`);
            }

            const result = await response.json();
            return { success: true, data: result };
        } catch (error: any) {
            console.error('LimeSocial getMe Error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get connected social media accounts
     */
    getAccounts: async (apiKey?: string): Promise<{ success: boolean; accounts?: LimeSocialAccount[]; error?: string }> => {
        try {
            const key = apiKey || API_KEY;
            if (!key) {
                throw new Error('LimeSocial API key bulunamadı');
            }

            const response = await fetch(`${LIMESOCIAL_API_URL}/accounts`, {
                method: 'GET',
                headers: {
                    'Authorization': key,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
                throw new Error(errorData.message || `API hatası: ${response.status}`);
            }

            const result = await response.json();
            return { success: true, accounts: result.accounts || result };
        } catch (error: any) {
            console.error('LimeSocial getAccounts Error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Test API connection
     */
    testConnection: async (apiKey: string): Promise<{ success: boolean; message: string; credits?: number }> => {
        try {
            const result = await limeSocialService.getMe(apiKey);
            if (result.success) {
                return {
                    success: true,
                    message: 'LimeSocial bağlantısı başarılı!',
                    credits: result.data?.credits || result.data?.creditsRemaining,
                };
            }
            return { success: false, message: result.error || 'Bağlantı başarısız' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    },
};
