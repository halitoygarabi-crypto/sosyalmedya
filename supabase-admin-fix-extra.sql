-- ADMİN PANELİ İÇİN EK DÜZELTMELER
-- Bu scripti de Supabase SQL Editor'da çalıştırın

-- 1. DELETE politikası ekle (eksikti)
DROP POLICY IF EXISTS "Profiles are deletable by admins" ON customer_profiles;
CREATE POLICY "Profiles are deletable by admins" ON customer_profiles
  FOR DELETE USING (
    public.is_admin()  -- Sadece admin silebilir
  );

-- 2. INSERT politikasını güncelle - Admin herhangi bir ID ile profil ekleyebilmeli
DROP POLICY IF EXISTS "Profiles are insertable by owners and admins" ON customer_profiles;
CREATE POLICY "Profiles are insertable by owners and admins" ON customer_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id  -- Kendi profilini ekleyebilir
    OR 
    public.is_admin()  -- Admin herhangi birini ekleyebilir
  );

-- 3. Service role key ile yapılması gereken işlemler için bilgi:
-- Not: Admin panelinden müşteri oluşturmak için:
-- a) Supabase Dashboard > Authentication > Settings > Email Confirmations KAPALI olmalı
-- b) Ya da service_role key kullanılmalı (güvenlik riski!)

-- 4. Email onayını kontrol et
SELECT 'Script başarıyla çalıştı. Email onayı ayarlarını kontrol edin.' AS status;
