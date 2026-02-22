/**
 * Google Sheets Integration Service
 * 
 * This service allows saving AI-generated content directly to a Google Sheet
 * using a Google Apps Script web app as a middleman (no n8n required).
 * 
 * Uses Image tag injection for GET requests — this completely bypasses CORS.
 */

export interface SheetEntry {
    date: string;
    influencerName?: string;
    prompt: string;
    imageUrl: string;
    clientName?: string;
    type: 'image' | 'video';
    metadata?: Record<string, string | number | boolean | null>;
}

export interface SheetConfig {
    id: string;
    name: string;
    url: string;
    isActive: boolean;
}

class GoogleSheetsService {
    private storageKey: string = 'google_sheets_configs';

    constructor() {
        this.syncConfigsFromEnv();
    }

    syncConfigsFromEnv(): void {
        let configs = this.getConfigs();
        const influencerUrl = import.meta.env.VITE_GOOGLE_SHEETS_INFLUENCER_URL || '';
        const contentUrl = import.meta.env.VITE_GOOGLE_SHEETS_CONTENT_URL || 
                          import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL || 
                          import.meta.env.VITE_SHEETS_API || '';

        let changed = false;

        // Cleanup: remove old or duplicated entries that don't match latest env URLs
        const oldSize = configs.length;
        // Keep ONLY the entries that match our current ENV URLs or are manually added (not beginning with inf_ or cnt_)
        configs = configs.filter(c => {
            if (c.name.toLowerCase().includes('influencer')) return c.url === influencerUrl;
            if (c.name.toLowerCase().includes('içerik')) return c.url === contentUrl;
            return true; // Keep others
        });
        if (configs.length !== oldSize) changed = true;

        // Ensure Influencer sheet exists and is up to date
        if (influencerUrl) {
            const existingByName = configs.find(c => c.name.toLowerCase().includes('influencer'));
            if (!existingByName) {
                configs.push({ id: 'inf_' + Date.now(), name: 'AI Influencer', url: influencerUrl, isActive: true });
                changed = true;
            } else if (existingByName.url !== influencerUrl) {
                existingByName.url = influencerUrl;
                changed = true;
            }
        }

        // Ensure Content sheet exists and is up to date
        if (contentUrl) {
            const existingByName = configs.find(c => c.name.toLowerCase().includes('içerik'));
            if (!existingByName) {
                configs.push({ id: 'cnt_' + Date.now(), name: 'İçerik N99', url: contentUrl, isActive: true });
                changed = true;
            } else if (existingByName.url !== contentUrl) {
                existingByName.url = contentUrl;
                changed = true;
            }
        }

        if (changed) {
            this.saveConfigs(configs);
        }
    }

