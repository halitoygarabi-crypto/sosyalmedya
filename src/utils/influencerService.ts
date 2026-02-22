import type { Influencer, ClientInfluencer } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

// Helper: DB row → Influencer
const rowToInfluencer = (row: any): Influencer => ({
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url,
    style: row.style,
    personality: row.personality,
    voiceTone: row.voice_tone,
    targetAudience: row.target_audience,
    createdBy: row.created_by,
    createdAt: row.created_at,
});

export const influencerService = {
    // Get all influencers
    list: async (): Promise<Influencer[]> => {
        try {
            const data = await apiFetch('/api/influencers');
            return (data || []).map(rowToInfluencer);
        } catch (error) {
            console.error('influencerService.list error:', error);
            return [];
        }
    },

    // Create a new influencer
    create: async (influencer: Omit<Influencer, 'id' | 'createdAt'>): Promise<Influencer | null> => {
        try {
            const data = await apiFetch('/api/influencers', {
                method: 'POST',
                body: JSON.stringify({
                    name: influencer.name,
                    avatar_url: influencer.avatarUrl,
                    style: influencer.style,
                    personality: influencer.personality,
                    voice_tone: influencer.voiceTone,
                    target_audience: influencer.targetAudience,
                    created_by: influencer.createdBy,
                })
            });
            return data ? rowToInfluencer(data) : null;
        } catch (error) {
            console.error('influencerService.create error:', error);
            return null;
        }
    },

    // Delete an influencer
    delete: async (id: string): Promise<boolean> => {
        try {
            await apiFetch(`/api/influencers/${id}`, {
                method: 'DELETE'
            });
            return true;
        } catch (error) {
            console.error('influencerService.delete error:', error);
            return false;
        }
    },

    // Assign influencer to a client
    assignToClient: async (clientId: string, influencerId: string): Promise<boolean> => {
        try {
            await apiFetch('/api/client-influencers', {
                method: 'POST',
                body: JSON.stringify({ client_id: clientId, influencer_id: influencerId })
            });
            return true;
        } catch (error) {
            console.error('influencerService.assignToClient error:', error);
            return false;
        }
    },

    // Remove influencer from a client
    removeFromClient: async (clientId: string, influencerId: string): Promise<boolean> => {
        try {
            await apiFetch(`/api/client-influencers/${clientId}/${influencerId}`, {
                method: 'DELETE'
            });
            return true;
        } catch (error) {
            console.error('influencerService.removeFromClient error:', error);
            return false;
        }
    },

    // Get influencers assigned to a specific client
    getByClient: async (clientId: string): Promise<Influencer[]> => {
        try {
            const data = await apiFetch(`/api/client-influencers/${clientId}`);
            return (data || [])
                .map((row: any) => {
                    const inf = row.influencers;
                    return inf ? rowToInfluencer(inf) : null;
                })
                .filter((inf: any): inf is Influencer => inf !== null);
        } catch (error) {
            console.error('influencerService.getByClient error:', error);
            return [];
        }
    },

    // Get all client-influencer assignments
    getAssignments: async (): Promise<ClientInfluencer[]> => {
        try {
            const data = await apiFetch('/api/assignments');
            return (data || []).map((row: any) => ({
                id: row.id,
                clientId: row.client_id,
                influencerId: row.influencer_id,
                assignedAt: row.assigned_at,
            }));
        } catch (error) {
            console.error('influencerService.getAssignments error:', error);
            return [];
        }
    },
};
