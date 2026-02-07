// Post Object Types
export interface PostMetrics {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    impressions: number;
}

export type PostStatus = 'scheduled' | 'posted' | 'failed' | 'draft';
export type Platform = 'instagram' | 'twitter' | 'linkedin' | 'tiktok';

export interface IntegrationStatus {
    id: string;
    platform: Platform;
    status: 'connected' | 'disconnected' | 'error';
    lastSync: string;
    accountName: string;
}

export interface Client {
    id: string;
    name: string;
    logo?: string;
    industry: string;
    status: 'active' | 'inactive';
    integrations: IntegrationStatus[];
    aiPromptPrefix?: string;
    configSource: 'google_sheets' | 'notion' | 'manual';
    configUrl?: string;
}

export interface Post {
    id: string;
    clientId: string;
    title: string;
    content: string;
    imageUrls: string[];
    platforms: Platform[];
    scheduledTime: string;
    status: PostStatus;
    metrics: PostMetrics;
    createdBy: string;
    createdAt: string;
    errorMessage?: string;
    bufferId?: string;
}

// Platform Statistics
export interface PlatformStats {
    clientId: string;
    platform: Platform;
    followers: number;
    followerGrowth: number;
    avgEngagementRate: number;
    postsCount: number;
    bestPostingTime: string;
    reach: number;
    impressions: number;
}

// Analytics & Trends
export interface DailyEngagement {
    date: string;
    likes: number;
    comments: number;
    shares: number;
    reach: number;
}

export interface HourlyActivity {
    hour: number;
    day: string;
    count: number;
}

// Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    timestamp: string;
    read: boolean;
}

// User Types
export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

// Sentiment Analysis
export interface SentimentData {
    positive: number;
    neutral: number;
    negative: number;
}

// Hashtag Performance
export interface HashtagPerformance {
    hashtag: string;
    usageCount: number;
    avgEngagement: number;
    reach: number;
}

// Report Types
export interface WeeklyReport {
    startDate: string;
    endDate: string;
    totalPosts: number;
    totalEngagement: number;
    avgEngagementRate: number;
    topPlatform: Platform;
    followerGrowth: number;
    performanceChange: number;
}

// Platform Connection Settings
export interface PlatformConnection {
    platform: Platform;
    isConnected: boolean;
    accessToken?: string;
    refreshToken?: string;
    accountId?: string;
    accountName?: string;
    expiresAt?: string;
    // Platform-specific fields
    apiKey?: string;
    apiSecret?: string;
    pageId?: string; // For Facebook/Instagram Business
    workspaceId?: string; // For Publer integration per platform
}
