import type { Post, PlatformStats, DailyEngagement, HourlyActivity, Notification, HashtagPerformance, SentimentData, Client } from '../types';

export const mockClients: Client[] = [];

export const mockPosts: Post[] = [];

export const mockPlatformStats: PlatformStats[] = [];

// Generate 30 days of engagement data - all zeroed
export const generateDailyEngagement = (): DailyEngagement[] => {
    const data: DailyEngagement[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        data.push({
            date: date.toISOString().split('T')[0],
            likes: 0,
            comments: 0,
            shares: 0,
            reach: 0,
        });
    }

    return data;
};

// Generate hourly activity heatmap data - all zeroed
export const generateHourlyActivity = (): HourlyActivity[] => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const data: HourlyActivity[] = [];

    days.forEach((day) => {
        for (let hour = 0; hour < 24; hour++) {
            data.push({
                hour,
                day,
                count: 0,
            });
        }
    });

    return data;
};

// Notifications
export const mockNotifications: Notification[] = [];

// Hashtag Performance
export const mockHashtags: HashtagPerformance[] = [];

// Sentiment Data
export const mockSentiment: SentimentData = {
    positive: 0,
    neutral: 0,
    negative: 0,
};

export const dailyEngagementData = generateDailyEngagement();
export const hourlyActivityData = generateHourlyActivity();
