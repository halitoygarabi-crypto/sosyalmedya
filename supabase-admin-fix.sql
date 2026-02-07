-- ADMİN PANELİ VE MÜŞTERİ KAYDI İÇİN VERİTABANI DÜZELTME v3
-- Bu scripti Supabase Dashboard > SQL Editor kısmında çalıştırın.

-- 1. is_admin sütununu ekle (eğer yoksa)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customer_profiles' AND column_name = 'is_admin') THEN
        ALTER TABLE customer_profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
END
$$;

-- 2. Admin kontrolü için SECURITY DEFINER fonksiyon oluştur
-- Bu fonksiyon RLS politikalarını bypass ederek admin kontrolü yapabilir
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM customer_profiles 
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Mevcut oturum açmış kullanıcıyı admin yap
UPDATE customer_profiles 
SET is_admin = TRUE 
WHERE id = auth.uid();

-- 4. TÜM mevcut politikaları kaldır
DROP POLICY IF EXISTS "Users can view own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owners and admins" ON customer_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Profiles are insertable by owners and admins" ON customer_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Profiles are updatable by owners and admins" ON customer_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON customer_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON customer_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON customer_profiles;

-- 5. Yeni SELECT politikası - Fonksiyon kullanarak
CREATE POLICY "Profiles are viewable by owners and admins" ON customer_profiles
  FOR SELECT USING (
    auth.uid() = id  -- Kendi profilini görebilir
    OR 
    public.is_admin()  -- Admin herkesi görebilir
  );

-- 6. Yeni INSERT politikası
CREATE POLICY "Profiles are insertable by owners and admins" ON customer_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id  -- Kendi profilini ekleyebilir
    OR 
    public.is_admin()  -- Admin ekleyebilir
  );

-- 7. Yeni UPDATE politikası
CREATE POLICY "Profiles are updatable by owners and admins" ON customer_profiles
  FOR UPDATE USING (
    auth.uid() = id  -- Kendi profilini güncelleyebilir
    OR 
    public.is_admin()  -- Admin güncelleyebilir
  );

-- 8. Sonuç Mesajı
SELECT 'Veritabanı başarıyla güncellendi. is_admin() fonksiyonu oluşturuldu.' AS status;
