import type { Platform, PostStatus, PlatformStats } from '../types';

// Format numbers with K/M suffix
export const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

// Format date to Turkish locale
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

// Format time
export const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Format relative time
export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return formatDate(dateString);
};

// Platform colors
export const getPlatformColor = (platform: Platform): string => {
    const colors: Record<Platform, string> = {
        instagram: '#E4405F',
        twitter: '#1DA1F2',
        linkedin: '#0A66C2',
        tiktok: '#000000',
    };
    return colors[platform];
};

// Platform gradient colors
export const getPlatformGradient = (platform: Platform): string => {
    const gradients: Record<Platform, string> = {
        instagram: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
        twitter: 'linear-gradient(135deg, #1DA1F2 0%, #0d8ddb 100%)',
        linkedin: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
        tiktok: 'linear-gradient(135deg, #00f2ea 0%, #ff0050 100%)',
    };
    return gradients[platform];
};

// Platform names in Turkish
export const getPlatformName = (platform: Platform): string => {
    const names: Record<Platform, string> = {
        instagram: 'Instagram',
        twitter: 'Twitter/X',
        linkedin: 'LinkedIn',
        tiktok: 'TikTok',
    };
    return names[platform];
};

// Status colors
export const getStatusColor = (status: PostStatus): string => {
    const colors: Record<PostStatus, string> = {
        scheduled: '#3B82F6',
        posted: '#10B981',
        failed: '#EF4444',
        draft: '#6B7280',
    };
    return colors[status];
};

// Status names in Turkish
export const getStatusName = (status: PostStatus): string => {
    const names: Record<PostStatus, string> = {
        scheduled: 'Planlandı',
        posted: 'Gönderildi',
        failed: 'Başarısız',
        draft: 'Taslak',
    };
    return names[status];
};

// Calculate engagement rate
export const calculateEngagementRate = (
    likes: number,
    comments: number,
    shares: number,
    reach: number
): number => {
    if (reach === 0) return 0;
    return Number((((likes + comments + shares) / reach) * 100).toFixed(2));
};

// Generate unique ID
export const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

// Calculate optimal posting time based on platform stats
export const getOptimalPostingTime = (platform: Platform, stats: PlatformStats[]): string => {
    const platformStat = stats.find(s => s.platform === platform);
    return platformStat ? platformStat.bestPostingTime : '12:00';
};

// Get greeting based on time
export const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 6) return 'İyi geceler';
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
};

// Calculate percentage change
export const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(1));
};
