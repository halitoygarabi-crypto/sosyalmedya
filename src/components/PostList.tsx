import React from 'react';
import { Instagram, Twitter, Linkedin, Play, Eye, Edit, Trash2, RefreshCw, Send } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import type { Post, Platform, PostStatus } from '../types';
import { formatRelativeTime, getPlatformColor, getStatusName, truncateText } from '../utils/helpers';

const platformIcons: Record<Platform, React.ReactNode> = {
    instagram: <Instagram size={10} />,
    twitter: <Twitter size={10} />,
    linkedin: <Linkedin size={10} />,
    tiktok: <Play size={10} />,
};

interface PostListProps {
    filter?: PostStatus | 'all';
    limit?: number;
    showActions?: boolean;
}

const PostList: React.FC<PostListProps> = ({ filter = 'all', limit, showActions = true }) => {
    const { posts, selectedPlatform, searchQuery, deletePost, updatePost, activeClient, publishPost } = useDashboard();

    // Filter posts
    let filteredPosts = posts;

    // Filter by active client
    if (activeClient) {
        filteredPosts = filteredPosts.filter((p) => p.clientId === activeClient.id);
    }

    if (filter !== 'all') {
        filteredPosts = filteredPosts.filter((p) => p.status === filter);
    }

    if (selectedPlatform !== 'all') {
        filteredPosts = filteredPosts.filter((p) => p.platforms.includes(selectedPlatform));
    }

    if (searchQuery) {
        filteredPosts = filteredPosts.filter(
            (p) =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Sort by created at (newest first)
    filteredPosts = [...filteredPosts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Limit results
    if (limit) {
        filteredPosts = filteredPosts.slice(0, limit);
    }

    const handleRetry = (post: Post) => {
        updatePost(post.id, { status: 'scheduled', errorMessage: undefined });
    };

    if (filteredPosts.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p className="empty-state-title">Post bulunamadı</p>
                <p className="empty-state-description">
                    {filter === 'failed'
                        ? 'Başarısız gönderi yok - harika iş!'
                        : 'Henüz bu kriterlere uygun post yok.'}
                </p>
            </div>
        );
    }

    return (
        <div className="post-list">
            {filteredPosts.map((post) => (
                <div key={post.id} className="post-item">
                    <img
                        src={post.imageUrls[0] || 'https://picsum.photos/60/60?random=' + post.id}
                        alt={post.title}
                        className="post-thumbnail"
                    />
                    <div className="post-content">
                        <h4 className="post-title">{post.title}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            {truncateText(post.content, 60)}
                        </p>
                        <div className="post-meta">
                            <span className={`post-status ${post.status}`}>{getStatusName(post.status)}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(post.createdAt)}</span>
                        </div>
                        <div className="post-platforms">
                            {post.platforms.map((platform) => (
                                <div
                                    key={platform}
                                    className="post-platform-badge"
                                    style={{ background: getPlatformColor(platform) }}
                                    title={platform}
                                >
                                    {platformIcons[platform]}
                                </div>
                            ))}
                        </div>
                        {post.status === 'failed' && post.errorMessage && (
                            <p
                                style={{
                                    fontSize: '0.625rem',
                                    color: 'var(--error)',
                                    marginTop: '4px',
                                    padding: '4px 8px',
                                    background: 'var(--error-bg)',
                                    borderRadius: 'var(--radius-sm)',
                                }}
                            >
                                {truncateText(post.errorMessage, 50)}
                            </p>
                        )}
                    </div>
                    {showActions && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {post.status === 'posted' && (
                                <button
                                    className="btn btn-ghost btn-icon btn-sm"
                                    title="İstatistikler"
                                    style={{ width: '28px', height: '28px' }}
                                >
                                    <Eye size={14} />
                                </button>
                            )}
                            {(post.status === 'scheduled' || post.status === 'draft') && (
                                <button
                                    className="btn btn-primary btn-icon btn-sm"
                                    title="Publer'a Gönder"
                                    style={{ width: '28px', height: '28px', background: 'var(--accent-gradient)' }}
                                    onClick={() => publishPost(post)}
                                >
                                    <Send size={14} />
                                </button>
                            )}
                            {post.status === 'scheduled' && (
                                <button
                                    className="btn btn-ghost btn-icon btn-sm"
                                    title="Düzenle"
                                    style={{ width: '28px', height: '28px' }}
                                >
                                    <Edit size={14} />
                                </button>
                            )}
                            {post.status === 'failed' && (
                                <button
                                    className="btn btn-ghost btn-icon btn-sm"
                                    title="Tekrar Dene"
                                    style={{ width: '28px', height: '28px' }}
                                    onClick={() => handleRetry(post)}
                                >
                                    <RefreshCw size={14} />
                                </button>
                            )}
                            <button
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Sil"
                                style={{ width: '28px', height: '28px', color: 'var(--error)' }}
                                onClick={() => deletePost(post.id)}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PostList;
