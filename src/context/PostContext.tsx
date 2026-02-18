import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Post } from '../types';

interface PlatformStats {
    total: number;
    instagram: number;
    tiktok: number;
    youtube: number;
    growth: number;
}

interface PostContextType {
    posts: Post[];
    setPosts: (posts: Post[]) => void;
    addPost: (post: Post) => void;
    updatePost: (id: string, updates: Partial<Post>) => void;
    deletePost: (id: string) => void;
    platformStats: PlatformStats;
    refreshData: () => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const platformStats = useMemo(() => {
        const stats = { total: posts.length, instagram: 0, tiktok: 0, youtube: 0, growth: 12.5 };
        posts.forEach(post => {
            if (post.platforms?.includes('instagram')) stats.instagram++;
            if (post.platforms?.includes('tiktok')) stats.tiktok++;
            if (post.platforms?.includes('twitter')) stats.youtube++;
        });
        return stats;
    }, [posts]);

    const addPost = useCallback((post: Post) => {
        setPosts(prev => [post, ...prev]);
    }, []);

    const updatePost = useCallback((id: string, updates: Partial<Post>) => {
        setPosts(prev => prev.map(post => post.id === id ? { ...post, ...updates } : post));
    }, []);

    const deletePost = useCallback((id: string) => {
        setPosts(prev => prev.filter(post => post.id !== id));
    }, []);

    const refreshData = useCallback(async () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        try {
            // API fetch logic will go here
            console.log('Refreshing post data...');
        } finally {
            setIsRefreshing(false);
        }
    }, [isRefreshing]);

    return (
        <PostContext.Provider value={{ 
            posts, setPosts, addPost, updatePost, deletePost, 
            platformStats, refreshData 
        }}>
            {children}
        </PostContext.Provider>
    );
};

export const usePosts = () => {
    const context = useContext(PostContext);
    if (!context) throw new Error('usePosts must be used within a PostProvider');
    return context;
};