    getConfigs(): SheetConfig[] {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

    saveConfigs(configs: SheetConfig[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(configs));
    }

    addConfig(name: string, url: string): SheetConfig {
        const configs = this.getConfigs();
        const newConfig: SheetConfig = {
            id: Date.now().toString(),
            name,
            url,
            isActive: true
        };
        configs.push(newConfig);
        this.saveConfigs(configs);
        return newConfig;
    }

    removeConfig(id: string): void {
        const configs = this.getConfigs().filter(c => c.id !== id);
        this.saveConfigs(configs);
    }

    updateConfig(id: string, updates: Partial<SheetConfig>): void {
        const configs = this.getConfigs().map(c => c.id === id ? { ...c, ...updates } : c);
        this.saveConfigs(configs);
    }

    // Backwards compatibility for single URL usage
    getWebhookUrl(): string {
        const active = this.getConfigs().find(c => c.isActive);
        return active ? active.url : '';
    }

    setWebhookUrl(url: string): void {
        const configs = this.getConfigs();
        if (configs.length > 0) {
            this.updateConfig(configs[0].id, { url });
        } else {
            this.addConfig('Varsayılan Tablo', url);
        }
    }

    isConfigured(): boolean {
        return this.getConfigs().some(c => c.isActive && c.url.startsWith('https://script.google.com/'));
    }

    private async sendRequest(url: string, data?: unknown): Promise<boolean> {
        try {
            const options: RequestInit = { 
                mode: 'no-cors',
                method: data ? 'POST' : 'GET',
                keepalive: true,
                cache: 'no-cache'
            };

            if (data) {
                options.body = JSON.stringify(data);
                // content-type text/plain is required for Google Apps Script to avoid CORS preflight on POST
                options.headers = { 'Content-Type': 'text/plain' }; 
            }

            await fetch(url, options);
            return true;
        } catch (error) {
            console.error('Fetch error:', error);
            return false;
        }
    }

    /**
     * Appends a new row to the Google Sheet(s)
     * If specificConfigId is provided, saves only to that sheet.
     * Otherwise, saves to ALL active sheets.
     */
    async saveToSheet(entry: SheetEntry, specificConfigId?: string): Promise<{ success: boolean; error?: string }> {
        const configs = this.getConfigs();
        let targets = configs.filter(c => c.isActive);

        if (specificConfigId) {
            targets = configs.filter(c => c.id === specificConfigId);
        }

        if (targets.length === 0) {
            return { 
                success: false, 
                error: 'Aktif Google Sheet bağlantısı bulunamadı.' 
            };
        }

        console.log(`📊 Google Sheet'e kaydediliyor (${targets.length} hedef)...`, entry);

        let successCount = 0;
        const errors: string[] = [];

        for (const config of targets) {
            try {
                const payload = {
                    date: entry.date || new Date().toLocaleString('tr-TR'),
                    prompt: entry.prompt || '',
                    imageUrl: entry.imageUrl || '',
                    type: entry.type || 'image',
                    influencerName: entry.influencerName || '',
                    clientName: entry.clientName || 'Genel',
                    metadata: entry.metadata || {}
                };

                const result = await this.sendRequest(config.url, payload);
                if (result) successCount++;
                else errors.push(`${config.name}: İstek başarısız`);

            } catch (error) {
                console.error(`❌ ${config.name} kayıt hatası:`, error);
                errors.push(`${config.name}: ${error instanceof Error ? error.message : 'Hata'}`);
            }
        }

        return successCount > 0 ? { success: true } : { success: false, error: errors.join(', ') };
    }
    
    /**
     * Saves to a sheet that matches the name partially (case insensitive)
     */
    async saveToNamedSheet(namePart: string, entry: SheetEntry): Promise<{ success: boolean; error?: string }> {
        this.syncConfigsFromEnv(); // Ensure latest naming
        const configs = this.getConfigs();
        const target = configs.find(c => c.name.toLowerCase().includes(namePart.toLowerCase()) && c.isActive)
                    || configs.find(c => c.isActive); // Fallback to any active if name not found
        
        if (target) {
            console.log(`🎯 Named sheet target found: ${target.name}`);
            return this.saveToSheet(entry, target.id);
        }
        
        return { success: false, error: 'Kayıt edilecek aktif tablo bulunamadı.' };
    }

    async fetchData(specificConfigIdOrName?: string): Promise<SheetEntry[]> {
        this.syncConfigsFromEnv(); // Ensure latest config from ENV is loaded
        const configs = this.getConfigs();
        let targets: SheetConfig[] = [];

        if (specificConfigIdOrName) {
            // Try ID first
            const byId = configs.filter(c => c.id === specificConfigIdOrName);
            if (byId.length > 0) {
                targets = byId;
            } else {
                // Try Name (loose match)
                targets = configs.filter(c => 
                    (c.name.toLowerCase().includes(specificConfigIdOrName.toLowerCase()) ||
                     specificConfigIdOrName.toLowerCase().includes(c.name.toLowerCase())) && 
                    c.isActive
                );
            }
        }
        
        // If no specific target found or none provided, use all active
        if (targets.length === 0) {
            targets = configs.filter(c => c.isActive);
        }
        
        if (targets.length === 0) {
            console.warn('⚠️ fetchData: No active Google Sheet configs found.');
            throw new Error('Aktif Google Sheet bağlantısı bulunamadı.');
        }

        console.log(`🔍 fetchData: ${targets.length} tablo taranıyor...`, targets.map(t => t.name));

        const allResults: SheetEntry[] = [];
        
        for (const target of targets) {
            try {
                console.log(`📊 ${target.name} tablosundan veriler çekiliyor (JSONP)...`);
                
                // Use JSONP with explicit sheet name if it's the influencer one
                let fetchUrl = target.url;
                if (target.name.toLowerCase().includes('influencer')) {
                    const url = new URL(fetchUrl);
                    url.searchParams.set('sheet', 'AI Influencer'); // Hint for the script
                    fetchUrl = url.toString();
                }

                const data = await this.fetchJsonp(fetchUrl);
                
                if (Array.isArray(data)) {
                    console.log(`📊 Raw data from ${target.name} (${data.length} rows)`);
                    
                    const normalized = (data as any[]).map(item => {
                        const keys = Object.keys(item);
                        const clean: Record<string, string> = {};
                        keys.forEach(k => {
                            const cleanKey = k.toLowerCase().trim().replace(/\s+/g, '');
                            clean[cleanKey] = String(item[k] ?? '');
                        });

                        // 1. Header mapping
                        let date = item.date || item.Date || item.Tarih || clean.tarih || clean.date || '';
                        const clientName = item.clientName || item.Client || item.Müşteri || clean.müşteri || clean.clientname || '';
                        const influencerName = item.influencerName || item.Influencer || clean.influencer || clean.influencername || '';
                        let prompt = item.prompt || item.Prompt || item.İçerik || clean.içerik || clean.prompt || '';
                        let imageUrl = item.imageUrl || item.URL || item.ImageUrl || item.image_url || clean.url || clean.imageurl || '';
                        const type = (item.type || item.Tip || clean.tip || clean.type || 'image');
                        const metadata = typeof item.metadata === 'object' ? item.metadata : (typeof item.Detay === 'string' ? { raw: item.Detay } : {});

                        // 2. Fallback: If prompt is empty but there's a key with a long string
                        if (!prompt) {
                            const longValue = Object.values(item).find(v => typeof v === 'string' && v.length > 20);
                            if (longValue) prompt = String(longValue);
                        }

                        // 3. Fallback: URL detection in any field
                        if (!imageUrl) {
                            const allValues = Object.values(item).map(v => String(v ?? ''));
                            const urlValue = allValues.find(v => v.startsWith('http'));
                            if (urlValue) imageUrl = urlValue;
                        }

                        // 4. Fallback: Date detection
                        if (!date) {
                            const allValues = Object.values(item).map(v => String(v ?? ''));
                            const dateValue = allValues.find(v => /\d{2}[.\-/]\d{2}[.\-/]\d{4}/.test(v) || v.includes('GMT'));
                            if (dateValue) date = dateValue;
                        }

                        return {
                            date: String(date),
                            clientName: String(clientName),
                            influencerName: String(influencerName),
                            prompt: String(prompt),
                            imageUrl: String(imageUrl),
                            type: (String(type).toLowerCase().includes('video') ? 'video' : 'image') as 'image' | 'video',
                            metadata: metadata as Record<string, string | number | boolean | null>
                        };
                    });
                    
                    // Filter out entries without images
                    const withVisuals = normalized.filter(item => item.imageUrl);
                    console.log(`✅ ${target.name}: ${withVisuals.length}/${data.length} rows with visuals mapped`);
                    allResults.push(...withVisuals);
                }
            } catch (error) {
                console.error(`❌ ${target.name} veri çekme hatası:`, error);
            }
        }

        return allResults.sort((a, b) => {
            const timeA = new Date(a.date).getTime() || 0;
            const timeB = new Date(b.date).getTime() || 0;
            return timeB - timeA;
        });
    }


    /**
     * Bypasses CORS using a dynamic script tag (JSONP)
     */
    private fetchJsonp(baseUrl: string): Promise<Record<string, unknown>[]> {
        return new Promise((resolve, reject) => {
            const callbackName = 'jsonp_callback_' + Math.round(Math.random() * 1000000);
            
            // Define global callback
            (window as any)[callbackName] = (data: Record<string, unknown>[]) => {
                delete (window as any)[callbackName];
                document.body.removeChild(script);
                resolve(data);
            };

            const url = new URL(baseUrl);
            url.searchParams.set('action', 'read');
            url.searchParams.set('callback', callbackName);

            const script = document.createElement('script');
            script.src = url.toString();
            script.onerror = () => {
                delete (window as any)[callbackName];
                document.body.removeChild(script);
                reject(new Error('JSONP yükleme hatası (Hatalı URL veya Google Script erişim sorunu)'));
            };

            document.body.appendChild(script);

            // Timeout after 15 seconds
            setTimeout(() => {
                if ((window as any)[callbackName]) {
                    delete (window as any)[callbackName];
                    document.body.removeChild(script);
                    reject(new Error('İstek zaman aşımına uğradı.'));
                }
            }, 15000);
        });
    }

    async testConnection(): Promise<{ success: boolean; error?: string }> {
        return this.saveToSheet({
            date: new Date().toLocaleString('tr-TR'),
            prompt: 'BAĞLANTI TESTİ',
            imageUrl: 'https://picsum.photos/200',
            type: 'image',
            clientName: 'Sistem Testi',
            metadata: { status: 'test-success' }
        });
    }
}

export const googleSheetsService = new GoogleSheetsService();
