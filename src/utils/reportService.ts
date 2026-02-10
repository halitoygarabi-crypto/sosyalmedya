import { supabase } from './supabaseService';
import type { Report } from '../types';

// Helper: DB row → Report
const rowToReport = (row: Record<string, unknown>): Report => ({
    id: row.id as string,
    clientId: row.client_id as string,
    reportType: row.report_type as 'weekly' | 'monthly',
    periodStart: row.period_start as string,
    periodEnd: row.period_end as string,
    data: (row.data as Record<string, unknown>) || {},
    pdfUrl: row.pdf_url as string | undefined,
    generatedAt: row.generated_at as string,
});

export const reportService = {
    // List reports for a client
    listReports: async (clientId: string): Promise<Report[]> => {
        try {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('client_id', clientId)
                .order('generated_at', { ascending: false });

            if (error) throw error;
            return (data || []).map(rowToReport);
        } catch (error) {
            console.error('reportService.listReports error:', error);
            return [];
        }
    },

    // Generate a weekly report
    generateWeeklyReport: async (clientId: string): Promise<Report | null> => {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);

            // Fetch posts for the period
            const { data: posts, error: postsError } = await supabase
                .from('posts')
                .select('*')
                .eq('client_id', clientId)
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());

            if (postsError) throw postsError;

            // Fetch platform stats
            const { data: stats } = await supabase
                .from('platform_stats')
                .select('*')
                .eq('client_id', clientId);

            // Calculate report data
            const totalPosts = posts?.length || 0;
            const totalLikes = posts?.reduce((sum, p) => sum + ((p.likes as number) || 0), 0) || 0;
            const totalComments = posts?.reduce((sum, p) => sum + ((p.comments as number) || 0), 0) || 0;
            const totalShares = posts?.reduce((sum, p) => sum + ((p.shares as number) || 0), 0) || 0;
            const totalReach = posts?.reduce((sum, p) => sum + ((p.reach as number) || 0), 0) || 0;
            const totalImpressions = posts?.reduce((sum, p) => sum + ((p.impressions as number) || 0), 0) || 0;

            const reportData = {
                summary: {
                    totalPosts,
                    totalEngagement: totalLikes + totalComments + totalShares,
                    totalReach,
                    totalImpressions,
                    avgEngagementRate: totalImpressions > 0
                        ? ((totalLikes + totalComments + totalShares) / totalImpressions * 100).toFixed(2)
                        : '0',
                },
                platformBreakdown: stats?.map(s => ({
                    platform: s.platform,
                    followers: s.followers,
                    followerGrowth: s.follower_growth,
                    engagement: s.avg_engagement_rate,
                })) || [],
                topPosts: posts
                    ?.sort((a, b) => ((b.likes as number) || 0) - ((a.likes as number) || 0))
                    .slice(0, 5)
                    .map(p => ({
                        title: p.title,
                        platform: p.platforms,
                        likes: p.likes,
                        reach: p.reach,
                    })) || [],
            };

            // Save report to DB
            const { data: savedReport, error: saveError } = await supabase
                .from('reports')
                .insert({
                    client_id: clientId,
                    report_type: 'weekly',
                    period_start: startDate.toISOString().split('T')[0],
                    period_end: endDate.toISOString().split('T')[0],
                    data: reportData,
                })
                .select()
                .single();

            if (saveError) throw saveError;
            return savedReport ? rowToReport(savedReport) : null;
        } catch (error) {
            console.error('reportService.generateWeeklyReport error:', error);
            return null;
        }
    },

    // Generate a monthly report
    generateMonthlyReport: async (clientId: string): Promise<Report | null> => {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            const { data: posts, error: postsError } = await supabase
                .from('posts')
                .select('*')
                .eq('client_id', clientId)
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());

            if (postsError) throw postsError;

            const { data: stats } = await supabase
                .from('platform_stats')
                .select('*')
                .eq('client_id', clientId);

            const totalPosts = posts?.length || 0;
            const totalLikes = posts?.reduce((sum, p) => sum + ((p.likes as number) || 0), 0) || 0;
            const totalComments = posts?.reduce((sum, p) => sum + ((p.comments as number) || 0), 0) || 0;
            const totalShares = posts?.reduce((sum, p) => sum + ((p.shares as number) || 0), 0) || 0;
            const totalReach = posts?.reduce((sum, p) => sum + ((p.reach as number) || 0), 0) || 0;
            const totalImpressions = posts?.reduce((sum, p) => sum + ((p.impressions as number) || 0), 0) || 0;

            // Weekly breakdown
            const weeklyBreakdown = [];
            for (let i = 0; i < 4; i++) {
                const weekEnd = new Date(endDate);
                weekEnd.setDate(weekEnd.getDate() - (i * 7));
                const weekStart = new Date(weekEnd);
                weekStart.setDate(weekStart.getDate() - 7);

                const weekPosts = posts?.filter(p => {
                    const date = new Date(p.created_at as string);
                    return date >= weekStart && date <= weekEnd;
                }) || [];

                weeklyBreakdown.push({
                    week: `Hafta ${4 - i}`,
                    posts: weekPosts.length,
                    engagement: weekPosts.reduce((s, p) =>
                        s + ((p.likes as number) || 0) + ((p.comments as number) || 0), 0),
                });
            }

            const reportData = {
                summary: {
                    totalPosts,
                    totalEngagement: totalLikes + totalComments + totalShares,
                    totalReach,
                    totalImpressions,
                    avgEngagementRate: totalImpressions > 0
                        ? ((totalLikes + totalComments + totalShares) / totalImpressions * 100).toFixed(2)
                        : '0',
                },
                platformBreakdown: stats?.map(s => ({
                    platform: s.platform,
                    followers: s.followers,
                    followerGrowth: s.follower_growth,
                    engagement: s.avg_engagement_rate,
                })) || [],
                weeklyBreakdown,
                topPosts: posts
                    ?.sort((a, b) => ((b.likes as number) || 0) - ((a.likes as number) || 0))
                    .slice(0, 10)
                    .map(p => ({
                        title: p.title,
                        platform: p.platforms,
                        likes: p.likes,
                        reach: p.reach,
                    })) || [],
            };

            const { data: savedReport, error: saveError } = await supabase
                .from('reports')
                .insert({
                    client_id: clientId,
                    report_type: 'monthly',
                    period_start: startDate.toISOString().split('T')[0],
                    period_end: endDate.toISOString().split('T')[0],
                    data: reportData,
                })
                .select()
                .single();

            if (saveError) throw saveError;
            return savedReport ? rowToReport(savedReport) : null;
        } catch (error) {
            console.error('reportService.generateMonthlyReport error:', error);
            return null;
        }
    },

    // Delete a report
    deleteReport: async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('reports')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('reportService.deleteReport error:', error);
            return false;
        }
    },
};
