import { supabase } from './supabaseService';
import type { Influencer, ClientInfluencer } from '../types';

// Helper: DB row → Influencer
const rowToInfluencer = (row: Record<string, unknown>): Influencer => ({
    id: row.id as string,
    name: row.name as string,
    avatarUrl: row.avatar_url as string | undefined,
    style: row.style as string | undefined,
    personality: row.personality as string | undefined,
    voiceTone: row.voice_tone as string | undefined,
    targetAudience: row.target_audience as string | undefined,
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
});

export const influencerService = {
    // Get all influencers
    list: async (): Promise<Influencer[]> => {
        try {
            const { data, error } = await supabase
                .from('influencers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []).map(rowToInfluencer);
        } catch (error) {
            console.error('influencerService.list error:', error);
            return [];
        }
    },

    // Create a new influencer
    create: async (influencer: Omit<Influencer, 'id' | 'createdAt'>): Promise<Influencer | null> => {
        try {
            const { data, error } = await supabase
                .from('influencers')
                .insert({
                    name: influencer.name,
                    avatar_url: influencer.avatarUrl,
                    style: influencer.style,
                    personality: influencer.personality,
                    voice_tone: influencer.voiceTone,
                    target_audience: influencer.targetAudience,
                    created_by: influencer.createdBy,
                })
                .select()
                .single();

            if (error) throw error;
            return data ? rowToInfluencer(data) : null;
        } catch (error) {
            console.error('influencerService.create error:', error);
            return null;
        }
    },

    // Delete an influencer
    delete: async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('influencers')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('influencerService.delete error:', error);
            return false;
        }
    },

    // Assign influencer to a client
    assignToClient: async (clientId: string, influencerId: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('client_influencers')
                .insert({ client_id: clientId, influencer_id: influencerId });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('influencerService.assignToClient error:', error);
            return false;
        }
    },

    // Remove influencer from a client
    removeFromClient: async (clientId: string, influencerId: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('client_influencers')
                .delete()
                .eq('client_id', clientId)
                .eq('influencer_id', influencerId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('influencerService.removeFromClient error:', error);
            return false;
        }
    },

    // Get influencers assigned to a specific client
    getByClient: async (clientId: string): Promise<Influencer[]> => {
        try {
            const { data, error } = await supabase
                .from('client_influencers')
                .select(`
                    influencer_id,
                    influencers (*)
                `)
                .eq('client_id', clientId);

            if (error) throw error;

            return (data || [])
                .map((row: Record<string, unknown>) => {
                    const inf = row.influencers as Record<string, unknown> | null;
                    return inf ? rowToInfluencer(inf) : null;
                })
                .filter((inf): inf is Influencer => inf !== null);
        } catch (error) {
            console.error('influencerService.getByClient error:', error);
            return [];
        }
    },

    // Get all client-influencer assignments
    getAssignments: async (): Promise<ClientInfluencer[]> => {
        try {
            const { data, error } = await supabase
                .from('client_influencers')
                .select('*')
                .order('assigned_at', { ascending: false });

            if (error) throw error;

            return (data || []).map((row: Record<string, unknown>) => ({
                id: row.id as string,
                clientId: row.client_id as string,
                influencerId: row.influencer_id as string,
                assignedAt: row.assigned_at as string,
            }));
        } catch (error) {
            console.error('influencerService.getAssignments error:', error);
            return [];
        }
    },
};
