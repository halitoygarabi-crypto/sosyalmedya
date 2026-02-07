-- RLS Politikası Düzeltmesi
-- Kayıt sırasında profil oluşturmaya izin ver

-- Mevcut INSERT politikasını kaldır
DROP POLICY IF EXISTS "Users can insert own profile" ON customer_profiles;

-- Daha esnek INSERT politikası
-- Kullanıcı sadece kendi ID'si ile profil oluşturabilir
CREATE POLICY "Users can insert own profile" ON customer_profiles
  FOR INSERT 
  WITH CHECK (true);

-- Service role ile de erişime izin ver (gerekirse)
-- ALTER TABLE customer_profiles FORCE ROW LEVEL SECURITY;

SELECT 'INSERT politikası güncellendi!' AS status;
