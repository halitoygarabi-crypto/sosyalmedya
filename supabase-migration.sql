-- Müşteri Giriş Sistemi - Supabase Veritabanı Kurulumu
-- Bu SQL dosyasını Supabase Dashboard > SQL Editor'de çalıştırın

-- 1. Müşteri profilleri tablosu
-- auth.users tablosuna bağlı, her kullanıcı için bir profil
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  logo_url TEXT,
  ai_prompt_prefix TEXT DEFAULT 'Profesyonel bir dil kullan.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Platform bağlantıları tablosu
-- Müşteri bazlı sosyal medya bağlantıları
CREATE TABLE IF NOT EXISTS platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  account_name TEXT,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, platform)
);

-- 3. Posts tablosuna customer_id sütunu ekle (varsa)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'customer_id') THEN
      ALTER TABLE posts ADD COLUMN customer_id UUID REFERENCES customer_profiles(id);
    END IF;
  END IF;
END
$$;

-- 4. Row Level Security (RLS) politikaları
-- Her kullanıcı sadece kendi verilerine erişebilir

-- Customer Profiles RLS
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON customer_profiles;
CREATE POLICY "Users can view own profile" ON customer_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON customer_profiles;
CREATE POLICY "Users can insert own profile" ON customer_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON customer_profiles;
CREATE POLICY "Users can update own profile" ON customer_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Platform Connections RLS
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own connections" ON platform_connections;
CREATE POLICY "Users can manage own connections" ON platform_connections
  FOR ALL USING (customer_id = auth.uid());

-- Posts RLS (eğer posts tablosu varsa)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts') THEN
    EXECUTE 'ALTER TABLE posts ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage own posts" ON posts';
    EXECUTE 'CREATE POLICY "Users can manage own posts" ON posts FOR ALL USING (customer_id = auth.uid() OR customer_id IS NULL)';
  END IF;
END
$$;

-- 5. Tamamlandı mesajı
SELECT 'Veritabanı kurulumu tamamlandı!' AS status;
