// hooks/usePostiz.ts
import { useState, useCallback } from 'react';

export interface Integration {
  id: string;
  name: string;
  identifier: string;
  picture: string | null;
  disabled: boolean;
  profile: string;
}

export interface Post {
  id: string;
  content: string;
  publishDate: string;
  releaseURL?: string;
  state: 'QUEUE' | 'PUBLISHED' | 'ERROR' | 'DRAFT';
  integration: {
    id: string;
    providerIdentifier: string;
    name: string;
    picture?: string;
  };
}

export interface AIGenerateOptions {
  topic: string;
  platform: string;
  tone: 'professional' | 'casual' | 'humorous' | 'inspirational' | 'educational';
  language: string;
  includeHashtags: boolean;
  includeEmoji: boolean;
  variations: number;
}

export interface CSVRow {
  content: string;
  channel: string;
  date?: string;
  type?: string;
}

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = 'http://localhost:3001'; // Default backend URL
  const res = await fetch(`${baseUrl}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API hatası: ${res.status}`);
  return data.data;
}

export function usePostiz() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchIntegrations = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // MOCK DATA for Integrations
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network latency
      const mockIntegrations = [
        { id: 'int-1', name: 'Instagram', identifier: 'instagram', picture: null, disabled: false, profile: 'Polmark AI' },
        { id: 'int-2', name: 'Twitter/X', identifier: 'x', picture: null, disabled: false, profile: '@polmarkai' },
        { id: 'int-3', name: 'LinkedIn', identifier: 'linkedin', picture: null, disabled: false, profile: 'Polmark Pro' },
        { id: 'int-4', name: 'Telegram', identifier: 'telegram', picture: null, disabled: false, profile: 'Polmark Community' }
      ];
      setIntegrations(mockIntegrations);
      return mockIntegrations;
    } catch (err: unknown) {
      setError('Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPosts = useCallback(async (startDate?: string, endDate?: string) => {
    setLoading(true); setError(null);
    try {
      // MOCK DATA for Posts
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
      
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 86400000);
      const yesterday = new Date(now.getTime() - 86400000);

      const mockPosts = [
        {
          id: 'post-1',
          content: '🚀 Yeni özelliklerimiz yayında! AI tabanlı metin üretimi artık çok daha hızlı.',
          publishDate: tomorrow.toISOString(),
          state: 'QUEUE',
          integration: { id: 'int-2', providerIdentifier: 'x', name: 'Twitter/X' }
        },
        {
          id: 'post-2',
          content: 'Sosyal medya yönetimi hiç bu kadar kolay olmamıştı. 📈',
          publishDate: yesterday.toISOString(),
          state: 'PUBLISHED',
          integration: { id: 'int-3', providerIdentifier: 'linkedin', name: 'LinkedIn' }
        },
        {
          id: 'post-3',
          content: 'Telegram duyuru kanalımız açıldı! Hemen katılın.',
          publishDate: yesterday.toISOString(),
          releaseURL: 'https://telegram.org',
          state: 'PUBLISHED',
          integration: { id: 'int-4', providerIdentifier: 'telegram', name: 'Telegram' }
        }
      ] as Post[];

      setPosts(mockPosts);
      return mockPosts;
    } catch (err: unknown) {
      setError('Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (content: string, integrationIds: string[], options?: { type?: string; date?: string; images?: { id: string; path: string }[] }) => {
    setLoading(true); setError(null);
    try {
      // MOCK CREATE
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Mock Post Created:', { content, integrationIds, options });
      
      // Simulate refetching posts immediately
      const newPost = {
        id: `post-new-${Date.now()}`,
        content,
        publishDate: options?.date || new Date().toISOString(),
        state: options?.type === 'schedule' ? 'QUEUE' : 'PUBLISHED',
        integration: { id: integrationIds[0] || 'int-unknown', providerIdentifier: 'unknown', name: 'Multiple Networks' }
      } as Post;
      
      setPosts(prev => [newPost, ...prev]);
      return { success: true };
    } catch (err: unknown) {
      setError('Failed to create post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    setLoading(true); setError(null);
    try {
      // MOCK DELETE
      await new Promise(resolve => setTimeout(resolve, 500));
      setPosts(prev => prev.filter(p => p.id !== postId));
      return { success: true };
    } catch (err: unknown) {
      setError('Failed to delete post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateAIContent = useCallback(async (options: AIGenerateOptions) => {
    setLoading(true); setError(null);
    try {
      // MOCK AI GENERATION
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Mock AI Options:', options);
      return {
        posts: Array.from({ length: options.variations }).map((_, i) => ({
          content: `🤖 (Mock AI) ${options.topic} hakkında ${options.tone} bir paylaşım varyasyonu #${i + 1}. ${options.includeHashtags ? '#ai #sosyalmedya' : ''} ${options.includeEmoji ? '🚀✨' : ''}`
        }))
      };
    } catch (err: unknown) {
      setError('AI generation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading, error, integrations, posts,
    fetchIntegrations, fetchPosts, createPost, deletePost, generateAIContent,
    clearError: () => setError(null)
  };
}
