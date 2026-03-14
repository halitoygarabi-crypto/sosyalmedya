// server/postiz-client.ts
export interface PostizConfig {
  baseUrl: string;
  apiKey: string;
}

export interface Integration {
  id: string;
  name: string;
  identifier: string;
  picture: string | null;
  disabled: boolean;
  profile: string;
}

export interface PostizPost {
  id: string;
  content: string;
  publishDate: string;
  state: 'QUEUE' | 'PUBLISHED' | 'ERROR' | 'DRAFT';
  integration: {
    id: string;
    providerIdentifier: string;
    name: string;
  };
}

export class PostizClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: PostizConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.apiKey = config.apiKey;
  }

  private get headers(): HeadersInit {
    return {
      'Authorization': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/public/v1${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: { ...this.headers, ...(options.headers || {}) },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Postiz API Hatası: ${response.status} - ${errorBody}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }

  async getIntegrations(): Promise<Integration[]> {
    return this.request<Integration[]>('/integrations');
  }

  async getPosts(startDate: string, endDate: string): Promise<{ posts: PostizPost[] }> {
    return this.request<{ posts: PostizPost[] }>(`/posts?startDate=${startDate}&endDate=${endDate}`);
  }

  async createPost(payload: unknown): Promise<unknown> {
    return this.request('/posts', { method: 'POST', body: JSON.stringify(payload) });
  }

  async deletePost(postId: string): Promise<void> {
    await this.request(`/posts/${postId}`, { method: 'DELETE' });
  }

  async createBulkPost(content: string, integrationIds: string[], integrations: Integration[], options: { type?: string; date?: string; images?: { id: string; path: string }[] } = {}): Promise<unknown> {
    const payload = {
      type: options.type || 'schedule',
      date: options.date || new Date(Date.now() + 3600000).toISOString(),
      posts: integrationIds.map(id => {
        const integration = integrations.find(i => i.id === id);
        return {
          integration: { id },
          value: [{ content, image: options.images || [] }],
          settings: { __type: integration?.identifier || 'x' },
        };
      }),
    };
    return this.createPost(payload);
  }
}
