
import type { Post } from '../types';

export const publerService = {
    publishPost: async (post: Post, settings: { apiKey: string, workspaceId: string, accountIds: string }) => {
        try {
            // Publer API gereksinimlerine göre hesap ID'lerini diziye çeviriyoruz
            const accounts = settings.accountIds.split(',').map(id => id.trim());

            const payload = {
                workspace_id: settings.workspaceId,
                accounts: accounts,
                type: post.imageUrls && post.imageUrls.length > 0 ? 'video' : 'text', // Görsel varsa video/media tipi
                body: post.content,
                media: post.imageUrls && post.imageUrls.length > 0 ? {
                    urls: post.imageUrls
                } : undefined,
                date: post.scheduledTime // Veya anında yayın için boş bırakılabilir
            };

            const response = await fetch('https://app.publer.com/api/v1/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer-API ${settings.apiKey}`,
                    'Publer-Workspace-Id': settings.workspaceId,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Publer API hatası');
            }

            return { success: true, data: await response.json() };
        } catch (error: any) {
            console.error('Publer Service Error:', error);
            return { success: false, error: error.message };
        }
    },

    // Upload media file to Publer
    uploadMedia: async (file: File, settings: { apiKey: string, workspaceId: string }): Promise<{ success: boolean; mediaId?: string; url?: string; error?: string }> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('https://app.publer.com/api/v1/media/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer-API ${settings.apiKey}`,
                    'Publer-Workspace-Id': settings.workspaceId
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Media yükleme hatası');
            }

            const result = await response.json();
            return {
                success: true,
                mediaId: result.id || result.media_id,
                url: result.url
            };
        } catch (error: any) {
            console.error('Publer Media Upload Error:', error);
            return { success: false, error: error.message };
        }
    },

    // Create post with uploaded media
    publishWithMedia: async (
        text: string,
        mediaIds: string[],
        settings: { apiKey: string, workspaceId: string, accountIds: string },
        state: 'draft' | 'scheduled' = 'draft'
    ): Promise<{ success: boolean; jobId?: string; error?: string }> => {
        try {
            const accounts = settings.accountIds.split(',').map(id => id.trim());

            const payload = {
                accounts: accounts,
                text: text,
                media_ids: mediaIds,
                state: state
            };

            const response = await fetch('https://app.publer.com/api/v1/posts/schedule', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer-API ${settings.apiKey}`,
                    'Publer-Workspace-Id': settings.workspaceId,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'Post oluşturma hatası');
            }

            const result = await response.json();
            return { success: true, jobId: result.job_id };
        } catch (error: any) {
            console.error('Publer Publish Error:', error);
            return { success: false, error: error.message };
        }
    }
};
