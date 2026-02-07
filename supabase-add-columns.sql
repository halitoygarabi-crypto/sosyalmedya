-- MÜŞTERİ PROFİL TABLOSUNA YENİ SÜTUNLAR EKLEME
-- Bu scripti Supabase SQL Editor'da çalıştırın

-- 1. İletişim bilgileri sütunları
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- 2. Sosyal medya API token'ları
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS instagram_token TEXT;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS twitter_token TEXT;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS linkedin_token TEXT;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS tiktok_token TEXT;

-- 3. Üçüncü parti entegrasyonlar
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS metricool_api_key TEXT;
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS publer_api_key TEXT;

-- 4. Sonuç
SELECT 'Yeni sütunlar başarıyla eklendi!' AS status;
