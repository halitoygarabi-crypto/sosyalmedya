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
    phone?: string;
    website?: string;
    address?: string;
    socialAccounts?: Record<string, string>;
    brandGuidelines?: string;
    assignedInfluencers?: Influencer[];
    assets?: ClientAsset[];
}

export interface AssignedClient {
    id: string;
    company_name: string;
    industry: string | null;
    logo_url: string | null;
    ai_prompt_prefix?: string;
    brand_guidelines?: string;
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
    postType?: 'post' | 'reel' | 'story';
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
export type UserRole = 'admin' | 'client' | 'content_creator';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    assignedClients?: string[]; // For content_creator role
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

export interface Report {
    id: string;
    clientId: string;
    reportType: 'weekly' | 'monthly';
    periodStart: string;
    periodEnd: string;
    data: Record<string, unknown>;
    pdfUrl?: string;
    generatedAt: string;
}

// AI Influencer Types
export interface Influencer {
    id: string;
    name: string;
    avatarUrl?: string;
    style?: string;
    personality?: string;
    voiceTone?: string;
    targetAudience?: string;
    createdBy: string;
    createdAt: string;
}

export interface ClientInfluencer {
    id: string;
    clientId: string;
    influencerId: string;
    assignedAt: string;
    influencer?: Influencer;
}

// Client Assets
export interface ClientAsset {
    id: string;
    clientId: string;
    assetType: 'logo' | 'brand_image' | 'document' | 'video' | 'other';
    fileUrl: string;
    fileName?: string;
    description?: string;
    uploadedBy: string;
    uploadedAt: string;
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
    workspaceId?: string; // For LimeSocial integration per platform
}
