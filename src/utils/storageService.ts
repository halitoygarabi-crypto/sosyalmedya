import { supabase } from './supabaseService';

export const storageService = {
    /**
     * AI tarafından üretilen geçici URL'yi Supabase Storage'a yükler ve kalıcı public URL döndürür.
     */
    uploadFromUrl: async (url: string, fileName: string): Promise<string | null> => {
        try {
            console.log('📦 Görsel Storage\'a taşınıyor:', fileName);
            
            // Fetch the image from AI provider
            const response = await fetch(url);
            const blob = await response.blob();
            
            // Upload to Supabase 'media' bucket
            const path = `generated/${Date.now()}_${fileName}`;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any).storage
                .from('media')
                .upload(path, blob, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (error) throw error;

            // Get Public URL
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: { publicUrl } } = (supabase as any).storage
                .from('media')
                .getPublicUrl(path);

            return publicUrl;
        } catch (error) {
            console.error('Storage Upload Error:', error);
            return null;
        }
    }
};
