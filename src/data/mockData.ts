import type { Post, PlatformStats, DailyEngagement, HourlyActivity, Notification, HashtagPerformance, SentimentData, Client } from '../types';

export const mockClients: Client[] = [
    {
        id: 'client_1',
        name: 'TechFlow Solutions',
        industry: 'Teknoloji',
        status: 'active',
        configSource: 'google_sheets',
        aiPromptPrefix: 'Profesyonel, teknik ama samimi bir dil kullan.',
        integrations: [
            { id: 'int_1', platform: 'instagram', status: 'connected', accountName: '@techflow_global', lastSync: new Date().toISOString() },
            { id: 'int_2', platform: 'twitter', status: 'connected', accountName: 'TechFlowGlobal', lastSync: new Date().toISOString() },
            { id: 'int_3', platform: 'linkedin', status: 'connected', accountName: 'TechFlow Solutions', lastSync: new Date().toISOString() }
        ]
    },
    {
        id: 'client_2',
        name: 'Gourmet Garden',
        industry: 'Gıda & Restoran',
        status: 'active',
        configSource: 'notion',
        aiPromptPrefix: 'İştah kabartıcı, sıcak ve topluluk odaklı bir dil kullan. Emoji kullanımını artır.',
        integrations: [
            { id: 'int_4', platform: 'instagram', status: 'connected', accountName: '@gourmetgarden_tr', lastSync: new Date().toISOString() },
            { id: 'int_5', platform: 'tiktok', status: 'connected', accountName: 'gourmetgarden', lastSync: new Date().toISOString() }
        ]
    }
];

// Generate realistic mock posts
export const mockPosts: Post[] = [
    {
        id: '1',
        clientId: 'client_1',
        title: 'Yeni Ürün Lansmanı',
        content: 'Heyecan verici yeni ürünümüzü duyurduk! 🚀 #YeniÜrün #İnovasyon',
        imageUrls: ['https://picsum.photos/400/400?random=1'],
        platforms: ['instagram', 'twitter', 'linkedin'],
        scheduledTime: new Date(Date.now() - 3600000).toISOString(),
        status: 'posted',
        metrics: { likes: 1542, comments: 89, shares: 234, reach: 15420, impressions: 28340 },
        createdBy: 'admin',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
        id: '2',
        clientId: 'client_1',
        title: 'Müşteri Hikayesi',
        content: 'Müşterimiz @örnekmüşteri ile başarı hikayesi! 💪 #MüşteriMemnuniyeti',
        imageUrls: ['https://picsum.photos/400/400?random=2'],
        platforms: ['instagram', 'linkedin'],
        scheduledTime: new Date(Date.now() - 7200000).toISOString(),
        status: 'posted',
        metrics: { likes: 892, comments: 45, shares: 123, reach: 8920, impressions: 15670 },
        createdBy: 'editor',
        createdAt: new Date(Date.now() - 10800000).toISOString(),
    },
    {
        id: '3',
        clientId: 'client_1',
        title: 'Haftalık İpuçları',
        content: '5 pratik ipucu ile sosyal medya stratejinizi güçlendirin! 📈 #SosyalMedya #Tips',
        imageUrls: ['https://picsum.photos/400/400?random=3'],
        platforms: ['twitter', 'linkedin'],
        scheduledTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'scheduled',
        metrics: { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0 },
        createdBy: 'admin',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
        id: '4',
        clientId: 'client_2',
        title: 'TikTok Trend Video',
        content: 'En son trend\'e katıldık! 🎵 #TikTokTrend #Viral',
        imageUrls: ['https://picsum.photos/400/400?random=4'],
        platforms: ['tiktok', 'instagram'],
        scheduledTime: new Date(Date.now() + 7200000).toISOString(),
        status: 'scheduled',
        metrics: { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0 },
        createdBy: 'editor',
        createdAt: new Date(Date.now() - 900000).toISOString(),
    },
    {
        id: '5',
        clientId: 'client_1',
        title: 'API Bağlantı Hatası',
        content: 'Bu post gönderilirken bir hata oluştu.',
        imageUrls: ['https://picsum.photos/400/400?random=5'],
        platforms: ['twitter'],
        scheduledTime: new Date(Date.now() - 1800000).toISOString(),
        status: 'failed',
        metrics: { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0 },
        createdBy: 'admin',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        errorMessage: 'Twitter API rate limit exceeded. Please try again later.',
    },
    {
        id: '6',
        clientId: 'client_1',
        title: 'Behind the Scenes',
        content: 'Ofisimizden kareler! 📸 #Ekip #ŞirketHayatı',
        imageUrls: ['https://picsum.photos/400/400?random=6'],
        platforms: ['instagram'],
        scheduledTime: new Date(Date.now() - 86400000).toISOString(),
        status: 'posted',
        metrics: { likes: 2341, comments: 156, shares: 89, reach: 23410, impressions: 45230 },
        createdBy: 'admin',
        createdAt: new Date(Date.now() - 90000000).toISOString(),
    },
    {
        id: '7',
        clientId: 'client_1',
        title: 'Etkinlik Duyurusu',
        content: 'Önümüzdeki hafta canlı webinar! Kayıt için linke tıklayın 🎯',
        imageUrls: ['https://picsum.photos/400/400?random=7'],
        platforms: ['linkedin', 'twitter'],
        scheduledTime: new Date(Date.now() + 172800000).toISOString(),
        status: 'scheduled',
        metrics: { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0 },
        createdBy: 'editor',
        createdAt: new Date().toISOString(),
    },
    {
        id: '8',
        clientId: 'client_2',
        title: 'Ürün Videosu',
        content: 'Ürünümüzün nasıl çalıştığını görün! 🎬 #ÜrünDemo',
        imageUrls: ['https://picsum.photos/400/400?random=8'],
        platforms: ['tiktok', 'instagram'],
        scheduledTime: new Date(Date.now() - 172800000).toISOString(),
        status: 'posted',
        metrics: { likes: 5678, comments: 234, shares: 456, reach: 56780, impressions: 98450 },
        createdBy: 'admin',
        createdAt: new Date(Date.now() - 180000000).toISOString(),
    },
];

