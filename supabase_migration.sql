-- ============================================================
-- Sosyal Medya Dashboard — Mimari Yeniden Yapılandırma Migration
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- ============================================================

-- 1. customer_profiles tablosuna yeni alanlar ekle
ALTER TABLE customer_profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client'
    CHECK (role IN ('admin', 'client', 'content_creator')),
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS social_accounts JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS brand_guidelines TEXT,
  ADD COLUMN IF NOT EXISTS assigned_clients TEXT[] DEFAULT '{}';

-- 2. Mevcut is_admin=true olanları role='admin' yap
UPDATE customer_profiles SET role = 'admin' WHERE is_admin = true;
UPDATE customer_profiles SET role = 'client' WHERE is_admin = false OR is_admin IS NULL;

-- 3. AI Influencer tablosu
CREATE TABLE IF NOT EXISTS influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  style TEXT,
  personality TEXT,
  voice_tone TEXT,
  target_audience TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Influencer → Firma atama tablosu
CREATE TABLE IF NOT EXISTS client_influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, influencer_id)
);

-- 5. Müşteri görselleri / dosyaları tablosu
CREATE TABLE IF NOT EXISTS client_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
  asset_type TEXT CHECK (asset_type IN ('logo', 'brand_image', 'document', 'video', 'other')),
  file_url TEXT NOT NULL,
  file_name TEXT,
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Raporlar tablosu
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
  report_type TEXT CHECK (report_type IN ('weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  pdf_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. RLS Policies (isteğe bağlı — geliştirme aşamasında devre dışı bırakılabilir)
-- ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE client_influencers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE client_assets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