// Platform Statistics
export const mockPlatformStats: PlatformStats[] = [
    {
        clientId: 'client_1',
        platform: 'instagram',
        followers: 125400,
        followerGrowth: 2340,
        avgEngagementRate: 4.8,
        postsCount: 156,
        bestPostingTime: '19:00',
        reach: 450000,
        impressions: 890000,
    },
    {
        clientId: 'client_1',
        platform: 'twitter',
        followers: 89200,
        followerGrowth: 1560,
        avgEngagementRate: 2.3,
        postsCount: 234,
        bestPostingTime: '12:00',
        reach: 320000,
        impressions: 650000,
    },
    {
        clientId: 'client_1',
        platform: 'linkedin',
        followers: 45600,
        followerGrowth: 890,
        avgEngagementRate: 5.6,
        postsCount: 89,
        bestPostingTime: '09:00',
        reach: 180000,
        impressions: 340000,
    },
    {
        clientId: 'client_2',
        platform: 'tiktok',
        followers: 234500,
        followerGrowth: 5670,
        avgEngagementRate: 8.9,
        postsCount: 67,
        bestPostingTime: '21:00',
        reach: 890000,
        impressions: 2340000,
    },
];

// Generate 30 days of engagement data
export const generateDailyEngagement = (): DailyEngagement[] => {
    const data: DailyEngagement[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        data.push({
            date: date.toISOString().split('T')[0],
            likes: Math.floor(Math.random() * 5000) + 2000,
            comments: Math.floor(Math.random() * 500) + 100,
            shares: Math.floor(Math.random() * 300) + 50,
            reach: Math.floor(Math.random() * 50000) + 20000,
        });
    }

    return data;
};

// Generate hourly activity heatmap data
export const generateHourlyActivity = (): HourlyActivity[] => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const data: HourlyActivity[] = [];

    days.forEach((day) => {
        for (let hour = 0; hour < 24; hour++) {
            // Simulate higher activity during business hours
            let baseCount = 5;
            if (hour >= 9 && hour <= 21) {
                baseCount = 15;
            }
            if (hour >= 12 && hour <= 14) {
                baseCount = 25;
            }
            if (hour >= 19 && hour <= 21) {
                baseCount = 30;
            }
            if (day === 'Cmt' || day === 'Paz') {
                baseCount *= 0.6;
            }

            data.push({
                hour,
                day,
                count: Math.floor(Math.random() * baseCount) + Math.floor(baseCount / 2),
            });
        }
    });

    return data;
};

// Notifications
export const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'success',
        message: 'Instagram postu başarıyla gönderildi!',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        read: false,
    },
    {
        id: '2',
        type: 'error',
        message: 'Twitter API bağlantısı başarısız.',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        read: false,
    },
    {
        id: '3',
        type: 'info',
        message: '3 yeni post planlandı.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: true,
    },
    {
        id: '4',
        type: 'warning',
        message: 'LinkedIn API limiti yaklaşıyor.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true,
    },
    {
        id: '5',
        type: 'success',
        message: 'TikTok videosu viral oldu! 🎉',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: false,
    },
];

// Hashtag Performance
export const mockHashtags: HashtagPerformance[] = [
    { hashtag: '#SosyalMedya', usageCount: 45, avgEngagement: 4.2, reach: 125000 },
    { hashtag: '#Dijital', usageCount: 38, avgEngagement: 3.8, reach: 98000 },
    { hashtag: '#İnovasyon', usageCount: 32, avgEngagement: 5.1, reach: 156000 },
    { hashtag: '#Teknoloji', usageCount: 28, avgEngagement: 4.5, reach: 87000 },
    { hashtag: '#Pazarlama', usageCount: 25, avgEngagement: 3.9, reach: 76000 },
    { hashtag: '#Girişimcilik', usageCount: 22, avgEngagement: 4.7, reach: 92000 },
    { hashtag: '#Başarı', usageCount: 19, avgEngagement: 5.3, reach: 145000 },
    { hashtag: '#Motivasyon', usageCount: 17, avgEngagement: 6.1, reach: 178000 },
];

// Sentiment Data
export const mockSentiment: SentimentData = {
    positive: 67,
    neutral: 25,
    negative: 8,
};

export const dailyEngagementData = generateDailyEngagement();
export const hourlyActivityData = generateHourlyActivity();
